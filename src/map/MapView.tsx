import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type PaddingOptions } from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import type { LatLon, Route } from "@/core";
import { CATEGORY_BY_ID } from "@/data/categories";
import type { Theme } from "@/lib/theme";
import { currentPalette, PALETTE_HEX } from "@/lib/palette";

/** Free, keyless OSM vector tiles. See docs/DATA_SOURCES.md. */
const STYLES: Record<Theme, string> = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

interface Props {
  center: LatLon;
  origin: LatLon | null;
  route: Route | null;
  /** POI ids already checked off in walk mode. */
  checked?: string[];
  /** The stop the user should head to next. */
  nextId?: string | null;
  theme: Theme;
  /** Where the UI panel sits, so fitBounds leaves room for it. */
  panel: "left" | "bottom";
  onPickOrigin?: (p: LatLon) => void;
}

export function MapView({ center, origin, route, checked = [], nextId, theme, panel, onPickOrigin }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const pickRef = useRef(onPickOrigin);
  pickRef.current = onPickOrigin;
  const lastFitted = useRef<string | null>(null);
  // isStyleLoaded() is false whenever tiles are still loading, and style.load
  // only fires once per style, so track readiness ourselves.
  const styleReady = useRef(false);
  /** Latest route-drawing function, re-run after a style (re)load. */
  const redraw = useRef<() => void>(() => {});
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: STYLES[theme],
      center: [center.lon, center.lat],
      zoom: 13.5,
      attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    m.on("click", (e) => pickRef.current?.({ lat: e.lngLat.lat, lon: e.lngLat.lng }));
    m.on("style.load", () => {
      styleReady.current = true;
      ensureLayers(m, themeRef.current);
      redraw.current();
    });
    map.current = m;
    if (import.meta.env.DEV) (window as unknown as { __ykMap?: MlMap }).__ykMap = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // Initial centre and theme only; later changes handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the basemap with the theme. Layers are re-added on style.load.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const current = (m.getStyle()?.name ?? "").toLowerCase();
    const wantDark = theme === "dark";
    if (current.includes("dark") === wantDark && current) return;
    styleReady.current = false;
    m.setStyle(STYLES[theme]);
  }, [theme]);

  // Markers and path.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];

    if (origin) {
      const node = document.createElement("div");
      node.className = "yk-origin";
      node.setAttribute("aria-label", "Start point");
      markers.current.push(new maplibregl.Marker({ element: node }).setLngLat([origin.lon, origin.lat]).addTo(m));
    }

    route?.stops.forEach((s, i) => {
      // MapLibre positions the outer element with an inline transform, so the
      // animated/scaled visuals live on an inner element.
      const outer = document.createElement("div");
      const node = document.createElement("div");
      node.className = "yk-stop";
      node.style.setProperty("--i", String(i));
      node.dataset.done = String(checked.includes(s.id));
      node.dataset.next = String(s.id === nextId);
      node.title = s.name ?? CATEGORY_BY_ID[s.category].label;
      node.textContent = `${i + 1}`;
      outer.appendChild(node);
      markers.current.push(new maplibregl.Marker({ element: outer }).setLngLat([s.lon, s.lat]).addTo(m));
    });

    const apply = () => {
      ensureLayers(m, themeRef.current);
      const src = m.getSource("route") as maplibregl.GeoJSONSource | undefined;
      src?.setData(route ? lineFor(route) : emptyLine());
      (m.getSource("route-connectors") as maplibregl.GeoJSONSource | undefined)?.setData(connectorsFor(route));
      if (m.getLayer("route-line")) {
        // Dashed and softer while it's still a straight-line guess.
        m.setPaintProperty("route-line", "line-dasharray", route && !route.routed ? [1.5, 1.5] : null);
        m.setPaintProperty("route-line", "line-opacity", route && !route.routed ? 0.7 : 1);
      }
    };
    redraw.current = apply;
    if (styleReady.current) apply();

    // Padding lives on the map itself so every camera move respects the panel.
    // (Passing padding to fitBounds as well would stack it on top.)
    m.setPadding(paddingFor(panel));

    // Fit once per route, and once more when its street path arrives.
    const fitKey = route ? `${route.id}:${route.routed ? 1 : 0}` : null;
    if (route && lastFitted.current !== fitKey) {
      lastFitted.current = fitKey;
      const b = new maplibregl.LngLatBounds();
      (route.geometry ?? route.path).forEach((p) => b.extend([p.lon, p.lat]));
      m.fitBounds(b, { padding: 24, maxZoom: 16, duration: route.routed ? 450 : 700 });
    } else if (!route && origin) {
      lastFitted.current = null;
      m.easeTo({ center: [origin.lon, origin.lat], zoom: Math.max(m.getZoom(), 14.5), duration: 500 });
    }
  }, [origin, route, checked, nextId, panel]);

  // MapLibre's stylesheet forces position: relative on its container, so the
  // positioned wrapper is a separate element.
  return (
    <div className="absolute inset-0">
      <div ref={el} className="h-full w-full" />
    </div>
  );
}

function paddingFor(panel: "left" | "bottom"): PaddingOptions {
  if (panel === "left") return { left: 420 + 24, right: 24, top: 72, bottom: 24 };
  return { left: 16, right: 16, top: 72, bottom: Math.round(window.innerHeight * 0.42) + 16 };
}

/** Route line: a soft casing under a solid primary line. Idempotent. */
function ensureLayers(m: MlMap, theme: Theme) {
  // MapLibre wants sRGB colours, not the oklch tokens in CSS.
  const { route: primary, casing } = PALETTE_HEX[currentPalette()][theme];
  if (!m.getSource("route")) m.addSource("route", { type: "geojson", data: emptyLine() });
  if (!m.getSource("route-connectors")) m.addSource("route-connectors", { type: "geojson", data: connectorsFor(null) });
  if (!m.getLayer("route-connectors")) {
    m.addLayer({
      id: "route-connectors",
      type: "line",
      source: "route-connectors",
      layout: { "line-cap": "round" },
      paint: { "line-color": primary, "line-width": 2, "line-dasharray": [0.5, 2], "line-opacity": 0.8 },
    });
  }
  if (!m.getLayer("route-casing")) {
    m.addLayer({
      id: "route-casing",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": casing, "line-width": 9, "line-opacity": 0.9 },
    });
  }
  if (!m.getLayer("route-line")) {
    m.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": primary, "line-width": 4.5 },
    });
  } else {
    m.setPaintProperty("route-line", "line-color", primary);
    m.setPaintProperty("route-connectors", "line-color", primary);
    m.setPaintProperty("route-casing", "line-color", casing);
  }
}

function lineFor(route: Route): Feature {
  const pts = route.geometry ?? route.path;
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts.map((p) => [p.lon, p.lat]) } };
}

function connectorsFor(route: Route | null): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: (route?.connectors ?? []).map(([a, b]) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: [[a.lon, a.lat], [b.lon, b.lat]] },
    })),
  };
}

function emptyLine(): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } };
}

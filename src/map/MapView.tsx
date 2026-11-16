import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type PaddingOptions } from "maplibre-gl";
import type { Feature } from "geojson";
import type { LatLon, Route } from "@/core";
import { CATEGORY_BY_ID } from "@/data/categories";
import type { Theme } from "@/lib/theme";

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
    m.on("style.load", () => ensureLayers(m, themeRef.current));
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
    };
    if (m.isStyleLoaded()) apply();
    else m.once("style.load", apply);

    // Padding lives on the map itself so every camera move respects the panel.
    // (Passing padding to fitBounds as well would stack it on top.)
    m.setPadding(paddingFor(panel));

    // Fit once per route (not on every check-off).
    if (route && lastFitted.current !== route.id) {
      lastFitted.current = route.id;
      const b = new maplibregl.LngLatBounds();
      route.path.forEach((p) => b.extend([p.lon, p.lat]));
      m.fitBounds(b, { padding: 24, maxZoom: 16, duration: 700 });
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

/** MapLibre wants sRGB colours, not the oklch tokens in CSS, so these mirror the theme by hand. */
const LINE_COLORS: Record<Theme, { line: string; casing: string }> = {
  light: { line: "#bf4e22", casing: "#faf6ee" },
  dark: { line: "#ea8a5e", casing: "#1b1816" },
};

/** Route line: a soft casing under a solid primary line. Idempotent. */
function ensureLayers(m: MlMap, theme: Theme) {
  if (!m.getSource("route")) m.addSource("route", { type: "geojson", data: emptyLine() });
  const { line: primary, casing } = LINE_COLORS[theme];
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
    m.setPaintProperty("route-casing", "line-color", casing);
  }
}

function lineFor(route: Route): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.path.map((p) => [p.lon, p.lat]) } };
}

function emptyLine(): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } };
}

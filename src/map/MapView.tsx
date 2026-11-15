import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature } from "geojson";
import type { LatLon, Route } from "../core";
import { CATEGORY_BY_ID } from "../data/categories";

/** Free, keyless OSM vector tiles. See docs/DATA_SOURCES.md. */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

interface Props {
  center: LatLon;
  origin: LatLon | null;
  route: Route | null;
  onPickOrigin?: (p: LatLon) => void;
}

export function MapView({ center, origin, route, onPickOrigin }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const pickRef = useRef(onPickOrigin);
  pickRef.current = onPickOrigin;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: STYLE_URL,
      center: [center.lon, center.lat],
      zoom: 14,
      attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("click", (e) => pickRef.current?.({ lat: e.lngLat.lat, lon: e.lngLat.lng }));
    m.on("load", () => {
      m.addSource("route", { type: "geojson", data: emptyLine() });
      m.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": "#0f766e", "line-width": 4, "line-dasharray": [2, 1.5] },
      });
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // Initial centre only; later moves are driven by route/origin effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw origin + stops + path whenever they change.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];

    if (origin) {
      markers.current.push(
        new maplibregl.Marker({ color: "#f59e0b" }).setLngLat([origin.lon, origin.lat]).addTo(m),
      );
    }

    const apply = () => {
      const src = m.getSource("route") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      if (!route) {
        src.setData(emptyLine());
        return;
      }
      src.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: route.path.map((p) => [p.lon, p.lat]) },
      });
      route.stops.forEach((s, i) => {
        const node = document.createElement("div");
        node.className = "stop-marker";
        node.title = s.name ?? CATEGORY_BY_ID[s.category].label;
        node.textContent = `${i + 1}`;
        markers.current.push(new maplibregl.Marker({ element: node }).setLngLat([s.lon, s.lat]).addTo(m));
      });
      const b = new maplibregl.LngLatBounds();
      route.path.forEach((p) => b.extend([p.lon, p.lat]));
      m.fitBounds(b, { padding: 60, maxZoom: 16, duration: 600 });
    };
    if (m.isStyleLoaded()) apply();
    else m.once("load", apply);
  }, [origin, route]);

  return <div ref={el} className="map" />;
}

function emptyLine(): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } };
}

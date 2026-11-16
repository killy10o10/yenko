import { estimateMinutes, haversineKm, type LatLon, type Mode, type Route } from "@/core";

/**
 * Street-following paths from the free OSRM servers run by FOSSGIS, the same
 * ones openstreetmap.org uses for its own directions. No key; fair use only,
 * so we ask once per route and cache. If it fails we keep the straight lines.
 * Policy: https://routing.openstreetmap.de/about.html
 */
const BASE = "https://routing.openstreetmap.de";

const PROFILE: Record<Mode, string> = {
  walk: "routed-foot",
  okada: "routed-car",
  trotro: "routed-car",
  taxi: "routed-car",
  car: "routed-car",
};

interface RoadResult {
  geometry: LatLon[];
  distanceKm: number;
  /** Where each input point was snapped onto the street network, in order. */
  snapped: LatLon[];
}

const cache = new Map<string, Promise<RoadResult | null>>();

function fetchRoad(mode: Mode, path: LatLon[]): Promise<RoadResult | null> {
  const coords = path.map((p) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const url = `${BASE}/${PROFILE[mode]}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  let hit = cache.get(url);
  if (!hit) {
    hit = (async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return null;
        const json = await res.json();
        const r = json?.routes?.[0];
        if (json?.code !== "Ok" || !r?.geometry?.coordinates?.length) return null;
        return {
          geometry: (r.geometry.coordinates as [number, number][]).map(([lon, lat]) => ({ lat, lon })),
          distanceKm: r.distance / 1000,
          snapped: ((json.waypoints ?? []) as { location: [number, number] }[]).map(({ location: [lon, lat] }) => ({ lat, lon })),
        };
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    })();
    cache.set(url, hit);
    // Don't cache failures forever; let a later attempt retry.
    hit.then((v) => v === null && cache.delete(url));
  }
  return hit;
}

/** Return the route with street geometry, distance and time, or null if routing failed. */
export async function routeOnStreets(route: Route): Promise<Route | null> {
  const road = await fetchRoad(route.mode, route.path);
  if (!road) return null;
  // path[0] is the origin; stops are path[1..n] and waypoints line up with path.
  const connectors: [LatLon, LatLon][] = [];
  route.stops.forEach((s, i) => {
    const snap = road.snapped[i + 1];
    if (snap && haversineKm(s, snap) > 0.015) connectors.push([{ lat: s.lat, lon: s.lon }, snap]);
  });
  return {
    ...route,
    geometry: road.geometry,
    connectors,
    distanceKm: Math.round(road.distanceKm * 100) / 100,
    estimatedMinutes: estimateMinutes(route.mode, road.distanceKm, route.stops.length),
    routed: true,
  };
}

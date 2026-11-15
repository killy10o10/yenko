import type { LatLon } from "./types";

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Total length of a polyline in km. */
export function pathLengthKm(path: LatLon[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += haversineKm(path[i - 1], path[i]);
  return total;
}

/**
 * Order points to make a short tour from `origin`: nearest-neighbour then
 * 2-opt. Small inputs only (≤ ~12 points); that's all we ever need.
 */
export function orderStops<T extends LatLon>(origin: LatLon, points: T[], loop: boolean): T[] {
  if (points.length <= 1) return [...points];

  // Nearest neighbour
  const remaining = [...points];
  const tour: T[] = [];
  let current: LatLon = origin;
  while (remaining.length) {
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i]);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    tour.push(next);
    current = next;
  }

  // 2-opt
  const tourLen = (t: T[]) => {
    const full: LatLon[] = [origin, ...t];
    if (loop) full.push(origin);
    return pathLengthKm(full);
  };
  let improved = true;
  let best = tourLen(tour);
  while (improved) {
    improved = false;
    for (let i = 0; i < tour.length - 1; i++) {
      for (let j = i + 1; j < tour.length; j++) {
        const candidate = [...tour.slice(0, i), ...tour.slice(i, j + 1).reverse(), ...tour.slice(j + 1)];
        const len = tourLen(candidate);
        if (len + 1e-9 < best) {
          tour.splice(0, tour.length, ...candidate);
          best = len;
          improved = true;
        }
      }
    }
  }
  return tour;
}

/**
 * Geohash-ish cell id at ~1 km resolution, used as the MVP "hood" key.
 * Not a real geohash; just a stable grid cell string.
 */
export function hoodCell(p: LatLon, cellDeg = 0.01): string {
  const y = Math.floor(p.lat / cellDeg);
  const x = Math.floor(p.lon / cellDeg);
  return `${y}:${x}`;
}

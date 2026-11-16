import type { LatLon } from "./types";
import { haversineKm, hoodCell } from "./geo";

export type HoodKind = "neighbourhood" | "quarter" | "suburb" | "town" | "village";

/** A named area from OpenStreetMap (place=* nodes). */
export interface Hood extends LatLon {
  name: string;
  kind: HoodKind;
}

/**
 * Bigger places are "further away" than they look: a town node sits at its
 * centre but should lose to a neighbourhood that is a bit further yet more
 * specific. Distance is multiplied by these before comparing.
 */
const KIND_WEIGHT: Record<HoodKind, number> = {
  neighbourhood: 0.85,
  quarter: 0.85,
  suburb: 1,
  village: 1.3,
  town: 1.6,
};

export function nearestHood(p: LatLon, hoods: Hood[], maxKm = 3): Hood | null {
  let best: Hood | null = null;
  let bestScore = Infinity;
  for (const h of hoods) {
    const d = haversineKm(p, h);
    if (d > maxKm) continue;
    const score = d * (KIND_WEIGHT[h.kind] ?? 1);
    if (score < bestScore) {
      bestScore = score;
      best = h;
    }
  }
  return best;
}

/** Name for a point: the nearest hood, or a grid-cell key when nothing is mapped nearby. */
export function hoodResolver(hoods: Hood[] | undefined): (p: LatLon) => string {
  if (!hoods?.length) return (p) => hoodCell(p);
  return (p) => nearestHood(p, hoods)?.name ?? hoodCell(p);
}

/** Grid-cell keys look like "558:-19". */
export function isCellKey(key: string): boolean {
  return /^-?\d+:-?\d+$/.test(key);
}

export function hoodLabel(key: string): string {
  return isCellKey(key) ? "Unmapped area" : key;
}

/** The hood most stops fall in, for naming a whole route. */
export function dominantHood(points: LatLon[], hoodOf: (p: LatLon) => string): string {
  const counts = new Map<string, number>();
  for (const p of points) {
    const k = hoodOf(p);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return best ? hoodLabel(best) : "this hood";
}

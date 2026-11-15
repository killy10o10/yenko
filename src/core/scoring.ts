import type { Category, LatLon, Poi } from "./types";
import { haversineKm } from "./geo";

/** Deterministic PRNG (mulberry32) so variants are reproducible per seed. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ScoringOptions {
  origin: LatLon;
  radiusKm: number;
  categoryWeights: Partial<Record<Category, number>>;
  visited: Set<string>;
  /** 0..1, how much random jitter to apply. */
  jitter: number;
  random: () => number;
}

/** How much OSM data a POI has. Named places with hours beat anonymous nodes. */
export function qualityScore(p: Poi): number {
  let q = 0.3;
  if (p.name) q += 0.5;
  if (p.tags.opening_hours) q += 0.1;
  if (p.tags.phone || p.tags.website) q += 0.1;
  return q;
}

export function distanceDecay(dKm: number, radiusKm: number): number {
  if (dKm >= radiusKm) return 0;
  // 1 at origin, ~0.3 at the edge, smooth.
  const x = dKm / radiusKm;
  return 1 - 0.7 * x * x;
}

export function scorePoi(p: Poi, o: ScoringOptions): number {
  const d = haversineKm(o.origin, p);
  const decay = distanceDecay(d, o.radiusKm);
  if (decay === 0) return 0;
  const w = o.categoryWeights[p.category] ?? 1;
  const novelty = o.visited.has(p.id) ? 0.2 : 1;
  const jitter = 1 + (o.random() * 2 - 1) * o.jitter;
  return w * decay * qualityScore(p) * novelty * jitter;
}

import type { Category, LatLon, Poi, Route, RouteRequest, Variant } from "./types";
import { haversineKm, orderStops, pathLengthKm } from "./geo";
import { distanceBudgetKm, estimateMinutes } from "./modes";
import { rng, scorePoi, type ScoringOptions } from "./scoring";

const DEFAULT_MAX_STOPS = 6;

interface VariantProfile {
  variant: Variant;
  title: string;
  budgetScale: number;
  extraStops: number;
  jitter: number;
  boost: Category[];
}

const VARIANTS: VariantProfile[] = [
  {
    variant: "essentials",
    title: "Essentials",
    budgetScale: 0.7,
    extraStops: 0,
    jitter: 0.2,
    boost: ["pharmacy", "groceries", "money", "transport", "health"],
  },
  {
    variant: "chill",
    title: "Chill",
    budgetScale: 1,
    extraStops: 0,
    jitter: 0.3,
    boost: ["food", "cafe", "leisure", "sights", "nightlife"],
  },
  {
    variant: "deep-dive",
    title: "Deep dive",
    budgetScale: 1,
    extraStops: 2,
    jitter: 0.4,
    boost: [],
  },
];

/**
 * Generate 2–3 route variants for a request. Pure: same inputs, same outputs.
 */
export function generateRoutes(req: RouteRequest, pois: Poi[]): Route[] {
  const seed = req.seed ?? 1;
  const routes: Route[] = [];
  for (let i = 0; i < VARIANTS.length; i++) {
    const profile = VARIANTS[i];
    let route = generateOne(req, pois, profile, seed + i * 101);
    if (!route) continue;
    // Dedupe: re-roll once if too similar to an earlier variant.
    if (routes.some((r) => overlap(r, route!) > 0.6)) {
      const retry = generateOne(req, pois, profile, seed + i * 101 + 7919);
      if (retry && !routes.some((r) => overlap(r, retry) > 0.6)) route = retry;
      else continue;
    }
    routes.push(route);
  }
  return routes;
}

function overlap(a: Route, b: Route): number {
  const ids = new Set(a.stops.map((s) => s.id));
  const shared = b.stops.filter((s) => ids.has(s.id)).length;
  return shared / Math.max(1, Math.min(a.stops.length, b.stops.length));
}

function generateOne(
  req: RouteRequest,
  pois: Poi[],
  profile: VariantProfile,
  seed: number,
): Route | null {
  const maxStops = (req.maxStops ?? DEFAULT_MAX_STOPS) + profile.extraStops;
  const loop = req.loop ?? true;
  const budgetMin = req.budgetMinutes * profile.budgetScale;
  const interests = req.interests.filter((c) => !(req.avoid ?? []).includes(c));
  if (interests.length === 0) return null;

  // Radius: half the distance budget for a loop, a bit more for one-way.
  const totalKm = distanceBudgetKm(req.mode, budgetMin, Math.min(maxStops, interests.length));
  const radiusKm = Math.max(0.3, totalKm * (loop ? 0.5 : 0.7));

  const visited = req.visited ?? new Set<string>();
  const weights: Partial<Record<Category, number>> = {};
  for (const c of interests) weights[c] = profile.boost.includes(c) ? 1.5 : 1;

  const opts: ScoringOptions = {
    origin: req.origin,
    radiusKm,
    categoryWeights: weights,
    visited,
    jitter: profile.jitter,
    random: rng(seed),
  };

  // 1. Candidates within radius, in interests.
  const interestSet = new Set(interests);
  const scored = pois
    .filter((p) => interestSet.has(p.category) && haversineKm(req.origin, p) <= radiusKm)
    .map((p) => ({ p, s: scorePoi(p, opts) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  if (scored.length === 0) return null;

  // 2. Coverage first: best candidate per interest.
  const chosen: Poi[] = [];
  const chosenIds = new Set<string>();
  const chosenNames = new Set<string>();
  const fits = (candidate: Poi[]) => tourKm(req.origin, candidate, loop) <= totalKm;
  // Same-named places are usually the same thing twice: a bus stop on each
  // side of the road, or a bank and its own ATM. One per route is enough.
  const dupName = (p: Poi) => p.name !== null && chosenNames.has(normName(p.name));
  const take = (p: Poi) => {
    chosen.push(p);
    chosenIds.add(p.id);
    if (p.name) chosenNames.add(normName(p.name));
  };

  // Walk down each interest's ranked list until one fits the budget, so a
  // far-away "best" pharmacy doesn't cost us pharmacy coverage entirely.
  for (const c of interests) {
    if (chosen.length >= maxStops) break;
    for (const x of scored) {
      if (x.p.category !== c || chosenIds.has(x.p.id) || dupName(x.p)) continue;
      if (fits([...chosen, x.p])) {
        take(x.p);
        break;
      }
    }
  }

  // 3. Fill remaining slots by score, respecting the budget.
  for (const x of scored) {
    if (chosen.length >= maxStops) break;
    if (chosenIds.has(x.p.id) || dupName(x.p)) continue;
    // Avoid stacking many of one category unless it's the only interest.
    const sameCat = chosen.filter((s) => s.category === x.p.category).length;
    if (interests.length > 1 && sameCat >= 2) continue;
    if (fits([...chosen, x.p])) take(x.p);
  }

  if (chosen.length === 0) return null;

  // 4. Order and measure.
  const ordered = orderStops(req.origin, chosen, loop);
  const path: LatLon[] = [req.origin, ...ordered.map(({ lat, lon }) => ({ lat, lon }))];
  if (loop) path.push(req.origin);
  const distanceKm = pathLengthKm(path);

  return {
    id: `${profile.variant}-${seed}`,
    variant: profile.variant,
    title: profile.title,
    stops: ordered,
    path,
    distanceKm: Math.round(distanceKm * 100) / 100,
    estimatedMinutes: estimateMinutes(req.mode, distanceKm, ordered.length),
    mode: req.mode,
    categoriesCovered: [...new Set(ordered.map((s) => s.category))],
  };
}

function normName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(atm|bank|branch|bus stop|station)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tourKm(origin: LatLon, stops: Poi[], loop: boolean): number {
  const ordered = orderStops(origin, stops, loop);
  const path: LatLon[] = [origin, ...ordered];
  if (loop) path.push(origin);
  return pathLengthKm(path);
}

import { describe, expect, it } from "vitest";
import { generateRoutes } from "./generator";
import { haversineKm, orderStops, pathLengthKm } from "./geo";
import { completeRoute, EMPTY_PROGRESS, overallRank, rankForPoints } from "./familiarity";
import type { Category, Poi, RouteRequest } from "./types";

// Osu, Accra. Oxford Street area.
const ORIGIN = { lat: 5.5571, lon: -0.1824 };

/** Scatter synthetic POIs around the origin so tests don't depend on the 2 MB city file. */
function makePois(): Poi[] {
  const cats: Category[] = ["pharmacy", "groceries", "money", "food", "transport", "cafe", "worship", "fuel"];
  const pois: Poi[] = [];
  let n = 0;
  for (const cat of cats) {
    for (let i = 0; i < 12; i++) {
      // Spread 0.1–3 km out in a spiral.
      const r = 0.001 + i * 0.0025;
      const a = (n * 137.5 * Math.PI) / 180;
      pois.push({
        id: `p${n}`,
        name: i % 3 === 0 ? null : `${cat} ${i}`,
        category: cat,
        lat: ORIGIN.lat + r * Math.sin(a),
        lon: ORIGIN.lon + r * Math.cos(a),
        tags: i % 2 === 0 ? { opening_hours: "Mo-Su 08:00-20:00" } : {},
      });
      n++;
    }
  }
  return pois;
}

const POIS = makePois();

const baseReq: RouteRequest = {
  origin: ORIGIN,
  interests: ["pharmacy", "groceries", "money", "food", "transport"],
  mode: "walk",
  budgetMinutes: 45,
  seed: 42,
};

describe("geo", () => {
  it("haversine: Osu to Kotoka airport is ~5.5 km", () => {
    const d = haversineKm(ORIGIN, { lat: 5.6052, lon: -0.1668 });
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(6);
  });

  it("orderStops produces a tour no longer than the input order", () => {
    const pts = POIS.slice(0, 8);
    const naive = pathLengthKm([ORIGIN, ...pts, ORIGIN]);
    const ordered = orderStops(ORIGIN, pts, true);
    const len = pathLengthKm([ORIGIN, ...ordered, ORIGIN]);
    expect(ordered).toHaveLength(pts.length);
    expect(new Set(ordered.map((p) => p.id)).size).toBe(pts.length);
    expect(len).toBeLessThanOrEqual(naive + 1e-9);
  });
});

describe("generateRoutes", () => {
  it("returns 2–3 distinct variants", () => {
    const routes = generateRoutes(baseReq, POIS);
    expect(routes.length).toBeGreaterThanOrEqual(2);
    expect(routes.length).toBeLessThanOrEqual(3);
    const variants = new Set(routes.map((r) => r.variant));
    expect(variants.size).toBe(routes.length);
  });

  it("is deterministic for the same seed", () => {
    const a = generateRoutes(baseReq, POIS);
    const b = generateRoutes(baseReq, POIS);
    expect(a.map((r) => r.stops.map((s) => s.id))).toEqual(b.map((r) => r.stops.map((s) => s.id)));
  });

  it("changes with the seed (regenerate gives new routes)", () => {
    const key = (seed: number) =>
      generateRoutes({ ...baseReq, seed }, POIS).map((r) => r.stops.map((s) => s.id).join()).join("|");
    const distinct = new Set([1, 2, 3, 4, 5].map(key));
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });

  it("covers every requested interest when data allows", () => {
    const routes = generateRoutes(baseReq, POIS);
    for (const r of routes) {
      for (const c of baseReq.interests) expect(r.categoriesCovered).toContain(c);
    }
  });

  it("respects the time budget", () => {
    const routes = generateRoutes(baseReq, POIS);
    for (const r of routes) expect(r.estimatedMinutes).toBeLessThanOrEqual(baseReq.budgetMinutes + 1);
  });

  it("respects maxStops (+2 for deep dive)", () => {
    const routes = generateRoutes({ ...baseReq, maxStops: 4 }, POIS);
    for (const r of routes) expect(r.stops.length).toBeLessThanOrEqual(r.variant === "deep-dive" ? 6 : 4);
  });

  it("never includes avoided categories", () => {
    const routes = generateRoutes({ ...baseReq, avoid: ["money"] }, POIS);
    for (const r of routes) expect(r.categoriesCovered).not.toContain("money");
  });

  it("loops back to origin by default and not when loop=false", () => {
    const [loop] = generateRoutes(baseReq, POIS);
    expect(loop.path[0]).toEqual(ORIGIN);
    expect(loop.path[loop.path.length - 1]).toEqual(ORIGIN);
    const [open] = generateRoutes({ ...baseReq, loop: false }, POIS);
    expect(open.path[open.path.length - 1]).not.toEqual(ORIGIN);
  });

  it("prefers named places over anonymous ones", () => {
    const routes = generateRoutes(baseReq, POIS);
    const named = routes.flatMap((r) => r.stops).filter((s) => s.name).length;
    const total = routes.flatMap((r) => r.stops).length;
    expect(named / total).toBeGreaterThan(0.6);
  });

  it("avoids already visited places", () => {
    const first = generateRoutes(baseReq, POIS);
    const visited = new Set(first.flatMap((r) => r.stops.map((s) => s.id)));
    const again = generateRoutes({ ...baseReq, visited }, POIS);
    const reused = again.flatMap((r) => r.stops).filter((s) => visited.has(s.id)).length;
    const total = again.flatMap((r) => r.stops).length;
    expect(reused / total).toBeLessThan(0.5);
  });

  it("does not include two stops with the same name", () => {
    const twin: Poi[] = POIS.map((p) => ({ ...p, name: p.name ? p.category : null }));
    const routes = generateRoutes(baseReq, twin);
    for (const r of routes) {
      const names = r.stops.map((s) => s.name).filter(Boolean);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("returns nothing when no POIs are in range", () => {
    const far = { lat: 6.69, lon: -1.62 }; // Kumasi
    expect(generateRoutes({ ...baseReq, origin: far }, POIS)).toEqual([]);
  });

  it("trotro reaches further than walking for the same budget", () => {
    const walk = generateRoutes(baseReq, POIS);
    const trotro = generateRoutes({ ...baseReq, mode: "trotro" }, POIS);
    const maxD = (rs: typeof walk) => Math.max(...rs.map((r) => r.distanceKm));
    expect(maxD(trotro)).toBeGreaterThan(maxD(walk));
  });
});

describe("familiarity", () => {
  it("ranks thresholds", () => {
    expect(rankForPoints(0)).toBe("JJC");
    expect(rankForPoints(50)).toBe("Visitor");
    expect(rankForPoints(200)).toBe("Regular");
    expect(rankForPoints(500)).toBe("Local");
  });

  it("completing a route adds points and visited ids, once", () => {
    const [route] = generateRoutes(baseReq, POIS);
    const p1 = completeRoute(EMPTY_PROGRESS, route);
    const p2 = completeRoute(p1, route);
    expect(p1.completedRouteIds).toEqual([route.id]);
    expect(p2).toBe(p1);
    expect(p1.visitedPoiIds.length).toBe(route.stops.length);
    const total = Object.values(p1.hoods).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(route.stops.length * 10 * 1.5, 0);
    // 6 walked stops = 90 points; if they share a grid cell that cell is already "Visitor".
    expect(["JJC", "Visitor"]).toContain(overallRank(p1));
  });
});

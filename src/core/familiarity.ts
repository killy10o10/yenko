import type { Mode, Route } from "./types";
import { MODES } from "./modes";
import { hoodCell } from "./geo";

export type Rank = "JJC" | "Visitor" | "Regular" | "Local" | "Borga";

export interface Progress {
  /** hood cell id -> points */
  hoods: Record<string, number>;
  completedRouteIds: string[];
  visitedPoiIds: string[];
}

export const EMPTY_PROGRESS: Progress = { hoods: {}, completedRouteIds: [], visitedPoiIds: [] };

export function pointsForRoute(route: Route, mode: Mode = route.mode): number {
  return Math.round(route.stops.length * 10 * MODES[mode].familiarityMultiplier);
}

/** Apply a completed route to progress. Points go to the hood each stop sits in. */
export function completeRoute(progress: Progress, route: Route): Progress {
  if (progress.completedRouteIds.includes(route.id)) return progress;
  const perStop = pointsForRoute(route) / route.stops.length;
  const hoods = { ...progress.hoods };
  for (const s of route.stops) {
    const cell = hoodCell(s);
    hoods[cell] = Math.round(((hoods[cell] ?? 0) + perStop) * 10) / 10;
  }
  return {
    hoods,
    completedRouteIds: [...progress.completedRouteIds, route.id],
    visitedPoiIds: [...new Set([...progress.visitedPoiIds, ...route.stops.map((s) => s.id)])],
  };
}

export function rankForPoints(points: number): Rank {
  if (points >= 500) return "Local";
  if (points >= 200) return "Regular";
  if (points >= 50) return "Visitor";
  return "JJC";
}

/** Overall rank: Borga if Local in 3+ hoods, else rank of the best hood. */
export function overallRank(progress: Progress): Rank {
  const values = Object.values(progress.hoods);
  if (values.filter((v) => v >= 500).length >= 3) return "Borga";
  return rankForPoints(Math.max(0, ...values));
}

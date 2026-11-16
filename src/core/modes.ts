import type { Mode } from "./types";

export interface ModeProfile {
  label: string;
  speedKmh: number;
  /** Minutes lost per stop: waiting, boarding, parking. */
  stopOverheadMin: number;
  /** Multiplier for familiarity points. Walking teaches you the most. */
  familiarityMultiplier: number;
}

export const MODES: Record<Mode, ModeProfile> = {
  walk: { label: "Walking", speedKmh: 4.5, stopOverheadMin: 0, familiarityMultiplier: 1.5 },
  okada: { label: "Okada", speedKmh: 25, stopOverheadMin: 2, familiarityMultiplier: 1.2 },
  trotro: { label: "Trotro", speedKmh: 15, stopOverheadMin: 6, familiarityMultiplier: 1.0 },
  taxi: { label: "Taxi / Bolt / Yango", speedKmh: 22, stopOverheadMin: 3, familiarityMultiplier: 1.0 },
  car: { label: "Own car", speedKmh: 22, stopOverheadMin: 4, familiarityMultiplier: 1.0 },
};

/**
 * Streets are longer than straight lines. Planning uses straight-line
 * distance (fast, offline), so it's scaled by this to estimate the real walk.
 * ~1.4 is typical for city grids; Accra's big roads with few crossings push
 * it higher in places, and the street router corrects it once it answers.
 */
export const DETOUR_FACTOR: Record<Mode, number> = {
  walk: 1.4,
  okada: 1.35,
  trotro: 1.45,
  taxi: 1.35,
  car: 1.35,
};

/** How far (km) the whole route may be for a given mode and budget, along streets. */
export function distanceBudgetKm(mode: Mode, budgetMinutes: number, stops: number): number {
  const m = MODES[mode];
  const moving = Math.max(0, budgetMinutes - stops * m.stopOverheadMin);
  return (moving / 60) * m.speedKmh;
}

export function estimateMinutes(mode: Mode, distanceKm: number, stops: number): number {
  const m = MODES[mode];
  return Math.round((distanceKm / m.speedKmh) * 60 + stops * m.stopOverheadMin);
}

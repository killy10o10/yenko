/** Categories a POI can belong to. Ghana-first naming. */
export type Category =
  | "pharmacy"
  | "health"
  | "transport"
  | "fuel"
  | "money"
  | "groceries"
  | "market"
  | "food"
  | "cafe"
  | "nightlife"
  | "worship"
  | "safety"
  | "education"
  | "leisure"
  | "fitness"
  | "sights"
  | "grooming"
  | "shopping"
  | "services";

export interface LatLon {
  lat: number;
  lon: number;
}

import type { Hood } from "./hoods";

export interface Poi extends LatLon {
  id: string;
  name: string | null;
  category: Category;
  tags: Record<string, string>;
}

/** Shape of public/data/<city>.json, produced by scripts/fetch-pois.mjs */
export interface CityData {
  city: string;
  slug: string;
  /** [south, west, north, east] */
  bbox: [number, number, number, number];
  source: string;
  fetchedAt: string;
  count: number;
  /** Named neighbourhoods, suburbs and towns, used to name areas. */
  hoods?: Hood[];
  pois: Poi[];
}

export type Mode = "walk" | "okada" | "trotro" | "taxi" | "car";

export interface RouteRequest {
  origin: LatLon;
  interests: Category[];
  mode: Mode;
  /** Total time the user wants to spend moving, in minutes. */
  budgetMinutes: number;
  maxStops?: number;
  loop?: boolean;
  avoid?: Category[];
  visited?: Set<string>;
  seed?: number;
}

export type Variant = "essentials" | "chill" | "deep-dive";

export interface Route {
  id: string;
  variant: Variant;
  title: string;
  stops: Poi[];
  /** Ordered path including origin at the start (and end if loop). */
  path: LatLon[];
  /** Street-following geometry from a routing service, once fetched. */
  geometry?: LatLon[];
  /** True once distance and time come from real streets, not straight lines. */
  routed?: boolean;
  /** Short hops from a stop to where the street path reaches it (gates, compounds). */
  connectors?: [LatLon, LatLon][];
  distanceKm: number;
  estimatedMinutes: number;
  mode: Mode;
  categoriesCovered: Category[];
}

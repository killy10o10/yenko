import type { LucideIcon } from "lucide-react";
import { Bike, BusFront, CarFront, CarTaxiFront, Footprints } from "lucide-react";
import type { Mode, Variant } from "../core";

export const MODE_META: Record<Mode, { label: string; short: string; icon: LucideIcon }> = {
  walk: { label: "Walking", short: "Walk", icon: Footprints },
  okada: { label: "Okada", short: "Okada", icon: Bike },
  trotro: { label: "Trotro", short: "Trotro", icon: BusFront },
  taxi: { label: "Taxi or ride-hail", short: "Taxi", icon: CarTaxiFront },
  car: { label: "Own car", short: "Car", icon: CarFront },
};

export const MODE_ORDER: Mode[] = ["walk", "trotro", "okada", "taxi", "car"];

export const VARIANT_COPY: Record<Variant, { title: string; tagline: string }> = {
  essentials: { title: "The errands run", tagline: "Pharmacy, MoMo, provisions. Sorted." },
  chill: { title: "The slow stroll", tagline: "Food, coffee and somewhere to sit." },
  "deep-dive": { title: "The full tour", tagline: "Everything within reach. Bring water." },
};

/** Human label for a time budget, in a local voice. */
export function budgetLabel(min: number): string {
  if (min <= 20) return "A quick dash";
  if (min <= 40) return "A short walk";
  if (min <= 60) return "A proper stroll";
  if (min <= 100) return "A long wander";
  return "Make a day of it";
}

import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Beer,
  BusFront,
  Camera,
  Church,
  Coffee,
  Dumbbell,
  Fuel,
  GraduationCap,
  Pill,
  Scissors,
  Shield,
  ShoppingBag,
  ShoppingBasket,
  Stethoscope,
  Store,
  Trees,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import type { Category } from "../core";

export interface CategoryInfo {
  id: Category;
  label: string;
  /** One line in a local voice, shown under the label on the picker. */
  blurb: string;
  icon: LucideIcon;
  /** Pre-selected for a new user. */
  essential?: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "pharmacy", label: "Pharmacy", blurb: "Paracetamol at 9pm", icon: Pill, essential: true },
  { id: "groceries", label: "Provisions", blurb: "Supermarkets and corner shops", icon: ShoppingBasket, essential: true },
  { id: "money", label: "MoMo & banks", blurb: "Agents, ATMs, branches", icon: Banknote, essential: true },
  { id: "transport", label: "Trotro & taxis", blurb: "Stops, stations, ranks", icon: BusFront, essential: true },
  { id: "food", label: "Chop bars", blurb: "Waakye to wood-fired pizza", icon: UtensilsCrossed, essential: true },
  { id: "health", label: "Clinics", blurb: "Hospitals and doctors", icon: Stethoscope },
  { id: "market", label: "Markets", blurb: "Fresh, loud, cheaper", icon: Store },
  { id: "fuel", label: "Filling stations", blurb: "Fuel, air, late-night mart", icon: Fuel },
  { id: "cafe", label: "Cafés", blurb: "Wifi and a flat white", icon: Coffee },
  { id: "nightlife", label: "Spots & bars", blurb: "Where the hood unwinds", icon: Beer },
  { id: "worship", label: "Churches & mosques", blurb: "Sunday, Friday, any day", icon: Church },
  { id: "grooming", label: "Salons & barbers", blurb: "Fresh cut, fresh start", icon: Scissors },
  { id: "fitness", label: "Gyms & pitches", blurb: "Lift, run, kick", icon: Dumbbell },
  { id: "leisure", label: "Parks", blurb: "Shade and a bench", icon: Trees },
  { id: "sights", label: "Sights & beaches", blurb: "Worth a photo", icon: Camera },
  { id: "shopping", label: "Shops & malls", blurb: "Clothes, phones, everything", icon: ShoppingBag },
  { id: "services", label: "Tailors & mechanics", blurb: "Laundry too", icon: Wrench },
  { id: "education", label: "Schools & libraries", blurb: "Campus and quiet", icon: GraduationCap },
  { id: "safety", label: "Police", blurb: "Good to know where", icon: Shield },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<Category, CategoryInfo>;

export const DEFAULT_INTERESTS: Category[] = CATEGORIES.filter((c) => c.essential).map((c) => c.id);

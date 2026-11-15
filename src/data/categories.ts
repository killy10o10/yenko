import type { Category } from "../core";

export interface CategoryInfo {
  id: Category;
  label: string;
  emoji: string;
  /** Shown on the picker by default. */
  essential?: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "pharmacy", label: "Pharmacy", emoji: "💊", essential: true },
  { id: "groceries", label: "Provisions & supermarkets", emoji: "🛒", essential: true },
  { id: "money", label: "MoMo, banks & ATMs", emoji: "💸", essential: true },
  { id: "transport", label: "Trotro & taxi stops", emoji: "🚐", essential: true },
  { id: "food", label: "Chop bars & restaurants", emoji: "🍲", essential: true },
  { id: "health", label: "Clinics & hospitals", emoji: "🏥" },
  { id: "market", label: "Markets", emoji: "🧺" },
  { id: "fuel", label: "Filling stations", emoji: "⛽" },
  { id: "cafe", label: "Cafés", emoji: "☕" },
  { id: "nightlife", label: "Spots & bars", emoji: "🍻" },
  { id: "worship", label: "Churches & mosques", emoji: "🕊️" },
  { id: "grooming", label: "Salons & barbers", emoji: "💈" },
  { id: "fitness", label: "Gyms & pitches", emoji: "🏃" },
  { id: "leisure", label: "Parks", emoji: "🌳" },
  { id: "sights", label: "Sights & beaches", emoji: "📸" },
  { id: "shopping", label: "Shops & malls", emoji: "🛍️" },
  { id: "services", label: "Tailors, mechanics, laundry", emoji: "🧵" },
  { id: "education", label: "Schools & libraries", emoji: "🎓" },
  { id: "safety", label: "Police", emoji: "🚓" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<Category, CategoryInfo>;

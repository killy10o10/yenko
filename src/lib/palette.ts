export type Palette = "black-star" | "golden-hour";

const PALETTES: Palette[] = ["black-star", "golden-hour"];
const KEY = "yenko:palette";

/**
 * The default palette is set on <html data-palette> in index.html.
 * `?palette=golden-hour` (or `?palette=black-star`) overrides it and is
 * remembered on this device, so palettes can be compared on a real phone.
 */
export function initPalette(): void {
  const fromUrl = new URLSearchParams(location.search).get("palette");
  let pick: string | null = null;
  if (fromUrl && (PALETTES as string[]).includes(fromUrl)) {
    pick = fromUrl;
    try {
      localStorage.setItem(KEY, fromUrl);
    } catch {
      /* ignore */
    }
  } else {
    try {
      pick = localStorage.getItem(KEY);
    } catch {
      pick = null;
    }
  }
  if (pick && (PALETTES as string[]).includes(pick)) document.documentElement.dataset.palette = pick;
}

export function currentPalette(): Palette {
  const p = document.documentElement.dataset.palette;
  return p === "golden-hour" ? "golden-hour" : "black-star";
}

/** Hex mirrors of the palette for things that can't read CSS oklch (MapLibre, meta theme-color). */
export const PALETTE_HEX: Record<Palette, { light: { bg: string; route: string; casing: string }; dark: { bg: string; route: string; casing: string } }> = {
  "black-star": {
    light: { bg: "#fafaf8", route: "#141411", casing: "#ffffff" },
    dark: { bg: "#0b0b09", route: "#fbd028", casing: "#0b0b09" },
  },
  "golden-hour": {
    light: { bg: "#faf6ee", route: "#bf4e22", casing: "#faf6ee" },
    dark: { bg: "#1b1816", route: "#ea8a5e", casing: "#1b1816" },
  },
};

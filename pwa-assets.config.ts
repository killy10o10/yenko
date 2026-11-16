import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/**
 * Regenerate PWA icons from public/icon.svg:  npm run icons
 * Maskable and Apple icons get a gold background so Android's shape masks
 * and iOS's square tile both look intentional.
 */
const GOLD = "#fbd028";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.1, resizeOptions: { background: GOLD } },
    apple: { ...minimal2023Preset.apple, padding: 0.15, resizeOptions: { background: GOLD } },
  },
  images: ["public/icon.svg"],
});

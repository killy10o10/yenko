import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// GitHub Pages serves the app at https://<user>.github.io/yenko/, so production
// builds live under /yenko/. Override with BASE_PATH (e.g. "/" for a custom domain).
export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === "build" ? "/yenko/" : "/"),
  build: {
    rollupOptions: {
      output: {
        // Keep the big, rarely-changing libraries in their own cached files.
        manualChunks: {
          maplibre: ["maplibre-gl"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        // start_url and scope default to the base path, so the PWA works under /yenko/.
        name: "Yɛnkɔ",
        short_name: "Yɛnkɔ",
        description: "Explore your new hood, Ghana style.",
        lang: "en",
        theme_color: "#fbd028",
        background_color: "#fbd028",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // City data files are large; cache them at runtime, not in the precache.
        globIgnores: ["**/data/*.json"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/data/") && url.pathname.endsWith(".json"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "city-data", expiration: { maxEntries: 8 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === "tiles.openfreemap.org",
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
}));

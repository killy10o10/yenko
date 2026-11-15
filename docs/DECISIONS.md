# Architecture decision records

Short records of the choices that shape the project. Add a new entry rather than
editing an old one when a decision changes.

## ADR-001: No Google Maps Platform

**Status:** accepted · 2026-11-15

The first attempt at this app died on Google Places/Maps pricing. Every data need
has a free, open equivalent that is good enough for Ghana's major cities:

| Need | Google | We use |
|------|--------|--------|
| Places / POIs | Places API | OpenStreetMap via Overpass (bulk, offline) |
| Map tiles | Maps JS | MapLibre GL + OpenFreeMap vector tiles |
| Routing | Directions API | OSRM / OpenRouteService / Valhalla |
| Geocoding | Geocoding API | Nominatim / Photon |

Trade-off: OSM coverage in Ghana is uneven outside Accra, Kumasi and a few other
cities, and quality (opening hours, phone numbers) is thinner than Google's. We
accept this and plan for in-app corrections feeding back to OSM later.

## ADR-002: Static PWA, no backend for MVP

**Status:** accepted · 2026-11-15

Everything the MVP needs can run on the phone:

- POI data is a per-city JSON file (hundreds of KB) fetched once and cached.
- Route generation is pure TypeScript and runs locally in milliseconds.
- Progress (completed routes, familiarity) lives in IndexedDB.

A backend arrives only with features that need one: accounts, leaderboards,
shared routes, community corrections. Those go on a free tier (Supabase first
choice: Postgres + PostGIS + auth; Cloudflare Workers + D1 as the alternative).

Trade-off: no cross-device sync in MVP. Acceptable.

## ADR-003: Vite + React + TypeScript, not Next.js or Nuxt

**Status:** accepted · 2026-11-15

Considered Next.js, Nuxt, Vite+Vue, Vite+React.

- The app is a map behind a location prompt. There is nothing to server-render and
  no SEO surface, so SSR frameworks add build complexity for no benefit.
- MapLibre and geolocation are client-only; in Next/Nuxt they need `dynamic`
  imports with `ssr: false` and a pile of hydration guards.
- A plain Vite build deploys to GitHub Pages or Cloudflare Pages for free with
  zero config, and `vite-plugin-pwa` gives offline support in a few lines.
- React over Vue only because the MapLibre + React ecosystem is slightly larger
  (`react-map-gl` works with MapLibre). Vue would be fine; the core engine is
  framework-free either way, so a swap is cheap.

If a backend ever needs to live in the same repo, use a tiny Hono or Cloudflare
Worker, not Next API routes. Revisit if the app grows a public, crawlable
"explore Osu" content side; that would justify Next or Astro for those pages only.

## ADR-004: Core engine is framework-free and ships with tests

**Status:** accepted · 2026-11-15

`src/core` has no imports from React, the DOM or MapLibre. It takes POIs and a
request and returns routes. This keeps it testable with Vitest in Node, reusable
if we move to React Native or Capacitor, and easy to reason about.

## ADR-005: Mobile distribution via PWA first, Capacitor later

**Status:** accepted · 2026-11-15

Ghana is overwhelmingly Android. An installable PWA reaches users with no store
fee and no review queue. When a Play Store listing matters (trust, discoverability),
wrap the same build with Capacitor. React Native was considered and rejected for
now: a second build system is not worth it before product-market fit.

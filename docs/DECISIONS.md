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

## ADR-006: GitHub Pages hosting, public repo

**Status:** accepted · 2026-11-16

The repo goes public and the app is served from GitHub Pages at
`/yenko/`, built and deployed by `.github/workflows/deploy.yml` on every push
to `main`. Free, HTTPS (required for geolocation and the service worker), no
extra account. Vite's `base` is `/yenko/` for builds; set `BASE_PATH=/` if a
custom domain is added later. Cloudflare Pages stays the fallback if we ever
need a private repo or an Accra edge for speed.

## ADR-007: Black Star palette, Golden Hour kept switchable

**Status:** accepted · 2026-11-16

The first palette (sand + terracotta) read too close to Anthropic/Claude's
brand. The new default, Black Star, uses the Ghana flag: ink black on golden
yellow, true flag red and green as accents. Both palettes live in
`src/index.css` behind `<html data-palette>`; components use semantic tokens
(`--selected`, `--route`, `--segment`, `--eyebrow`) so either palette renders
fully. Preview the old one with `?palette=golden-hour`; make it the default by
changing one attribute in `index.html`.

## ADR-008: Street paths from FOSSGIS OSRM, planned with a detour factor

**Status:** accepted · 2026-11-16

Stops are still chosen offline with straight-line distance (fast, no network),
scaled by a per-mode detour factor (~1.4 for walking) so time budgets are
honest. After generation, each route is sent once to the free FOSSGIS OSRM
servers (`routing.openstreetmap.de`, the ones openstreetmap.org uses) for the
real street path, distance and time. If it fails, the dashed straight-line
estimate stays. Requests are sequential and cached to respect the fair-use
policy. A card says plainly when following the streets pushes a route past
the time the user asked for.

## ADR-005: Mobile distribution via PWA first, Capacitor later

**Status:** accepted · 2026-11-15

Ghana is overwhelmingly Android. An installable PWA reaches users with no store
fee and no review queue. When a Play Store listing matters (trust, discoverability),
wrap the same build with Capacitor. React Native was considered and rejected for
now: a second build system is not worth it before product-market fit.

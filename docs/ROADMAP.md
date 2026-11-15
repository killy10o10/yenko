# Roadmap

Phases, not dates. Each phase ends with something a real person in Accra can
use. Effort is a rough guess for one person working evenings.

## Phase 0 — Foundation (this commit)

- [x] Polished product definition for Ghana
- [x] Architecture, data-source and algorithm docs
- [x] POI fetch script and real Accra dataset (~13k places)
- [x] Route engine: scoring, selection, ordering, variants, with tests
- [x] Vite + React + TypeScript app shell with MapLibre map

## Phase 1 — Usable MVP (3–4 weekends)

Goal: generate and walk a route in Accra, offline, on a phone.

- [ ] Interest picker with Ghana-first categories and sensible defaults
- [ ] Budget + mode controls
- [ ] Route cards (Essentials / Chill / Deep dive) with stop list and distance
- [ ] Map shows stops, straight-line path, user position
- [ ] "Start route" mode: check off stops as you reach them (GPS proximity or tap)
- [ ] Familiarity points and rank stored in IndexedDB
- [ ] PWA: installable, app shell and city data cached
- [ ] Deploy to Cloudflare Pages or GitHub Pages
- [ ] Test with 5 people who recently moved to Accra; fix what they trip on

## Phase 2 — Better routes (2–3 weekends)

- [ ] Real road geometry via OpenRouteService (free key) with OSRM fallback
- [ ] Distance matrix from the router for honest budgets
- [ ] AccraMobile GTFS: show trotro lines at transport stops
- [ ] Opening-hours awareness (don't send people to a closed pharmacy at 9pm)
- [ ] Kumasi, Tamale, Takoradi, Cape Coast datasets (script already supports them)
- [ ] Swap-a-stop: replace one stop with the next best in that category

## Phase 3 — Social (when there are users)

- [ ] Supabase: auth (phone OTP fits Ghana better than email), progress sync
- [ ] Leaderboards per hood, district, city
- [ ] Share a route by link
- [ ] Community corrections: "this place closed", "name is wrong", fed back to OSM
- [ ] Named neighbourhoods from OSM boundaries instead of grid cells
- [ ] Offline city map tiles via PMTiles

## Phase 4 — Maybe

- [ ] Capacitor wrap for Play Store
- [ ] Twi and Ga UI strings
- [ ] Ghana Post GPS display if a licence-clean path exists
- [ ] Curated routes by locals ("Osu food crawl", "Madina market run")
- [ ] Partnerships: universities (freshers' week), NSS, relocation services

## Explicitly not planned

- Turn-by-turn navigation
- Reviews and ratings
- Anything that requires paying Google

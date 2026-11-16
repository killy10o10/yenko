# Roadmap

Phases, not dates. Each phase ends with something a real person in Accra can
use. Effort is a rough guess for one person working evenings.

## Phase 0 — Foundation ✅

- [x] Polished product definition for Ghana
- [x] Architecture, data-source and algorithm docs
- [x] POI fetch script and real Accra dataset (~13k places)
- [x] Route engine: scoring, selection, ordering, variants, with tests
- [x] Vite + React + TypeScript app shell with MapLibre map

## Phase 1 — Usable MVP

Goal: generate and walk a route in Accra, offline, on a phone.

- [x] UI rebuilt on shadcn/ui + Radix, Black Star palette, dark mode, motion
- [x] Interest picker with Ghana-first categories and sensible defaults
- [x] Time budget + mode controls
- [x] Route cards (errands run / slow stroll / full tour) with stop list and distance
- [x] Map shows stops and real street paths (FOSSGIS OSRM), straight-line fallback
- [x] Walk mode: tick off stops; passport stamp on completion
- [x] Familiarity points and rank, keyed by real hood names from OpenStreetMap
- [x] PWA icons and manifest for installing on Android and iOS
- [x] GitHub Pages deploy workflow
- [ ] Go live (repo public, Pages enabled, branch merged)
- [ ] Tick stops off automatically by GPS proximity
- [ ] Move progress from localStorage to IndexedDB
- [ ] Test with 5 people who recently moved to Accra; fix what they trip on

## Phase 2 — Better routes (2–3 weekends)

- [ ] Distance matrix from the router when choosing stops, so street detours
      (gated compounds, the motorway) don't push routes over budget
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

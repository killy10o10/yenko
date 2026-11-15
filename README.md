# Yɛnkɔ — explore your new hood, Ghana style

> *Yɛnkɔ* (Twi: "let's go"). Working name; rename later.

Yɛnkɔ turns "I just moved to Accra / Kumasi / Tamale and I don't know where anything is"
into a game. Tell it where you are and what you care about, and it hands you short,
walkable (or trotro-able) routes that string together the places you actually need:
the pharmacy, the MoMo agent, the chop bar, the trotro stop, the cold store, the
closest clinic. Complete routes, grow your **hood familiarity**, and go from
**JJC** to **Local**.

Built for people who just landed somewhere new in Ghana:

- NSS personnel posted to a town they've never lived in
- Freshers at Legon, KNUST, UCC, UDS and co.
- New hires relocating for work
- Returnees and the diaspora back for the long haul
- Visitors who want more than the hotel-to-mall loop

## Why this exists (and why it died the first time)

The original idea (2021-ish) was built on the Google Maps + Places APIs. It stalled
because those APIs cost money, and the author didn't have it. Version two is
designed around a simple constraint: **zero recurring cost until the app earns it**.

- **No Google.** Places come from OpenStreetMap, routing from open routers,
  tiles from free vector tile hosts, geocoding from Nominatim or Photon.
- **No backend for MVP.** The whole thing is a static PWA. City POI data ships as a
  JSON file that the app caches for offline use. Accounts, leaderboards and shared
  routes come later on a free tier (Supabase or Cloudflare).
- **Cheap-phone and low-data first.** Small bundle, vector tiles, offline cache,
  works on a GH₵600 Android.

See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) for the full free stack and
[docs/DECISIONS.md](docs/DECISIONS.md) for why each choice was made.

## Core features

### 1. Route generation
Pick your interests (e.g. *groceries, pharmacy, food, transport, money*), your start
point, how far you want to go and how you're moving. Yɛnkɔ generates two or three
routes, each a loop of 4–8 real places chosen to cover your interests without
sending you across town.

### 2. Customisable routes
- Distance / time budget (a 20-minute stroll vs. a half-day wander)
- Mode: walking, trotro, taxi / ride-hail (Bolt, Yango, Uber), okada, own car
- Number of stops, "must include" categories, "avoid" categories
- Swap a stop for a nearby alternative

### 3. Hood familiarity (gamification)
Every completed route earns familiarity for that area. Ranks:

| Rank | Meaning |
|------|---------|
| JJC | Johnny Just Come. You know your gate and nothing else. |
| Visitor | You can find the pharmacy and a chop bar. |
| Regular | The trotro mates know your stop. |
| Local | You give directions to other people. |
| Borga | Honorary. You've explored multiple hoods. |

Later: a leaderboard per neighbourhood, district and city.

## Ghana-specific touches

- **Categories that matter here:** MoMo agents, trotro stations and stops, filling
  stations, chop bars, cold stores, provision shops, markets, churches and mosques,
  salons and barbers, tailors, mechanics, police posts.
- **Transport reality:** trotro and shared taxi routes are not "transit" in the
  Google sense. Phase 2 pulls in the open AccraMobile GTFS data for trotro lines.
- **Ghana Post GPS:** every stop can show its digital address (e.g. GA-183-8164)
  once a free lookup path is confirmed. See data sources doc.
- **Daylight-aware:** routes default to daytime and prefer busier, lit roads.
- **Local language:** UI strings in English first, Twi and Ga as stretch goals.

## Project layout

```
.
├── README.md
├── docs/
│   ├── ARCHITECTURE.md      system design + diagrams
│   ├── ROUTE_ALGORITHM.md   how routes are generated
│   ├── DATA_SOURCES.md      the free stack, with limits and fallbacks
│   ├── ROADMAP.md           phases to MVP and beyond
│   └── DECISIONS.md         architecture decision records
├── scripts/
│   └── fetch-pois.mjs       pulls POIs for a city from OpenStreetMap
├── public/data/             generated city POI files (accra.json, ...)
└── src/
    ├── core/                pure TypeScript: types, geo maths, scoring, generator
    ├── data/                loading and caching city data
    ├── map/                 MapLibre map view
    └── ui/                  React components
```

## Getting started

```bash
npm install
npm run dev
```

Refresh the Accra POI data (free, Overpass API, be gentle):

```bash
npm run data:fetch -- accra
```

Run the route-generation tests:

```bash
npm test
```

## Status

Pre-MVP. The route engine and data pipeline exist and are tested. The map UI is a
first pass. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Licence

Code: MIT. Map data: © OpenStreetMap contributors, ODbL.

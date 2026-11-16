# Data sources: the zero-cost stack

Every source below is free at MVP scale. Each entry lists what it gives us, its
limits, and the fallback if it goes away.

## Places / points of interest

**OpenStreetMap (OSM)** via the **Overpass API**

- What: every tagged place in a bounding box: pharmacies, hospitals, bus stops,
  banks, ATMs, markets, restaurants, bars, churches, mosques, schools, and so on.
  Licence: ODbL (attribution required, which we give).
- How we use it: `scripts/fetch-pois.mjs` runs a single Overpass query per city
  and writes `public/data/<city>.json`. The app loads that file; it never calls
  Overpass at runtime.
- Limits: public Overpass servers are shared and will refuse heavy or frequent
  queries. Run the script occasionally (weekly is plenty), never in CI on every
  push. For bulk work, download the **Geofabrik Ghana extract** (`ghana-latest.osm.pbf`,
  ~100 MB) and filter it locally with `osmium`.
- Ghana coverage: good in Accra, Tema, Kumasi; decent in Takoradi, Cape Coast,
  Tamale; thin elsewhere. Many places lack names or opening hours.
- Ghana-specific tags to watch: `amenity=mobile_money_agent` (MoMo),
  `amenity=bus_station` (trotro stations), `highway=bus_stop` (trotro stops),
  `shop=general` (provision shops), `amenity=marketplace`. Chop bars are usually
  `amenity=restaurant` + `cuisine=ghanaian` or `amenity=fast_food`.
- Fallback: none needed; OSM is the base layer. Enrichment can come later from
  user corrections.

## Map tiles and rendering

**MapLibre GL JS** (rendering) + **OpenFreeMap** (vector tiles)

- MapLibre is the open fork of Mapbox GL. Free, no key, no telemetry.
- OpenFreeMap serves OSM-based vector tiles with no API key and no usage cap
  (as of late 2025). Styles: `liberty`, `bright`, `positron`.
- Fallbacks: **Protomaps** PMTiles (self-host a Ghana extract on Cloudflare R2's
  free tier, a few hundred MB), or **MapTiler** free tier (100k tile loads/month,
  needs a key). Offline map tiles for a whole city is a Phase 3 item via PMTiles.

## Routing (turning an ordered list of stops into a road path)

Stops are picked with straight-line distance scaled by a per-mode detour
factor. Once a route exists, the app fetches its real street path from the
**FOSSGIS OSRM** servers at `routing.openstreetmap.de` (`routed-foot` for
walking, `routed-car` for everything else): no key, CORS enabled, fair use,
one request per route. See ADR-008.

Other options, for when usage grows:

1. **OpenRouteService** — free key, ~2,000 directions requests/day, has a
   `matrix` endpoint for many-to-many distances. Walking, cycling, driving.
2. **OSRM public demo** — no key, no SLA, best effort. Good for development.
3. **Valhalla** public instances (e.g. the FOSSGIS one) — similar to OSRM.
4. **Self-hosted OSRM** — Docker + Ghana extract on an Oracle Cloud Always Free VM.
   Unlimited, ours, ~20 minutes to set up. This is the plan once usage grows.

## Hood names

`scripts/fetch-pois.mjs` also pulls `place=neighbourhood|quarter|suburb|town|village`
nodes into each city file's `hoods` list (267 for Accra). The app names an
area after the nearest one, preferring specific neighbourhoods over town
centres. `--hoods-only` refreshes just these, which is a light query that still
works when the public Overpass servers are struggling.

## Geocoding (text → coordinates, and the reverse)

- **Nominatim** (OSM): free public instance, 1 request/second, must send a
  descriptive User-Agent, no bulk/autocomplete. Fine for "where am I" reverse
  geocoding.
- **Photon** (komoot): free, supports search-as-you-type, OSM-based. Use for the
  start-point search box.
- Most users will just tap "use my location", which needs no geocoder at all.

## Trotro and public transport

- **AccraMobile3 GTFS** — open dataset of ~300 trotro routes and stops in Greater
  Accra, collected in 2017 by AFD / Accra Metropolitan Assembly. Old but still the
  best open trotro data that exists. Phase 2: load it, show lines near a stop,
  and bias "transport" stops toward real stations.
- OSM `route=bus` relations are patchy in Ghana; use them to supplement, not lead.
- Nothing equivalent exists for Kumasi; treat trotro data as Accra-only until
  someone maps it.

## Ghana Post GPS (digital addresses)

- GhanaPostGPS has an API but it is not openly licensed and the public web form
  is rate-limited. Do **not** depend on it for MVP.
- The address grid is a deterministic function of coordinates, and community
  reimplementations exist. Revisit in Phase 3; show the digital address only if a
  licence-clean path is confirmed.

## Backend (Phase 3+), when needed

- **Supabase free tier**: Postgres with PostGIS, auth, row-level security, 500 MB
  DB, 50k monthly active users. Covers accounts, completed routes, leaderboards,
  shared routes, community corrections. First choice.
- **Cloudflare Pages + Workers + D1**: generous free tier, great for Ghana
  latency (Cloudflare has a POP in Accra). Alternative if we outgrow Supabase's
  pausing of inactive free projects.

## Hosting

- **GitHub Pages** or **Cloudflare Pages**: free static hosting with HTTPS, which
  the PWA and geolocation APIs require. Cloudflare's Accra edge makes it the
  better pick for first-load speed on local networks.

## What this costs

GH₵0 per month until the app has enough users to need a self-hosted router or a
paid Supabase plan. By then it should be clear whether the thing has legs.

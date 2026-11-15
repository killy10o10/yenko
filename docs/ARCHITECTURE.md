# Architecture

## One-paragraph version

Yɛnkɔ is a static progressive web app. A build-time script pulls points of
interest (POIs) for each supported Ghanaian city from OpenStreetMap into a JSON
file. At runtime the app loads the city file, caches it, and runs a pure
TypeScript route generator on the phone. The map is MapLibre with free vector
tiles. There is no server in the MVP. A backend is added in Phase 3 for
accounts, leaderboards and shared routes.

## System context

```mermaid
flowchart LR
    U([User on Android / iOS / desktop browser])
    subgraph PWA["Yɛnkɔ PWA (static, cached offline)"]
        UI[React UI]
        MAP[MapLibre GL map]
        CORE[Route engine<br/>src/core]
        STORE[(IndexedDB<br/>progress, cached city data)]
    end
    TILES[OpenFreeMap<br/>vector tiles]
    CITY[/public/data/accra.json/]
    ROUTER[OSRM / OpenRouteService<br/>optional road geometry]
    GEO[Photon / Nominatim<br/>optional search]

    U --> UI
    UI --> MAP
    UI --> CORE
    CORE --> STORE
    UI --> STORE
    MAP --> TILES
    UI -. first load .-> CITY
    UI -. Phase 2 .-> ROUTER
    UI -. Phase 2 .-> GEO
```

## Data pipeline (offline, run by a developer)

```mermaid
flowchart LR
    OSM[(OpenStreetMap)] -->|Overpass query<br/>per city bbox| S[scripts/fetch-pois.mjs]
    S -->|tag → category mapping| J[/public/data/city.json/]
    J -->|committed to repo,<br/>served as static asset| PWA[PWA]
```

The JSON file is the contract between the data world and the app. Its shape
(`CityData` in `src/core/types.ts`) is deliberately boring: a list of POIs with
id, name, category, lat, lon and a handful of useful tags. Anything that
produces that shape (Overpass today, a Geofabrik extract tomorrow, a Supabase
table later) can feed the app without touching the engine.

## Runtime layers

| Layer | Folder | Depends on | Purpose |
|-------|--------|-----------|---------|
| Core | `src/core` | nothing | Types, geo maths, scoring, route generation. Pure functions, fully unit tested. |
| Data | `src/data` | core | Load a city file, cache it, filter by bounds, category registry. |
| Map | `src/map` | core, MapLibre | Render the map, stops and route lines. |
| UI | `src/ui` | all above, React | Screens: pick interests, see routes, walk a route, progress. |
| App | `src/App.tsx` | ui | Wiring and routing between screens. |

Dependency direction is strictly downward. The core never imports React.

## Route request flow

```mermaid
sequenceDiagram
    actor U as User
    participant UI
    participant D as Data layer
    participant C as Core engine
    participant M as Map

    U->>UI: pick interests, mode, budget, tap "Generate"
    UI->>D: getCity("accra")
    D-->>UI: CityData (from cache or network)
    UI->>C: generateRoutes(request, pois)
    C->>C: filter candidates by radius
    C->>C: score candidates
    C->>C: select stops per interest within budget
    C->>C: order stops (nearest neighbour + 2-opt)
    C-->>UI: Route[] (2–3 variants)
    UI->>M: draw stops + polyline
    U->>UI: start route, check off stops
    UI->>D: save progress (IndexedDB)
```

## Offline and low-data behaviour

- Service worker (`vite-plugin-pwa`) precaches the app shell.
- City JSON is cached on first load with a stale-while-revalidate strategy.
- Map tiles are cached by MapLibre's own tile cache for the session; whole-city
  offline tiles (PMTiles) are a Phase 3 feature.
- Route generation never needs the network.
- Progress is stored locally. Nothing is lost if the user is offline for a week.

## Phase 3 backend (sketch)

```mermaid
flowchart LR
    PWA --> SB[(Supabase<br/>Postgres + PostGIS + Auth)]
    SB --> LB[Leaderboards<br/>per hood / district / city]
    SB --> SH[Shared routes]
    SB --> FIX[Community corrections<br/>→ periodic OSM upload]
```

Row-level security keeps each user's progress private; leaderboards read from
a materialised view. Nothing about the PWA changes except that progress syncs.

## Non-goals (for now)

- Turn-by-turn voice navigation. Link out to Google Maps / OsmAnd for the
  "take me there" moment; we own discovery, not navigation.
- Real-time trotro tracking. Nobody has that data.
- Reviews and ratings. That is a different product with a moderation problem.

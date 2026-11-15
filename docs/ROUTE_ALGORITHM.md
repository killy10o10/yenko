# Route generation

Input: a `RouteRequest` and a list of POIs. Output: 2–3 `Route`s, each an
ordered list of stops that starts (and by default ends) at the user's location.

## Request

```ts
interface RouteRequest {
  origin: { lat: number; lon: number };
  interests: Category[];        // e.g. ["pharmacy", "groceries", "food", "transport"]
  mode: "walk" | "trotro" | "taxi" | "okada" | "car";
  budgetMinutes: number;        // total time the user wants to spend moving
  maxStops?: number;            // default 6
  loop?: boolean;               // return to origin, default true
  avoid?: Category[];
  visited?: Set<string>;        // POI ids the user already completed
  seed?: number;                // deterministic variation
}
```

## Steps

### 1. Convert the budget to a distance

Each mode has a speed and a "radius factor". Walking at ~4.5 km/h with a
30-minute budget gives ~2.2 km of total path, so candidates are pulled from a
radius of roughly half that. Trotro and car get bigger radii but a penalty per
stop (you have to get on and off something).

| Mode | Speed km/h | Per-stop overhead (min) | Notes |
|------|-----------:|------------------------:|-------|
| walk | 4.5 | 0 | Default. Accra heat is factored as a slightly low speed. |
| okada | 25 | 2 | |
| trotro | 15 | 6 | Waiting + walking to the stop. |
| taxi | 22 | 3 | Bolt / Yango / Uber / drop-in. |
| car | 22 | 4 | Parking. |

### 2. Candidate filter

Keep POIs within the radius whose category is in `interests` and not in
`avoid`. Drop POIs the user already visited unless there are too few left.

### 3. Score each candidate

```
score = categoryWeight
      × distanceDecay(d)        // 1 at origin → ~0.3 at radius edge
      × quality                 // +named, +opening_hours, +phone/website
      × novelty                 // 1.0 unvisited, 0.2 visited
      × jitter(seed)            // ±20–40 % by variant, so regenerating reshuffles
```

Quality matters more than it sounds: OSM in Ghana has many unnamed
`highway=bus_stop` nodes and the user wants the named ones.

### 4. Select stops

Greedy with coverage first:

1. For each interest category, walk down its ranked candidates and take the
   first one that fits the budget. This guarantees every interest appears if
   the data allows, without a far-away "best" pharmacy costing coverage.
2. Fill remaining slots (up to `maxStops`) with the best remaining candidates
   from any interest, skipping any that would push the estimated total path over
   the distance budget.

Estimated path length is recomputed after each insertion using the ordering
step below, so the budget check is honest.

### 5. Order stops

Travelling-salesman-lite: nearest-neighbour from the origin, then 2-opt
improvement until no swap shortens the tour. With ≤ 8 stops this is
instantaneous. If `loop` is true the path returns to origin.

### 6. Variants

Run steps 3–5 three times with different seeds and different personalities:

| Variant | Tweak |
|---------|-------|
| Essentials | Weight pharmacy, groceries, money, transport ×1.5; shortest budget. |
| Chill | Weight food, cafe, leisure, sights ×1.5; full budget. |
| Deep dive | Full budget, `maxStops` + 2, extra jitter. |

Deduplicate: if two variants share more than 60 % of stops, re-run the second
with a new seed once; if still similar, drop it.

### 7. Geometry (optional)

The MVP draws straight lines between stops. Phase 2 asks a routing engine for
the real road path; the stop list does not change.

## Familiarity model

Each completed route adds points to the hood the stops fall in:

```
points = stops × 10 × modeMultiplier    // walk 1.5, okada 1.2, others 1.0
```

A "hood" in MVP is a ~1 km grid cell (geohash precision 6). Later it maps to
named neighbourhoods and districts via OSM boundaries. Rank thresholds:
JJC 0, Visitor 50, Regular 200, Local 500, Borga 500 in 3+ hoods.

## Known weaknesses, by design

- Straight-line distance ignores the Odaw river, the motorway and walls around
  gated estates. Acceptable for picking stops; fixed by the Phase 2 routing call.
- Category coverage depends on OSM tagging. A chop bar tagged as a generic
  `amenity=restaurant` with no cuisine looks like any other restaurant.
- No notion of opening hours in selection yet. Easy add once `opening_hours`
  parsing is in.

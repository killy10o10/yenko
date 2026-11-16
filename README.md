# Yɛnkɔ

> *Yɛnkɔ* is Twi for "let's go". It's a working name. I'll probably change it, but
> it sounds better than "Neighbourhood Explorer", which is what I called it the
> first time round.

I moved around a lot: new areas, new routines, that first week of not knowing
where the nearest pharmacy is or which trotro stop is actually mine. Everyone in
Ghana has done this at some point. NSS posting. Freshers' week at Legon or KNUST.
A new job on the other side of Accra. Coming back from abroad to a city that
rearranged itself while you were away.

Yɛnkɔ is the app I wished I had on those days. You tell it where you are and what
you care about, and it hands you a short, walkable route through the places you
actually need: the pharmacy, the MoMo agent, a decent chop bar, the provisions
shop, the right trotro stop. Walk it, tick the stops off, and your **hood
familiarity** goes up. Start as a **JJC**, work your way to **Local**.

## Why it died the first time, and why I'm building it again

I first sketched this around 2021 on top of the Google Maps and Places APIs. It
stalled for two honest reasons: those APIs cost money and I didn't have it, and I
didn't know enough backend to make the rest work.

I still don't have money to burn on APIs. So this version is built around one
rule: **it costs me nothing to run until it earns something.**

- **No Google.** Places come from OpenStreetMap, routing from open routers, map
  tiles from a free vector tile host, geocoding from Nominatim or Photon.
- **No backend, yet.** The whole app is a static PWA. Each city's places ship as
  one JSON file the app caches for offline use. Accounts, leaderboards and shared
  routes come later on a free tier.
- **Built for the phones people actually have.** Small bundle, vector tiles,
  offline-first, fine on a GH₵600 Android with a 1 GB bundle.

The full free stack, with limits and fallbacks, is in
[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md). Why I chose each thing is in
[docs/DECISIONS.md](docs/DECISIONS.md).

## What it does

**Routes from what you need.** Pick your interests, your start point, how long
you have and how you're moving. Yɛnkɔ gives you three takes on the same hood:

| Route | What it's for |
|-------|---------------|
| The errands run | Pharmacy, MoMo, provisions. Sorted. |
| The slow stroll | Food, coffee and somewhere to sit. |
| The full tour | Everything within reach. Bring water. |

**Routes that respect your time.** The time budget is real: walking, trotro,
okada, taxi and car each have their own speed and their own faff per stop.

**A hood passport.** Finish a route and it gets stamped. Ranks go JJC, Visitor,
Regular, Local, and Borga once you're Local in three hoods. Later: a leaderboard
per neighbourhood, district and city, so Osu can argue with East Legon.

## Ghana first

- Categories that make sense here: MoMo agents, trotro stops and stations,
  filling stations, chop bars, cold stores and provision shops, markets, churches
  and mosques, salons and barbers, tailors, mechanics, police posts.
- Trotro is not "transit" the way Google means it. Phase 2 uses the open
  AccraMobile GTFS data to show real lines at the stops.
- Ghana Post GPS addresses on each stop, once I find a licence-clean way to get
  them.
- Daylight-aware by default. Nobody needs a 9pm stroll through an unlit street.
- English first, Twi and Ga when I get to it.

## The look

I'm a UX engineer, so this part matters to me as much as the routing. The UI is
built on shadcn/ui and Radix for accessibility, with Tailwind on top. The palette
is **Black Star**: ink black on golden yellow, with the flag's red and green as
accents and a line of kente where a divider would be boring. Type is Bricolage
Grotesque and DM Sans, self-hosted so it works offline. Animations are real but
quiet, and they switch off if your phone asks for reduced motion.

My first palette, **Golden Hour** (sand and terracotta), is still in there. I
liked it, but it looked a bit too much like someone else's brand. Add
`?palette=golden-hour` to the URL to see it.

## Where things live

```
.
├── README.md
├── docs/
│   ├── ARCHITECTURE.md      system design with diagrams
│   ├── ROUTE_ALGORITHM.md   how routes get picked and ordered
│   ├── DATA_SOURCES.md      the free stack, limits and fallbacks
│   ├── ROADMAP.md           phases to MVP and beyond
│   └── DECISIONS.md         why I chose what I chose
├── scripts/
│   └── fetch-pois.mjs       pulls a city's places from OpenStreetMap
├── public/data/             generated city files (accra.json, ...)
└── src/
    ├── core/                pure TypeScript: types, geo maths, scoring, generator
    ├── data/                city loading, categories, copy
    ├── features/            setup, routes, walk, passport, layout
    ├── components/          shadcn/ui kit and hand-drawn illustrations
    └── map/                 MapLibre map view
```

## Try it

It's live at **https://killy10o10.github.io/yenko/**. On Android, open it in
Chrome and choose "Add to Home screen" (or "Install app"). On iPhone, open it in
Safari, tap Share, then "Add to Home Screen".

## Run it

```bash
npm install
npm run dev
```

Every push to `main` builds, tests and deploys to GitHub Pages.

Regenerate the app icons after editing `public/icon.svg`:

```bash
npm run icons
```

Refresh the Accra places from OpenStreetMap (free, be gentle with the public
Overpass servers):

```bash
npm run data:fetch -- accra
```

Tests for the route engine, including a smoke test on the real Accra data:

```bash
npm test
```

## Where it is right now

Pre-MVP, but it works: pick interests, tap the map, get three routes that
follow real streets in Accra, walk one, and get your passport stamped. The roadmap is in [docs/ROADMAP.md](docs/ROADMAP.md).

If you've just moved somewhere in Ghana and want to try it, I'd genuinely like to
hear what it got wrong.

## Licence

Code is MIT. Map data is © OpenStreetMap contributors, under the ODbL.

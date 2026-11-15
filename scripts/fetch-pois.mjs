#!/usr/bin/env node
/**
 * Fetch points of interest for a Ghanaian city from OpenStreetMap via the
 * Overpass API and write them to public/data/<city>.json.
 *
 * Free, no API key. Be polite: Overpass public servers are shared and
 * rate-limited, so run this occasionally, not on every build.
 *
 * Usage:  node scripts/fetch-pois.mjs accra
 *         node scripts/fetch-pois.mjs kumasi
 */
import { writeFile, mkdir } from "node:fs/promises";

// Bounding boxes: [south, west, north, east]
const CITIES = {
  accra: { name: "Accra", bbox: [5.52, -0.32, 5.72, -0.02] },
  kumasi: { name: "Kumasi", bbox: [6.62, -1.68, 6.76, -1.54] },
  takoradi: { name: "Sekondi-Takoradi", bbox: [4.86, -1.80, 4.96, -1.70] },
  tamale: { name: "Tamale", bbox: [9.36, -0.90, 9.46, -0.80] },
  "cape-coast": { name: "Cape Coast", bbox: [5.08, -1.30, 5.14, -1.22] },
};

// OSM tag -> Yenko category. Order matters: first match wins.
const CATEGORY_RULES = [
  ["amenity=pharmacy", "pharmacy"],
  ["amenity=hospital", "health"],
  ["amenity=clinic", "health"],
  ["amenity=doctors", "health"],
  ["amenity=bus_station", "transport"],
  ["highway=bus_stop", "transport"],
  ["amenity=taxi", "transport"],
  ["amenity=fuel", "fuel"],
  ["amenity=bank", "money"],
  ["amenity=atm", "money"],
  ["amenity=mobile_money_agent", "money"],
  ["amenity=money_transfer", "money"],
  ["shop=supermarket", "groceries"],
  ["shop=convenience", "groceries"],
  ["shop=general", "groceries"],
  ["shop=greengrocer", "groceries"],
  ["amenity=marketplace", "market"],
  ["amenity=restaurant", "food"],
  ["amenity=fast_food", "food"],
  ["amenity=cafe", "cafe"],
  ["amenity=bar", "nightlife"],
  ["amenity=pub", "nightlife"],
  ["amenity=nightclub", "nightlife"],
  ["amenity=place_of_worship", "worship"],
  ["amenity=police", "safety"],
  ["amenity=school", "education"],
  ["amenity=university", "education"],
  ["amenity=college", "education"],
  ["amenity=library", "education"],
  ["leisure=park", "leisure"],
  ["leisure=fitness_centre", "fitness"],
  ["leisure=sports_centre", "fitness"],
  ["leisure=pitch", "fitness"],
  ["tourism=attraction", "sights"],
  ["tourism=museum", "sights"],
  ["historic=*", "sights"],
  ["natural=beach", "sights"],
  ["shop=hairdresser", "grooming"],
  ["shop=beauty", "grooming"],
  ["shop=clothes", "shopping"],
  ["shop=mall", "shopping"],
  ["shop=tailor", "services"],
  ["shop=car_repair", "services"],
  ["craft=tailor", "services"],
  ["shop=laundry", "services"],
  ["amenity=post_office", "services"],
];

function categorise(tags) {
  for (const [rule, cat] of CATEGORY_RULES) {
    const [k, v] = rule.split("=");
    if (tags[k] !== undefined && (v === "*" || tags[k] === v)) return cat;
  }
  return null;
}

function buildQuery(bbox) {
  const b = bbox.join(",");
  const selectors = [
    'amenity~"^(pharmacy|hospital|clinic|doctors|bus_station|taxi|fuel|bank|atm|mobile_money_agent|money_transfer|marketplace|restaurant|fast_food|cafe|bar|pub|nightclub|place_of_worship|police|school|university|college|library|post_office)$"',
    'highway="bus_stop"',
    'shop~"^(supermarket|convenience|general|greengrocer|hairdresser|beauty|clothes|mall|tailor|car_repair|laundry)$"',
    'leisure~"^(park|fitness_centre|sports_centre|pitch)$"',
    'tourism~"^(attraction|museum)$"',
    'historic',
    'natural="beach"',
    'craft="tailor"',
  ];
  const body = selectors.map((s) => `nwr[${s}](${b});`).join("\n  ");
  return `[out:json][timeout:180];\n(\n  ${body}\n);\nout center tags;`;
}

async function main() {
  const key = process.argv[2] ?? "accra";
  const city = CITIES[key];
  if (!city) {
    console.error(`Unknown city "${key}". Known: ${Object.keys(CITIES).join(", ")}`);
    process.exit(1);
  }
  const query = buildQuery(city.bbox);
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  let json;
  for (const url of endpoints) {
    try {
      console.error(`Querying ${url} for ${city.name}...`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "yenko-poi-fetch/0.1" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = await res.json();
      break;
    } catch (e) {
      console.error(`  failed: ${e.message}`);
    }
  }
  if (!json) {
    console.error("All Overpass endpoints failed.");
    process.exit(2);
  }

  const pois = [];
  for (const el of json.elements) {
    const tags = el.tags ?? {};
    const category = categorise(tags);
    if (!category) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    pois.push({
      id: `${el.type[0]}${el.id}`,
      name: tags.name ?? tags["name:en"] ?? null,
      category,
      lat: +lat.toFixed(6),
      lon: +lon.toFixed(6),
      tags: pick(tags, ["amenity", "shop", "leisure", "tourism", "historic", "highway", "cuisine", "opening_hours", "phone", "website", "brand", "operator", "religion", "addr:street", "addr:suburb"]),
    });
  }

  const out = {
    city: city.name,
    slug: key,
    bbox: city.bbox,
    source: "OpenStreetMap contributors (ODbL) via Overpass API",
    fetchedAt: new Date().toISOString(),
    count: pois.length,
    pois,
  };
  await mkdir("public/data", { recursive: true });
  const file = `public/data/${key}.json`;
  await writeFile(file, JSON.stringify(out));
  const byCat = pois.reduce((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {});
  console.error(`Wrote ${pois.length} POIs to ${file}`);
  console.error(JSON.stringify(byCat, null, 2));
}

function pick(obj, keys) {
  const o = {};
  for (const k of keys) if (obj[k] !== undefined) o[k] = obj[k];
  return o;
}

main();

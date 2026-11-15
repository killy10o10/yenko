import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateRoutes } from "./generator";
import type { CityData } from "./types";

/**
 * Smoke test against the real Accra dataset, if it has been fetched.
 * Skipped when public/data/accra.json is absent so CI doesn't need Overpass.
 */
const FILE = "public/data/accra.json";
const has = existsSync(FILE);

describe.skipIf(!has)("real Accra data", () => {
  const city: CityData = has ? JSON.parse(readFileSync(FILE, "utf8")) : null;

  const spots = [
    { name: "Osu, Oxford Street", lat: 5.5571, lon: -0.1824 },
    { name: "East Legon, A&C Mall", lat: 5.6366, lon: -0.1572 },
    { name: "Madina Market", lat: 5.6771, lon: -0.1663 },
    { name: "Dansoman", lat: 5.5406, lon: -0.2644 },
  ];

  for (const spot of spots) {
    it(`walking 45 min from ${spot.name} finds essentials`, () => {
      const routes = generateRoutes(
        {
          origin: spot,
          interests: ["pharmacy", "groceries", "money", "transport", "food"],
          mode: "walk",
          budgetMinutes: 45,
          seed: 3,
        },
        city.pois,
      );
      expect(routes.length).toBeGreaterThanOrEqual(2);
      for (const r of routes) {
        expect(r.stops.length).toBeGreaterThanOrEqual(3);
        expect(r.estimatedMinutes).toBeLessThanOrEqual(46);
        expect(r.categoriesCovered.length).toBeGreaterThanOrEqual(3);
      }
      // Print one so a human can eyeball it in the test output.
      const r = routes[0];
      console.log(
        `${spot.name} / ${r.title}: ${r.distanceKm} km, ~${r.estimatedMinutes} min\n  ` +
          r.stops.map((s, i) => `${i + 1}. [${s.category}] ${s.name ?? "(unnamed)"}`).join("\n  "),
      );
    });
  }

  it("generates in well under 100 ms on ~13k POIs", () => {
    const t0 = performance.now();
    generateRoutes(
      { origin: spots[0], interests: ["pharmacy", "food", "cafe", "sights"], mode: "walk", budgetMinutes: 60 },
      city.pois,
    );
    expect(performance.now() - t0).toBeLessThan(100);
  });
});

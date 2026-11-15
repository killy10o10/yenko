import type { CityData } from "../core";

export interface CityMeta {
  slug: string;
  name: string;
  center: { lat: number; lon: number };
}

/** Cities with a data file in public/data. Add here after running data:fetch. */
export const CITIES: CityMeta[] = [
  { slug: "accra", name: "Accra", center: { lat: 5.5913, lon: -0.1857 } },
];

const cache = new Map<string, Promise<CityData>>();

/** Fetch a city's POI file. The service worker caches it for offline use. */
export function loadCity(slug: string): Promise<CityData> {
  let p = cache.get(slug);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/${slug}.json`).then((r) => {
      if (!r.ok) throw new Error(`Could not load city data for ${slug} (${r.status})`);
      return r.json() as Promise<CityData>;
    });
    cache.set(slug, p);
  }
  return p;
}

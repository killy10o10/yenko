import { useEffect, useMemo, useState } from "react";
import {
  completeRoute,
  generateRoutes,
  MODES,
  overallRank,
  type Category,
  type CityData,
  type LatLon,
  type Mode,
  type Progress,
  type Route,
} from "./core";
import { CITIES, loadCity } from "./data/city";
import { loadProgress, saveProgress } from "./data/progress";
import { MapView } from "./map/MapView";
import { InterestPicker } from "./ui/InterestPicker";
import { RouteCard } from "./ui/RouteCard";

const DEFAULT_INTERESTS: Category[] = ["pharmacy", "groceries", "money", "transport", "food"];

export function App() {
  const city = CITIES[0];
  const [data, setData] = useState<CityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<LatLon | null>(null);
  const [interests, setInterests] = useState<Category[]>(DEFAULT_INTERESTS);
  const [mode, setMode] = useState<Mode>("walk");
  const [budget, setBudget] = useState(45);
  const [seed, setSeed] = useState(1);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    loadCity(city.slug).then(setData).catch((e: Error) => setError(e.message));
  }, [city.slug]);

  useEffect(() => saveProgress(progress), [progress]);

  const active = useMemo(() => routes.find((r) => r.id === activeId) ?? null, [routes, activeId]);

  const locate = () => {
    if (!navigator.geolocation) return setError("Geolocation not available. Tap the map instead.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Couldn't get your location. Tap the map to set a start point."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const generate = () => {
    if (!data || !origin) return;
    const next = generateRoutes(
      { origin, interests, mode, budgetMinutes: budget, seed, visited: new Set(progress.visitedPoiIds) },
      data.pois,
    );
    setSeed((s) => s + 1);
    setRoutes(next);
    setActiveId(next[0]?.id ?? null);
    setError(next.length ? null : "Nothing found nearby for those interests. Try a bigger budget or more interests.");
  };

  return (
    <div className="app">
      <header>
        <h1>Yɛnkɔ</h1>
        <span className="rank">{overallRank(progress)} · {city.name}</span>
      </header>

      <aside className="panel">
        <h2>Start</h2>
        <button className="primary" type="button" onClick={locate}>
          📍 Use my location
        </button>
        <p className="hint">{origin ? `Start: ${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}` : "Or tap anywhere on the map."}</p>

        <h2>Interests</h2>
        <InterestPicker selected={interests} onChange={setInterests} />

        <h2>How are you moving?</h2>
        <div className="row">
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            {Object.entries(MODES).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <label htmlFor="budget">Time: {budget} min</label>
        </div>
        <input id="budget" type="range" min={15} max={180} step={5} value={budget} onChange={(e) => setBudget(+e.target.value)} />

        <button className="primary" type="button" onClick={generate} disabled={!data || !origin || interests.length === 0}>
          {data ? "Yɛnkɔ — generate routes" : "Loading Accra…"}
        </button>
        {error && <p className="error">{error}</p>}

        {routes.length > 0 && (
          <>
            <h2>Routes</h2>
            <div className="routes">
              {routes.map((r) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  active={r.id === activeId}
                  completed={progress.completedRouteIds.includes(r.id)}
                  onSelect={() => setActiveId(r.id)}
                  onComplete={() => setProgress((p) => completeRoute(p, r))}
                />
              ))}
            </div>
          </>
        )}
        {data && <p className="hint">{data.count.toLocaleString()} places · {data.source}</p>}
      </aside>

      <MapView center={city.center} origin={origin} route={active} onPickOrigin={setOrigin} />
    </div>
  );
}

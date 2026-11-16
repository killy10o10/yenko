import { useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  completeRoute,
  dominantHood,
  generateRoutes,
  hoodResolver,
  overallRank,
  type Category,
  type CityData,
  type LatLon,
  type Mode,
  type Progress,
  type Route,
} from "@/core";
import { CITIES, loadCity } from "@/data/city";
import { DEFAULT_INTERESTS } from "@/data/categories";
import { loadProgress, saveProgress } from "@/data/progress";
import { routeOnStreets } from "@/data/routing";
import { useTheme } from "@/lib/theme";
import { useMediaQuery } from "@/lib/use-media-query";
import { MapView } from "@/map/MapView";
import { AppHeader } from "@/features/layout/AppHeader";
import { Panel, type SnapRequest } from "@/features/layout/Panel";
import { GenerateButton, SetupScreen } from "@/features/setup/SetupScreen";
import { RoutesScreen } from "@/features/routes/RoutesScreen";
import { FinishButton, WalkScreen } from "@/features/walk/WalkScreen";
import { CompletionDialog, type Completion } from "@/features/walk/CompletionDialog";

type Screen = "setup" | "routes" | "walk";

interface State {
  screen: Screen;
  origin: LatLon | null;
  interests: Category[];
  mode: Mode;
  budget: number;
  seed: number;
  routes: Route[];
  activeId: string | null;
  checked: string[];
  progress: Progress;
  completion: Completion | null;
  error: string | null;
  sheet: SnapRequest;
}

type Action =
  | { type: "origin"; origin: LatLon }
  | { type: "interests"; interests: Category[] }
  | { type: "mode"; mode: Mode }
  | { type: "budget"; budget: number }
  | { type: "generated"; routes: Route[] }
  | { type: "routed"; route: Route }
  | { type: "select"; id: string }
  | { type: "start"; id: string }
  | { type: "toggle"; poiId: string }
  | { type: "finish"; hoodOf: (p: LatLon) => string }
  | { type: "dismissCompletion" }
  | { type: "screen"; screen: Screen }
  | { type: "error"; error: string | null };

const initial: State = {
  screen: "setup",
  origin: null,
  interests: DEFAULT_INTERESTS,
  mode: "walk",
  budget: 45,
  // Different first shuffle on every visit.
  seed: Math.floor(Math.random() * 1e6),
  routes: [],
  activeId: null,
  checked: [],
  progress: loadProgress(),
  completion: null,
  error: null,
  sheet: { to: "peek", id: 0 },
};

const peek = (s: State): SnapRequest => ({ to: "peek", id: s.sheet.id + 1 });
const full = (s: State): SnapRequest => ({ to: "full", id: s.sheet.id + 1 });

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "origin":
      return { ...s, origin: a.origin, error: null };
    case "interests":
      return { ...s, interests: a.interests };
    case "mode":
      return { ...s, mode: a.mode };
    case "budget":
      return { ...s, budget: a.budget };
    case "generated":
      return {
        ...s,
        routes: a.routes,
        activeId: a.routes[0]?.id ?? null,
        seed: s.seed + 1,
        screen: "routes",
        checked: [],
        error: null,
        sheet: peek(s),
      };
    case "routed":
      return { ...s, routes: s.routes.map((r) => (r.id === a.route.id ? a.route : r)) };
    case "select":
      return { ...s, activeId: a.id };
    case "start":
      return { ...s, activeId: a.id, screen: "walk", checked: [], sheet: peek(s) };
    case "toggle":
      return { ...s, checked: s.checked.includes(a.poiId) ? s.checked.filter((id) => id !== a.poiId) : [...s.checked, a.poiId] };
    case "finish": {
      const route = s.routes.find((r) => r.id === s.activeId);
      if (!route) return s;
      const rankBefore = overallRank(s.progress);
      const progress = completeRoute(s.progress, route, a.hoodOf);
      const points = Object.values(progress.hoods).reduce((x, y) => x + y, 0) - Object.values(s.progress.hoods).reduce((x, y) => x + y, 0);
      return {
        ...s,
        progress,
        completion: {
          points: Math.round(points),
          stops: route.stops.length,
          rankBefore,
          rankAfter: overallRank(progress),
          hoodName: dominantHood(route.stops, a.hoodOf),
        },
      };
    }
    case "dismissCompletion":
      return { ...s, completion: null, screen: "setup", routes: [], activeId: null, checked: [], sheet: peek(s) };
    case "screen":
      return { ...s, screen: a.screen, ...(a.screen === "setup" ? { activeId: null, sheet: full(s) } : { sheet: peek(s) }) };
    case "error":
      return { ...s, error: a.error };
  }
}

export function App() {
  const [citySlug, setCitySlug] = useState(CITIES[0].slug);
  const city = CITIES.find((c) => c.slug === citySlug) ?? CITIES[0];
  const [data, setData] = useState<CityData | null>(null);
  const [locating, setLocating] = useState(false);
  const [s, dispatch] = useReducer(reducer, initial);
  const [theme, toggleTheme] = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reduce = useReducedMotion();

  useEffect(() => {
    setData(null);
    loadCity(city.slug)
      .then(setData)
      .catch((e: Error) => dispatch({ type: "error", error: e.message }));
  }, [city.slug]);

  useEffect(() => saveProgress(s.progress), [s.progress]);

  const hoodOf = useMemo(() => hoodResolver(data?.hoods), [data]);

  // Swap straight lines for real streets, one request at a time (fair use),
  // the highlighted route first.
  const routeKey = s.routes.map((r) => r.id).join("|");
  useEffect(() => {
    let cancelled = false;
    const pending = [...s.routes].filter((r) => !r.routed).sort((a, b) => Number(b.id === s.activeId) - Number(a.id === s.activeId));
    (async () => {
      for (const r of pending) {
        const routed = await routeOnStreets(r);
        if (cancelled) return;
        if (routed) dispatch({ type: "routed", route: routed });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only when a new set of routes arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  const active = useMemo(() => s.routes.find((r) => r.id === s.activeId) ?? null, [s.routes, s.activeId]);
  const nextId = s.screen === "walk" && active ? (active.stops.find((st) => !s.checked.includes(st.id))?.id ?? null) : null;

  const locate = () => {
    if (!navigator.geolocation) {
      dispatch({ type: "error", error: "This browser can't share your location. Tap the map instead." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        dispatch({ type: "origin", origin: { lat: pos.coords.latitude, lon: pos.coords.longitude } });
      },
      () => {
        setLocating(false);
        dispatch({ type: "error", error: "Couldn't get your location. Tap the map to set a start point." });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const generate = () => {
    if (!data || !s.origin) return;
    const routes = generateRoutes(
      { origin: s.origin, interests: s.interests, mode: s.mode, budgetMinutes: s.budget, seed: s.seed, visited: new Set(s.progress.visitedPoiIds) },
      data.pois,
    );
    dispatch({ type: "generated", routes });
  };

  const footer =
    s.screen === "setup" ? (
      <GenerateButton ready={!!data} disabled={!data || !s.origin || s.interests.length === 0} onClick={generate} />
    ) : s.screen === "walk" && active ? (
      <FinishButton allDone={s.checked.length === active.stops.length} onFinish={() => dispatch({ type: "finish", hoodOf })} />
    ) : null;

  const screenMotion = reduce
    ? {}
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25, ease: "easeOut" as const } };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-full w-full overflow-hidden bg-background">
        <MapView
          center={city.center}
          origin={s.origin}
          route={s.screen === "setup" ? null : active}
          checked={s.checked}
          nextId={nextId}
          theme={theme}
          panel={isDesktop ? "left" : "bottom"}
          onPickOrigin={s.screen === "setup" ? (p) => dispatch({ type: "origin", origin: p }) : undefined}
        />

        <AppHeader cities={CITIES} city={city} onCity={setCitySlug} theme={theme} onToggleTheme={toggleTheme} progress={s.progress} />

        <Panel footer={footer} snapRequest={s.sheet}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={s.screen} {...screenMotion}>
              {s.screen === "setup" && (
                <SetupScreen
                  cityName={city.name}
                  dataReady={!!data}
                  origin={s.origin}
                  locating={locating}
                  onLocate={locate}
                  interests={s.interests}
                  onInterests={(i) => dispatch({ type: "interests", interests: i })}
                  mode={s.mode}
                  onMode={(m) => dispatch({ type: "mode", mode: m })}
                  budget={s.budget}
                  onBudget={(b) => dispatch({ type: "budget", budget: b })}
                  error={s.error}
                />
              )}
              {s.screen === "routes" && (
                <RoutesScreen
                  routes={s.routes}
                  budgetMinutes={s.budget}
                  activeId={s.activeId}
                  onSelect={(id) => dispatch({ type: "select", id })}
                  onStart={(id) => dispatch({ type: "start", id })}
                  onBack={() => dispatch({ type: "screen", screen: "setup" })}
                  onRegenerate={generate}
                />
              )}
              {s.screen === "walk" && active && (
                <WalkScreen
                  route={active}
                  checked={s.checked}
                  onToggle={(id) => dispatch({ type: "toggle", poiId: id })}
                  onBack={() => dispatch({ type: "screen", screen: "routes" })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Panel>

        <CompletionDialog completion={s.completion} onClose={() => dispatch({ type: "dismissCompletion" })} />
      </div>
    </TooltipProvider>
  );
}

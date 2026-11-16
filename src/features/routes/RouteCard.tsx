import { Clock, Footprints, MapPin, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Route } from "@/core";
import { CATEGORY_BY_ID } from "@/data/categories";
import { MODE_META, VARIANT_COPY } from "@/data/copy";
import { cn } from "@/lib/utils";

interface Props {
  route: Route;
  budgetMinutes: number;
  active: boolean;
  index: number;
  onSelect: () => void;
  onStart: () => void;
}

export function RouteCard({ route, budgetMinutes, active, index, onSelect, onStart }: Props) {
  const overBudget = route.routed && route.estimatedMinutes > budgetMinutes * 1.15;
  const reduce = useReducedMotion();
  const copy = VARIANT_COPY[route.variant];
  const ModeIcon = MODE_META[route.mode].icon;

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-background transition-[border-color,box-shadow]",
        active ? "border-selected shadow-lg shadow-black/10 ring-1 ring-selected" : "hover:border-foreground/25",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className="w-full p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg leading-tight font-bold">{copy.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{copy.tagline}</p>
          </div>
          <StopStrip route={route} />
        </div>
        <dl className="mt-3 flex gap-4 text-sm">
          <Stat icon={MapPin} label="stops" value={route.stops.length} />
          <Stat icon={Footprints} label="km" value={route.distanceKm} />
          <Stat icon={Clock} label="min" value={`~${route.estimatedMinutes}`} />
          <dd className="ml-auto flex items-center gap-1 text-muted-foreground">
            <ModeIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">{MODE_META[route.mode].label}</span>
          </dd>
        </dl>
        <p className="mt-1.5 text-[11px] text-muted-foreground" aria-live="polite">
          {!route.routed
            ? "Estimate · checking the streets…"
            : overBudget
              ? `Longer than your ${budgetMinutes} min once you follow the streets`
              : "Distance along real streets"}
        </p>
      </button>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="detail"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <ol className="border-t px-4 py-3">
              {route.stops.map((s, i) => {
                const cat = CATEGORY_BY_ID[s.category];
                const Icon = cat.icon;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-1.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-route font-heading text-[11px] font-bold text-route-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {s.name ?? <span className="text-muted-foreground italic">Unnamed {cat.label.toLowerCase()}</span>}
                    </span>
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-label={cat.label} />
                  </li>
                );
              })}
            </ol>
            <div className="px-4 pb-4">
              <Button size="lg" className="h-11 w-full rounded-xl font-bold" onClick={onStart}>
                <Play className="size-4 fill-current" />
                Start this route
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <dd className="font-heading font-bold tabular-nums">{value}</dd>
      <dt className="text-muted-foreground">{label}</dt>
    </div>
  );
}

/** Overlapping category icons, like an avatar stack, for a glanceable summary. */
function StopStrip({ route }: { route: Route }) {
  const cats = route.categoriesCovered.slice(0, 5);
  return (
    <div className="flex shrink-0 -space-x-2" aria-label={`Covers ${route.categoriesCovered.map((c) => CATEGORY_BY_ID[c].label).join(", ")}`}>
      {cats.map((c) => {
        const Icon = CATEGORY_BY_ID[c].icon;
        return (
          <span key={c} className="grid size-7 place-items-center rounded-full border-2 border-background bg-secondary text-secondary-foreground">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        );
      })}
      {route.categoriesCovered.length > 5 && (
        <span className="grid size-7 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
          +{route.categoriesCovered.length - 5}
        </span>
      )}
    </div>
  );
}

import { ArrowLeft, Check, Flag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Route } from "@/core";
import { CATEGORY_BY_ID } from "@/data/categories";
import { VARIANT_COPY } from "@/data/copy";
import { cn } from "@/lib/utils";

interface Props {
  route: Route;
  checked: string[];
  onToggle: (poiId: string) => void;
  onBack: () => void;
}

export function WalkScreen({ route, checked, onToggle, onBack }: Props) {
  const reduce = useReducedMotion();
  const done = checked.length;
  const total = route.stops.length;
  const nextId = route.stops.find((s) => !checked.includes(s.id))?.id;

  return (
    <div className="p-4 pt-3 md:p-6 md:pt-2">
      <Button variant="ghost" className="-ml-2 mb-3 rounded-xl" onClick={onBack}>
        <ArrowLeft />
        Routes
      </Button>

      <div className="mb-4">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">On the move</p>
        <h2 className="text-2xl font-extrabold">{VARIANT_COPY[route.variant].title}</h2>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={(done / total) * 100} aria-label="Stops completed" className="h-2 **:data-[slot=progress-indicator]:bg-forest" />
          <span className="shrink-0 font-heading text-sm font-bold tabular-nums">
            {done}/{total}
          </span>
        </div>
      </div>

      <ol className="space-y-2">
        {route.stops.map((s, i) => {
          const cat = CATEGORY_BY_ID[s.category];
          const Icon = cat.icon;
          const isDone = checked.includes(s.id);
          const isNext = s.id === nextId;
          return (
            <li key={s.id}>
              <motion.button
                type="button"
                layout={!reduce}
                whileTap={reduce ? undefined : { scale: 0.985 }}
                onClick={() => onToggle(s.id)}
                aria-pressed={isDone}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isDone ? "border-forest/40 bg-forest/10" : isNext ? "border-primary bg-background shadow-md shadow-primary/10" : "bg-background opacity-80",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full font-heading text-sm font-bold transition-colors",
                    isDone ? "bg-forest text-forest-foreground" : isNext ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                  )}
                  aria-hidden="true"
                >
                  {isDone ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", isDone && "line-through decoration-forest/60")}>
                    {s.name ?? `Unnamed ${cat.label.toLowerCase()}`}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {cat.label}
                    {s.tags.opening_hours ? ` · ${s.tags.opening_hours}` : ""}
                  </span>
                </span>
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </motion.button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function FinishButton({ allDone, onFinish }: { allDone: boolean; onFinish: () => void }) {
  return (
    <Button
      size="lg"
      variant={allDone ? "default" : "outline"}
      className={cn("h-13 w-full rounded-2xl text-base font-bold", allDone && "bg-forest text-forest-foreground shadow-md shadow-forest/25 hover:bg-forest/90")}
      onClick={onFinish}
    >
      <Flag className="size-5" />
      {allDone ? "Stamp my passport" : "Finish early"}
    </Button>
  );
}

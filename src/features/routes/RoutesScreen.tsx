import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompassIllustration } from "@/components/illustrations/Compass";
import type { Route } from "@/core";
import { RouteCard } from "./RouteCard";

interface Props {
  routes: Route[];
  budgetMinutes: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  onStart: (id: string) => void;
  onBack: () => void;
  onRegenerate: () => void;
}

export function RoutesScreen({ routes, budgetMinutes, activeId, onSelect, onStart, onBack, onRegenerate }: Props) {
  return (
    <div className="p-4 pt-3 md:p-6 md:pt-2">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" className="-ml-2 rounded-xl" onClick={onBack}>
          <ArrowLeft />
          Edit picks
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={onRegenerate}>
          <RefreshCw />
          Shuffle
        </Button>
      </div>

      <p className="sr-only" aria-live="polite">
        {routes.length ? `${routes.length} routes ready` : "No routes found"}
      </p>

      {routes.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CompassIllustration className="mb-4 size-28" />
          <h2 className="text-lg font-bold">Nothing close enough</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Those picks are thin around here. Give yourself more time, switch to trotro, or add a few more interests.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-1 text-2xl font-extrabold">Pick your route</h2>
          <p className="mb-4 text-sm text-muted-foreground">Three takes on the same hood. Tap one to see it on the map.</p>
          <div className="space-y-3">
            {routes.map((r, i) => (
              <RouteCard
                key={r.id}
                route={r}
                budgetMinutes={budgetMinutes}
                index={i}
                active={r.id === activeId}
                onSelect={() => onSelect(r.id)}
                onStart={() => onStart(r.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

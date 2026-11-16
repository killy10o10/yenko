import { Crosshair, LoaderCircle, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LatLon } from "@/core";

interface Props {
  origin: LatLon | null;
  locating: boolean;
  onLocate: () => void;
}

export function LocationControl({ origin, locating, onLocate }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-background p-2 pl-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest/15 text-forest" aria-hidden="true">
        <MapPinned className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{origin ? "Starting here" : "Where are you?"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {origin ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)} · tap the map to move` : "Use your location, or tap the map"}
        </p>
      </div>
      <Button variant={origin ? "outline" : "default"} className="h-10 rounded-xl px-3" onClick={onLocate} disabled={locating}>
        {locating ? <LoaderCircle className="animate-spin" /> : <Crosshair />}
        <span className="sr-only sm:not-sr-only">{origin ? "Relocate" : "Locate me"}</span>
      </Button>
    </div>
  );
}

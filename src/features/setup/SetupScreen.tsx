import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/illustrations/Hero";
import type { Category, LatLon, Mode } from "@/core";
import { LocationControl } from "./LocationControl";
import { InterestGrid } from "./InterestGrid";
import { ModePicker } from "./ModePicker";
import { TimeSlider } from "./TimeSlider";

interface Props {
  cityName: string;
  dataReady: boolean;
  origin: LatLon | null;
  locating: boolean;
  onLocate: () => void;
  interests: Category[];
  onInterests: (c: Category[]) => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  budget: number;
  onBudget: (n: number) => void;
  error: string | null;
}

export function SetupScreen(p: Props) {
  return (
    <div className="space-y-6 p-4 pt-3 md:p-6 md:pt-2">
      <section>
        <HeroIllustration className="mb-4 w-full rounded-2xl" />
        <h1 className="text-[1.65rem] leading-tight font-extrabold">Where to, today?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell me what you need around {p.cityName} and I'll string the spots into a route you can actually walk.
        </p>
      </section>

      <LocationControl origin={p.origin} locating={p.locating} onLocate={p.onLocate} />

      <section>
        <SectionTitle n="1" title="What do you need?" hint={`${p.interests.length} picked`} />
        <InterestGrid value={p.interests} onChange={p.onInterests} />
      </section>

      <section>
        <SectionTitle n="2" title="How are you moving?" />
        <ModePicker value={p.mode} onChange={p.onMode} />
      </section>

      <section>
        <SectionTitle n="3" title="How long have you got?" />
        <TimeSlider value={p.budget} onChange={p.onBudget} />
      </section>

      {p.error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {p.error}
        </p>
      )}
    </div>
  );
}

export function GenerateButton({ disabled, ready, onClick }: { disabled: boolean; ready: boolean; onClick: () => void }) {
  return (
    <Button size="lg" className="h-13 w-full rounded-2xl text-base font-bold shadow-md shadow-primary/25" disabled={disabled} onClick={onClick}>
      <Sparkles className="size-5" />
      {ready ? "Find my routes" : "Loading places…"}
    </Button>
  );
}

function SectionTitle({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="grid size-6 place-items-center rounded-full bg-foreground font-heading text-xs font-bold text-background" aria-hidden="true">
        {n}
      </span>
      <h2 className="text-base font-bold">{title}</h2>
      {hint && <span className="ml-auto text-xs font-medium text-muted-foreground">{hint}</span>}
    </div>
  );
}

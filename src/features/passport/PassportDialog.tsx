import { BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Stamp } from "@/components/illustrations/Stamp";
import { hoodLabel, isCellKey, overallRank, rankForPoints, type Progress as ProgressData, type Rank } from "@/core";

const THRESHOLDS: Record<Rank, number> = { JJC: 0, Visitor: 50, Regular: 200, Local: 500, Borga: 500 };
const ORDER: Rank[] = ["JJC", "Visitor", "Regular", "Local", "Borga"];
const BLURB: Record<Rank, string> = {
  JJC: "Johnny Just Come. You know your gate and not much else.",
  Visitor: "You can find the pharmacy and a chop bar without asking.",
  Regular: "The trotro mates know your stop.",
  Local: "You give directions to other people now.",
  Borga: "Local in three hoods and counting. Respect.",
};

export function PassportDialog({ progress }: { progress: ProgressData }) {
  const rank = overallRank(progress);
  // Named hoods first; old grid-cell entries sink to the bottom.
  const hoods = Object.entries(progress.hoods).sort((a, b) => Number(isCellKey(a[0])) - Number(isCellKey(b[0])) || b[1] - a[1]);
  const best = hoods[0]?.[1] ?? 0;
  const nextRank = ORDER[Math.min(ORDER.indexOf(rank) + 1, ORDER.length - 1)];
  const nextAt = THRESHOLDS[nextRank];
  const pct = rank === "Borga" ? 100 : Math.min(100, (best / nextAt) * 100);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 rounded-2xl bg-card/90 pr-3 pl-2.5 font-semibold shadow-sm backdrop-blur" aria-label={`Hood passport, rank ${rank}`}>
          <BookOpenCheck className="text-forest" />
          {rank}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm overflow-hidden rounded-3xl p-0">
        <div className="kente-rule" aria-hidden="true" />
        <div className="p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-extrabold">Hood passport</DialogTitle>
            <DialogDescription>{BLURB[rank]}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-4">
            <Stamp label={rank} className="w-28 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>{rank}</span>
                <span className="text-muted-foreground">{rank === "Borga" ? "Maxed" : nextRank}</span>
              </div>
              <Progress value={pct} className="mt-1.5 h-2 **:data-[slot=progress-indicator]:bg-forest" aria-label="Progress to next rank" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {rank === "Borga" ? "You've seen it all." : `${Math.round(best)} / ${nextAt} familiarity in your best hood`}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
            <StatTile label="routes" value={progress.completedRouteIds.length} />
            <StatTile label="places" value={progress.visitedPoiIds.length} />
            <StatTile label="hoods" value={hoods.length} />
          </dl>

          {hoods.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Your hoods</h3>
              <ul className="space-y-1.5">
                {hoods.slice(0, 5).map(([cell, pts]) => (
                  <li key={cell} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">{hoodLabel(cell)}</span>
                    <span className="text-muted-foreground">
                      {rankForPoints(pts)} · {Math.round(pts)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <dd className="font-heading text-2xl font-extrabold tabular-nums">{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

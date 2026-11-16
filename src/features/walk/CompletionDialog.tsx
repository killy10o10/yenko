import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Stamp } from "@/components/illustrations/Stamp";
import type { Rank } from "@/core";

export interface Completion {
  points: number;
  stops: number;
  rankBefore: Rank;
  rankAfter: Rank;
  hoodName: string;
}

interface Props {
  completion: Completion | null;
  onClose: () => void;
}

export function CompletionDialog({ completion, onClose }: Props) {
  const reduce = useReducedMotion();
  const promoted = completion && completion.rankAfter !== completion.rankBefore;
  return (
    <Dialog open={!!completion} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden rounded-3xl p-0 text-center">
        <div className="kente-rule" aria-hidden="true" />
        {completion && (
          <div className="px-6 pt-6 pb-6">
            <motion.div
              initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: 8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.15 }}
              className="mx-auto mb-4 w-44"
            >
              <Stamp label={completion.rankAfter} sub={completion.hoodName} />
            </motion.div>
            <DialogTitle className="text-2xl font-extrabold">
              {promoted ? `You're now a ${completion.rankAfter}` : "Stamped."}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm">
              {completion.stops} stops, <span className="font-semibold text-foreground">+{completion.points} familiarity</span> in {completion.hoodName}.
              {promoted ? " The trotro mates will start to recognise you." : " Keep walking; the hood is getting smaller."}
            </DialogDescription>
            <Button size="lg" className="mt-6 h-12 w-full rounded-2xl font-bold" onClick={onClose}>
              Yɛnkɔ, next one
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

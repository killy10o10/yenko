import { Check } from "lucide-react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { motion, useReducedMotion } from "motion/react";
import type { Category } from "@/core";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

interface Props {
  value: Category[];
  onChange: (next: Category[]) => void;
}

/**
 * Multi-select grid of illustrated cards. Radix ToggleGroup gives roving
 * tab focus and aria-pressed; we only own the looks.
 */
export function InterestGrid({ value, onChange }: Props) {
  const reduce = useReducedMotion();
  return (
    <ToggleGroupPrimitive.Root
      type="multiple"
      value={value}
      onValueChange={(v) => onChange(v as Category[])}
      aria-label="Interests"
      className="grid grid-cols-2 gap-2"
    >
      {CATEGORIES.map((c, i) => {
        const Icon = c.icon;
        const on = value.includes(c.id);
        return (
          <ToggleGroupPrimitive.Item key={c.id} value={c.id} asChild>
            <motion.button
              type="button"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.025, duration: 0.3, ease: "easeOut" }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className={cn(
                "group relative flex items-start gap-2.5 rounded-2xl border bg-background p-3 text-left transition-colors",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                on ? "border-selected bg-selected-surface" : "hover:border-foreground/25 hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
                aria-hidden="true"
              >
                <Icon className="size-[18px]" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-sm leading-tight font-semibold">{c.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{c.blurb}</span>
              </span>
              <span
                className={cn(
                  "absolute top-2 right-2 grid size-4 place-items-center rounded-full bg-selected text-background transition-all",
                  on ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            </motion.button>
          </ToggleGroupPrimitive.Item>
        );
      })}
    </ToggleGroupPrimitive.Root>
  );
}

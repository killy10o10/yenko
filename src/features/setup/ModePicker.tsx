import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type { Mode } from "@/core";
import { MODE_META, MODE_ORDER } from "@/data/copy";
import { cn } from "@/lib/utils";

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
}

/** Segmented control with icons. Single-select, arrow keys move between options. */
export function ModePicker({ value, onChange }: Props) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as Mode)}
      aria-label="How are you moving?"
      className="grid grid-cols-5 gap-1 rounded-2xl bg-muted p-1"
    >
      {MODE_ORDER.map((m) => {
        const meta = MODE_META[m];
        const Icon = meta.icon;
        const on = value === m;
        return (
          <ToggleGroupPrimitive.Item
            key={m}
            value={m}
            aria-label={meta.label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-all outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              on ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", on && "text-primary")} strokeWidth={2.2} />
            {meta.short}
          </ToggleGroupPrimitive.Item>
        );
      })}
    </ToggleGroupPrimitive.Root>
  );
}

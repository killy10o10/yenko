import { Slider } from "@/components/ui/slider";
import { budgetLabel } from "@/data/copy";

interface Props {
  value: number;
  onChange: (min: number) => void;
}

export function TimeSlider({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl border bg-background p-3">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{budgetLabel(value)}</span>
        <span className="font-heading text-lg font-bold tabular-nums">
          {value} <span className="text-sm font-semibold text-muted-foreground">min</span>
        </span>
      </div>
      <Slider
        aria-label="Time you want to spend"
        min={15}
        max={180}
        step={5}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="**:data-[slot=slider-track]:h-2 **:data-[slot=slider-thumb]:size-5 **:data-[slot=slider-thumb]:border-2 **:data-[slot=slider-thumb]:border-selected"
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>15 min</span>
        <span>3 hours</span>
      </div>
    </div>
  );
}

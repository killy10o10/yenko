import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wordmark } from "@/components/Wordmark";
import { PassportDialog } from "@/features/passport/PassportDialog";
import type { Progress } from "@/core";
import type { Theme } from "@/lib/theme";
import type { CityMeta } from "@/data/city";

interface Props {
  cities: CityMeta[];
  city: CityMeta;
  onCity: (slug: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  progress: Progress;
}

export function AppHeader({ cities, city, onCity, theme, onToggleTheme, progress }: Props) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 md:p-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur">
        <Wordmark className="text-xl" />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <Select value={city.slug} onValueChange={onCity}>
          <SelectTrigger aria-label="City" className="h-7 border-0 bg-transparent px-1.5 text-sm font-semibold shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <PassportDialog progress={progress} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-2xl bg-card/90 shadow-sm backdrop-blur"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

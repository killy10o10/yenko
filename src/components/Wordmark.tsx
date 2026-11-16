import { cn } from "@/lib/utils";

/** "Yɛnkɔ" with the black star from the Ghana flag (gold in dark mode). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-start font-heading text-2xl font-extrabold tracking-tight", className)}>
      Yɛnkɔ
      <svg viewBox="0 0 24 24" className="mt-[0.12em] ml-0.5 size-[0.5em] text-foreground dark:text-primary" aria-hidden="true">
        <path fill="currentColor" d="M12 1.5l3.09 7.26 7.86.69-5.96 5.2 1.78 7.7L12 18.27 5.23 22.35l1.78-7.7-5.96-5.2 7.86-.69z" />
      </svg>
    </span>
  );
}

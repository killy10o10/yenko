import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-2xl font-extrabold tracking-tight", className)}>
      Yɛnkɔ
      <span className="ml-0.5 inline-block size-2 rounded-full bg-primary align-baseline" aria-hidden="true" />
    </span>
  );
}

/** Empty-state mark: a compass rose, needle pointing somewhere worth going. */
export function CompassIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <g stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <path d="M60 14v8M60 98v8M14 60h8M98 60h8" />
      </g>
      <g stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M27 27l5 5M93 93l-5-5M27 93l5-5M93 27l-5 5" />
      </g>
      <path d="M60 22 L70 60 L60 68 L50 60 Z" fill="var(--primary)" />
      <path d="M60 98 L50 60 L60 52 L70 60 Z" fill="var(--forest)" />
      <circle cx="60" cy="60" r="6" fill="var(--background)" stroke="var(--foreground)" strokeWidth="2" />
    </svg>
  );
}

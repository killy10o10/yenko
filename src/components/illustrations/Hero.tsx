/**
 * Hand-drawn vector scene: a slice of an Accra neighbourhood at golden hour,
 * with a route threading three stops and a trotro on the main road.
 * Colours come from the theme so it adapts to dark mode.
 * Swap for a generated image later: keep the same aspect ratio (16:9).
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-labelledby="hero-title">
      <title id="hero-title">A map of a neighbourhood with a route through three stops</title>
      <defs>
        <clipPath id="hero-clip">
          <rect width="320" height="180" rx="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#hero-clip)">
        <rect width="320" height="180" fill="var(--clay)" />
        {/* city blocks */}
        <g fill="var(--card)" opacity="0.9">
          <rect x="-10" y="-10" width="110" height="70" rx="10" />
          <rect x="120" y="-10" width="90" height="52" rx="10" />
          <rect x="232" y="-10" width="110" height="70" rx="10" />
          <rect x="-10" y="86" width="80" height="60" rx="10" />
          <rect x="92" y="78" width="118" height="46" rx="10" />
          <rect x="232" y="86" width="110" height="46" rx="10" />
          <rect x="-10" y="152" width="140" height="50" rx="10" />
          <rect x="152" y="150" width="190" height="50" rx="10" />
        </g>
        {/* roads */}
        <g stroke="var(--background)" strokeWidth="12" strokeLinecap="round" fill="none">
          <path d="M-10 70 H330" />
          <path d="M108 -10 V190" />
          <path d="M220 -10 V190" />
          <path d="M-10 138 H330" />
        </g>
        <g stroke="var(--border)" strokeWidth="1" strokeDasharray="6 8" fill="none" opacity="0.8">
          <path d="M-10 70 H330" />
          <path d="M108 -10 V190" />
          <path d="M220 -10 V190" />
          <path d="M-10 138 H330" />
        </g>
        {/* trees */}
        <g>
          <circle cx="40" cy="110" r="9" fill="var(--forest)" opacity="0.9" />
          <circle cx="56" cy="118" r="6" fill="var(--forest)" opacity="0.7" />
          <circle cx="282" cy="108" r="8" fill="var(--forest)" opacity="0.85" />
          <circle cx="300" cy="30" r="7" fill="var(--forest)" opacity="0.7" />
        </g>
        {/* sun */}
        <circle cx="262" cy="24" r="14" fill="var(--gold)" />
        <circle cx="262" cy="24" r="20" fill="none" stroke="var(--gold)" strokeOpacity="0.4" strokeWidth="2" />
        {/* route */}
        <path
          d="M48 40 C 70 40, 80 70, 108 70 S 150 100, 166 100 S 220 100, 220 138 S 250 160, 268 160"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="7 6"
        />
        {/* stops */}
        <g fontFamily="var(--font-heading)" fontWeight="700" fontSize="11" textAnchor="middle">
          <circle cx="48" cy="40" r="10" fill="var(--forest)" stroke="var(--background)" strokeWidth="2.5" />
          <circle cx="166" cy="100" r="10" fill="var(--primary)" stroke="var(--background)" strokeWidth="2.5" />
          <text x="166" y="104" fill="var(--primary-foreground)">1</text>
          <circle cx="268" cy="160" r="10" fill="var(--primary)" stroke="var(--background)" strokeWidth="2.5" />
          <text x="268" y="164" fill="var(--primary-foreground)">2</text>
        </g>
        {/* trotro on the main road */}
        <g transform="translate(150 60)">
          <rect x="0" y="0" width="44" height="20" rx="5" fill="var(--gold)" />
          <rect x="4" y="3" width="10" height="7" rx="1.5" fill="var(--foreground)" opacity="0.75" />
          <rect x="17" y="3" width="10" height="7" rx="1.5" fill="var(--foreground)" opacity="0.75" />
          <rect x="30" y="3" width="10" height="7" rx="1.5" fill="var(--foreground)" opacity="0.75" />
          <rect x="0" y="12" width="44" height="3" fill="var(--primary)" />
          <circle cx="10" cy="21" r="3.5" fill="var(--foreground)" />
          <circle cx="34" cy="21" r="3.5" fill="var(--foreground)" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Passport stamp. Rendered on route completion and in the passport dialog.
 * Slightly rotated and textured so it reads as ink, not a badge.
 */
export function Stamp({ label, sub, className }: { label: string; sub?: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} role="img" aria-label={`${label} stamp`}>
      <defs>
        <path id="stamp-ring" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" />
        <filter id="stamp-grain" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.2" in="n" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
      </defs>
      <g fill="var(--forest)" stroke="var(--forest)" filter="url(#stamp-grain)" transform="rotate(-12 80 80)">
        <circle cx="80" cy="80" r="70" fill="none" strokeWidth="4" />
        <circle cx="80" cy="80" r="62" fill="none" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="42" fill="none" strokeWidth="1.5" />
        <text fontFamily="var(--font-heading)" fontWeight="800" fontSize="11.5" letterSpacing="2.2" stroke="none">
          <textPath href="#stamp-ring" startOffset="0">YƐNKƆ · HOOD PASSPORT · YƐNKƆ · HOOD PASSPORT ·</textPath>
        </text>
        <text x="80" y="78" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="20" stroke="none">
          {label.toUpperCase()}
        </text>
        {sub && (
          <text x="80" y="96" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="10" letterSpacing="1.5" stroke="none">
            {sub.toUpperCase()}
          </text>
        )}
      </g>
    </svg>
  );
}

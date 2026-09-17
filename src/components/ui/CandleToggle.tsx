/**
 * The theme control, as a candle: lit and flickering in the light theme,
 * snuffed out with a curl of smoke in the dark one.
 *
 * The flame is drawn rather than iconified so it can carry its own halo and
 * flicker independently of the wax — a single glyph could not do either.
 */
export function CandleToggle({ lit }: { lit: boolean }) {
  return (
    <span className="relative block h-[18px] w-[15px]" aria-hidden>
      <svg viewBox="0 0 15 18" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="candle-flame-core" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
          <linearGradient id="candle-wax" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* halo — sits behind the flame, breathing on its own cycle */}
        {lit && (
          <circle
            className="candle-halo"
            cx="7.5"
            cy="3.6"
            r="4.6"
            fill="#fbbf24"
            opacity="0.55"
            style={{ filter: 'blur(2.5px)' }}
          />
        )}

        {/* wax */}
        <rect x="4.6" y="7.6" width="5.8" height="9.4" rx="1.6" fill="url(#candle-wax)" />
        {/* melt line across the top of the wax */}
        <ellipse cx="7.5" cy="7.7" rx="2.9" ry="0.85" fill="currentColor" opacity="0.28" />
        {/* wick */}
        <path
          d="M7.5 7.5v-1.6"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity={lit ? 0.5 : 0.75}
        />

        {lit ? (
          <path
            className="candle-flame"
            d="M7.5 0.6c1.9 1.7 2.9 3 2.9 4.4a2.9 2.9 0 0 1-5.8 0c0-1.4 1-2.7 2.9-4.4Z"
            fill="url(#candle-flame-core)"
          />
        ) : (
          /* a snuffed wick still smokes */
          <path
            d="M7.5 5.4c1.3-.7.3-1.9 1.3-2.7"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
        )}
      </svg>
    </span>
  )
}

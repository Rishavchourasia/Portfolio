/**
 * The pool of light the light theme sits in.
 *
 * Two layers rather than one: a tight warm core high on the page where a
 * candle would stand, and a much wider, weaker wash that reaches the corners.
 * Real candlelight falls off fast near the flame and slowly after that, and a
 * single gradient can only describe one of those.
 *
 * Rendered only in the light theme — the dark theme is left exactly as it was.
 */
export function CandleGlow() {
  return (
    <>
      <div
        className="candle-glow absolute inset-0"
        style={{
          background: `radial-gradient(
            120% 90% at 50% -10%,
            hsl(var(--candle-core) / 0.55) 0%,
            hsl(var(--candle-edge) / 0.3) 28%,
            transparent 62%
          )`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            var(--candle-reach) var(--candle-reach) at 50% 8%,
            hsl(var(--candle-core) / 0.22) 0%,
            transparent 70%
          )`,
        }}
      />
      {/* Corners fall away from the flame, which is what sells it as one
          light source rather than an evenly lit room. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            110% 80% at 50% 12%,
            transparent 45%,
            hsl(28 45% 42% / 0.12) 100%
          )`,
        }}
      />
    </>
  )
}

/**
 * SVG grain, inlined as a data URI so it costs no request. Breaks up the
 * banding that large blurred gradients produce on 8-bit displays.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function NoiseLayer() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
      style={{ backgroundImage: NOISE }}
    />
  )
}

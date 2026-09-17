/** Infinite, pause-on-hover strip of skill chips. Duplicated once for a seamless loop. */
export function SkillMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items]

  return (
    <div
      className="group relative flex overflow-hidden"
      style={{ maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)' }}
    >
      <div className="animate-marquee flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span
            // `items` is a fixed prop for this component's whole lifetime — never
            // reordered, filtered or extended — so an index is exactly as
            // stable as any other key here, and paired with the value it
            // stays unique across the duplicated second half of the strip.
            // eslint-disable-next-line react/no-array-index-key
            key={`${item}-${i}`}
            className="glass rounded-full px-5 py-2.5 text-sm whitespace-nowrap transition-colors hover:border-accent-500/50 hover:text-accent-400"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

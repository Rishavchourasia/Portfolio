import { cn } from '@/lib/utils'

/** Deterministic hue per project so generated placeholders stay stable. */
const hueFor = (seed: string) =>
  [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7)

type Props = {
  title: string
  slug: string
  image?: string
  status?: string
  className?: string
}

/**
 * Card preview: a browser-chrome frame around either the project screenshot
 * or, when there isn't one yet, a generated gradient with the initials.
 */
export function ProjectPreview({ title, slug, image, status, className }: Props) {
  const hue = hueFor(slug)
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--text)_4%,transparent)]',
        className,
      )}
    >
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
        <span className="ml-2 h-4 flex-1 rounded-full bg-[color-mix(in_oklab,var(--text)_7%,transparent)]" />
        {status && (
          <span className="rounded-full bg-[var(--color-mint)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--color-mint)]">
            {status}
          </span>
        )}
      </div>

      <div className="relative aspect-[16/10] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${title} screenshot`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden
            className="grid h-full w-full place-items-center transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            style={{
              background: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 85% 55% / 0.35), transparent 60%),
                           radial-gradient(120% 120% at 90% 100%, hsl(${(hue + 70) % 360} 85% 60% / 0.3), transparent 55%),
                           color-mix(in oklab, var(--text) 4%, transparent)`,
            }}
          >
            <span
              className="font-display text-5xl font-bold tracking-tight opacity-25 select-none sm:text-6xl"
              style={{ color: `hsl(${hue} 80% 70%)` }}
            >
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

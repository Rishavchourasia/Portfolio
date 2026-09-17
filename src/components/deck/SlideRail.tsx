import { ActivePill } from '@/components/ui/ActivePill'
import { useDeck } from './DeckContext'
import { navSlides } from '@/content'
import { cn } from '@/lib/utils'

/** Vertical dot rail — position in the deck, and a jump target. */
export function SlideRail() {
  const { activeId, goTo } = useDeck()

  return (
    <nav
      aria-label="Slides"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col items-end gap-1">
        {navSlides.map((slide) => {
          const active = activeId === slide.id
          return (
            <li key={slide.id}>
              <button
                onClick={() => goTo(slide.id)}
                aria-current={active ? 'true' : undefined}
                className="group flex items-center gap-3 py-2 pl-3"
              >
                <span
                  className={cn(
                    'font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-300',
                    active
                      ? 'text-accent-400 opacity-100'
                      : 'text-muted opacity-0 group-hover:opacity-100',
                  )}
                >
                  {slide.label}
                </span>
                <span className="relative grid h-3 w-3 place-items-center">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all duration-300',
                      active ? 'bg-accent-400' : 'bg-[var(--text-muted)] group-hover:bg-accent-400',
                    )}
                  />
                  {active && (
                    <ActivePill layoutId="slide-rail-ring" className="rounded-full ring-1 ring-accent-400/60" />
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

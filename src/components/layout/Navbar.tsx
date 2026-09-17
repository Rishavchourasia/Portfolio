import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Palette, X } from 'lucide-react'
import { useDeck } from '@/components/deck'
import { navSlides, profile } from '@/content'
import { useTheme } from '@/hooks/useTheme'
import { ActivePill } from '@/components/ui/ActivePill'
import { CandleToggle } from '@/components/ui/CandleToggle'
import { StyleGuide } from '@/components/ui/StyleGuide'
import { cn } from '@/lib/utils'
import type { SlideId } from '@/types/content'

export function Navbar() {
  const { activeId, goTo, hasMoved } = useDeck()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: SlideId) => {
    setOpen(false)
    goTo(id)
  }

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-500', hasMoved ? 'py-3' : 'py-5')}>
        <nav
          className={cn(
            'mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500',
            hasMoved ? 'glass w-[92%] shadow-2xl shadow-black/20' : 'w-[94%] border border-transparent',
          )}
        >
          <button onClick={() => go('hero')} className="font-display text-sm font-semibold tracking-tight">
            <span className="text-accent-400">{'{'}</span>
            {profile.firstName.toLowerCase()}
            <span className="text-accent-400">{'}'}</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {navSlides
              .filter((slide) => slide.id !== 'hero')
              .map((slide) => (
                <li key={slide.id}>
                  <button
                    onClick={() => go(slide.id)}
                    aria-current={activeId === slide.id ? 'true' : undefined}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm transition-colors',
                      activeId === slide.id ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]',
                    )}
                  >
                    {activeId === slide.id && (
                      <ActivePill
                        layoutId="nav-pill"
                        className="-z-10 rounded-full bg-[color-mix(in_oklab,var(--text)_10%,transparent)]"
                      />
                    )}
                    {slide.label}
                  </button>
                </li>
              ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuideOpen(true)}
              aria-label="Show fonts and colours used"
              title="Fonts & colours"
              className="glass rounded-full p-2.5 transition-colors hover:border-accent-500/50"
            >
              <Palette size={15} />
            </button>
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={theme === 'dark' ? 'Light the candle' : 'Snuff the candle'}
              className={cn(
                'glass grid h-10 w-10 place-items-center rounded-full transition-all duration-500',
                'hover:border-accent-500/50',
                // a lit candle throws light on its own holder
                theme === 'light' &&
                  'border-accent-500/40 shadow-[0_0_18px_-4px_var(--color-accent-500)]',
              )}
            >
              <CandleToggle lit={theme === 'light'} />
            </button>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-accent-400 sm:inline-flex"
              >
                Resume
              </a>
            )}
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="glass rounded-full p-2.5 md:hidden">
              <Menu size={15} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-[var(--bg)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex justify-end p-6">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="glass rounded-full p-3">
                <X size={18} />
              </button>
            </div>
            <ul className="mt-6 flex flex-col gap-1 px-8">
              {navSlides.map((slide, i) => (
                <motion.li
                  key={slide.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  <button
                    onClick={() => go(slide.id)}
                    className="font-display w-full border-b border-[var(--border)] py-5 text-left text-3xl font-medium"
                  >
                    {slide.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 px-8">
              <button
                onClick={() => {
                  setOpen(false)
                  setGuideOpen(true)
                }}
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
              >
                <Palette size={15} />
                Fonts &amp; colours
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StyleGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}

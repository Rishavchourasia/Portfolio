import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { profile } from '@/content'
import { EASE } from '@/lib/motion'
import { scrollToId, setScrollLocked } from '@/lib/smoothScroll'
import { cn } from '@/lib/utils'
import { NAV, useIntroDone } from './intro'
import { Stamp } from './Stamp'


/**
 * Fixed header: signature and seal on the left, "Let's talk" and a Menu
 * button on the right. It tucks away while scrolling down and returns on the
 * way back up; the menu opens a full-screen index of the page.
 */
export function Header() {
  const introDone = useIntroDone()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    setHidden(y > 300 && y > prev + 2)
    if (y < prev - 2) setHidden(false)
  })

  useEffect(() => {
    setScrollLocked(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // Let the menu start closing before the page glides.
    window.setTimeout(() => scrollToId(id), open ? 250 : 0)
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={introDone ? { y: hidden && !open ? -90 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: EASE }}
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-[background,backdrop-filter] duration-500',
          scrolled && !open && 'bg-[color-mix(in_oklab,var(--color-ink-950)_70%,transparent)] backdrop-blur-md',
        )}
      >
        <div className="flex items-center justify-between px-gutter py-4">
          <button
            type="button"
            onClick={() => go('top')}
            aria-label={`${profile.name}, back to top`}
            className="flex items-center gap-2"
          >
            <span className="font-[family-name:var(--font-signature)] text-[2.1rem] leading-none text-[var(--color-cream)]">
              {profile.firstName}
            </span>
            <Stamp />
          </button>

          <div className="flex items-center gap-5 text-sm">
            <span className="hidden items-center gap-2 text-xs text-muted sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-mint)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-mint)]" />
              </span>
              {profile.availability}
            </span>
            <button type="button" onClick={() => go('contact')} className="hidden font-medium transition-colors hover:text-[var(--color-lavender)] sm:block">
              Let&apos;s talk
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex items-center gap-3 font-medium"
            >
              {open ? 'Close' : 'Menu'}
              <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-cream)] text-[var(--color-cream-ink)]">
                <span className={cn('absolute h-[1.5px] w-3.5 bg-current transition-transform duration-300', open ? 'rotate-45' : '-translate-y-[4px]')} />
                <span className={cn('absolute h-[1.5px] w-3.5 bg-current transition-opacity duration-200', open && 'opacity-0')} />
                <span className={cn('absolute h-[1.5px] w-3.5 bg-current transition-transform duration-300', open ? '-rotate-45' : 'translate-y-[4px]')} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Site"
            className="fixed inset-0 z-[55] flex flex-col justify-end bg-[var(--color-ink-950)] px-gutter pb-10"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="mb-12">
              {NAV.map((item, i) => (
                <li key={item.id} className="mask-line border-b border-[var(--border)]">
                  <motion.button
                    type="button"
                    onClick={() => go(item.id)}
                    className="group flex w-full items-baseline gap-5 py-3 text-left"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    <span className="voice w-10 text-xl">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.04em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-4">
                      {item.label}
                    </span>
                    <span className="voice ml-auto text-xl opacity-0 transition-opacity group-hover:opacity-100">go →</span>
                  </motion.button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-between gap-4 text-sm text-muted">
              <a href={`mailto:${profile.email}`} className="hover:text-[var(--text)]">
                {profile.email}
              </a>
              <span className="flex gap-6">
                {profile.socials.github && (
                  <a href={profile.socials.github} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                    GitHub ↗
                  </a>
                )}
                {profile.socials.linkedin && (
                  <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                    LinkedIn ↗
                  </a>
                )}
              </span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

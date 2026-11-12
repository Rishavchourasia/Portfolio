import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useScrollerLenis } from '@/hooks/useScrollerLenis'
import { track } from '@/lib/analytics'
import { leavePage, navigate, PAGES, type Page } from '@/lib/route'
import { setScrollLocked } from '@/lib/smoothScroll'
import { cn } from '@/lib/utils'
import { NAV } from '../intro'
import { ScrollerContext } from './sheetContext'

const CURTAIN = [0.76, 0, 0.24, 1] as const

/**
 * Rises from the bottom. Leaving for home it drops away again; when the next
 * page replaces it, it holds still underneath while the new one rises.
 * `leaving` comes from the AnimatePresence around it.
 */
const SHEET = {
  below: { y: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  shown: { y: '0%', borderTopLeftRadius: 0, borderTopRightRadius: 0, transition: { duration: 0.9, ease: CURTAIN } },
  gone: (leaving: boolean) =>
    leaving
      ? { y: '100%', transition: { duration: 0.8, ease: CURTAIN } }
      : { zIndex: 95, transition: { duration: 0.9, zIndex: { duration: 0 } } },
}

const labelOf = (page: Page) => NAV.find((n) => n.id === page)?.label ?? page

/** The sheet's own colour, and the class its content takes (paper sets its own text colours and texture). */
const TONES = {
  ink: { sheet: 'bg-[var(--color-ink-950)] text-[var(--text)]', content: '' },
  red: { sheet: 'bg-[var(--color-paper-red)]', content: 'paper paper--red min-h-full' },
  cream: { sheet: 'bg-[var(--color-cream)]', content: 'paper min-h-full' },
} as const

/**
 * A page of its own at /work, /about, /experience or /skills. It rises over
 * the home page (which stays where the reader left it), scrolls on its own
 * and ends on a link to the next page.
 */
export function Sheet({
  page,
  covered,
  tone = 'ink',
  children,
}: {
  page: Page
  /** A case study is open on top: this page waits underneath. */
  covered: boolean
  tone?: keyof typeof TONES
  children: ReactNode
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useScrollerLenis(scrollerRef, contentRef)

  useEffect(() => {
    setScrollLocked(true, 'sheet')
    return () => setScrollLocked(false, 'sheet')
  }, [])

  useEffect(() => track('page_view_sheet', { page }), [page])

  useEffect(() => {
    if (covered) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && leavePage()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [covered])

  const next = PAGES[(PAGES.indexOf(page) + 1) % PAGES.length] ?? 'work'

  return (
    <motion.article
      aria-label={labelOf(page)}
      inert={covered}
      className={cn('fixed inset-0 z-[96] overflow-hidden', TONES[tone].sheet)}
      variants={SHEET}
      initial="below"
      animate="shown"
      exit="gone"
    >
      <div ref={scrollerRef} data-lenis-prevent className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain">
        <div ref={contentRef} className={TONES[tone].content}>
          <ScrollerContext.Provider value={scrollerRef}>{children}</ScrollerContext.Provider>

          <button
            type="button"
            onClick={() => {
              track('page_next', { from: page, to: next })
              navigate(`/${next}`, true)
            }}
            className="group block w-full border-t border-[var(--border)] px-gutter pt-12 pb-16 text-left"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted uppercase">
              Next page <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="mt-4 block text-[clamp(3.5rem,13vw,12rem)] leading-[0.85] font-extrabold tracking-[-0.05em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3">
              {labelOf(next)}
            </span>
          </button>
        </div>
      </div>

      {/* Solid pills, so the controls stay legible over dark, paper and running text alike. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-gutter py-4 sm:py-5">
        <button type="button" onClick={leavePage} className="group pointer-events-auto rounded-full border border-[rgba(236,230,220,0.16)] bg-[rgba(11,10,15,0.72)] text-[#ece6dc] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-[rgba(236,230,220,0.4)] inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Home
        </button>
        <p className="rounded-full border border-[rgba(236,230,220,0.16)] bg-[rgba(11,10,15,0.72)] text-[#ece6dc] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md hidden px-4 py-2 text-[11px] font-bold tracking-[0.2em] uppercase sm:block">{labelOf(page)}</p>
        <button type="button" onClick={leavePage} aria-label={`Close ${labelOf(page)}`} className="pointer-events-auto rounded-full border border-[rgba(236,230,220,0.16)] bg-[rgba(11,10,15,0.72)] text-[#ece6dc] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-[rgba(236,230,220,0.4)] grid h-10 w-10 place-items-center">
          <X size={16} />
        </button>
      </div>
    </motion.article>
  )
}

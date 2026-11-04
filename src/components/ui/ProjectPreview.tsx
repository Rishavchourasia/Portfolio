import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { ActivePill } from '@/components/ui/ActivePill'
import { ArchitectureDiagram } from '@/components/ui/ArchitectureDiagram'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/content'

/** Deterministic hue per project so generated placeholders stay stable. */
const hueFor = (seed: string) =>
  [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7)

const AUTOPLAY_MS = 4500

type Tab = 'screens' | 'architecture'

type Props = {
  project: Pick<Project, 'title' | 'slug' | 'screens' | 'architecture'>
  className?: string
}

function Placeholder({ title, slug }: { title: string; slug: string }) {
  const hue = hueFor(slug)
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
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
  )
}

/**
 * Card preview: a browser-chrome frame around a screenshot slider and an
 * architecture diagram (or, when a project has neither yet, a generated
 * gradient with its initials). The expand button opens the same view large
 * in a modal dialog, sharing the selected tab and slide.
 */
export function ProjectPreview({ project, className }: Props) {
  const { title, slug, architecture } = project
  const screens = project.screens ?? []
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const [tab, setTab] = useState<Tab>('screens')
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0])
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const go = (step: number) =>
    setSlide(([i]) => [(i + step + screens.length) % screens.length, step])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Warm the cache once the card is on screen, so slides never flash in.
  useEffect(() => {
    if (!visible) return
    for (const s of screens.slice(1)) new Image().src = s.src
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Inline autoplay only; in the dialog the viewer is reading, so they drive.
  const autoplay = tab === 'screens' && screens.length > 1 && visible && !paused && !expanded && !reducedMotion
  useEffect(() => {
    if (!autoplay) return
    const id = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
    // `go` only closes over the length, which is fixed per project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, index])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!expanded || !dialog) return
    // A click on the backdrop lands on the dialog element itself.
    const onClick = (e: MouseEvent) => e.target === dialog && dialog.close()
    const onKey = (e: KeyboardEvent) => {
      if (tab !== 'screens' || screens.length < 2) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    dialog.addEventListener('click', onClick)
    dialog.addEventListener('keydown', onKey)
    return () => {
      dialog.removeEventListener('click', onClick)
      dialog.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, tab])

  const switchTab = (next: Tab) => {
    setTab(next)
    track('project_preview_tab', { project: slug, tab: next })
  }

  const open = () => {
    setExpanded(true)
    dialogRef.current?.showModal()
    track('project_preview_expand', { project: slug, tab })
  }

  const hasContent = screens.length > 0 || Boolean(architecture)
  const current = screens[index]
  const address = tab === 'architecture' ? `${slug} · architecture` : current ? `${slug} · ${current.caption}` : ''

  const chrome = (large: boolean) => (
    <div className={cn('flex items-center gap-1.5 border-b border-[var(--border)]', large ? 'px-4 py-3' : 'px-3 py-2')}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5f57]/70" />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#febc2e]/70" />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#28c840]/70" />
      <span
        className={cn(
          'ml-2 flex min-w-0 flex-1 items-center rounded-full bg-[color-mix(in_oklab,var(--text)_7%,transparent)] px-2.5 font-mono text-muted',
          large ? 'h-6 text-xs' : 'h-5 text-[10px]',
        )}
      >
        <span className="truncate">{address}</span>
      </span>

      {architecture && screens.length > 0 && (
        <div
          role="tablist"
          aria-label={`${title} preview`}
          className="flex shrink-0 rounded-full bg-[color-mix(in_oklab,var(--text)_6%,transparent)] p-0.5"
        >
          {(['screens', 'architecture'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => switchTab(t)}
              className={cn(
                'relative rounded-full font-medium capitalize transition-colors duration-200',
                large ? 'px-3.5 py-1 text-xs' : 'px-2.5 py-0.5 text-[10.5px]',
                tab === t ? 'text-ink-950' : 'text-muted hover:text-[var(--text)]',
              )}
            >
              {tab === t && (
                <ActivePill layoutId={`preview-tab-${slug}${large ? '-large' : ''}`} className="-z-10 rounded-full bg-accent-500" />
              )}
              {t}
            </button>
          ))}
        </div>
      )}

      {hasContent &&
        (large ? (
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
            className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-[color-mix(in_oklab,var(--text)_8%,transparent)] hover:text-[var(--text)]"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Expand ${title} preview`}
            onClick={open}
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-[var(--text)]"
          >
            <Maximize2 size={12} />
          </button>
        ))}
    </div>
  )

  const body = (large: boolean) => (
    <AnimatePresence initial={false} mode="wait">
      {tab === 'architecture' && architecture ? (
        <motion.div
          key="architecture"
          className="absolute inset-0"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ArchitectureDiagram title={title} architecture={architecture} />
        </motion.div>
      ) : screens.length > 0 ? (
        <motion.div
          key="screens"
          className="absolute inset-0"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={current?.src}
              src={current?.src}
              alt={`${title}: ${current?.caption}`}
              decoding="async"
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: reducedMotion ? 0 : `${d * 8}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: reducedMotion ? 0 : `${d * -8}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>

          {screens.length > 1 && (
            <>
              {(
                [
                  [-1, 'left-2', ChevronLeft, 'Previous screenshot'],
                  [1, 'right-2', ChevronRight, 'Next screenshot'],
                ] as const
              ).map(([step, side, Icon, label]) => (
                <button
                  key={step}
                  type="button"
                  aria-label={label}
                  onClick={() => go(step)}
                  className={cn(
                    'glass absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full transition-opacity duration-200 focus-visible:opacity-100',
                    large ? 'h-11 w-11 opacity-90' : 'h-8 w-8 opacity-0 group-hover/preview:opacity-100 [@media(hover:none)]:opacity-80',
                    side,
                  )}
                >
                  <Icon size={large ? 20 : 16} />
                </button>
              ))}

              <div className={cn('absolute inset-x-0 flex justify-center gap-1.5', large ? 'bottom-4' : 'bottom-2')}>
                {screens.map((screen, i) => (
                  <button
                    key={screen.src}
                    type="button"
                    aria-label={`Show ${screen.caption}`}
                    aria-current={i === index}
                    onClick={() => setSlide([i, i > index ? 1 : -1])}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === index ? 'w-5 bg-accent-500' : 'w-1.5 bg-white/45 hover:bg-white/75',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <Placeholder title={title} slug={slug} />
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div
        className={cn(
          'group/preview relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-[var(--elev-2)]',
          className,
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {chrome(false)}
        <div ref={frameRef} className="project-preview__frame relative aspect-[16/10] overflow-hidden">
          {!expanded && body(false)}
        </div>
      </div>

      {hasContent && (
        <dialog
          ref={dialogRef}
          aria-label={`${title} preview`}
          onClose={() => setExpanded(false)}
          className="group/preview m-auto w-[min(92vw,calc((92dvh-3rem)*1.6),1280px)] overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] p-0 text-[var(--text)] shadow-[var(--elev-3)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        >
          {expanded && (
            <>
              {chrome(true)}
              <div className="relative aspect-[16/10] overflow-hidden">{body(true)}</div>
            </>
          )}
        </dialog>
      )}
    </>
  )
}

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import { projects } from '@/content'
import { ORDERED, TOTAL, hueFor, pad, splitTitle } from './workData'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { caseUrl, navigate, useCaseSlug } from '@/lib/route'
import { jumpTo, scrollToId } from '@/lib/smoothScroll'
import type { Project } from '@/types/content'
import { FadeUp, RevealLines } from './Reveal'
import { useReveal } from './intro'

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']




/**
 * How long a card stays put, as a share of the viewport, before the next one
 * starts to cover it. Must match the `h-[50svh]` spacer between cards.
 */
const DWELL = 0.5
const HOLD = DWELL / (1 + DWELL)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function WorkIndex() {
  const years = projects.map((p) => Number(p.year)).filter(Boolean)
  const range = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : ''
  const [chipsRef, chipsShown] = useReveal<HTMLUListElement>(0.4)

  return (
    <div className="px-gutter pt-[18vh] pb-[14vh]">
      <FadeUp>
        <p className="eyebrow">Selected work · {range}</p>
      </FadeUp>
      <RevealLines
        className="mt-6 max-w-5xl text-[clamp(2.1rem,5vw,4.2rem)] leading-[1.02] font-bold tracking-[-0.035em]"
        lines={[
          `${NUMBER_WORDS[TOTAL] ?? TOTAL} builds,`,
          <span key="v" className="voice text-[1.08em]">from the first commit to production.</span>,
        ]}
      />
      <ul ref={chipsRef} className="mt-10 flex flex-wrap gap-3">
        {ORDERED.map((p, i) => (
          <motion.li
            key={p.slug}
            initial={{ opacity: 0, y: 14, rotate: 0 }}
            animate={chipsShown ? { opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 } : undefined}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
          >
            <button
              type="button"
              onClick={() => scrollToId(`case-${p.slug}`)}
              className="group flex items-center gap-2 rounded-md border border-[var(--color-stamp)] px-3 py-2 text-xs font-bold tracking-[0.12em] text-[#f08a7f] uppercase transition-colors hover:bg-[var(--color-stamp)] hover:text-[#f6e9df]"
            >
              <span className="voice text-sm tracking-normal text-current normal-case">{pad(i + 1)}</span>
              {splitTitle(p.title).name}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/** The browser window a card's screenshots or diagram sit in. */
export function Frame({ address, children }: { address: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--color-ink-900)] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
        <span className="ml-2 truncate rounded-full bg-[color-mix(in_oklab,var(--text)_7%,transparent)] px-2.5 py-0.5 font-mono text-[10px] text-muted">
          {address}
        </span>
      </div>
      <div className="relative aspect-[16/10]">{children}</div>
    </div>
  )
}

/** Cycles a project's screenshots inside a browser frame. */
function ScreenCycler({ project, active }: { project: Project; active: boolean }) {
  const screens = project.screens ?? []
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!active || screens.length < 2) return
    const id = window.setInterval(() => setI((n) => (n + 1) % screens.length), 3200)
    return () => window.clearInterval(id)
  }, [active, screens.length])
  const screen = screens[i]

  return (
    <Frame address={`${project.slug} · ${screen?.caption}`}>
        <AnimatePresence initial={false}>
          <motion.img
            key={screen?.src}
            src={screen?.src}
            alt={`${project.title}: ${screen?.caption}`}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
    </Frame>
  )
}

/** For work without screenshots (the architecture lives inside the case): the tagline set as a poster over a light line. */
function Poster({ project }: { project: Project }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="voice max-w-3xl text-[clamp(1.8rem,4vw,3.4rem)] leading-[1.1] text-[var(--color-cream)]">
        “{project.tagline}”
      </p>
      <ul className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {project.tags.map((tag, i) => (
          <li
            key={tag}
            className="rounded-md border border-[var(--border-strong)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase"
            style={{ rotate: `${((i * 37) % 7) - 3}deg` }}
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CaseCard({
  project,
  index,
  progress,
  onOpen,
}: {
  project: Project
  index: number
  progress: MotionValue<number>
  onOpen: () => void
}) {
  const { name, kind } = splitTitle(project.title)
  const hue = hueFor(project.slug)
  const steps = Math.max(1, TOTAL - 1)
  // 0 → 1 while the next card slides over this one, after this one has had its hold.
  const exit = useTransform(progress, (p) => clamp01((p * steps - index - HOLD) / (1 - HOLD)))
  // 0 → 1 while this card itself slides into place.
  const enter = useTransform(progress, (p) => clamp01((p * steps - index + 1 - HOLD) / (1 - HOLD)))
  const scale = useTransform(exit, [0, 1], [1, 0.9])
  const dim = useTransform(exit, [0, 1], [0, 0.75])
  const visualY = useTransform(enter, [0, 1], ['18%', '0%'])
  const visualTilt = useTransform(enter, [0, 1], [18, 0])
  const [visualRef, inView] = useReveal<HTMLDivElement>(0.3)

  return (
    <section id={`case-${project.slug}`} aria-label={name} className="sticky top-0 h-[100svh] overflow-hidden">
      <motion.div
        style={{ scale }}
        className="relative h-full origin-top overflow-hidden rounded-t-[clamp(1.25rem,3vw,2.5rem)] border-t border-[var(--border-strong)] bg-[var(--color-ink-950)]"
      >
        {/* Atmosphere: a coloured bloom, a horizon light line, a few stars. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 55% at 50% 58%, hsl(${hue} 70% 45% / 0.28), transparent 70%),
                         radial-gradient(40% 30% at 85% 10%, hsl(${(hue + 60) % 360} 70% 50% / 0.12), transparent 70%)`,
          }}
        />
        <div aria-hidden className="absolute inset-x-[12%] top-[62%] h-px bg-[var(--color-cream)] opacity-70 shadow-[0_0_24px_4px_rgba(236,230,220,0.45),0_0_80px_14px_hsl(var(--h)_80%_60%/0.35)]" style={{ ['--h' as string]: hue }} />

        <div className="absolute top-20 right-[var(--gutter)] text-right sm:top-24">
          <p className="voice text-4xl leading-none">
            {pad(index + 1)}
            <span className="text-base text-muted not-italic"> / {pad(TOTAL)}</span>
          </p>
          <p className="voice mt-1 text-base text-[var(--color-cream)]">
            {project.category === 'personal' ? 'Personal build' : 'Company work'} · {project.year}
          </p>
        </div>

        <motion.div
          ref={visualRef}
          style={{ y: visualY, rotateX: visualTilt, transformPerspective: 1400 }}
          className="absolute inset-x-[var(--gutter)] top-[16%] bottom-[30%] flex items-center justify-center"
        >
          {project.screens?.length ? (
            <div className="w-full max-w-[min(860px,calc((100svh*0.54)*1.6))]">
              <ScreenCycler project={project} active={inView} />
            </div>
          ) : (
            <Poster project={project} />
          )}
        </motion.div>

        <div className="absolute inset-x-[var(--gutter)] bottom-8 sm:bottom-10">
          <h3 className="text-[clamp(2.6rem,9vw,8rem)] leading-[0.85] font-extrabold tracking-[-0.045em] uppercase">
            {name}
          </h3>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border-strong)] pt-4">
            <div>
              <p className="voice text-xl text-[var(--color-cream)] sm:text-2xl">{kind || project.tagline}</p>
              <p className="mt-1 text-xs text-muted">
                {project.status ? `${project.year} · ${project.status}` : project.year} · {project.tags.slice(0, 4).join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
            {project.videos?.length ? (
              <button type="button" onClick={onOpen} className="voice inline-flex items-center gap-2 text-lg underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70">
                <Play size={14} className="fill-current" /> Watch it run
              </button>
            ) : null}
            {project.repo ? (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('case_source', { project: project.slug, from: 'card' })}
                className="voice inline-flex items-center gap-1.5 text-lg underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70"
              >
                Source <ArrowUpRight size={15} />
              </a>
            ) : null}
            <button
              type="button"
              onClick={onOpen}
              className="group inline-flex items-center gap-3 rounded-xl bg-[var(--color-cream)] px-5 py-3 text-sm font-semibold text-[var(--color-cream-ink)] transition-transform hover:-translate-y-0.5"
            >
              Open case
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            </div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
    </section>
  )
}

const openCase = (p: Project) => {
  track('case_open', { project: p.slug, from: 'card' })
  navigate(caseUrl(p.slug))
}

/** Selected work: an index of chips, then one full-screen case per project, each stacking over the last. */
export function Work() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })
  const slug = useCaseSlug()

  /**
   * Puts a case's card in place under its open case study, so leaving the case
   * lands on it. Worked out from the stack, because a card that is already
   * pinned reports where it is stuck, not where it belongs.
   */
  useEffect(() => {
    const i = slug ? ORDERED.findIndex((p) => p.slug === slug) : -1
    const stack = stackRef.current
    const card = stack?.firstElementChild
    if (i < 0 || !stack || !(card instanceof HTMLElement)) return
    jumpTo(stack.getBoundingClientRect().top + window.scrollY + i * card.offsetHeight * (1 + DWELL))
  }, [slug])

  return (
    <section id="work" aria-label="Selected work" className="relative">
      <WorkIndex />
      <div ref={stackRef} className="relative">
        {ORDERED.map((project, i) => (
          <Fragment key={project.slug}>
            <CaseCard project={project} index={i} progress={scrollYProgress} onOpen={() => openCase(project)} />
            {/* The hold: scroll that passes before the next card arrives. A spacer, not a
                margin, so every card stays pinned until the whole stack has gone by. */}
            {i < TOTAL - 1 && <div aria-hidden className="h-[50svh]" />}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

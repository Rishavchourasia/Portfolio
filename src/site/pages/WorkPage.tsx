import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '@/content'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { caseUrl, navigate } from '@/lib/route'
import type { Project } from '@/types/content'
import { FadeUp, RevealLines } from '../Reveal'
import { useReveal } from '../intro'
import { ORDERED, TOTAL, hueFor, pad, splitTitle } from '../workData'
import { Sheet } from './Sheet'

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const years = projects.map((p) => Number(p.year)).filter(Boolean)
const RANGE = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : ''

const openCase = (p: Project) => {
  track('case_open', { project: p.slug, from: 'work_page' })
  navigate(caseUrl(p.slug), false, { under: 'work' })
}

/** What a project looks like in a glance: its first screen, or a card in its colour. */
function Thumb({ project, className = '' }: { project: Project; className?: string }) {
  const screen = project.screens?.[0]
  const hue = hueFor(project.slug)
  if (screen)
    return <img src={screen.src} alt="" decoding="async" loading="lazy" className={`aspect-[16/10] w-full object-cover object-top ${className}`} />
  return (
    <div
      className={`grid aspect-[16/10] w-full place-items-center p-[8%] ${className}`}
      style={{ background: `radial-gradient(90% 90% at 20% 0%, hsl(${hue} 70% 45%), hsl(${(hue + 60) % 360} 50% 18%))` }}
    >
      <p className="voice text-center text-[clamp(1rem,2vw,1.6rem)] leading-tight text-[var(--color-cream)]">“{project.tagline}”</p>
    </div>
  )
}

function Row({ project, index, onHover }: { project: Project; index: number; onHover: (i: number | null) => void }) {
  const { name, kind } = splitTitle(project.title)
  const [ref, shown] = useReveal<HTMLLIElement>(0.3)
  return (
    <li ref={ref} className="border-t border-[var(--border)] last:border-b">
      <button
        type="button"
        onClick={() => openCase(project)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(index)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(index)}
        onBlur={() => onHover(null)}
        className="group grid w-full gap-4 py-8 text-left md:grid-cols-[4rem_minmax(0,1fr)_16rem] md:items-end md:py-10"
      >
        <motion.span
          className="voice text-2xl"
          initial={{ opacity: 0 }}
          animate={shown ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {pad(index + 1)}
        </motion.span>
        <span className="mask-line">
          <motion.span
            className="block text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.05em] uppercase transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4 group-hover:text-[var(--color-lavender)]"
            initial={{ y: '110%' }}
            animate={shown ? { y: '0%' } : undefined}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {name}
          </motion.span>
        </span>
        <motion.span
          className="flex items-end justify-between gap-4 md:block md:text-right"
          initial={{ opacity: 0, y: 16 }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
        >
          <span className="voice block text-xl">{kind || project.tagline}</span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
            {project.category === 'personal' ? 'Personal' : 'Company'} · {project.year}
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </motion.span>
        {/* No cursor to follow on touch screens: the picture sits in the row instead. */}
        <Thumb project={project} className="rounded-lg md:hidden" />
      </button>
    </li>
  )
}

/** /work: every build as a big line; the hovered one's screen follows the cursor. */
export function WorkPage({ covered }: { covered: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 22 })
  const sy = useSpring(y, { stiffness: 180, damping: 22 })
  const follow = (e: ReactPointerEvent) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }
  const shown = hovered === null ? null : ORDERED[hovered]
  const personal = ORDERED.filter((p) => p.category === 'personal').length

  return (
    <Sheet page="work" covered={covered}>
      <div onPointerMove={follow} className="px-gutter pt-32 pb-[14vh]">
        <FadeUp>
          <p className="eyebrow">Selected work · {RANGE}</p>
        </FadeUp>
        <RevealLines
          as="h1"
          className="mt-6 max-w-6xl text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.04em]"
          lines={[`${WORDS[TOTAL] ?? TOTAL} builds,`, <span key="v" className="voice text-[1.06em]">from the first commit to production.</span>]}
        />
        <FadeUp delay={0.3} className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <span>{personal} personal builds, with source on GitHub</span>
          <span>{TOTAL - personal} built at work</span>
          <span>Pick one to read the case</span>
        </FadeUp>

        <ol className="mt-16">
          {ORDERED.map((project, i) => (
            <Row key={project.slug} project={project} index={i} onHover={setHovered} />
          ))}
        </ol>
      </div>

      {/* The hovered build's screen, trailing the cursor. */}
      <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-10 hidden w-[min(30vw,420px)] md:block" style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {shown && (
            <motion.div
              key={shown.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-[var(--border-strong)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
              style={{ width: 'min(30vw, 420px)' }}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 4 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <Thumb project={shown} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Sheet>
  )
}

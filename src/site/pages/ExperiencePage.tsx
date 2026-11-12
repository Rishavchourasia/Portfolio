import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { experiences, profile } from '@/content'
import { withFigures } from '@/lib/figures'
import { EASE } from '@/lib/motion'
import type { Experience } from '@/types/content'
import { FadeUp, RevealLines } from '../Reveal'
import { useReveal } from '../intro'
import { Sheet } from './Sheet'
import { useSheetScroller } from './sheetContext'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** A company name set in outline that fills with ink from left to right as it scrolls up the page. */
function FillName({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const container = useSheetScroller()
  const { scrollYProgress } = useScroll({ container, target: ref, offset: ['start 90%', 'start 35%'] })
  const clip = useTransform(scrollYProgress, (p) => `inset(0 ${100 - 100 * clamp01(p)}% 0 0)`)
  return (
    <h2 ref={ref} className="relative text-[clamp(2.4rem,11vw,10rem)] break-words leading-[0.86] font-extrabold tracking-[-0.05em] uppercase">
      <span className="text-transparent [-webkit-text-stroke:1.5px_var(--border-strong)]">{text}</span>
      <motion.span aria-hidden className="absolute inset-0 text-[var(--text)]" style={{ clipPath: clip }}>
        {text}
      </motion.span>
    </h2>
  )
}

function Highlights({ items }: { items: string[] }) {
  const [ref, shown] = useReveal<HTMLOListElement>(0.15)
  return (
    <ol ref={ref} className="mt-12 grid gap-4 md:grid-cols-2">
      {items.map((h, i) => (
        <motion.li
          key={h}
          className="flex gap-5 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--text)_3%,transparent)] p-6 leading-relaxed"
          initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1.5 : -1.5 }}
          animate={shown ? { opacity: 1, y: 0, rotate: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
        >
          <span className="voice text-2xl">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-[color-mix(in_oklab,var(--text)_78%,transparent)]">{withFigures(h)}</span>
        </motion.li>
      ))}
    </ol>
  )
}

function Role({ job }: { job: Experience }) {
  const [from = '', to = ''] = job.period.split(/\s+—\s+/)
  return (
    <article className="relative pb-[14vh]">
      <FadeUp>
        <p className="voice text-[clamp(1.6rem,3vw,2.4rem)]">
          {from} <span className="text-muted not-italic">— {to}</span>
        </p>
      </FadeUp>
      <div className="mt-4">
        <FillName text={job.company} />
      </div>
      <FadeUp delay={0.1} className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <p className="text-2xl font-bold tracking-tight">{job.role}</p>
        {job.location && <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-lavender)] uppercase">{job.location}</p>}
      </FadeUp>
      <FadeUp delay={0.15}>
        <p className="mt-8 max-w-4xl text-[clamp(1.2rem,2vw,1.6rem)] leading-relaxed">{job.summary}</p>
      </FadeUp>
      <Highlights items={job.highlights} />
      <FadeUp className="mt-10">
        <ul className="flex flex-wrap gap-2">
          {job.stack.map((s) => (
            <li key={s} className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-sm">
              {s}
            </li>
          ))}
        </ul>
      </FadeUp>
    </article>
  )
}

/** /experience: each role as a chapter, joined by a line that draws as you read. */
export function ExperiencePage({ covered }: { covered: boolean }) {
  const { education } = profile
  return (
    <Sheet page="experience" covered={covered}>
      <section className="px-gutter pt-32 pb-[12vh]">
        <FadeUp>
          <p className="eyebrow">Experience</p>
        </FadeUp>
        <RevealLines
          as="h1"
          className="mt-6 text-[clamp(2.5rem,9vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.045em]"
          lines={['Shipping product,', <span key="v" className="voice text-[1.06em]">end to end.</span>]}
        />
        <FadeUp delay={0.3} className="mt-8 max-w-xl text-lg text-muted">
          Owning features from a vague ticket to the API, the UI, the tests and the deploy, then measuring them in production.
        </FadeUp>
      </section>

      <Timeline>
        {experiences.map((job) => (
          <Role key={`${job.company}-${job.period}`} job={job} />
        ))}
        <article className="pb-[10vh]">
          <FadeUp>
            <p className="voice text-[clamp(1.6rem,3vw,2.4rem)]">{education.period}</p>
          </FadeUp>
          <div className="mt-4">
            <FillName text={education.school} />
          </div>
          <FadeUp delay={0.1} className="mt-6">
            <p className="text-2xl font-bold tracking-tight">
              {education.degree}, {education.field}
            </p>
            <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-[var(--color-lavender)] uppercase">{education.location}</p>
          </FadeUp>
        </article>
      </Timeline>
    </Sheet>
  )
}

/** The roles, joined by a line down the left that draws as the reader goes. */
function Timeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const container = useSheetScroller()
  const { scrollYProgress } = useScroll({ container, target: ref, offset: ['start 70%', 'end 70%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <div ref={ref} className="relative mx-gutter border-l border-[var(--border)] pl-8 sm:pl-14">
      <motion.span
        aria-hidden
        style={{ scaleY: fill }}
        className="absolute top-0 -left-px h-full w-px origin-top bg-[var(--color-lavender)] shadow-[0_0_14px_rgba(169,156,255,0.8)]"
      />
      {children}
    </div>
  )
}

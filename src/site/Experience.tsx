import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { experiences, profile } from '@/content'
import { FadeUp, RevealLines } from './Reveal'

const year = (s: string) => /\d{4}/.exec(s)?.[0] ?? s

/** "Jan 2025 — Present" → ["2025", "now"], for the big italic year column. */
function years(period: string): [string, string] {
  const [from = '', to = ''] = period.split(/\s+—\s+/)
  return [year(from), /present/i.test(to) ? 'now' : year(to)]
}

type Row = {
  key: string
  period: string
  title: string
  org: string
  place?: string
  summary?: string
  highlights?: string[]
  stack?: string[]
}

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const { education } = profile

  const rows: Row[] = [
    ...experiences.map((e) => ({
      key: `${e.company}-${e.period}`,
      period: e.period,
      title: e.role,
      org: e.company,
      place: e.location,
      summary: e.summary,
      highlights: e.highlights,
      stack: e.stack,
    })),
    {
      key: 'education',
      period: education.period,
      title: `${education.degree}, ${education.field}`,
      org: education.school,
      place: education.location,
    },
  ]

  return (
    <section id="experience" aria-label="Experience" className="px-gutter py-[16vh]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <FadeUp>
            <p className="eyebrow">Experience</p>
          </FadeUp>
          <RevealLines
            className="mt-6 text-[clamp(2.1rem,4.6vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.035em]"
            lines={['Shipping product,', <span key="v" className="voice text-[1.08em]">end to end.</span>]}
          />
        </div>
        <FadeUp delay={0.2} className="max-w-sm text-muted">
          Owning features from a Figma file and a vague ticket to something shipped, measured and accessible.
        </FadeUp>
      </div>

      <ol ref={listRef} className="relative mt-16 ml-2 border-l border-[var(--border)] sm:ml-4">
        <motion.span
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute top-0 -left-px h-full w-px origin-top bg-[var(--color-lavender)] shadow-[0_0_12px_rgba(169,156,255,0.8)]"
        />
        {rows.map((row) => {
          const [from, to] = years(row.period)
          return (
            <li key={row.key} className="relative pb-16 pl-8 last:pb-0 sm:pl-12">
              <span aria-hidden className="absolute top-3 -left-[5px] h-[9px] w-[9px] rounded-full border border-[var(--color-lavender)] bg-[var(--bg)]" />
              <FadeUp className="grid gap-6 lg:grid-cols-[14rem_1fr]">
                <p className="voice text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.9]">
                  {from}
                  <span className="block text-[0.6em] text-muted">— {to}</span>
                </p>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{row.title}</h3>
                  <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-[var(--color-lavender)] uppercase">
                    {row.org}
                    {row.place && <span className="text-muted"> · {row.place}</span>}
                  </p>
                  {row.summary && <p className="mt-4 max-w-3xl text-lg leading-relaxed">{row.summary}</p>}
                  {row.highlights && (
                    <ol className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
                      {row.highlights.map((h, i) => (
                        <li key={h} className="flex gap-4 border-t border-[var(--border)] pt-4 text-sm leading-relaxed text-muted">
                          <span className="voice text-base">{String(i + 1).padStart(2, '0')}</span>
                          {h}
                        </li>
                      ))}
                    </ol>
                  )}
                  {row.stack && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {row.stack.map((s) => (
                        <li key={s} className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FadeUp>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

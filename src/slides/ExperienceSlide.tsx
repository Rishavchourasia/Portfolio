import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ActivePill } from '@/components/ui/ActivePill'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { experiences } from '@/content'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { Experience } from '@/types/content'

/**
 * Where each card rests relative to the window it slides through.
 *
 * Labels rather than an inline `animate` object: a motion child of a
 * variant-driven parent — which every slide is — does not pick up changes to
 * an object `animate` prop, but does respond to a label. The names avoid the
 * slide's own `active`/`idle`, since a parent's labels propagate to any child
 * that defines them.
 */
const cardVariants: Variants = {
  above: { y: '-100%' },
  current: { y: '0%' },
  below: { y: '100%' },
}

function RoleCard({ job }: { job: Experience }) {
  return (
    <SpotlightCard className="h-full" staticLift>
      <div className="p-7 sm:p-9">
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent-400 uppercase">
          {job.period}
          {job.location && <span className="text-muted"> · {job.location}</span>}
        </p>

        <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight">
          {job.role}
          <span className="text-muted"> · {job.company}</span>
        </h3>

        <p className="mt-4 leading-relaxed text-muted">{job.summary}</p>

        <ul className="mt-5 space-y-2.5">
          {job.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              {highlight}
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2">
          {job.stack.map((tech) => (
            <li key={tech} className="glass rounded-full px-3 py-1 font-mono text-[11px] text-muted">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </SpotlightCard>
  )
}

/**
 * Roles are a tab list rather than a long timeline: a deck slide has one
 * viewport to work with, and tabs keep every role one click away.
 */
export function ExperienceSlide({ label }: { label: string }) {
  const [index, setIndex] = useState(0)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <Slide id="experience" label={label}>
      <SlideHeading
        eyebrow="Experience"
        title={<>Where I&apos;ve <span className="text-gradient">shipped.</span></>}
        className="mb-10"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <motion.div variants={slideItem}>
          <ul
            role="tablist"
            aria-label="Roles"
            className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {experiences.map((item, i) => {
              const active = i === index
              return (
                <li key={`${item.company}-${item.period}`} className="shrink-0 lg:shrink">
                  <button
                    role="tab"
                    id={`role-tab-${i}`}
                    aria-controls={`role-panel-${i}`}
                    aria-selected={active}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'relative w-full rounded-xl px-4 py-3 text-left transition-colors duration-200',
                      active ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]',
                    )}
                  >
                    {active && (
                      <ActivePill
                        layoutId="experience-tab"
                        className="glass -z-10 rounded-xl border-accent-500/40"
                      />
                    )}
                    <span className="block text-sm font-medium whitespace-nowrap">{item.company}</span>
                    <span className="mt-0.5 block font-mono text-[11px] whitespace-nowrap text-muted">
                      {item.period}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>

        <motion.div variants={slideItem}>
          {/*
            A fixed window that whole cards travel through: every role sits in
            the same grid cell, so the window is always as tall as the longest
            one and never resizes. Grid items stretch to that height, which is
            what makes `y: 100%` exactly one window — the outgoing card clears
            the top as the next arrives from below.

            The elevation lives out here because a card's own shadow would be
            clipped by the window it slides inside.
          */}
          <div className="relative grid overflow-hidden rounded-2xl shadow-[var(--elev-2)]">
            {experiences.map((job, i) => (
              <motion.div
                key={`${job.company}-${job.period}`}
                role="tabpanel"
                id={`role-panel-${i}`}
                aria-labelledby={`role-tab-${i}`}
                aria-hidden={i !== index}
                initial={false}
                variants={cardVariants}
                animate={i < index ? 'above' : i === index ? 'current' : 'below'}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : // A spring silently fails to animate this: Framer Motion
                      // does not interpolate a percentage-based transform (the
                      // card travels by '100%', its own height, which is what
                      // lets it work at any content length) under `type: 'spring'`
                      // — it jumps straight to the end value. A tween has no such
                      // limit, so smoothness comes from the curve instead: the
                      // app's usual EASE is expo-out, launching at full speed and
                      // decelerating, which for a full-height card read as a snap
                      // followed by a crawl. This symmetric ease-in-out
                      // accelerates and decelerates evenly, closer to how
                      // something with real weight actually glides.
                      { duration: 0.6, ease: [0.65, 0, 0.35, 1] }
                }
                className={cn(
                  'col-start-1 row-start-1',
                  i !== index && 'pointer-events-none',
                  reducedMotion && i !== index && 'invisible',
                )}
              >
                <RoleCard job={job} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Slide>
  )
}

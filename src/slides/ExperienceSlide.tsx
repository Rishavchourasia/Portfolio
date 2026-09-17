import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { experiences } from '@/content'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** How far a resting panel sits above or below the visible one. */
const TRAVEL = 26

/**
 * `custom` is the panel's offset: negative for roles above the selected one,
 * positive for those below. Selecting a later role therefore sends the current
 * panel up and out while the next rises into its place.
 *
 * The labels are deliberately not `active`/`idle`: those are the slide's own
 * variant names, and a parent's labels propagate down to any child that
 * defines them — which would hand control of these panels to the slide.
 */
const panelVariants: Variants = {
  hidden: (offset: number) => ({
    opacity: 0,
    y: offset,
    transition: { duration: 0.32, ease: EASE },
  }),
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, staggerChildren: 0.05, delayChildren: 0.08 },
  },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
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
                      <motion.span
                        layoutId="experience-tab"
                        className="glass absolute inset-0 -z-10 rounded-xl border-accent-500/40"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
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
            Every role is rendered into the same grid cell, so the card is
            always as tall as the longest one. Nothing around it — the heading,
            the tab list, the slide — shifts when you switch; only the panel
            inside moves.
          */}
          <SpotlightCard className="h-full" staticLift>
            <div className="grid p-7 sm:p-9">
              {experiences.map((job, i) => (
                <motion.div
                  key={`${job.company}-${job.period}`}
                  role="tabpanel"
                  id={`role-panel-${i}`}
                  aria-labelledby={`role-tab-${i}`}
                  aria-hidden={i !== index}
                  custom={reducedMotion ? 0 : i < index ? -TRAVEL : TRAVEL}
                  initial={false}
                  animate={i === index ? 'shown' : 'hidden'}
                  variants={panelVariants}
                  className={cn(
                    'col-start-1 row-start-1',
                    i !== index && 'pointer-events-none',
                  )}
                >
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
                      <motion.li
                        key={highlight}
                        variants={lineVariants}
                        className="flex items-start gap-3 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {job.stack.map((tech) => (
                      <li key={tech} className="glass rounded-full px-3 py-1 font-mono text-[11px] text-muted">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </Slide>
  )
}

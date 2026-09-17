import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { experiences } from '@/content'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Roles are a tab list rather than a long timeline: a deck slide has one
 * viewport to work with, and tabs keep every role one click away.
 */
export function ExperienceSlide({ label }: { label: string }) {
  const [index, setIndex] = useState(0)
  const job = experiences[index]

  if (!job) return null

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
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
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
          <SpotlightCard className="h-full p-7 sm:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={job.company + job.period}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: EASE }}
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
              </motion.div>
            </AnimatePresence>
          </SpotlightCard>
        </motion.div>
      </div>
    </Slide>
  )
}

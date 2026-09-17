import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { CarouselItem } from '@/components/ui/CarouselItem'
import { projects } from '@/content'
import { useCarousel } from '@/hooks/useCarousel'
import { cn } from '@/lib/utils'
import type { ProjectCategory } from '@/types/content'

const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: 'company', label: 'Company' },
  { id: 'personal', label: 'Personal' },
]

/**
 * Projects live in a horizontal snap track so the slide stays one viewport
 * tall no matter how many projects the JSON grows to.
 *
 * Company and personal work are kept in separate tracks behind a tab switch
 * rather than one mixed list — an internal admin tool and a side project read
 * very differently, and mixing them makes neither easy to scan.
 */
export function WorkSlide({ label }: { label: string }) {
  const [category, setCategory] = useState<ProjectCategory>(CATEGORIES[0].id)
  const filtered = projects.filter((project) => project.category === category)

  const { trackRef, index, goTo, next, prev, canPrev, canNext } = useCarousel(filtered.length)

  // The track keeps its scroll position across a tab switch otherwise, which
  // can land on blank space if the new category has fewer cards.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: 'auto' })
  }, [category, trackRef])

  return (
    <Slide id="work" label={label}>
      <div className="work-header mb-7 flex flex-wrap items-end justify-between gap-6">
        <SlideHeading
          eyebrow="Selected work"
          title={<>Things I&apos;ve <span className="text-gradient">built.</span></>}
          subtitle="Company work and personal builds — same craft, different constraints."
        />

        <motion.div variants={slideItem} className="flex items-center gap-3">
          <div role="tablist" aria-label="Project category" className="glass flex rounded-full p-1">
            {CATEGORIES.map((c) => {
              const active = c.id === category
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm transition-colors duration-200',
                    active ? 'text-ink-950' : 'text-muted hover:text-[var(--text)]',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="work-category-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-accent-500"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  {c.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous project"
              className="glass grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:border-accent-500/50 disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              aria-label="Next project"
              className="glass grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:border-accent-500/50 disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div variants={slideItem}>
        <div
          ref={trackRef}
          className="carousel -mx-gutter flex snap-x snap-mandatory gap-5 overflow-x-auto px-gutter py-4"
        >
          {filtered.map((project, i) => (
            <CarouselItem key={project.slug} index={i} containerRef={trackRef}>
              <ProjectCard project={project} featured />
            </CarouselItem>
          ))}
        </div>
      </motion.div>

      <motion.div variants={slideItem} className="project-dots mt-4 flex items-center gap-4">
        <ul className="flex items-center gap-2">
          {filtered.map((project, i) => (
            <li key={project.slug}>
              <button
                onClick={() => goTo(i)}
                aria-label={`Go to ${project.title}`}
                aria-current={i === index ? 'true' : undefined}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-7 bg-accent-400' : 'w-1.5 bg-[var(--text-muted)] hover:bg-accent-400',
                )}
              />
            </li>
          ))}
        </ul>
        <span className="font-mono text-[11px] text-muted">
          {String(index + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
        </span>
      </motion.div>
    </Slide>
  )
}

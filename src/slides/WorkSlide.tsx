import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { CarouselItem } from '@/components/ui/CarouselItem'
import { projects } from '@/content'
import { useCarousel } from '@/hooks/useCarousel'
import { cn } from '@/lib/utils'

/**
 * Projects live in a horizontal snap track so the slide stays one viewport
 * tall no matter how many projects the JSON grows to.
 */
export function WorkSlide({ label }: { label: string }) {
  const { trackRef, index, goTo, next, prev, canPrev, canNext } = useCarousel(projects.length)

  return (
    <Slide id="work" label={label}>
      <div className="work-header mb-7 flex flex-wrap items-end justify-between gap-6">
        <SlideHeading
          eyebrow="Selected work"
          title={<>Things I&apos;ve <span className="text-gradient">built.</span></>}
          subtitle="Projects that show how I think about structure, performance and the feel of an interface."
        />

        <motion.div variants={slideItem} className="flex items-center gap-2">
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
        </motion.div>
      </div>

      <motion.div variants={slideItem}>
        <div
          ref={trackRef}
          className="carousel -mx-gutter flex snap-x snap-mandatory gap-5 overflow-x-auto px-gutter py-4"
        >
          {projects.map((project, i) => (
            <CarouselItem key={project.slug} index={i} containerRef={trackRef}>
              <ProjectCard project={project} featured />
            </CarouselItem>
          ))}
        </div>
      </motion.div>

      <motion.div variants={slideItem} className="project-dots mt-4 flex items-center gap-4">
        <ul className="flex items-center gap-2">
          {projects.map((project, i) => (
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
          {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
      </motion.div>
    </Slide>
  )
}

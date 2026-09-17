import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { projects, projectTags } from '@/data/projects'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function Projects() {
  const [filter, setFilter] = useState('All')

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter))),
    [filter],
  )

  return (
    <Section
      id="work"
      eyebrow="Selected work"
      title={<>Things I&apos;ve <span className="text-gradient">built.</span></>}
      subtitle="Projects that show how I think about structure, performance and the feel of an interface. Filter by the stack you care about."
    >
      {/* tag filter */}
      <motion.div
        variants={stagger(0.03)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-10 flex flex-wrap gap-2"
      >
        {projectTags.map((tag) => {
          const active = filter === tag
          return (
            <motion.button
              key={tag}
              variants={fadeUp}
              onClick={() => setFilter(tag)}
              aria-pressed={active}
              className={cn(
                'relative rounded-full px-4 py-2 text-[13px] transition-colors duration-200',
                active ? 'text-ink-950' : 'glass text-muted hover:text-[var(--text)]',
              )}
            >
              {active && (
                <motion.span
                  layoutId="project-filter-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {tag}
            </motion.button>
          )
        })}
      </motion.div>

      <motion.div layout className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.article
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn(project.featured && 'lg:col-span-2')}
            >
              <ProjectCard project={project} />
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">No projects tagged “{filter}” yet.</p>
      )}
    </Section>
  )
}

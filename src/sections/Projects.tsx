import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { Section } from '@/components/ui/Section'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { projects } from '@/data/projects'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function Projects() {
  return (
    <Section
      id="work"
      eyebrow="Selected work"
      title={<>Things I&apos;ve <span className="text-gradient">built.</span></>}
      subtitle="A few projects that show how I think about structure, performance and the feel of an interface."
    >
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="grid gap-6 md:grid-cols-2"
      >
        {projects.map((project) => (
          <motion.article
            key={project.title}
            variants={fadeUp}
            className={cn(project.featured && 'md:col-span-2')}
          >
            <SpotlightCard className="flex h-full flex-col p-7 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">{project.year}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold sm:text-2xl">{project.title}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} source code`}
                      className="rounded-full p-2.5 text-muted transition-colors hover:text-accent-400"
                    >
                      <GithubIcon size={17} />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} live site`}
                      className="rounded-full p-2.5 text-muted transition-colors hover:text-accent-400"
                    >
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-4 max-w-2xl grow text-sm leading-relaxed text-muted text-pretty">
                {project.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag} className="glass rounded-full px-3 py-1 font-mono text-[11px] text-muted">
                    {tag}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  )
}

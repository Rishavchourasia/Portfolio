import { ArrowUpRight, Link2 } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ProjectPreview } from '@/components/ui/ProjectPreview'
import type { Project } from '@/types/content'
import { cn } from '@/lib/utils'

function ProjectLinks({ project }: { project: Project }) {
  if (!project.live && !project.repo) {
    return <p className="font-mono text-[11px] text-muted">Links coming soon</p>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-[13px] font-medium text-ink-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
        >
          <Link2 size={14} />
          Live site
          <ArrowUpRight size={13} />
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/50"
        >
          <GithubIcon size={14} />
          Source
        </a>
      )}
    </div>
  )
}

/**
 * @param featured renders the wide two-column layout (preview beside the
 * copy). The carousel uses it for every card; a stacked grid would not.
 */
export function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  return (
    <SpotlightCard className="h-full" elevation={2} staticLift={featured}>
      <div
        className={cn(
          'project-card__body flex h-full flex-col gap-6 p-5 sm:p-7',
          featured && 'md:grid md:grid-cols-2 md:items-center md:gap-7 md:p-7 lg:gap-9 lg:p-8',
        )}
      >
        <ProjectPreview
          title={project.title}
          slug={project.slug}
          image={project.image}
          status={project.status}
          className={cn(featured && 'md:order-2')}
        />

        <div className={cn('flex flex-1 flex-col', featured && 'md:order-1')}>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                {project.year}
              </span>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <h3 className="font-display mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
              {project.title}
            </h3>
            <p className="mt-1.5 text-sm text-accent-400">{project.tagline}</p>

            <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">{project.description}</p>

            {project.highlights && project.highlights.length > 0 && (
              <ul className="project-highlights mt-4 space-y-2">
                {project.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag} className="glass rounded-full px-3 py-1 font-mono text-[11px] text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

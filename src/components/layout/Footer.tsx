import { ArrowUpRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { profile } from '@/data/profile'
import { navLinks } from '@/data/navigation'
import { marqueeSkills } from '@/data/skills'
import { scrollToId } from '@/lib/utils'
import { SkillMarquee } from '@/components/ui/SkillMarquee'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-[var(--border)]">
      {/* Skill showcase strip */}
      <div className="border-b border-[var(--border)] py-10">
        <p className="mb-6 text-center font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
          Tools of the trade
        </p>
        <SkillMarquee items={marqueeSkills} />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">
            Let&apos;s build something <span className="text-gradient">worth shipping.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {profile.availability} — currently based in {profile.location}. The inbox is always open.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-400"
          >
            {profile.email}
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <nav aria-label="Footer">
          <h3 className="mb-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Navigate</h3>
          <ul className="space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => scrollToId(l.id)}
                  className="text-sm text-muted transition-colors hover:text-[var(--text)]"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Elsewhere</h3>
          <ul className="space-y-2.5">
            {profile.socials.github && (
              <li>
                <a
                  href={profile.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-[var(--text)]"
                >
                  <GithubIcon size={15} /> GitHub
                </a>
              </li>
            )}
            {profile.socials.linkedin && (
              <li>
                <a
                  href={profile.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-[var(--text)]"
                >
                  <LinkedinIcon size={15} /> LinkedIn
                </a>
              </li>
            )}
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-[var(--text)]"
              >
                <Mail size={15} /> Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-6 text-xs text-muted sm:flex-row">
        <p>
          © {year} {profile.name}. All rights reserved.
        </p>
        <p className="font-mono">Built with React, TypeScript & Tailwind.</p>
      </div>
    </footer>
  )
}

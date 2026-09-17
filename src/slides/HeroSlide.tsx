import { motion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Slide, slideItem, useDeck } from '@/components/deck'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { ButtonLink } from '@/components/ui/Button'
import { SkillMarquee } from '@/components/ui/SkillMarquee'
import { profile, skills } from '@/content'

export function HeroSlide({ label }: { label: string }) {
  const { goTo } = useDeck()

  return (
    <Slide id="hero" label={label}>
      <motion.div variants={slideItem}>
        <span className="glass inline-flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-mint)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-mint)]" />
          </span>
          {profile.availability}
        </span>
      </motion.div>

      <motion.p variants={slideItem} className="mt-7 font-mono text-sm text-accent-400">
        Hi, I&apos;m {profile.name}
        <span className="animate-blink ml-0.5">_</span>
      </motion.p>

      <motion.h1
        variants={slideItem}
        className="font-display mt-4 max-w-4xl text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-balance"
      >
        <span className="text-gradient">{profile.role}</span>
        <br />
        <span className="text-muted">crafting interfaces</span>
        <br />
        people enjoy using.
      </motion.h1>

      <motion.p variants={slideItem} className="mt-7 max-w-xl text-lg leading-relaxed text-muted text-pretty">
        {profile.tagline}
      </motion.p>

      <motion.div variants={slideItem} className="mt-9 flex flex-wrap items-center gap-3">
        <ButtonLink
          href="#work"
          onClick={(e) => {
            e.preventDefault()
            goTo('work')
          }}
        >
          View my work
          <ArrowUpRight size={16} />
        </ButtonLink>
        <ButtonLink href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="ghost">
          Download résumé
        </ButtonLink>

        <div className="ml-1 flex items-center gap-1">
          {profile.socials.github && (
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-full p-3 text-muted transition-colors hover:text-accent-400"
            >
              <GithubIcon size={18} />
            </a>
          )}
          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="rounded-full p-3 text-muted transition-colors hover:text-accent-400"
            >
              <LinkedinIcon size={18} />
            </a>
          )}
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="rounded-full p-3 text-muted transition-colors hover:text-accent-400"
          >
            <Mail size={18} />
          </a>
        </div>
      </motion.div>

      <motion.dl variants={slideItem} className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
        {profile.stats.map((stat) => (
          <div key={stat.label} className="border-l border-[var(--border)] pl-4">
            <dt className="font-display text-3xl font-semibold tracking-tight">{stat.value}</dt>
            <dd className="mt-1 text-xs leading-snug text-muted">{stat.label}</dd>
          </div>
        ))}
      </motion.dl>

      <motion.div variants={slideItem} className="mt-12 -mx-gutter">
        <SkillMarquee items={skills.marquee} />
      </motion.div>
    </Slide>
  )
}

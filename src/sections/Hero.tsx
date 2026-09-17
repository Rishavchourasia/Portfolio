import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { profile } from '@/data/profile'
import { marqueeSkills } from '@/data/skills'
import { SkillMarquee } from '@/components/ui/SkillMarquee'
import { ButtonLink } from '@/components/ui/Button'
import { EASE, fadeUp, stagger } from '@/lib/motion'
import { scrollToId } from '@/lib/utils'

export function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 90])
  const opacity = useTransform(scrollY, [0, 420], [1, 0])

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-32 pb-12">
      <motion.div style={{ y, opacity }} className="mx-auto w-full max-w-6xl px-6">
        <motion.div variants={stagger(0.09, 0.1)} initial="hidden" animate="show">
          {/* availability pill */}
          <motion.div variants={fadeUp}>
            <span className="glass inline-flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-mint)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-mint)]" />
              </span>
              {profile.availability}
            </span>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 font-mono text-sm text-accent-400">
            Hi, I&apos;m {profile.name}
            <span className="animate-blink ml-0.5">_</span>
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display mt-4 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.03em] text-balance sm:text-7xl lg:text-[5.5rem]"
          >
            <span className="text-gradient">{profile.role}</span>
            <br />
            <span className="text-muted">crafting interfaces</span>
            <br />
            people enjoy using.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-8 max-w-xl text-lg leading-relaxed text-muted text-pretty">
            {profile.tagline}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('work')
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

          {/* stats */}
          <motion.dl variants={fadeUp} className="mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {profile.stats.map((s) => (
              <div key={s.label} className="border-l border-[var(--border)] pl-4">
                <dt className="font-display text-3xl font-semibold tracking-tight">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </motion.div>

      {/* hero skill strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
        className="mt-20"
      >
        <SkillMarquee items={marqueeSkills} />
      </motion.div>

      <motion.button
        onClick={() => scrollToId('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-label="Scroll to about"
        className="mx-auto mt-12 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-accent-400"
      >
        Scroll
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown size={13} />
        </motion.span>
      </motion.button>
    </section>
  )
}

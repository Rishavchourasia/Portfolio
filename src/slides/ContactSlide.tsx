import { motion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Slide, slideItem, useDeck } from '@/components/deck'
import { ButtonLink } from '@/components/ui/Button'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { SkillMarquee } from '@/components/ui/SkillMarquee'
import { navSlides, profile, skills } from '@/content'

/** Closing slide: the call to action, the skill showcase and the footer. */
export function ContactSlide({ label }: { label: string }) {
  const { goTo } = useDeck()
  const year = new Date().getFullYear()

  return (
    <Slide id="contact" label={label} bare contentClassName="flex h-full flex-col justify-between !pb-0">
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6">
        <div className="flex w-full flex-col items-center justify-center text-center">
          <motion.p
            variants={slideItem}
            className="font-mono text-xs tracking-[0.2em] text-accent-400 uppercase"
          >
            Contact
          </motion.p>

          <motion.h2
            variants={slideItem}
            className="font-display mt-5 max-w-3xl text-[clamp(2rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight text-balance"
          >
            Have a role or an idea? <span className="text-gradient">Let&apos;s talk.</span>
          </motion.h2>

          <motion.p
            variants={slideItem}
            className="mt-5 max-w-lg leading-relaxed text-muted text-pretty"
          >
            I reply to everything — whether it&apos;s a job, a freelance build, or a question about
            something in this deck.
          </motion.p>

          <motion.div variants={slideItem} className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={`mailto:${profile.email}`}>
              <Mail size={16} />
              Say hello
              <ArrowUpRight size={15} />
            </ButtonLink>
            {profile.socials.linkedin && (
              <ButtonLink href={profile.socials.linkedin} target="_blank" rel="noreferrer" variant="ghost">
                <LinkedinIcon size={15} /> LinkedIn
              </ButtonLink>
            )}
            {profile.socials.github && (
              <ButtonLink href={profile.socials.github} target="_blank" rel="noreferrer" variant="ghost">
                <GithubIcon size={15} /> GitHub
              </ButtonLink>
            )}
          </motion.div>
        </div>
      </div>

      <motion.footer variants={slideItem} className="w-full border-t border-[var(--border)]">
        <div className="border-b border-[var(--border)] py-6">
          <p className="mb-4 text-center font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            Tools of the trade
          </p>
          <SkillMarquee items={skills.marquee} />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {year} {profile.name}. Built with React, TypeScript &amp; Tailwind.
          </p>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {navSlides.map((slide) => (
                <li key={slide.id}>
                  <button
                    onClick={() => goTo(slide.id)}
                    className="text-xs text-muted transition-colors hover:text-[var(--text)]"
                  >
                    {slide.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.footer>
    </Slide>
  )
}

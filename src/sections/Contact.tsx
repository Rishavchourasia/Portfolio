import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { profile } from '@/data/profile'
import { fadeUp, stagger } from '@/lib/motion'

export function Contact() {
  return (
    <Section id="contact" className="pb-8">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-accent-500/15 blur-[110px]"
        />

        <motion.p variants={fadeUp} className="font-mono text-xs tracking-[0.2em] text-accent-400 uppercase">
          Contact
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-display mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Have a role or an idea? <span className="text-gradient">Let&apos;s talk.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted text-pretty">
          I reply to everything — whether it&apos;s a job, a freelance build, or a question about something on this page.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={`mailto:${profile.email}`}>
            Say hello
            <ArrowUpRight size={16} />
          </ButtonLink>
          {profile.socials.linkedin && (
            <ButtonLink href={profile.socials.linkedin} target="_blank" rel="noreferrer" variant="ghost">
              <LinkedinIcon size={16} /> LinkedIn
            </ButtonLink>
          )}
          {profile.socials.github && (
            <ButtonLink href={profile.socials.github} target="_blank" rel="noreferrer" variant="ghost">
              <GithubIcon size={16} /> GitHub
            </ButtonLink>
          )}
        </motion.div>
      </motion.div>
    </Section>
  )
}

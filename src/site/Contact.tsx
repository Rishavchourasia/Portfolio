import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { profile } from '@/content'
import { EASE } from '@/lib/motion'
import { scrollToId } from '@/lib/smoothScroll'
import { Stamp } from './Stamp'
import { FadeUp } from './Reveal'
import { useReveal } from './intro'

const LETTERS = [..."Let's talk"].map((ch, i) => ({ ch, id: `${i}-${ch}` }))

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 40%'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const [titleRef, shown] = useReveal<HTMLHeadingElement>(0.5)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const links = [
    profile.socials.github && { label: 'GitHub', value: profile.socials.github.replace(/^https?:\/\/(www\.)?/, ''), href: profile.socials.github },
    profile.socials.linkedin && { label: 'LinkedIn', value: profile.name, href: profile.socials.linkedin },
    profile.resumeUrl && { label: 'Résumé', value: 'View résumé', href: profile.resumeUrl },
  ].filter(Boolean) as { label: string; value: string; href: string }[]

  return (
    <section ref={ref} id="contact" aria-label="Contact" className="relative -mt-[6vh]">
      <motion.div style={{ scale }} className="paper origin-top px-gutter pt-[12vh] pb-8">
        <div className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <h2 ref={titleRef} aria-label="Let's talk." className="flex text-[clamp(4rem,13vw,12rem)] leading-[0.85] font-extrabold tracking-[-0.06em]">
            {LETTERS.map(({ ch, id }, i) => (
              <span key={id} aria-hidden className="mask-line">
                <motion.span
                  className="block whitespace-pre"
                  initial={{ y: '110%' }}
                  animate={shown ? { y: '0%' } : undefined}
                  transition={{ duration: 1, ease: EASE, delay: i * 0.04 }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
            <motion.span
              aria-hidden
              className="ml-1 self-end mb-[0.12em] h-[0.16em] w-[0.16em] rounded-full bg-[var(--voice)]"
              initial={{ scale: 0 }}
              animate={shown ? { scale: 1 } : undefined}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.55 }}
            />
          </h2>
          <FadeUp delay={0.2} className="max-w-sm pb-4">
            <p className="leading-relaxed">
              Open to full-time full-stack and software engineering roles, remote or in {profile.location}.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#2f9e6e]" />
              {profile.availability}
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.1}>
          <ul className="relative mt-14 grid gap-px border-y border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            <li className="border-[var(--border)] py-5 pr-4 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted uppercase">Email</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <a href={`mailto:${profile.email}`} className="truncate font-semibold hover:underline">
                  {profile.email}
                </a>
                <button type="button" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email'} className="shrink-0 text-muted hover:text-[var(--text)]">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </li>
            {links.map((l) => (
              <li key={l.label} className="border-[var(--border)] py-5 pr-4 sm:border-l sm:pl-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-muted uppercase">{l.label}</p>
                <a href={l.href} target="_blank" rel="noreferrer" className="group mt-2 flex items-center justify-between gap-2 font-semibold">
                  <span className="truncate group-hover:underline">{l.value}</span>
                  <ArrowUpRight size={15} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
            <li className="border-[var(--border)] py-5 pr-4 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted uppercase">Based in</p>
              <p className="mt-2 font-semibold">{profile.location} · IST</p>
            </li>
          </ul>
        </FadeUp>

        <footer className="relative mt-[14vh] flex flex-wrap items-end justify-between gap-6 text-sm text-muted">
          <button type="button" onClick={() => scrollToId('top')} className="flex items-center gap-2 text-[var(--text)]" aria-label="Back to top">
            <span className="font-[family-name:var(--font-signature)] text-5xl leading-none">{profile.firstName}</span>
            <Stamp />
          </button>
          <p>Built with React, TypeScript and a lot of easing curves.</p>
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
        </footer>
      </motion.div>
    </section>
  )
}

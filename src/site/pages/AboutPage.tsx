import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { profile } from '@/content'
import { CountUp } from '@/components/ui/CountUp'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { FadeUp, RevealLines } from '../Reveal'
import { useReveal } from '../intro'
import { ParticleCloud } from '../ParticleCloud'
import { Sheet } from './Sheet'
import { useSheetScroller } from './sheetContext'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function Word({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
  // A plain function, not a range: framer-motion would otherwise hand this to the browser's scroll timeline.
  const opacity = useTransform(progress, (p) => 0.14 + 0.86 * clamp01((p - from) / (to - from)))
  return <motion.span style={{ opacity }}>{word} </motion.span>
}

/** A paragraph whose words light up one by one as it is read down the page. */
function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const container = useSheetScroller()
  const { scrollYProgress } = useScroll({ container, target: ref, offset: ['start 85%', 'end 50%'] })
  const words = text.split(/\s+/)
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        // Words repeat; their position is their identity.
        // eslint-disable-next-line react/no-array-index-key
        <Word key={i} word={w} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length} />
      ))}
    </p>
  )
}

function Stats() {
  const [ref, shown] = useReveal<HTMLDListElement>(0.4)
  return (
    <dl ref={ref} className="grid gap-12 sm:grid-cols-3">
      {profile.stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
        >
          <dt className="voice text-[clamp(4rem,9vw,7.5rem)] leading-none">
            <CountUp value={stat.value} run={shown} />
          </dt>
          <motion.span
            aria-hidden
            className="mt-4 block h-[3px] origin-left rounded-full bg-[var(--voice)]"
            initial={{ scaleX: 0 }}
            animate={shown ? { scaleX: 1 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 + i * 0.12 }}
          />
          <dd className="mt-3 max-w-[16rem] text-sm leading-snug text-muted">{stat.label}</dd>
        </motion.div>
      ))}
    </dl>
  )
}

function Values() {
  const [ref, shown] = useReveal<HTMLOListElement>(0.3)
  return (
    <ol ref={ref}>
      {profile.values.map((v, i) => (
        <li key={v} className="relative flex items-baseline gap-6 py-6">
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--border-strong)]"
            initial={{ scaleX: 0 }}
            animate={shown ? { scaleX: 1 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: i * 0.1 }}
          />
          <span className="voice w-10 shrink-0 text-xl">{String(i + 1).padStart(2, '0')}</span>
          <span className="mask-line">
            <motion.span
              className="block text-[clamp(1.6rem,4vw,3.2rem)] leading-[1.02] font-bold tracking-[-0.03em]"
              initial={{ y: '110%' }}
              animate={shown ? { y: '0%' } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.1 }}
            >
              {v}
            </motion.span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/** /about: who, what I care about, the numbers, and where to find more. */
export function AboutPage({ covered }: { covered: boolean }) {
  const { education } = profile
  const links = [
    profile.resumeUrl && { label: 'Résumé', href: profile.resumeUrl },
    profile.socials.github && { label: 'GitHub', href: profile.socials.github },
    profile.socials.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin },
    { label: profile.email, href: `mailto:${profile.email}` },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <Sheet page="about" covered={covered}>
      <section className="relative grid min-h-[100svh] items-center gap-10 px-gutter pt-28 pb-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative z-10">
          <FadeUp>
            <p className="eyebrow">About · {profile.role} · {profile.location}</p>
          </FadeUp>
          <RevealLines
            as="h1"
            className="mt-6 text-[clamp(2.5rem,8.5vw,8rem)] leading-[0.92] font-bold tracking-[-0.045em]"
            lines={['Full-stack', 'engineering.', <span key="v" className="voice text-[1.06em]">Product-level care.</span>]}
          />
        </div>
        <FadeUp y={0} className="relative h-[42svh] w-full lg:h-[70svh]">
          <ParticleCloud className="h-full w-full" />
          <p className="voice absolute bottom-0 left-0 text-lg text-muted">— the stuff products are made of</p>
        </FadeUp>
      </section>

      <section className="px-gutter py-[12vh]">
        <p className="eyebrow">Who</p>
        {profile.bio.map((para) => (
          <ScrollWords key={para.slice(0, 24)} text={para} className="mt-8 max-w-5xl text-[clamp(1.5rem,3.2vw,2.8rem)] leading-[1.25] font-semibold tracking-[-0.02em]" />
        ))}
      </section>

      <section className="grid gap-12 px-gutter py-[12vh] lg:grid-cols-[16rem_1fr]">
        <FadeUp>
          <p className="eyebrow">What I care about</p>
        </FadeUp>
        <Values />
      </section>

      <section className="px-gutter py-[12vh]">
        <FadeUp>
          <p className="eyebrow mb-12">The numbers</p>
        </FadeUp>
        <Stats />
      </section>

      <section className="grid gap-12 px-gutter py-[12vh] lg:grid-cols-2">
        <FadeUp className="rounded-3xl border border-[var(--border-strong)] p-8 sm:p-10">
          <p className="eyebrow">Education</p>
          <p className="mt-6 text-3xl font-bold tracking-tight">
            {education.degree}, {education.field}
          </p>
          <p className="voice mt-2 text-2xl">{education.school}</p>
          <p className="mt-4 text-sm text-muted">
            {education.location} · {education.period}
          </p>
        </FadeUp>
        <FadeUp delay={0.15} className="flex flex-col justify-between gap-8 rounded-3xl bg-[var(--color-cream)] p-8 text-[var(--color-cream-ink)] sm:p-10">
          <p className="text-3xl leading-tight font-bold tracking-tight">
            {profile.availability}. <span className="font-serif font-normal italic">Full-time, remote or in {profile.location}.</span>
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  onClick={() => track('about_link', { link: l.label })}
                  className="group inline-flex items-center gap-1 font-semibold underline decoration-1 underline-offset-4"
                >
                  {l.label}
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </FadeUp>
      </section>
    </Sheet>
  )
}

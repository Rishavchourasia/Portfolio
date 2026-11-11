import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { profile, skills } from '@/content'
import { EASE } from '@/lib/motion'
import { FadeUp, RevealLines } from './Reveal'
import { useReveal } from './intro'
import { ParticleCloud } from './ParticleCloud'

/** "98" → 98, "25K+" → 25 with suffix "K+", so numbers can count up. */
function parseStat(value: string) {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value)
  return match ? { n: Number(match[1]), suffix: match[2] ?? '' } : null
}

function CountUp({ value, run }: { value: string; run: boolean }) {
  const parsed = parseStat(value)
  const target = parsed?.n ?? 0
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const controls = animate(0, target, { duration: reduced ? 0 : 1.8, ease: EASE, onUpdate: setN })
    return () => controls.stop()
  }, [run, target])

  if (!parsed) return <>{value}</>
  return (
    <span aria-label={value} className="tabular-nums">
      <span aria-hidden>
        {Math.round(n)}
        {parsed.suffix}
      </span>
    </span>
  )
}

function Stats() {
  const [ref, shown] = useReveal<HTMLDListElement>(0.4)
  return (
    <dl ref={ref} className="mt-14 grid gap-10 sm:grid-cols-3">
      {profile.stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 24 }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
        >
          <dt className="voice text-[clamp(3rem,6vw,4.6rem)] leading-none">
            <CountUp value={stat.value} run={shown} />
          </dt>
          <motion.span
            aria-hidden
            className="mt-3 block h-[3px] origin-left rounded-full bg-[var(--voice)]"
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

export function About() {
  const { education } = profile
  return (
    <section
      id="about"
      aria-label="About"
      className="relative grid items-center gap-6 px-gutter py-[12vh] md:grid-cols-[0.7fr_1.3fr] md:gap-10 md:py-[18vh] lg:grid-cols-[1fr_1.15fr]"
    >
      {/* A short band on phones, so the words start on the first screen; a full square beside them from tablet up. */}
      <FadeUp className="relative h-[240px] w-full justify-self-center pb-8 md:aspect-square md:h-auto md:max-w-[560px] md:pb-0" y={0}>
        <ParticleCloud className="h-full w-full" />
        <p className="voice absolute bottom-0 left-0 text-base text-muted md:-bottom-8 lg:bottom-[8%] lg:left-[6%] lg:text-lg">— the stuff products are made of</p>
      </FadeUp>

      <div>
        <FadeUp>
          <p className="eyebrow">About</p>
        </FadeUp>
        <RevealLines
          className="mt-6 text-[clamp(2.1rem,4.6vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.035em]"
          lines={['Full-stack engineering.', <span key="v" className="voice text-[1.08em]">Product-level care.</span>]}
        />
        <FadeUp delay={0.15}>
          <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-[var(--color-lavender)] uppercase">
            {profile.role} · {profile.location} · {skills.marquee.slice(0, 3).join(' & ')}
          </p>
        </FadeUp>
        {profile.bio.map((para, i) => (
          <FadeUp key={para} delay={0.2 + i * 0.1}>
            <p className={i === 0 ? 'mt-6 text-lg leading-relaxed' : 'mt-4 leading-relaxed text-muted'}>{para}</p>
          </FadeUp>
        ))}
        <FadeUp delay={0.35}>
          <ul className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {profile.values.map((v) => (
              <li key={v} className="flex items-center gap-3 border-b border-[var(--border)] py-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lavender)]" />
                {v}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted">
            {education.degree}, {education.field} · {education.school} · {education.period}
          </p>
        </FadeUp>
        <Stats />
      </div>
    </section>
  )
}

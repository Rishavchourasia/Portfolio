import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { experiences, profile, skills } from '@/content'
import { EASE } from '@/lib/motion'
import { scrollToId } from '@/lib/smoothScroll'
import { Magnetic } from '@/components/ui/Magnetic'
import { useIntroDone } from './intro'
import { ScreenStack } from './ScreenStack'
import { Starfield } from './Starfield'

const LINES = [
  profile.role,
  'building fast, accessible',
  <span key="voice" className="voice text-[1.1em] tracking-[-0.01em]">
    products, end to end.
  </span>,
]

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  transition: { duration: 1, ease: EASE, delay },
})

/** Moves the soft spotlight behind the hero to the cursor. */
function followCursor(e: ReactPointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const box = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - box.left}px`)
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - box.top}px`)
}

export function Hero() {
  const introDone = useIntroDone()
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const stackLift = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])

  // Size the headline so its longest line fills its column, capped so short
  // screens keep room for everything else.
  useEffect(() => {
    const title = titleRef.current
    const section = ref.current
    if (!title || !section) return
    const widest = () => Math.max(...[...title.querySelectorAll<HTMLElement>('[data-line]')].map((el) => el.offsetWidth))
    const fit = () => {
      const narrow = section.clientWidth < 768
      const room = title.clientWidth
      const cap = Math.min(section.clientHeight * (narrow ? 0.065 : 0.1), 116)
      // Bricolage's optical size widens the letters as they shrink, so width
      // isn't proportional to size: rescale at the new size until it fits.
      let px = 100
      for (let i = 0; i < 4; i++) {
        title.style.fontSize = `${px}px`
        px = Math.min((px * room) / widest(), cap)
      }
      title.style.fontSize = `${Math.floor(px)}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(section)
    // The heavy weight can arrive after first paint and widen every line.
    observer.observe(title)
    void document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [])

  const show = introDone ? { opacity: 1, y: 0 } : undefined
  const [, speed, builds] = profile.stats
  const company = experiences[0]?.company
  const marquee = [...skills.marquee, ...skills.marquee]

  return (
    <section
      ref={ref}
      id="top"
      onPointerMove={followCursor}
      className="hero relative flex min-h-[660px] flex-col overflow-hidden px-gutter pt-24 [height:100svh]"
    >
      <div aria-hidden className="hero-spot pointer-events-none absolute inset-0" />
      <Starfield className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Copy and screens side by side, centred in the space above the proof bar. */}
      <div className="relative grid min-h-0 w-full flex-1 items-center gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-10">
        <div className="order-first md:order-none md:col-start-2 md:row-start-1">
          <ScreenStack lift={stackLift} />
        </div>

        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative md:col-start-1 md:row-start-1">
          <motion.p
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_oklab,var(--color-ink-950)_60%,transparent)] py-1.5 pr-4 pl-3 text-xs backdrop-blur"
            {...rise(0.25)}
            animate={show}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-mint)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-mint)]" />
            </span>
            {profile.availability}
            {company && <span className="text-muted">· now at {company}</span>}
          </motion.p>

          <h1 ref={titleRef} className="mt-6 leading-[0.95] font-extrabold tracking-[-0.045em]">
            {LINES.map((line, i) => (
              // Lines are positional; their order is their identity.
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className="mask-line">
                <motion.span
                  data-line
                  className="block w-fit origin-bottom-left whitespace-nowrap"
                  initial={{ y: '115%', rotate: 3 }}
                  animate={introDone ? { y: '0%', rotate: 0 } : undefined}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.35 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="mt-5 max-w-xl leading-relaxed text-[color-mix(in_oklab,var(--text)_75%,transparent)] sm:text-lg" {...rise(0.75)} animate={show}>
            React, TypeScript, Node and Spring Boot. Shipped to {profile.stats[0]?.value ?? 'thousands of'} people, based in {profile.location}.
          </motion.p>

          <motion.div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4" {...rise(0.9)} animate={show}>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToId('work')}
                className="group inline-flex items-center gap-3 rounded-xl bg-[var(--color-cream)] px-6 py-3.5 text-sm font-semibold text-[var(--color-cream-ink)] transition-transform hover:-translate-y-0.5"
              >
                See the work
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <button type="button" onClick={() => scrollToId('contact')} className="voice text-xl underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70">
              Start a conversation
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Proof bar: anchors the bottom of the screen like a launch page's logo strip. */}
      <motion.div
        className="relative mt-6 flex items-center gap-8 border-t border-[var(--border)] py-5"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.3 }}
      >
        <span aria-hidden className="hero-horizon pointer-events-none absolute inset-x-[10%] -top-px h-px" />
        <dl className="flex shrink-0 gap-8">
          {[speed, builds].filter(Boolean).map((stat) => (
            <div key={stat?.label}>
              <dt className="voice text-2xl leading-none">{stat?.value}</dt>
              <dd className="mt-1 max-w-[9rem] text-[11px] leading-snug text-muted">{stat?.label}</dd>
            </div>
          ))}
        </dl>
        <div aria-label="Tools I work with" className="hero-marquee hidden min-w-0 flex-1 overflow-hidden md:block">
          <ul className="hero-marquee__track flex w-max gap-10 text-sm text-muted">
            {marquee.map((item, i) => (
              // The list repeats once so the loop is seamless; position is identity.
              // eslint-disable-next-line react/no-array-index-key
              <li key={`${item}-${i}`} aria-hidden={i >= skills.marquee.length} className="flex items-center gap-10 whitespace-nowrap">
                {item}
                <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--color-lavender)] opacity-60" />
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => scrollToId('work')}
          className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-muted transition-colors hover:text-[var(--text)] sm:flex"
        >
          Scroll
          <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown size={14} />
          </motion.span>
        </button>
      </motion.div>
    </section>
  )
}

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { experiences, profile, projects, skills } from '@/content'
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

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** 0 → 1 as `v` goes from `a` to `b`. */
const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)))

/**
 * The hole in the headline's "o", in the hero's own coordinates: its centre
 * (the point the zoom is anchored on), its half-width and half-height, and the
 * scale at which that hole covers the whole screen.
 */
type Hole = { ox: number; oy: number; rx: number; ry: number; max: number }

/** The first screen of the first build with screens: what is waiting inside the "o". */
const INSIDE = projects.find((p) => p.screens?.length)?.screens?.[0]

/**
 * Finds the counter (the hole) of the "o" by drawing the glyph in the same
 * font and walking out from its middle until the ink starts.
 */
function findHole(o: HTMLElement, section: HTMLElement): Hole | null {
  // Layout offsets, not on-screen boxes: the hero may already be mid-zoom.
  let x = 0
  let y = 0
  for (let el: HTMLElement | null = o; el && el !== section; el = el.offsetParent as HTMLElement | null) {
    x += el.offsetLeft
    y += el.offsetTop
  }
  const css = getComputedStyle(o)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  const font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`
  ctx.font = font
  const m = ctx.measureText('o')
  const pad = 8
  canvas.width = Math.ceil(m.width + pad * 2)
  canvas.height = Math.ceil(m.fontBoundingBoxAscent + m.fontBoundingBoxDescent + pad * 2)
  ctx.font = font
  ctx.fillText('o', pad, pad + m.fontBoundingBoxAscent)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const ink = (px: number, py: number) => (data[(py * width + px) * 4 + 3] ?? 0) > 110

  // Across the middle of the o: ink, then the hole, then ink again.
  const mid = Math.round(pad + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent / 2)
  let px = 0
  while (px < width && !ink(px, mid)) px++
  while (px < width && ink(px, mid)) px++
  const left = px
  while (px < width && !ink(px, mid)) px++
  const right = px
  if (right >= width || right - left < 2) return null
  const cx = Math.round((left + right) / 2)
  let up = mid
  while (up > 0 && !ink(cx, up)) up--
  let down = mid
  while (down < height - 1 && !ink(cx, down)) down++

  const ox = x + cx - pad
  const oy = y + (up + down) / 2 - pad
  const rx = (right - left) / 2
  const ry = (down - up) / 2
  const w = section.clientWidth
  const h = section.clientHeight
  const reach = Math.max(Math.hypot(ox, oy), Math.hypot(w - ox, oy), Math.hypot(ox, h - oy), Math.hypot(w - ox, h - oy))
  return { ox, oy, rx, ry, max: (reach / Math.min(rx, ry)) * 1.15 }
}

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

/** A word with its first "o" marked, so the zoom can find it. */
function WithO({ text, oRef }: { text: string; oRef: RefObject<HTMLSpanElement | null> }) {
  const at = text.toLowerCase().indexOf('o')
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span ref={oRef}>{text[at]}</span>
      {text.slice(at + 1)}
    </>
  )
}

export function Hero() {
  const introDone = useIntroDone()
  const ref = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const oRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [hole, setHole] = useState<Hole | null>(null)

  // The hero holds still for a screen of scrolling while it zooms into the
  // hole of the "o" in "Software": the letters fly past, the first project's
  // screen opens up inside the o until it fills the screen, then the work
  // section takes over. Scrolling back up zooms back out.
  const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const travel = useTransform(p, (v) => (REDUCED ? 0 : ramp(v, 0, 0.85)))
  // Exponential, so the zoom feels like a steady flight rather than a sudden lunge at the end.
  const scale = useTransform(travel, (t) => (hole ? hole.max ** t : 1))
  const windowClip = useTransform(scale, (k) =>
    hole ? `ellipse(${hole.rx * k}px ${hole.ry * k}px at ${hole.ox}px ${hole.oy}px)` : 'ellipse(0px 0px at 50% 50%)',
  )
  const windowOpacity = useTransform(p, (v) => ramp(v, 0, 0.04))
  const insideScale = useTransform(travel, (t) => 1.35 - 0.35 * t)
  const heroGone = useTransform(travel, (t) => (t >= 1 ? 0 : 1))
  const handOff = useTransform(p, (v) => ramp(v, 0.88, 1))
  // A little motion blur while zooming either way, gone as soon as the scrolling stops.
  // The hero's blur is divided by its scale, so it reads the same size on screen however far in it is.
  const zoomSpeed = useSpring(useVelocity(p), { stiffness: 200, damping: 30 })
  const moving = useTransform([zoomSpeed, p] as const, ([v, at]: number[]) =>
    (at ?? 0) > 0.005 && (at ?? 0) < 0.95 ? Math.min(1, Math.abs(v ?? 0) * 1.6) : 0,
  )
  const heroBlur = useTransform([moving, scale] as const, ([m, k]: number[]) => `blur(${((3 * (m ?? 0)) / (k ?? 1)).toFixed(3)}px)`)
  const insideBlur = useTransform(moving, (m) => `blur(${(2 * m).toFixed(2)}px)`)

  useEffect(() => {
    const section = ref.current
    if (!section || REDUCED) return
    const measure = () => {
      if (oRef.current) setHole(findHole(oRef.current, section))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    if (titleRef.current) observer.observe(titleRef.current)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [])

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
    <div ref={wrapRef} className={REDUCED ? 'relative' : 'relative h-[200svh]'}>
    <section
      ref={ref}
      id="top"
      onPointerMove={followCursor}
      className="hero sticky top-0 min-h-[660px] overflow-hidden [height:100svh]"
    >
      {/* Everything in the hero zooms together, anchored on the hole of the "o". */}
      <motion.div
        className="relative flex h-full flex-col px-gutter pt-20 md:pt-24"
        style={{ scale, opacity: heroGone, filter: heroBlur, transformOrigin: hole ? `${hole.ox}px ${hole.oy}px` : '50% 50%' }}
      >
      <div aria-hidden className="hero-spot pointer-events-none absolute inset-0" />
      <Starfield className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Copy and screens side by side, centred in the space above the proof bar. */}
      <div className="relative grid min-h-0 w-full flex-1 items-center gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-10">
        <div className="order-first md:order-none md:col-start-2 md:row-start-1">
          <ScreenStack />
        </div>

        <div className="relative md:col-start-1 md:row-start-1">
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
                  {i === 0 ? <WithO text={profile.role} oRef={oRef} /> : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="mt-5 max-w-xl leading-relaxed text-[color-mix(in_oklab,var(--text)_75%,transparent)] sm:text-lg" {...rise(0.75)} animate={show}>
            React, TypeScript, Node and Spring Boot. Shipped to {profile.stats[0]?.value ?? 'thousands of'} people, based in {profile.location}.
          </motion.p>

          <motion.div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-7" {...rise(0.9)} animate={show}>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToId('work')}
                className="group inline-flex items-center gap-3 rounded-xl bg-[var(--color-cream)] px-6 py-3 text-sm md:py-3.5 font-semibold text-[var(--color-cream-ink)] transition-transform hover:-translate-y-0.5"
              >
                See the work
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <button type="button" onClick={() => scrollToId('contact')} className="voice text-xl underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70">
              Start a conversation
            </button>
          </motion.div>
        </div>
      </div>

      {/* Proof bar: anchors the bottom of the screen like a launch page's logo strip. */}
      <motion.div
        className="relative mt-4 flex items-center gap-8 border-t border-[var(--border)] py-4 md:mt-6 md:py-5"
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
      </motion.div>

      {/* Inside the o: the first project's screen, opening with the hole as it grows. */}
      {INSIDE && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-[var(--color-ink-950)]" style={{ clipPath: windowClip, opacity: windowOpacity }}>
          <motion.img src={INSIDE.src} alt="" decoding="async" className="h-full w-full object-cover object-top" style={{ scale: insideScale, filter: insideBlur }} />
        </motion.div>
      )}

      {/* The screen fades into the page's ink as the work section takes over. */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[var(--color-ink-950)]" style={{ opacity: handOff }} />
    </section>
    </div>
  )
}

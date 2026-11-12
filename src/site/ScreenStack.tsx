import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { profile, projects } from '@/content'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { scrollToId } from '@/lib/smoothScroll'
import type { Project } from '@/types/content'
import { useIntroDone } from './intro'

const CYCLE_MS = 3600
const [FRONT, BACK] = projects.filter((p) => p.screens?.length)
const nameOf = (p: Project) => p.title.split(/\s+—\s+/)[0] ?? p.title
const sentence = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

const open = (p: Project) => {
  track('hero_screen_click', { project: p.slug })
  scrollToId(`case-${p.slug}`)
}

/** One project's screens in a browser frame, crossfading through them. */
function Screen({ project, offset }: { project: Project; offset: number }) {
  const screens = project.screens ?? []
  const [i, setI] = useState(0)
  useEffect(() => {
    if (screens.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let interval = 0
    // Offset the two cards so they never change at the same moment.
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => setI((n) => (n + 1) % screens.length), CYCLE_MS)
    }, offset)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [screens.length, offset])
  const screen = screens[i]

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
        <span className="ml-2 truncate font-mono text-[10px] text-muted">
          {project.slug} · {screen?.caption}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={screen?.src}
            src={screen?.src}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
      </div>
    </>
  )
}

const card =
  'absolute block overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--color-ink-900)] text-left shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)] transition-[border-color] duration-300 hover:border-[var(--color-lavender)]'

/**
 * Two real project screens floating at different depths, with the headline
 * number pinned in front of them. The whole stack turns towards the cursor;
 * each card opens its case study.
 */
export function ScreenStack({ lift }: { lift?: MotionValue<string> }) {
  const introDone = useIntroDone()
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltX, { stiffness: 120, damping: 18 })
  const rotateY = useSpring(tiltY, { stiffness: 120, damping: 18 })
  const proof = profile.stats[0]

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const box = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - box.left) / box.width - 0.5) * 18)
    tiltX.set(-((e.clientY - box.top) / box.height - 0.5) * 14)
  }
  const onLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  const enter = (delay: number, from: number) => ({
    initial: { opacity: 0, y: from },
    animate: introDone ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.3, ease: EASE, delay },
  })

  if (!FRONT) return null

  return (
    <div className="mx-auto w-[88%] max-w-[calc((100svh-34rem)*1.45)] md:w-full md:max-w-[calc((100svh-13rem)*1.45)]">
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      // Full column width, but never taller than the screen leaves room for.
      className="relative aspect-[1.45] w-full [perspective:1400px]"
    >
      <motion.div
        aria-hidden
        className="absolute top-1/2 right-[8%] aspect-square h-[110%] -translate-y-1/2 rounded-full bg-[var(--color-lavender)] blur-[110px]"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 0.13 } : undefined}
        transition={{ duration: 2, delay: 0.4 }}
      />
      <motion.div
        style={{ rotateX, rotateY, y: lift, transformStyle: 'preserve-3d' }}
        className="absolute inset-0"
      >
        {BACK && (
          <motion.button
            type="button"
            aria-label={`Open the ${nameOf(BACK)} case study`}
            onClick={() => open(BACK)}
            className={`${card} top-0 right-0 w-[62%]`}
            style={{ z: -90, rotate: 6 }}
            {...enter(0.85, 60)}
          >
            <Screen project={BACK} offset={CYCLE_MS / 2} />
          </motion.button>
        )}
        <motion.button
          type="button"
          aria-label={`Open the ${nameOf(FRONT)} case study`}
          onClick={() => open(FRONT)}
          className={`${card} bottom-[2%] left-0 w-[76%]`}
          style={{ z: 30, rotate: -3 }}
          {...enter(0.7, 80)}
        >
          <Screen project={FRONT} offset={0} />
        </motion.button>
        {proof && (
          <motion.p
            className="absolute right-[1%] bottom-[6%] max-w-[78%] rounded-lg bg-[var(--color-cream)] px-3 py-2 text-[11px] leading-snug text-[var(--color-cream-ink)] sm:max-w-none sm:text-sm"
            style={{ z: 90 }}
            {...enter(1.25, 20)}
          >
            <b className="font-extrabold">{proof.value}</b> {sentence(proof.label)}
          </motion.p>
        )}
      </motion.div>
    </div>
      <motion.p className="voice mt-2 text-right text-sm sm:text-base" {...enter(1.4, 10)}>
        01 / {String(projects.length).padStart(2, '0')} · {nameOf(FRONT)}
      </motion.p>
    </div>
  )
}

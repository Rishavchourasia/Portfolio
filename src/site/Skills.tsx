import { useRef } from 'react'
import { motion, useScroll, useTransform, type Easing } from 'framer-motion'
import { skills } from '@/content'
import { cn } from '@/lib/utils'
import { FadeUp, RevealLines } from './Reveal'
import { useReveal } from './intro'

/**
 * Chip styles, cycled so each row reads like a sheet of mixed stamps and
 * handwriting rather than a tag cloud. Short words go in the circle.
 */
const STYLES = [
  'rounded-full border-[1.5px] border-current px-3.5 py-1 text-xs font-bold tracking-[0.06em] uppercase',
  'font-semibold',
  'rounded-[3px] border-[1.5px] border-current px-2.5 py-1 text-[11px] font-extrabold tracking-[0.16em] uppercase',
  'font-serif text-xl italic underline decoration-1 underline-offset-4',
  'rounded-full bg-[#f3e9de] px-3.5 py-1 text-xs font-bold text-[var(--color-paper-red)]',
]
const CIRCLE = 'grid h-16 w-16 place-items-center rounded-full border-[1.5px] border-current p-1 text-center text-[10px] leading-tight font-bold'

const hash = (s: string) => [...s].reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 997, 5)

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const GRAVITY: Easing[] = ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn']
const SETTLE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

/**
 * A chip dropped from above its row: it speeds up as it falls (ease-in, like
 * gravity), hits its place, bounces twice and settles at its final tilt.
 */
function fall(h: number, i: number, tilt: number) {
  const height = 220 + (h % 6) * 30
  const bounce = 12 + (h % 4) * 4
  const delay = 0.04 + i * 0.07 + (h % 5) * 0.02
  return {
    initial: { opacity: 0, y: -height, rotate: tilt + ((h % 2 ? 1 : -1) * (10 + (h % 8))) },
    animate: { opacity: 1, y: [-height, 0, -bounce, 0, -bounce / 3, 0], rotate: tilt },
    transition: {
      y: { duration: 1, delay, times: [0, 0.5, 0.66, 0.8, 0.9, 1], ease: GRAVITY },
      opacity: { duration: 0.12, delay },
      rotate: { duration: 0.9, delay: delay + 0.35, ease: SETTLE },
    },
  }
}

function SkillRow({ title, blurb, items, row }: { title: string; blurb: string; items: string[]; row: number }) {
  const [ref, shown] = useReveal<HTMLLIElement>(0.4)
  return (
    <li ref={ref} className="grid gap-4 border-b border-[var(--border)] py-6 md:grid-cols-[16rem_1fr] md:items-center">
      <div>
        <h3 className="font-serif text-[1.9rem] leading-none italic">{title}</h3>
        <p className="mt-1 text-xs text-muted">{blurb}</p>
      </div>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {items.map((item, i) => {
          const h = hash(item)
          const circle = item.length <= 9 && (h + row) % 4 === 0
          const tilt = (h % 9) - 4
          const drop = fall(h, i, tilt)
          return (
            <motion.li
              key={item}
              className={cn(circle ? CIRCLE : STYLES[(i + row) % STYLES.length])}
              initial={REDUCED ? { rotate: tilt } : drop.initial}
              animate={shown && !REDUCED ? drop.animate : undefined}
              transition={drop.transition}
            >
              {item}
            </motion.li>
          )
        })}
      </ul>
    </li>
  )
}

/** The toolkit, set on a red paper sheet that rises over the dark page. */
export function Skills() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 40%'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])

  return (
    <section ref={ref} id="skills" aria-label="Skills" className="relative">
      <motion.div style={{ scale }} className="paper paper--red origin-top px-gutter pt-[14vh] pb-[18vh]">
        <div className="relative">
          <FadeUp>
            <p className="eyebrow">Toolkit</p>
          </FadeUp>
          <RevealLines
            className="mt-6 text-[clamp(2.1rem,4.6vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.035em]"
            lines={['What I reach for', <span key="v" className="voice text-[1.08em]">when it has to ship.</span>]}
          />
          <ul className="mt-12 border-t border-[var(--border)]">
            {skills.groups.map((g, i) => (
              <SkillRow key={g.title} title={g.title} blurb={g.blurb} items={g.skills} row={i} />
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}

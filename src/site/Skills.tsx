import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
          return (
            <motion.li
              key={item}
              className={cn(circle ? CIRCLE : STYLES[(i + row) % STYLES.length])}
              initial={{ opacity: 0, scale: 1.35 }}
              animate={shown ? { opacity: 1, scale: 1, rotate: (h % 9) - 4 } : undefined}
              transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.05 + i * 0.045 }}
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

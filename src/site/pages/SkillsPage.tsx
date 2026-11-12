import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { skills } from '@/content'
import { FadeUp, RevealLines } from '../Reveal'
import { SkillRow } from '../Skills'
import { Sheet } from './Sheet'
import { useSheetScroller } from './sheetContext'

/** One line of every tool, huge, sliding sideways with the scroll and leaning into its speed. */
function Marquee({ reverse = false }: { reverse?: boolean }) {
  const container = useSheetScroller()
  const { scrollY } = useScroll({ container })
  const speed = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 40 })
  const x = useTransform(scrollY, (y) => `${(reverse ? -1 : 1) * -y * 0.35}px`)
  const skewX = useTransform(speed, (v) => `${Math.max(-12, Math.min(12, -v / 180))}deg`)
  const line = [...skills.marquee, ...skills.marquee, ...skills.marquee]
  return (
    <div aria-hidden className="overflow-hidden py-2">
      <motion.p
        className={`flex w-max gap-10 text-[clamp(3rem,9vw,8rem)] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap uppercase ${reverse ? '-ml-[60%] opacity-40' : ''}`}
        style={{ x, skewX }}
      >
        {line.map((item, i) => (
          // The list repeats; its position is its identity.
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            {item}
            <span className="voice text-[0.5em] font-normal normal-case">✦</span>
          </span>
        ))}
      </motion.p>
    </div>
  )
}

/** /skills: the toolkit on red paper, each group's tools dropping into place. */
export function SkillsPage({ covered }: { covered: boolean }) {
  const total = skills.groups.reduce((n, g) => n + g.skills.length, 0)
  return (
    <Sheet page="skills" covered={covered} tone="red">
      <section className="px-gutter pt-32 pb-[8vh]">
        <FadeUp>
          <p className="eyebrow">Toolkit · {total} tools across {skills.groups.length} areas</p>
        </FadeUp>
        <RevealLines
          as="h1"
          className="mt-6 text-[clamp(2.5rem,9vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.045em]"
          lines={['What I reach for', <span key="v" className="voice text-[1.06em]">when it has to ship.</span>]}
        />
      </section>

      <div className="border-y border-[var(--border)] py-6">
        <Marquee />
        <Marquee reverse />
      </div>

      <section className="px-gutter pt-[10vh] pb-[14vh]">
        <ul className="border-t border-[var(--border)]">
          {skills.groups.map((g, i) => (
            <SkillRow key={g.title} title={g.title} blurb={g.blurb} items={g.skills} row={i} />
          ))}
        </ul>
      </section>
    </Sheet>
  )
}

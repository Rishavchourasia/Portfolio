import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Bot, Braces, Database, FlaskConical, Gauge, LayoutGrid, Sparkles, Wrench } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { skills } from '@/content'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { SkillGroup } from '@/types/content'

const ICONS = {
  braces: Braces,
  layout: LayoutGrid,
  wrench: Wrench,
  flask: FlaskConical,
  gauge: Gauge,
  database: Database,
  bot: Bot,
  sparkles: Sparkles,
} as const

/**
 * Resting tilt per card, in degrees. A fixed list rather than something random
 * so the arrangement is identical on every render and between sessions.
 */
const TILTS = [-1.4, 1, -0.7, 1.3, -1.2, 0.8, -1] as const

function GroupCard({ group, index }: { group: SkillGroup; index: number }) {
  const Icon = ICONS[group.icon]
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const tilt = reducedMotion ? 0 : TILTS[index % TILTS.length]

  return (
    <motion.div variants={slideItem} className="skill-card mb-6 break-inside-avoid">
      {/*
        The tilt lives on its own plain element, between the entrance variant
        above and the card's hover lift below, so none of the three overwrite
        another's transform. Plain CSS rather than a motion prop: framer's
        gesture props do not fire reliably on a child of a variant-driven
        parent, and a rotation that never re-renders React is cheaper anyway.
      */}
      <div className="skill-card__tilt" style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
        <SpotlightCard className="skill-card__body p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-500/12 text-accent-400">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold">{group.title}</h3>
              <p className="text-xs text-muted">{group.blurb}</p>
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--text)_5%,transparent)] px-2.5 py-1 text-[13px] transition-colors duration-200 hover:border-accent-500/50 hover:text-accent-400"
              >
                {skill}
              </li>
            ))}
          </ul>
        </SpotlightCard>
      </div>
    </motion.div>
  )
}

export function SkillsSlide({ label }: { label: string }) {
  return (
    <Slide id="skills" label={label}>
      <SlideHeading
        eyebrow="Skills"
        title={<>The toolkit behind the <span className="text-gradient">interface.</span></>}
        subtitle="What I reach for when a real deadline shows up."
        className="mb-7"
      />

      <div className="skill-columns columns-1 gap-7 sm:columns-2 xl:columns-3">
        {skills.groups.map((group, i) => (
          <GroupCard key={group.title} group={group} index={i} />
        ))}
      </div>
    </Slide>
  )
}

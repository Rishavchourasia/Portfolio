import { motion } from 'framer-motion'
import { Bot, Braces, Database, FlaskConical, Gauge, LayoutGrid, Sparkles, Wrench } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { skills } from '@/content'
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

function GroupCard({ group }: { group: SkillGroup }) {
  const Icon = ICONS[group.icon]

  return (
    <motion.div variants={slideItem} className="skill-card mb-4 break-inside-avoid">
      <SpotlightCard className="p-5">
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
        className="mb-8"
      />

      <div className="skill-columns columns-1 gap-4 sm:columns-2 xl:columns-3">
        {skills.groups.map((group) => (
          <GroupCard key={group.title} group={group} />
        ))}
      </div>
    </Slide>
  )
}

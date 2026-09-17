import { motion } from 'framer-motion'
import { Code2, LayoutGrid, Sparkles, Wrench } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { skills } from '@/content'
import type { SkillGroup } from '@/types/content'

const ICONS = {
  code: Code2,
  layout: LayoutGrid,
  wrench: Wrench,
  sparkles: Sparkles,
} as const

function GroupCard({ group }: { group: SkillGroup }) {
  const Icon = ICONS[group.icon]

  return (
    <motion.div variants={slideItem}>
      <SpotlightCard className="h-full p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-500/12 text-accent-400">
            <Icon size={18} />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">{group.title}</h3>
            <p className="text-xs text-muted">{group.blurb}</p>
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--text)_5%,transparent)] px-3 py-1.5 text-[13px] transition-colors duration-200 hover:border-accent-500/50 hover:text-accent-400"
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
        subtitle="Not a list of every logo I've touched — these are the things I reach for when a real deadline shows up."
        className="mb-10"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {skills.groups.map((group) => (
          <GroupCard key={group.title} group={group} />
        ))}
      </div>
    </Slide>
  )
}

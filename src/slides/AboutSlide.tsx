import { motion } from 'framer-motion'
import { MapPin, Sparkles } from 'lucide-react'
import { Slide, slideItem } from '@/components/deck'
import { SlideHeading } from '@/components/ui/SlideHeading'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { profile } from '@/content'

export function AboutSlide({ label }: { label: string }) {
  return (
    <Slide id="about" label={label}>
      <SlideHeading
        eyebrow="About"
        title={<>A frontend engineer who sweats the <span className="text-gradient">details.</span></>}
        className="mb-10"
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <motion.div variants={slideItem}>
          <SpotlightCard className="h-full p-7 sm:p-9">
            <div className="space-y-4">
              {profile.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="leading-relaxed text-muted text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <motion.div variants={slideItem}>
            <SpotlightCard className="h-full p-6">
              <MapPin size={18} className="text-accent-400" />
              <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Based in</p>
              <p className="font-display mt-1 text-2xl font-semibold">{profile.location}</p>
              <p className="mt-2 text-sm text-muted">Comfortable across remote and distributed teams.</p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={slideItem}>
            <SpotlightCard className="h-full p-6">
              <Sparkles size={18} className="text-accent-400" />
              <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">What I care about</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {profile.values.map((value) => (
                  <li key={value} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    {value}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </Slide>
  )
}

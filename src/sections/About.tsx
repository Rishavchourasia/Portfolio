import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { profile } from '@/data/profile'
import { MapPin, Sparkles } from 'lucide-react'

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title={<>A frontend engineer who sweats the <span className="text-gradient">details.</span></>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal>
          <SpotlightCard className="h-full p-8 sm:p-10">
            <div className="space-y-5">
              {profile.bio.map((p) => (
                <p key={p.slice(0, 24)} className="text-base leading-relaxed text-muted text-pretty sm:text-lg">
                  {p}
                </p>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>

        <div className="grid gap-6">
          <Reveal delay={0.1}>
            <SpotlightCard className="p-7">
              <MapPin size={18} className="text-accent-400" />
              <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Based in</p>
              <p className="font-display mt-1 text-2xl font-semibold">{profile.location}</p>
              <p className="mt-2 text-sm text-muted">Comfortable across remote and distributed teams.</p>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.18}>
            <SpotlightCard className="p-7">
              <Sparkles size={18} className="text-accent-400" />
              <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">What I care about</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {['Accessibility by default', 'Performance budgets, not vibes', 'Design systems that scale', 'Motion with a purpose'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

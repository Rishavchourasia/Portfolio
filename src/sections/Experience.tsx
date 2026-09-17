import { motion } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { experiences } from '@/data/experience'
import { fadeUp, stagger } from '@/lib/motion'

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title={<>Where I&apos;ve <span className="text-gradient">shipped.</span></>}
    >
      <motion.ol
        variants={stagger(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative border-l border-[var(--border)] pl-8 sm:pl-12"
      >
        {experiences.map((job) => (
          <motion.li key={`${job.company}-${job.period}`} variants={fadeUp} className="group relative pb-14 last:pb-0">
            <span className="absolute top-2 -left-[calc(2rem+1px)] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[var(--bg)] bg-accent-500 transition-transform duration-300 group-hover:scale-125 sm:-left-[calc(3rem+1px)]" />

            <p className="font-mono text-[11px] tracking-[0.18em] text-accent-400 uppercase">{job.period}</p>
            <h3 className="font-display mt-2 text-xl font-semibold sm:text-2xl">
              {job.role}
              <span className="text-muted"> · {job.company}</span>
            </h3>
            {job.location && <p className="mt-1 text-xs text-muted">{job.location}</p>}

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{job.summary}</p>

            <ul className="mt-4 max-w-2xl space-y-2">
              {job.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                  {h}
                </li>
              ))}
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {job.stack.map((tech) => (
                <li
                  key={tech}
                  className="glass rounded-full px-3 py-1 font-mono text-[11px] text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ol>
    </Section>
  )
}

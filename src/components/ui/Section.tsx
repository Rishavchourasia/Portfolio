import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'

type Props = {
  id: string
  eyebrow?: string
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ id, eyebrow, title, subtitle, children, className }: Props) {
  return (
    <section id={id} className={cn('relative scroll-mt-24 py-24 sm:py-32', className)}>
      <div className="mx-auto w-full max-w-6xl px-6">
        {(eyebrow || title) && (
          <motion.header
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-14 max-w-2xl"
          >
            {eyebrow && (
              <motion.p
                variants={fadeUp}
                className="mb-4 inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-accent-400 uppercase"
              >
                <span className="h-px w-8 bg-accent-500/60" />
                {eyebrow}
              </motion.p>
            )}
            {title && (
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl"
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p variants={fadeUp} className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                {subtitle}
              </motion.p>
            )}
          </motion.header>
        )}
        {children}
      </div>
    </section>
  )
}

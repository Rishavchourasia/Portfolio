import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { slideItem } from '@/components/deck'
import { cn } from '@/lib/utils'

/** Shared eyebrow + title + subtitle block used at the top of every slide. */
export function SlideHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <motion.p
        variants={slideItem}
        className="mb-4 inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-accent-400 uppercase"
      >
        <span className="h-px w-8 bg-accent-500/60" />
        {eyebrow}
      </motion.p>

      <motion.h2
        variants={slideItem}
        className="font-display text-[clamp(1.85rem,4.2vw,3.25rem)] leading-[1.08] font-semibold tracking-tight text-balance"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p variants={slideItem} className="slide-subtitle mt-4 leading-relaxed text-muted text-pretty">
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

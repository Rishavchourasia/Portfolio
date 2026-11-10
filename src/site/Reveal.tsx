import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useReveal } from './intro'

/**
 * Lines that rise out of a clipped mask, one after another, when the block
 * scrolls into view. Each child of `lines` is one line.
 */
export function RevealLines({
  lines,
  className,
  as: Tag = 'h2',
  delay = 0,
}: {
  lines: ReactNode[]
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  delay?: number
}) {
  const [ref, shown] = useReveal<HTMLHeadingElement>(0.5)
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        // Lines are positional; their order is their identity.
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="mask-line">
          <motion.span
            className="block origin-bottom-left"
            initial={{ y: '115%', rotate: 3 }}
            animate={shown ? { y: '0%', rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.1 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Fade-and-rise on scroll into view. */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const [ref, shown] = useReveal<HTMLDivElement>(0.2)
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

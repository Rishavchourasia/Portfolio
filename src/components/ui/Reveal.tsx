import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'

/** Fades + lifts its children into view once. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useIsActiveSlide } from './DeckContext'
import { cn } from '@/lib/utils'
import type { SlideId } from '@/types/content'

type Props = {
  id: SlideId
  label: string
  children: ReactNode
  /** Extra classes on the <section> itself. */
  className?: string
  /** Extra classes on the scrolling inner wrapper. */
  contentClassName?: string
  /** Opt out of the centred max-width shell (used by the closing slide). */
  bare?: boolean
}

/**
 * One full-viewport panel of the deck.
 *
 * Children are wrapped in a framer-motion variant scope: anything using the
 * `slideItem` variant animates in every time the slide becomes active, so
 * moving back up the deck feels as alive as moving down.
 */
export function Slide({ id, label, children, className, contentClassName, bare }: Props) {
  const isActive = useIsActiveSlide(id)

  return (
    <section id={id} aria-label={label} className={cn('slide', className)}>
      <motion.div
        initial={false}
        animate={isActive ? 'active' : 'idle'}
        variants={{
          idle: {},
          active: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
        className={cn(
          'slide__inner',
          !bare && 'mx-auto w-full max-w-6xl px-6',
          contentClassName,
        )}
      >
        {children}
      </motion.div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { useDeck } from './DeckContext'

/** Thin bar across the top showing progress through the deck. */
export function SlideProgress() {
  const { activeIndex, total } = useDeck()
  const progress = total > 1 ? activeIndex / (total - 1) : 0

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-60 h-0.5">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-accent-500 via-[var(--color-violet-alt)] to-[var(--color-mint)]"
        initial={false}
        animate={{ scaleX: progress }}
        transition={{ type: 'spring', stiffness: 120, damping: 24 }}
      />
    </div>
  )
}

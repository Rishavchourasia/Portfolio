import { motion } from 'framer-motion'
import { SELECTION_SPRING } from '@/lib/motion'
import { cn } from '@/lib/utils'

type Props = {
  /**
   * Ties this pill to the group it slides within. Framer Motion matches
   * layout animations by this id, so it must be unique per group on screen
   * — reusing one across two independent tab groups would make them
   * (incorrectly) animate as if they were the same element.
   */
  layoutId: string
  /**
   * Shape, colour, stacking — whatever the caller needs. The primitive only
   * supplies position (`absolute inset-0`) and the shared spring; radius,
   * fill, border and z-index vary enough between call sites (a filled circle
   * behind nav text, a hollow ring around a dot, a rounded-rectangle behind a
   * two-line tab) that baking any of them in would fight half the callers.
   */
  className?: string
}

/**
 * The indicator that slides to whichever option is currently selected —
 * shared by the nav pill, the dot rail's ring, and every tab list in the
 * deck, so all of them move with the same spring instead of four incidental
 * variations on the same idea.
 */
export function ActivePill({ layoutId, className }: Props) {
  return (
    <motion.span
      layoutId={layoutId}
      className={cn('absolute inset-0', className)}
      transition={SELECTION_SPRING}
    />
  )
}

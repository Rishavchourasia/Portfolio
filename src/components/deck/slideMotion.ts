import type { Variants } from 'framer-motion'
import { EASE } from '@/lib/motion'

/**
 * Variant every direct child of a <Slide> should use. It is driven by the
 * slide's active state, so entering a slide replays the animation.
 */
export const slideItem: Variants = {
  idle: { opacity: 0, y: 28, transition: { duration: 0.35, ease: EASE } },
  active: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

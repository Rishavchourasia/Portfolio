import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDeck } from '@/components/deck'
import { hueBySlide } from '@/content'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { GridLayer } from './GridLayer'
import { NoiseLayer } from './NoiseLayer'
import { OrbField } from './OrbField'

/**
 * Fixed background behind the deck.
 *
 * Each slide declares a hue in `content/site.json`; the orbs spring towards
 * that hue and reposition as the deck moves, so the backdrop feels like it is
 * responding to the slide rather than sitting behind it.
 */
export function AnimatedBackground() {
  const { activeIndex, total, activeId } = useDeck()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const hue = hueBySlide[activeId] ?? 199
  const progress = total > 1 ? activeIndex / (total - 1) : 0

  // A slow drift across the deck so successive slides never look identical.
  const drift = useMemo(
    () => ({
      x: Math.sin(progress * Math.PI * 1.5) * 14,
      y: progress * -18,
    }),
    [progress],
  )

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ backgroundColor: `hsl(${hue} 60% 6% / 0.35)` }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      <GridLayer />
      <OrbField hue={hue} drift={drift} animate={!reducedMotion} />
      <NoiseLayer />

      {/* keeps text legible over the brightest orb */}
      <div className="absolute inset-0 bg-[var(--bg)]/25" />
    </div>
  )
}

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type Props = {
  index: number
  containerRef: React.RefObject<HTMLDivElement | null>
  children: ReactNode
}

/**
 * One card in the horizontal project track.
 *
 * Scale, opacity and a slight Y-rotation are linked to how far the card is
 * from the centre of the track, so cards settle into focus as you scroll
 * rather than sliding past at a flat size. Falls back to a plain card under
 * reduced motion.
 */
export function CarouselItem({ index, containerRef, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const { scrollXProgress } = useScroll({
    container: containerRef,
    target: ref,
    axis: 'x',
    offset: ['start end', 'end start'],
  })

  // 0 → entering from the right, 0.5 → centred, 1 → leaving to the left.
  const smooth = useSpring(scrollXProgress, { stiffness: 220, damping: 34, mass: 0.6 })

  const scale = useTransform(smooth, [0, 0.5, 1], [0.9, 1, 0.9])
  const opacity = useTransform(smooth, [0, 0.5, 1], [0.35, 1, 0.35])
  const rotateY = useTransform(smooth, [0, 0.5, 1], [9, 0, -9])
  const z = useTransform(smooth, [0, 0.5, 1], [-90, 0, -90])

  if (reducedMotion) {
    return (
      <div ref={ref} data-index={index} className="w-[min(92vw,58rem)] shrink-0 snap-center">
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      data-index={index}
      style={{ scale, opacity, rotateY, z, transformPerspective: 1400 }}
      className="w-[min(92vw,58rem)] shrink-0 snap-center will-change-transform"
    >
      {children}
    </motion.div>
  )
}

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type Props = {
  index: number
  containerRef: React.RefObject<HTMLDivElement | null>
  children: ReactNode
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * One card in the horizontal project track.
 *
 * Scale, opacity and a slight Y-rotation track how far the card sits from the
 * track's left edge, so cards settle into focus as you scroll.
 *
 * Distance is measured from that edge rather than from the middle of the
 * viewport: a centre-based measure can never reach zero for the first or last
 * card, because the track cannot scroll past either end — which left the first
 * card permanently shrunk and faded even while it was the one on show.
 */
export function CarouselItem({ index, containerRef, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // -1 → scrolled off to the left, 0 → resting in place, 1 → one card to the right.
  const distance = useMotionValue(index === 0 ? 0 : 1)

  useEffect(() => {
    const element = ref.current
    const container = containerRef.current
    if (!element || !container) return

    // Live rects rather than cached offsets: the track is not a positioned
    // ancestor, so `offsetLeft` resolves against the slide and would not line
    // up with the track's own scroll position.
    const update = () => {
      const item = element.getBoundingClientRect()
      const box = container.getBoundingClientRect()
      distance.set(clamp((item.left - box.left) / (item.width || 1), -1, 1))
    }

    update()
    container.addEventListener('scroll', update, { passive: true })

    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(element)

    return () => {
      container.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [containerRef, distance])

  const smooth = useSpring(distance, { stiffness: 260, damping: 34, mass: 0.6 })
  const scale = useTransform(smooth, [-1, 0, 1], [0.92, 1, 0.92])
  const opacity = useTransform(smooth, [-1, 0, 1], [0.4, 1, 0.4])
  const rotateY = useTransform(smooth, [-1, 0, 1], [-8, 0, 8])

  const inner = <div className="mx-auto w-full max-w-[58rem]">{children}</div>

  if (reducedMotion) {
    return (
      <div ref={ref} data-index={index} className="w-full shrink-0 snap-start">
        {inner}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      data-index={index}
      style={{ scale, opacity, rotateY, transformPerspective: 1400 }}
      className="w-full shrink-0 snap-start will-change-transform"
    >
      {inner}
    </motion.div>
  )
}

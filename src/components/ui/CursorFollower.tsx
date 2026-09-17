import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Elements the ring should wrap around rather than trail behind. */
const TARGET_SELECTOR = 'a, button, [role="tab"], [data-cursor="target"]'

type Snap = { width: number; height: number; radius: string }

/**
 * A ring and dot that follow the pointer and snap around whatever nav item or
 * button is under it — so navigation feels tracked rather than merely hovered.
 *
 * Rendered only for fine pointers and never under reduced motion; on touch it
 * would be permanently stranded wherever the last tap landed.
 */
export function CursorFollower() {
  const finePointer = useMediaQuery('(pointer: fine)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const enabled = finePointer && !reducedMotion

  const [snap, setSnap] = useState<Snap | null>(null)
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const snapped = useRef(false)

  // Pointer position drives the dot; the ring follows its own target, which is
  // the pointer normally and the centre of the hovered element when snapped.
  const dotRawX = useMotionValue(-100)
  const dotRawY = useMotionValue(-100)
  const ringRawX = useMotionValue(-100)
  const ringRawY = useMotionValue(-100)

  const dotX = useSpring(dotRawX, { stiffness: 1200, damping: 50, mass: 0.2 })
  const dotY = useSpring(dotRawY, { stiffness: 1200, damping: 50, mass: 0.2 })
  const ringX = useSpring(ringRawX, { stiffness: 300, damping: 28, mass: 0.6 })
  const ringY = useSpring(ringRawY, { stiffness: 300, damping: 28, mass: 0.6 })

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      dotRawX.set(event.clientX)
      dotRawY.set(event.clientY)
      setVisible(true)

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(TARGET_SELECTOR)

      if (!target) {
        if (snapped.current) {
          snapped.current = false
          setSnap(null)
        }
        ringRawX.set(event.clientX)
        ringRawY.set(event.clientY)
        return
      }

      const rect = target.getBoundingClientRect()
      snapped.current = true
      ringRawX.set(rect.left + rect.width / 2)
      ringRawY.set(rect.top + rect.height / 2)
      setSnap({
        width: rect.width + 14,
        height: rect.height + 14,
        radius: getComputedStyle(target).borderRadius || '999px',
      })
    }

    const hide = () => {
      setVisible(false)
      snapped.current = false
      setSnap(null)
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', hide)
    window.addEventListener('blur', hide)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
    }
  }, [enabled, dotRawX, dotRawY, ringRawX, ringRawY])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[70] border border-accent-400/80 mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        initial={false}
        animate={{
          width: snap ? snap.width : pressed ? 22 : 32,
          height: snap ? snap.height : pressed ? 22 : 32,
          borderRadius: snap ? snap.radius : '999px',
          opacity: visible ? (snap ? 1 : 0.8) : 0,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.6 }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[70] h-1.5 w-1.5 rounded-full bg-accent-400 mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && !snap ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.18 }}
      />
    </>
  )
}

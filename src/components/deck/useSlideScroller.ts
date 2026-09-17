import { useCallback, useEffect, useRef } from 'react'

/** Duration of a slide-to-slide move, in ms. */
const DURATION = 780

/**
 * Symmetric ease-in-out. A slide change should start and stop gently — the
 * browser's own `scroll-behavior: smooth` uses a much shorter, flatter curve
 * that reads as a jump at deck scale.
 */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * Drives the deck's scroll position itself rather than handing the browser a
 * `scrollIntoView`.
 *
 * Two reasons. The timing is ours, so every move — wheel, keyboard, nav click,
 * dot rail — travels at the same pace with the same curve. And because the
 * animation runs to a known destination, a gesture can be locked out until it
 * lands, which is what stops momentum from carrying past a slide.
 *
 * `data-animating` on the container turns off CSS snapping and smooth
 * behaviour for the duration; both would otherwise fight the frames written
 * here (assigning `scrollTop` is itself subject to `scroll-behavior`).
 */
export function useSlideScroller(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef(0)
  const guardRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const animatingRef = useRef(false)

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    clearTimeout(guardRef.current)
    animatingRef.current = false
    const root = containerRef.current
    if (root) delete root.dataset.animating
  }, [containerRef])

  useEffect(() => stop, [stop])

  const scrollTo = useCallback(
    (top: number, { instant = false }: { instant?: boolean } = {}) => {
      const root = containerRef.current
      if (!root) return

      cancelAnimationFrame(frameRef.current)
      clearTimeout(guardRef.current)

      const from = root.scrollTop
      const distance = top - from

      if (instant || Math.abs(distance) < 1) {
        root.dataset.animating = 'true'
        root.scrollTop = top
        delete root.dataset.animating
        animatingRef.current = false
        return
      }

      animatingRef.current = true
      root.dataset.animating = 'true'
      const started = performance.now()

      const settle = () => {
        cancelAnimationFrame(frameRef.current)
        clearTimeout(guardRef.current)
        root.scrollTop = top
        animatingRef.current = false
        delete root.dataset.animating
      }

      const step = (now: number) => {
        const progress = Math.min(1, (now - started) / DURATION)
        root.scrollTop = from + distance * ease(progress)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step)
          return
        }

        settle()
      }

      frameRef.current = requestAnimationFrame(step)

      // Frames are not guaranteed: an occluded or backgrounded tab can stop
      // producing them entirely, and without this the deck would sit at its
      // start position with snapping switched off — unscrollable — waiting for
      // a frame that never comes. Land it regardless, a little after the
      // animation should have finished.
      guardRef.current = setTimeout(settle, DURATION + 250)
    },
    [containerRef],
  )

  return { scrollTo, isAnimating: animatingRef, stop }
}

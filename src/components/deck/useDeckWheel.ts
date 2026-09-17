import { useEffect, useRef } from 'react'

/** Wheel distance that counts as one deliberate gesture. */
const THRESHOLD = 28
/** Quiet period before a new gesture is accepted, in ms. */
const GESTURE_GAP = 160

/**
 * Walks up from the wheel's target looking for something that should consume
 * the scroll itself — the project track, an overflowing slide, the design
 * tokens panel. Without this the deck would swallow their scrolling too.
 */
function scrollableAncestor(target: EventTarget | null, deltaY: number, root: HTMLElement) {
  let node = target as HTMLElement | null

  while (node && node !== root) {
    const style = getComputedStyle(node)
    const scrolls = /(auto|scroll)/.test(style.overflowY)
    const room = node.scrollHeight - node.clientHeight

    if (scrolls && room > 1) {
      const atTop = node.scrollTop <= 0
      const atBottom = node.scrollTop >= room - 1
      if (!(deltaY < 0 ? atTop : atBottom)) return true
    }

    node = node.parentElement
  }

  return false
}

/**
 * One slide per wheel gesture.
 *
 * CSS snapping alone cannot promise this. `scroll-snap-stop: always` asks the
 * browser to halt at each snap point, but a long trackpad flick still arrives
 * as one continuous stream of deltas, and support for honouring it under heavy
 * momentum varies by engine — which is how slides get skipped.
 *
 * So the wheel is taken over while the deck is in its full one-screen mode:
 * a gesture past the threshold moves exactly one slide, and every further
 * delta is swallowed until the move lands and the wheel has been quiet for a
 * moment. Momentum after the gesture therefore goes nowhere.
 *
 * Deliberately left native: touch (a swipe has its own clear boundaries),
 * keyboard, and both reduced-motion and short-viewport modes, where the deck
 * falls back to ordinary scrolling.
 */
export function useDeckWheel({
  containerRef,
  onStep,
  isAnimating,
  enabled,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  onStep: (direction: 1 | -1) => void
  isAnimating: React.RefObject<boolean>
  enabled: boolean
}) {
  // Held in a ref so the listener below is attached once and still calls the
  // latest handler.
  const stepRef = useRef(onStep)
  useEffect(() => {
    stepRef.current = onStep
  }, [onStep])

  useEffect(() => {
    const root = containerRef.current
    if (!enabled || !root) return

    let accumulated = 0
    let locked = false
    let quiet: ReturnType<typeof setTimeout>

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom, and horizontal intent (the project track) stay native.
      if (event.ctrlKey) return
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      if (scrollableAncestor(event.target, event.deltaY, root)) return

      event.preventDefault()

      clearTimeout(quiet)
      quiet = setTimeout(() => {
        locked = false
        accumulated = 0
      }, GESTURE_GAP)

      if (locked || isAnimating.current) return

      accumulated += event.deltaY
      if (Math.abs(accumulated) < THRESHOLD) return

      const direction = accumulated > 0 ? 1 : -1
      accumulated = 0
      locked = true
      stepRef.current(direction)
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(quiet)
      root.removeEventListener('wheel', onWheel)
    }
  }, [containerRef, enabled, isAnimating])
}

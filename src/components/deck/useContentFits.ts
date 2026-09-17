import { useEffect, useRef, useState } from 'react'

/** A slide must exceed the viewport by this much to count as not fitting… */
const OVERFLOW_TOLERANCE = 8
/** …and must then clear the viewport by this much to count as fitting again. */
const RECOVERY_MARGIN = 32

const px = (value: string) => Number.parseFloat(value) || 0

/**
 * Laid-out height of a slide's content, in px.
 *
 * Deliberately built from `offsetTop`/`offsetHeight` rather than
 * `scrollHeight`: slide children rest at a translated `y` until their slide
 * becomes active, and `scrollHeight` counts that entrance offset as overflow.
 * Offset geometry ignores transforms, so this measures layout only.
 */
function contentHeight(inner: HTMLElement): number {
  const style = getComputedStyle(inner)
  const bottom = Array.from(inner.children).reduce((max, node) => {
    const child = node as HTMLElement
    const edge = child.offsetTop + child.offsetHeight + px(getComputedStyle(child).marginBottom)
    return Math.max(max, edge)
  }, 0)

  return bottom + px(style.paddingBottom)
}

/**
 * Reports whether every slide's content fits one viewport.
 *
 * Media queries can only guess; a long bio or an extra project can push a
 * slide past the screen at any size. The two thresholds give the result
 * hysteresis, so a slide sitting within a pixel or two of the boundary can't
 * oscillate the deck between snap modes.
 */
export function useContentFits(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [fits, setFits] = useState(true)
  const fitsRef = useRef(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0

    const measure = () => {
      const available = container.clientHeight
      if (!available) return

      const inners = [...container.querySelectorAll<HTMLElement>('.slide__inner')]
      if (inners.length === 0) return

      const tallest = Math.max(...inners.map(contentHeight))

      const threshold = fitsRef.current
        ? available + OVERFLOW_TOLERANCE
        : available - RECOVERY_MARGIN

      const next = tallest <= threshold
      if (next !== fitsRef.current) {
        fitsRef.current = next
        setFits(next)
      }
    }

    // Layout settles over several frames (fonts, images, springs); batching
    // into one rAF keeps the observer from measuring mid-reflow.
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    schedule()

    // The inner wrappers are watched via their children: under mandatory
    // snapping an inner's own box is pinned to the viewport, so only its
    // content's box actually changes size.
    const observer = new ResizeObserver(schedule)
    observer.observe(container)
    container.querySelectorAll<HTMLElement>('.slide__inner').forEach((inner) => {
      observer.observe(inner)
      Array.from(inner.children).forEach((child) => observer.observe(child))
    })

    document.fonts?.ready.then(schedule).catch(() => {})

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [containerRef])

  return fits
}

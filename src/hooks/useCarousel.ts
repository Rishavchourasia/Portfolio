import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Drives a horizontal scroll-snap track: tracks the visible item and exposes
 * prev/next/goTo. The track keeps native scrolling, so touch swipe and
 * keyboard both work without extra code.
 */
export function useCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return

        const i = Number((visible.target as HTMLElement).dataset.index)
        if (!Number.isNaN(i)) setIndex(i)
      },
      { root: track, threshold: 0.6 },
    )

    track.querySelectorAll('[data-index]').forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [count])

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current
      if (!track) return
      const clamped = Math.max(0, Math.min(target, count - 1))
      const item = track.querySelector<HTMLElement>(`[data-index="${clamped}"]`)
      item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    },
    [count],
  )

  return {
    trackRef,
    index,
    goTo,
    next: useCallback(() => goTo(index + 1), [goTo, index]),
    prev: useCallback(() => goTo(index - 1), [goTo, index]),
    canPrev: index > 0,
    canNext: index < count - 1,
  }
}

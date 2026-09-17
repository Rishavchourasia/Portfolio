import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DeckContext, type DeckState } from './DeckContext'
import { useDeckNavigation } from './useDeckNavigation'
import { useContentFits } from './useContentFits'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { SlideId } from '@/types/content'

type Props = {
  slideIds: SlideId[]
  children: ReactNode
}

/**
 * The scroll container every slide lives in.
 *
 * Snapping is CSS-driven (see `.deck` in globals.css) so the browser keeps
 * ownership of scrolling; this component only tracks which slide is in view
 * and exposes imperative navigation.
 */
export function Deck({ slideIds, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)

  /**
   * Three snap modes, because one screen size does not fit all:
   *
   * - `mandatory` — the full deck. Requires a roomy viewport *and* content
   *   that measurably fits it, so a long bio can't strand text off-screen.
   * - `proximity` — phones, short windows, overflowing slides. Slides grow to
   *   their natural height and the browser only snaps when you already land
   *   near a boundary: still reads as sections, nothing ever trapped.
   * - `none` — reduced motion. Plain scrolling.
   */
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const roomy = useMediaQuery('(min-width: 768px) and (min-height: 640px)')
  const fits = useContentFits(containerRef)

  const snapMode = reducedMotion ? 'none' : roomy && fits ? 'mandatory' : 'proximity'

  // Track the slide filling most of the viewport.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const sections = slideIds
      .map((id) => root.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return

        const index = slideIds.indexOf(visible.target.id as SlideId)
        if (index >= 0) {
          setActiveIndex(index)
          if (index > 0) setHasMoved(true)
        }
      },
      { root, threshold: [0.35, 0.6, 0.9] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [slideIds])

  const goToIndex = useCallback(
    (index: number) => {
      const root = containerRef.current
      const clamped = Math.max(0, Math.min(index, slideIds.length - 1))
      const target = root?.querySelector<HTMLElement>(`#${slideIds[clamped]}`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [slideIds],
  )

  const goTo = useCallback(
    (id: SlideId) => goToIndex(slideIds.indexOf(id)),
    [goToIndex, slideIds],
  )

  const next = useCallback(() => goToIndex(activeIndex + 1), [goToIndex, activeIndex])
  const prev = useCallback(() => goToIndex(activeIndex - 1), [goToIndex, activeIndex])

  useDeckNavigation({ next, prev, goToIndex, total: slideIds.length, enabled: snapMode !== 'none' })

  const value = useMemo<DeckState>(
    () => ({
      containerRef,
      activeId: slideIds[activeIndex],
      activeIndex,
      total: slideIds.length,
      goTo,
      goToIndex,
      next,
      prev,
      hasMoved,
    }),
    [slideIds, activeIndex, goTo, goToIndex, next, prev, hasMoved],
  )

  return (
    <DeckContext.Provider value={value}>
      <div
        ref={containerRef}
        data-snap={snapMode}
        className="deck"
      >
        {children}
      </div>
    </DeckContext.Provider>
  )
}

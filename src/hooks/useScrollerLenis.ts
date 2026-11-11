import { useEffect, type RefObject } from 'react'
import Lenis from 'lenis'

/**
 * Smooth wheel scrolling inside a sheet that scrolls on its own (a case
 * study, a page), while the home page's scroll is held still underneath.
 */
export function useScrollerLenis(wrapperRef: RefObject<HTMLElement | null>, contentRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ wrapper, content, lerp: 0.09 })
    // Dev only: lets the console (and visual checks) move the sheet.
    if (import.meta.env.DEV) Object.assign(window, { __sheetLenis: lenis })
    let frame = 0
    const raf = (t: number) => {
      lenis.raf(t)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [wrapperRef, contentRef])
}

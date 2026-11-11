import Lenis from 'lenis'

/**
 * One Lenis instance for the page: inertia-smoothed wheel scrolling over the
 * native window scroll, so framer-motion's scroll hooks and anchor links keep
 * working unchanged. Touch devices keep their native scroll.
 */
let lenis: Lenis | null = null

/** Who is currently holding the page still: the intro, the menu, an open case. */
const locks = new Set<string>()

export function startSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: false })
  // Dev only: lets the browser console (and visual checks) jump the page.
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis })
  // A lock taken before Lenis existed (a case opened straight from its URL).
  if (locks.size) lenis.stop()
  let frame = 0
  const raf = (time: number) => {
    lenis?.raf(time)
    frame = requestAnimationFrame(raf)
  }
  frame = requestAnimationFrame(raf)
  return () => {
    cancelAnimationFrame(frame)
    lenis?.destroy()
    lenis = null
  }
}

/**
 * Freeze scrolling, e.g. under the intro curtain or an open menu. Each caller
 * holds its own named lock, so one of them letting go never frees the page
 * while another still needs it still.
 */
export function setScrollLocked(locked: boolean, key = 'page') {
  if (locked) locks.add(key)
  else locks.delete(key)
  const any = locks.size > 0
  if (lenis) {
    if (any) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = any ? 'hidden' : ''
}

/** Glide to a section by id, offset for the fixed header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -24, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Move the page to a scroll position at once, even while scrolling is locked. */
export function jumpTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
  else window.scrollTo(0, top)
}

import Lenis from 'lenis'

/**
 * One Lenis instance for the page: inertia-smoothed wheel scrolling over the
 * native window scroll, so framer-motion's scroll hooks and anchor links keep
 * working unchanged. Touch devices keep their native scroll.
 */
let lenis: Lenis | null = null

export function startSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: false })
  // Dev only: lets the browser console (and visual checks) jump the page.
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis })
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

/** Freeze scrolling, e.g. under the intro curtain or an open menu. */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Glide to a section by id, offset for the fixed header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -24, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

import { useEffect } from 'react'

const EDITABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])

const isInteractiveTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  return Boolean(el && (EDITABLE.has(el.tagName) || el.isContentEditable))
}

/**
 * Keyboard control for the deck: one slide per keypress.
 *
 * Deliberately does NOT hijack the wheel or touch — CSS scroll-snap already
 * gives the one-slide-at-a-time feel while leaving native momentum, trackpad
 * gestures and screen-reader scrolling intact.
 */
export function useDeckNavigation({
  next,
  prev,
  goToIndex,
  total,
  enabled,
}: {
  next: () => void
  prev: () => void
  goToIndex: (index: number) => void
  total: number
  enabled: boolean
}) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isInteractiveTarget(event.target)) return

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault()
          next()
          break
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault()
          prev()
          break
        case 'Home':
          event.preventDefault()
          goToIndex(0)
          break
        case 'End':
          event.preventDefault()
          goToIndex(total - 1)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, prev, goToIndex, total, enabled])
}

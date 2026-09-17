import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'portfolio-theme'
const listeners = new Set<() => void>()

const read = (): Theme => {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* storage unavailable — fall through to the default */
  }
  return 'dark'
}

let current: Theme = read()

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
}

apply(current)

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const setTheme = (theme: Theme) => {
  if (theme === current) return
  current = theme
  apply(theme)
  listeners.forEach((listener) => listener())
}

/**
 * Theme lives in a module-level store rather than component state: the navbar
 * toggles it and the animated background reads it, and both must see the same
 * value. `useSyncExternalStore` keeps that safe under concurrent rendering.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => current,
    () => 'dark' as Theme,
  )

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggle: () => setTheme(current === 'dark' ? 'light' : 'dark'),
  }
}

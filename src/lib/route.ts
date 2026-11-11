import { useSyncExternalStore } from 'react'

/**
 * The site's routes, each a sheet laid over the home page:
 *   /work, /about, /experience, /skills   a page of its own
 *   /work/<slug>                          a case study (over /work when opened from there)
 * This keeps the address bar, Back and Forward in step with them.
 */
const CHANGE = 'portfolio:navigate'

export const PAGES = ['work', 'about', 'experience', 'skills'] as const
export type Page = (typeof PAGES)[number]

// The home page stays mounted under every sheet, so it is already where the reader left it.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

export const caseUrl = (slug: string) => `/work/${slug}`

export const caseSlug = () => /^\/work\/([^/]+)\/?$/.exec(window.location.pathname)?.[1] ?? null

type State = { inSite?: boolean; under?: Page } | null
const state = () => window.history.state as State

/** The page sheet showing: the one in the address, or the one a case was opened over. */
export const currentPage = (): Page | null => {
  const name = /^\/([a-z]+)\/?$/.exec(window.location.pathname)?.[1]
  if (name && (PAGES as readonly string[]).includes(name)) return name as Page
  return caseSlug() ? (state()?.under ?? null) : null
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  window.addEventListener(CHANGE, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(CHANGE, onChange)
  }
}

/** The slug in the address bar, re-read on every navigation. */
export function useCaseSlug() {
  return useSyncExternalStore(subscribe, caseSlug, () => null)
}

/** The page sheet showing, re-read on every navigation. */
export function usePage() {
  return useSyncExternalStore(subscribe, currentPage, () => null)
}

/** Push (or, with `replace`, swap) an address and tell the app. */
export function navigate(path: string, replace = false, extra: Omit<NonNullable<State>, 'inSite'> = {}) {
  if (replace) window.history.replaceState({ ...state(), ...extra }, '', path)
  else window.history.pushState({ inSite: true, ...extra }, '', path)
  window.dispatchEvent(new Event(CHANGE))
}

/** Back one step if the sheet was opened here; otherwise swap the address for `fallback`. */
function leave(fallback: string) {
  if (state()?.inSite) window.history.back()
  else navigate(fallback, true)
}

/** Out of a case study: to the page it was opened over, or home. */
export const leaveCase = () => leave(state()?.under ? `/${state()?.under}` : '/')

/** Out of a page sheet, back to the home page. */
export const leavePage = () => leave('/')

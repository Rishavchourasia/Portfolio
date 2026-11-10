import { createContext, useContext, useRef } from 'react'
import { useInView } from 'framer-motion'

/** False while the intro curtain covers the page; entrance animations wait for it. */
export const IntroContext = createContext(true)

export const useIntroDone = () => useContext(IntroContext)

/** True once the element has scrolled into view (and the intro has lifted). */
export function useReveal<T extends Element>(amount = 0.35) {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, amount })
  const introDone = useIntroDone()
  return [ref, inView && introDone] as const
}

/** Sections in page order, for the menu and analytics. */
export const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const

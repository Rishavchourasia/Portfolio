import { createContext, useContext, type RefObject } from 'react'

export const ScrollerContext = createContext<RefObject<HTMLDivElement | null> | null>(null)

/** The element a page scrolls in, for scroll-linked animation inside it. */
export const useSheetScroller = () => {
  const ref = useContext(ScrollerContext)
  if (!ref) throw new Error('useSheetScroller outside a Sheet')
  return ref
}


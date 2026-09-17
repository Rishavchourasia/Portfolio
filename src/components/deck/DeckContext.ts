import { createContext, useContext } from 'react'
import type { SlideId } from '@/types/content'

export type DeckState = {
  /** Scroll container the slides live in. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Id of the slide currently filling the viewport. */
  activeId: SlideId
  /** Its position in the deck. */
  activeIndex: number
  total: number
  /** Move the deck to a slide. */
  goTo: (id: SlideId) => void
  goToIndex: (index: number) => void
  next: () => void
  prev: () => void
  /** True once the user has left the first slide — used to reveal chrome. */
  hasMoved: boolean
}

export const DeckContext = createContext<DeckState | null>(null)

export function useDeck(): DeckState {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error('useDeck must be used inside <Deck>')
  return ctx
}

/** True while the given slide is the active one. Drives enter animations. */
export function useIsActiveSlide(id: SlideId): boolean {
  return useDeck().activeId === id
}

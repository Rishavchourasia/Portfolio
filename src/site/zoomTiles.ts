import type { ReactNode } from 'react'

export const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Slot = { x: number; y: number; w: number; h?: number; depth: number }
export type Tile = Slot & { node: ReactNode }

/**
 * Where the collage pieces sit (their centres, in % of the screen) and how
 * fast each one comes at you. The lead piece sits right behind the word, so
 * the letters show it first, and has the screen's own shape so the zoom ends
 * on it full-bleed.
 */
const SLOTS: Slot[] = [
  { x: 50, y: 50, w: 70, h: 58, depth: 0.9 },
  { x: 12, y: 15, w: 30, depth: 2.6 },
  { x: 88, y: 13, w: 30, depth: 1.9 },
  { x: 10, y: 85, w: 32, depth: 2.2 },
  { x: 88, y: 84, w: 34, depth: 3 },
  { x: 52, y: 94, w: 24, depth: 3.6 },
]

/** Deals collage pieces into the slots, the first one into the lead slot. */
export const toTiles = (pieces: ReactNode[]): Tile[] =>
  pieces.length ? SLOTS.map((slot, i) => Object.assign({ node: pieces[i % pieces.length] }, slot)) : []


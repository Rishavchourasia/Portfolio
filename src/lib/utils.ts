import clsx, { type ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]) => clsx(inputs)

/**
 * Asserts a condition and narrows the type on success, throwing with a clear
 * message otherwise. Use it for invariants the code relies on but that
 * `noUncheckedIndexedAccess` cannot prove on its own — e.g. an index that is
 * always in range by construction (clamped elsewhere, or backed by a fixed
 * list) — so a real bug fails loudly instead of silently producing `undefined`.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

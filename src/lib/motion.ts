/** Shared easing for every transition in the app. */
export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The feel every "selection follows you" indicator in the app should share —
 * the nav pill, the dot rail's ring, the role and category tabs. One spring
 * so a user never senses that two visually identical mechanisms are actually
 * tuned differently.
 */
export const SELECTION_SPRING = { type: 'spring', stiffness: 400, damping: 32 } as const

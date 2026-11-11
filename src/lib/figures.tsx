import type { ReactNode } from 'react'

/** A measured result inside a sentence: "36%", "12+", "62 to 98", "2 weeks to 2 days", "8 hours a week". */
const FIGURE = /(\d+(?:[.,]\d+)*(?:%|\+)?(?: (?:weeks?|days?|hours? a week|hours?))?(?: to \d+(?:[.,]\d+)*%?(?: (?:weeks?|days?|hours?))?)?)/

/** Sets the numbers in a line apart, so a skim down the list lands on the results. */
export function withFigures(text: string): ReactNode[] {
  return text.split(FIGURE).map((part, i) =>
    i % 2 ? (
      // Split keeps the order fixed; the position is the identity.
      // eslint-disable-next-line react/no-array-index-key
      <strong key={i} className="font-semibold whitespace-nowrap text-[var(--color-cream)]">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}


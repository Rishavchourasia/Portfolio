/**
 * The design tokens the style-guide panel documents.
 *
 * Values are read from the live stylesheet with `getComputedStyle`, so the
 * panel always reflects what the page is actually painting — including the
 * current theme — instead of a hand-maintained copy that drifts.
 */

export type TokenSwatch = { label: string; varName: string; note?: string }
export type TokenGroup = { title: string; blurb: string; tokens: TokenSwatch[] }

export const COLOR_GROUPS: TokenGroup[] = [
  {
    title: 'Surface',
    blurb: 'The ground everything sits on.',
    tokens: [
      { label: 'Background', varName: '--bg', note: 'Page ground' },
      { label: 'Surface', varName: '--surface', note: 'Cards, glass' },
      { label: 'Surface strong', varName: '--surface-strong', note: 'Raised panels' },
      { label: 'Border', varName: '--border' },
      { label: 'Border strong', varName: '--border-strong', note: 'Hover, focus' },
    ],
  },
  {
    title: 'Text',
    blurb: 'Two weights of voice, nothing more.',
    tokens: [
      { label: 'Primary', varName: '--text', note: 'Headings, body' },
      { label: 'Muted', varName: '--text-muted', note: 'Secondary copy' },
    ],
  },
  {
    title: 'Accent',
    blurb: 'Links, focus rings and the primary button.',
    tokens: [
      { label: 'Accent 400', varName: '--color-accent-400', note: 'Small text, links' },
      { label: 'Accent 500', varName: '--color-accent-500', note: 'Buttons, fills' },
      { label: 'Violet', varName: '--color-violet-alt' },
      { label: 'Mint', varName: '--color-mint', note: 'Status, availability' },
    ],
  },
  {
    title: 'Gradient',
    blurb: 'Stops behind every highlighted heading.',
    tokens: [
      { label: 'Stop 1', varName: '--grad-1' },
      { label: 'Stop 2', varName: '--grad-2' },
      { label: 'Stop 3', varName: '--grad-3' },
    ],
  },
]

export const FONTS = [
  {
    label: 'Display',
    varName: '--font-display',
    usage: 'Headings, stat figures, the wordmark',
    sample: 'Frontend Engineer',
    className: 'font-display',
  },
  {
    label: 'Sans',
    varName: '--font-sans',
    usage: 'Body copy, buttons, navigation',
    sample: 'I build fast, accessible interfaces.',
    className: 'font-sans',
  },
  {
    label: 'Mono',
    varName: '--font-mono',
    usage: 'Eyebrows, tags, years, counters',
    sample: 'SELECTED WORK — 2026',
    className: 'font-mono',
  },
] as const

export const ELEVATIONS = [
  { label: 'Elevation 1', varName: '--elev-1', usage: 'Resting cards, nav' },
  { label: 'Elevation 2', varName: '--elev-2', usage: 'Project cards, previews' },
  { label: 'Elevation 3', varName: '--elev-3', usage: 'Hover lift' },
] as const

/** Reads a custom property off the document root. */
export const readToken = (varName: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim()

/** Resolves a token to a concrete rgb()/hsl() string a swatch can display. */
export function resolveColor(varName: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${varName})`
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

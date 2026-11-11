import { projects } from '@/content'

// Personal builds lead, as on the old Work slide.
export const ORDERED = [...projects.filter((p) => p.category === 'personal'), ...projects.filter((p) => p.category !== 'personal')]
export const TOTAL = ORDERED.length
export const pad = (n: number) => String(n).padStart(2, '0')
export const splitTitle = (title: string) => {
  const [name = title, kind = ''] = title.split(/\s+—\s+/)
  return { name, kind }
}
export const hueFor = (seed: string) => [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7)

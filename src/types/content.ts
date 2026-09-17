/**
 * Types for everything under `src/content/*.json`.
 * The JSON files are the only thing you edit to change the site;
 * these types are what keep them honest at build time.
 */

export type SlideId = 'hero' | 'about' | 'skills' | 'experience' | 'work' | 'contact'

export type SlideConfig = {
  id: SlideId
  /** Label in the nav and the dot rail. */
  label: string
  /** Base hue (0–360) driving the animated background on this slide. */
  hue: number
  /** Hide from the nav without removing the slide. */
  hidden?: boolean
}

export type SiteContent = {
  /** Render order of the deck. */
  slides: SlideConfig[]
  meta: {
    title: string
    description: string
    themeColor: string
  }
}

export type Education = {
  school: string
  degree: string
  field: string
  location: string
  period: string
}

export type Profile = {
  name: string
  firstName: string
  role: string
  tagline: string
  bio: string[]
  location: string
  email: string
  resumeUrl: string
  availability: string
  values: string[]
  socials: { github: string; linkedin: string; twitter: string }
  stats: { value: string; label: string }[]
  /** Secondary info — shown as a small footnote, not a headline. */
  education: Education
}

export type SkillGroup = {
  title: string
  blurb: string
  icon: 'braces' | 'layout' | 'wrench' | 'flask' | 'gauge' | 'database' | 'bot' | 'sparkles'
  skills: string[]
}

export type SkillsContent = {
  groups: SkillGroup[]
  /** Flat list for the marquee strips. */
  marquee: string[]
}

export type Experience = {
  company: string
  role: string
  period: string
  location?: string
  summary: string
  highlights: string[]
  stack: string[]
}

export type ProjectCategory = 'company' | 'personal'

export type Project = {
  slug: string
  title: string
  /** Company work vs. personal builds — drives the tab filter on the Work slide. */
  category: ProjectCategory
  tagline: string
  description: string
  highlights?: string[]
  tags: string[]
  year: string
  live?: string
  repo?: string
  image?: string
  status?: string
}

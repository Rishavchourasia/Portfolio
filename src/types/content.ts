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
  /** Google Tag Manager container; loaded in production builds only. */
  analytics?: { gtmId: string }
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
  icon: 'braces' | 'layout' | 'wrench' | 'flask' | 'gauge' | 'database' | 'bot' | 'sparkles' | 'cloud'
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
  /** The real-world problem, in a sentence or two. Leads the case study. */
  problem?: string
  description: string
  highlights?: string[]
  /** Headline numbers that prove it works, shown as a strip in the case study. */
  results?: ProjectResult[]
  /** Demo or test-run recordings, e.g. a load test booking 10,000 seats. */
  videos?: ProjectVideo[]
  tags: string[]
  year: string
  live?: string
  repo?: string
  /** Screenshots for the preview slider, in display order. */
  screens?: ProjectScreen[]
  /** Drawn as an animated flow diagram on the preview's Architecture tab. */
  architecture?: Architecture
  status?: string
}

export type ProjectResult = {
  value: string
  label: string
}

export type ProjectVideo = {
  /** A file under `public/`, e.g. `/projects/showdrop/load-test.mp4`. */
  src: string
  /** Still frame shown before playback. */
  poster?: string
  title: string
  /** One line on what the recording proves. */
  caption?: string
  /** WebVTT captions for narrated recordings. */
  captions?: string
}

export type ProjectScreen = {
  src: string
  /** Shown in the preview's address bar and used as alt text. */
  caption: string
}

/** Which edge of a node a connection leaves from or arrives at. */
export type NodeSide = 'left' | 'right' | 'top' | 'bottom'

export type ArchitectureNode = {
  id: string
  label: string
  sub?: string
  /** Centre position in the diagram's 1000×625 coordinate space. */
  x: number
  y: number
  /** Width in diagram units; defaults to 150. */
  w?: number
  kind: 'client' | 'edge' | 'service' | 'data' | 'queue' | 'external'
  /** Sub-components listed inside the node, e.g. the services behind a gateway. */
  items?: string[]
}

export type ArchitectureEdge = {
  from: string
  to: string
  label?: string
  /** Traffic flows both ways, e.g. request/reply over a queue. */
  bidirectional?: boolean
  /** Override the automatically chosen sides when the default route crosses something. */
  fromSide?: NodeSide
  toSide?: NodeSide
}

export type Architecture = {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}

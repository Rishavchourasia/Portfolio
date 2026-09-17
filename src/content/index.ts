/**
 * Typed entry point for all site content.
 *
 * Everything the site renders comes from the JSON files in this folder.
 * Import from `@/content` — never reach for the raw `.json` directly, so the
 * types stay the single place a shape is described.
 */
import type {
  Experience,
  Profile,
  Project,
  SiteContent,
  SkillsContent,
  SlideId,
} from '@/types/content'

import siteJson from './site.json'
import profileJson from './profile.json'
import skillsJson from './skills.json'
import experienceJson from './experience.json'
import projectsJson from './projects.json'

export const site = siteJson as SiteContent
export const profile = profileJson as Profile
export const skills = skillsJson as SkillsContent
export const experiences = experienceJson as Experience[]
export const projects = projectsJson as Project[]

/** Slide ids in render order. */
export const slideIds: SlideId[] = site.slides.map((slide) => slide.id)

/** Slides that appear in the nav and dot rail. */
export const navSlides = site.slides.filter((slide) => !slide.hidden)

/** Background hue per slide, for the animated background. */
export const hueBySlide: Record<string, number> = Object.fromEntries(
  site.slides.map((slide) => [slide.id, slide.hue]),
)

/** Every unique project tag, for the filter row. */
export const projectTags = ['All', ...new Set(projects.flatMap((p) => p.tags))]

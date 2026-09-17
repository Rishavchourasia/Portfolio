import type { ComponentType } from 'react'
import type { SlideId } from '@/types/content'
import { HeroSlide } from './HeroSlide'
import { AboutSlide } from './AboutSlide'
import { SkillsSlide } from './SkillsSlide'
import { ExperienceSlide } from './ExperienceSlide'
import { WorkSlide } from './WorkSlide'
import { ContactSlide } from './ContactSlide'

export type SlideProps = { label: string }

/**
 * Maps a slide id from `content/site.json` to its component. Reordering or
 * removing a slide is a JSON edit; adding one means a new entry here.
 */
export const SLIDE_REGISTRY: Record<SlideId, ComponentType<SlideProps>> = {
  hero: HeroSlide,
  about: AboutSlide,
  skills: SkillsSlide,
  experience: ExperienceSlide,
  work: WorkSlide,
  contact: ContactSlide,
}

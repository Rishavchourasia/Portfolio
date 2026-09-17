/**
 * Single source of truth for personal info.
 * Edit this file — every section reads from it.
 */
export const profile = {
  name: 'Rishav Chourasia',
  firstName: 'Rishav',
  role: 'Frontend Engineer',
  tagline: 'I build fast, accessible, delightfully animated interfaces for the web.',
  bio: [
    "I'm a frontend engineer who cares about the details most people only feel — the 80ms that a page takes to become interactive, the easing curve on a modal, the focus ring that makes a form usable with a keyboard.",
    'I work mostly in React and TypeScript, shaping design systems and product UI that scale past the first sprint. I like owning a feature end to end: from a Figma file and a vague ticket to a shipped, measured, accessible thing in production.',
  ],
  location: 'India',
  email: 'rishav.chourasia4@gmail.com',
  resumeUrl: '/resume.pdf',
  availability: 'Open to frontend roles',
  socials: {
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    twitter: '',
  },
  stats: [
    { value: '3+', label: 'Years building for the web' },
    { value: '20+', label: 'Features shipped to production' },
    { value: '98', label: 'Median Lighthouse performance' },
  ],
} as const

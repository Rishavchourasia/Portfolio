export type Skill = { name: string; level?: number }

export type SkillGroup = {
  title: string
  blurb: string
  icon: 'code' | 'layout' | 'wrench' | 'sparkles'
  skills: Skill[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Core',
    blurb: 'The languages I think in every day.',
    icon: 'code',
    skills: [
      { name: 'JavaScript (ES2023)', level: 92 },
      { name: 'TypeScript', level: 88 },
      { name: 'HTML5 / Semantics', level: 95 },
      { name: 'CSS3 / Modern layout', level: 93 },
    ],
  },
  {
    title: 'Frameworks & UI',
    blurb: 'How I turn designs into products.',
    icon: 'layout',
    skills: [
      { name: 'React', level: 92 },
      { name: 'Next.js', level: 82 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'Redux Toolkit / Zustand', level: 84 },
      { name: 'Framer Motion', level: 86 },
    ],
  },
  {
    title: 'Tooling & Platform',
    blurb: 'Shipping, testing and keeping it fast.',
    icon: 'wrench',
    skills: [
      { name: 'Vite / Webpack', level: 85 },
      { name: 'Git & GitHub Actions', level: 88 },
      { name: 'Jest / React Testing Library', level: 80 },
      { name: 'REST & GraphQL APIs', level: 84 },
    ],
  },
  {
    title: 'Craft',
    blurb: 'The parts that make it feel good.',
    icon: 'sparkles',
    skills: [
      { name: 'Accessibility (WCAG 2.2)', level: 86 },
      { name: 'Performance / Core Web Vitals', level: 88 },
      { name: 'Design systems', level: 84 },
      { name: 'Responsive & motion design', level: 90 },
    ],
  },
]

/** Flat list used by the marquee strip. */
export const marqueeSkills = [
  'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript', 'Framer Motion',
  'Redux', 'Vite', 'Node.js', 'GraphQL', 'Jest', 'Git', 'Figma', 'Accessibility',
  'Web Vitals', 'REST APIs',
]

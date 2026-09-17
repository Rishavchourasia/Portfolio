export type SkillGroup = {
  title: string
  blurb: string
  icon: 'code' | 'layout' | 'wrench' | 'sparkles'
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Core',
    blurb: 'The languages I think in every day.',
    icon: 'code',
    skills: ['JavaScript (ES2023)', 'TypeScript', 'HTML5 & semantics', 'CSS3', 'Modern layout (Grid / Flexbox)'],
  },
  {
    title: 'Frameworks & UI',
    blurb: 'How I turn designs into products.',
    icon: 'layout',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'Framer Motion', 'SCSS'],
  },
  {
    title: 'Tooling & Platform',
    blurb: 'Shipping, testing and keeping it fast.',
    icon: 'wrench',
    skills: ['Vite', 'Webpack', 'Git & GitHub Actions', 'Jest', 'React Testing Library', 'REST', 'GraphQL', 'Node.js'],
  },
  {
    title: 'Craft',
    blurb: 'The parts that make it feel good.',
    icon: 'sparkles',
    skills: ['Accessibility (WCAG 2.2)', 'Core Web Vitals', 'Design systems', 'Responsive design', 'Motion design', 'Figma'],
  },
]

/** Flat list used by the marquee strips in the hero and footer. */
export const marqueeSkills = [
  'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript', 'Framer Motion',
  'Redux', 'Vite', 'Node.js', 'GraphQL', 'Jest', 'Git', 'Figma', 'Accessibility',
  'Web Vitals', 'REST APIs',
]

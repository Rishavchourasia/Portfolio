export type Project = {
  title: string
  description: string
  tags: string[]
  live?: string
  repo?: string
  featured?: boolean
  year: string
}

export const projects: Project[] = [
  {
    title: 'Project One',
    description:
      'A short, specific sentence about what it does and the hard part you solved — not "a web app built with React".',
    tags: ['React', 'TypeScript', 'Tailwind'],
    live: '',
    repo: '',
    featured: true,
    year: '2025',
  },
  {
    title: 'Project Two',
    description: 'What it is, who it is for, and the measurable outcome it produced.',
    tags: ['Next.js', 'GraphQL'],
    live: '',
    repo: '',
    year: '2024',
  },
  {
    title: 'Project Three',
    description: 'A component library / tool / experiment worth showing to an interviewer.',
    tags: ['React', 'Storybook'],
    repo: '',
    year: '2024',
  },
]

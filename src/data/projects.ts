export type Project = {
  /** Used as the React key — keep unique. */
  slug: string
  title: string
  /** One line shown under the title on the card. */
  tagline: string
  /** The longer pitch: what it does and the interesting part you solved. */
  description: string
  /** Short bullets — the things an interviewer actually asks about. */
  highlights?: string[]
  tags: string[]
  year: string
  /** Deployed URL. Omit or leave empty to hide the "Live" button. */
  live?: string
  /** Source repo. Omit or leave empty to hide the "Code" button. */
  repo?: string
  /**
   * Screenshot for the card preview — put the file in `public/projects/`
   * and reference it as `/projects/name.png`. If omitted, a generated
   * gradient placeholder is shown instead, so the layout never breaks.
   */
  image?: string
  /** Featured projects get the wide, two-column card at the top. */
  featured?: boolean
  /** Shown as a small pill on the preview, e.g. "Live" / "In progress". */
  status?: string
}

export const projects: Project[] = [
  {
    slug: 'portfolio',
    title: 'Developer Portfolio',
    tagline: 'The site you are looking at right now.',
    description:
      'A fully data-driven portfolio: every section reads from typed content files, so updating the site never means touching a component. Dark and light themes are driven entirely by CSS custom properties, and all motion respects prefers-reduced-motion.',
    highlights: [
      'Zero-runtime theming with CSS custom properties and a persisted toggle.',
      'Scroll-linked parallax, a spring scroll-progress bar and shared-layout nav.',
      'Ships at ~125 kB gzipped with a perfect accessibility audit.',
    ],
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    year: '2026',
    live: '',
    repo: '',
    featured: true,
    status: 'Live',
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    tagline: 'A one-line hook for what it does.',
    description:
      'Replace this with what the product is, who it is for, and the hard problem you solved — not "a web app built with React".',
    highlights: ['A measurable outcome.', 'A technical decision you can defend.'],
    tags: ['Next.js', 'TypeScript', 'GraphQL'],
    year: '2025',
    live: '',
    repo: '',
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    tagline: 'A one-line hook for what it does.',
    description: 'What it is, the constraint you worked under, and the result it produced.',
    highlights: ['A measurable outcome.'],
    tags: ['React', 'Redux Toolkit', 'REST'],
    year: '2025',
    live: '',
    repo: '',
  },
  {
    slug: 'project-four',
    title: 'Project Four',
    tagline: 'A component library, tool or experiment.',
    description: 'Smaller side projects still count — show the thing you would happily walk an interviewer through.',
    tags: ['React', 'Storybook', 'Accessibility'],
    year: '2024',
    repo: '',
  },
]

/** Every unique tag, for the filter row. */
export const projectTags = ['All', ...new Set(projects.flatMap((p) => p.tags))]

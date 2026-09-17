# Portfolio — Rishav Chourasia

A frontend portfolio built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Where to edit your content

Everything personal lives in `src/data/` — you never need to touch a component to update the site.

| File | What it controls |
| --- | --- |
| `src/data/profile.ts` | Name, role, tagline, bio, email, socials, résumé link, hero stats |
| `src/data/skills.ts` | Skill groups (plain lists, no ratings) + the marquee strip |
| `src/data/experience.ts` | Work timeline |
| `src/data/projects.ts` | Project cards — live/repo links, screenshots, highlights |
| `src/data/navigation.ts` | Nav links (id must match a section `id`) |

Drop your résumé at `public/resume.pdf` and the "Résumé" buttons work.
Social share image goes at `public/og.png` (1200×630).

### Adding a project

Append an entry to `projects` in `src/data/projects.ts`:

```ts
{
  slug: 'unique-id',
  title: 'Project name',
  tagline: 'One line hook.',
  description: 'What it does and the hard part you solved.',
  highlights: ['A measurable outcome.'],
  tags: ['React', 'TypeScript'],
  year: '2025',
  live: 'https://example.com',      // omit to hide the Live button
  repo: 'https://github.com/...',   // omit to hide the Source button
  image: '/projects/name.png',      // optional — falls back to a gradient
  featured: true,                   // optional — wide two-column card
  status: 'Live',                   // optional pill on the preview
}
```

Screenshots live in `public/projects/` (PNG or WebP, ~1600×1000). The tag filter
row above the grid builds itself from the `tags` you use, so nothing else to wire up.

## Structure

```
src/
├── components/
│   ├── layout/      Navbar, Footer
│   └── ui/          Section, Reveal, SpotlightCard, Button, Aurora,
│                    ScrollProgress, SkillMarquee, BrandIcons
├── data/            ← all your content
├── hooks/           useScrollSpy, useTheme, useMediaQuery
├── lib/             utils (cn, scrollToId), motion presets
├── sections/        Hero, About, Skills, Experience, Projects, Contact
├── styles/          globals.css (design tokens, utilities, keyframes)
├── App.tsx
└── main.tsx
```

## Design notes

- Dark-first with a light theme toggle; both are driven by CSS custom properties in `globals.css`.
- Colours, fonts and easing live in the `@theme` block — change them there once.
- Respects `prefers-reduced-motion`, has a skip link, visible focus rings and semantic landmarks.

## Deploy (free)

### Vercel — recommended, gives you `your-name.vercel.app`

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset **Vite** is auto-detected — click **Deploy**.
4. Project → Settings → Domains → rename to e.g. `rishav-chourasia.vercel.app`.

Every push to `main` redeploys automatically.

### GitHub Pages — gives you `username.github.io/repo`

`.github/workflows/deploy.yml` is already set up. After pushing:
Settings → Pages → Source → **GitHub Actions**.

If the repo is *not* named `username.github.io`, set the base path in `vite.config.ts`:

```ts
export default defineConfig({ base: '/your-repo-name/', /* ... */ })
```

Best free URL: `username.github.io` as the repo name — then no base path is needed.

### Netlify

Build command `npm run build`, publish directory `dist`.

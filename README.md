# Portfolio — Rishav Chourasia

A slide-deck portfolio built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion**.

Scrolling moves one full-viewport slide at a time, and the background re-tints
itself as each slide takes focus.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Editing content — it's all JSON

Everything the site renders comes from `src/content/*.json`. You never touch a
component to change what the site says.

| File | What it controls |
| --- | --- |
| `site.json` | Slide order, nav labels, background hue per slide, page metadata |
| `profile.json` | Name, role, tagline, bio, email, socials, résumé link, stats, values |
| `skills.json` | Skill groups (plain lists, no ratings) + the marquee strip |
| `experience.json` | Work history — rendered as tabs |
| `projects.json` | Project cards — links, screenshots, highlights |

`src/content/index.ts` is the typed entry point. Import from `@/content`, never
from a raw `.json`, so `src/types/content.ts` stays the single description of
every shape — a typo in a JSON file fails the build rather than the page.

Drop your résumé at `public/resume.pdf`. Social share image at `public/og.png`
(1200×630).

### Reordering or hiding a slide

Edit the `slides` array in `site.json`. Each entry is:

```json
{ "id": "skills", "label": "Skills", "hue": 172, "hidden": false }
```

`hue` (0–360) is what the animated background springs to on that slide, so
neighbouring slides should differ by 40° or more to make the shift readable.
Adding a brand-new slide also needs a component and one line in
`src/slides/registry.tsx`.

### Adding a project

Append to `projects.json`:

```json
{
  "slug": "unique-id",
  "title": "Project name",
  "tagline": "One line hook.",
  "description": "What it does and the hard part you solved.",
  "highlights": ["A measurable outcome."],
  "tags": ["React", "TypeScript"],
  "year": "2025",
  "live": "https://example.com",
  "repo": "https://github.com/...",
  "image": "/projects/name.png",
  "status": "Live"
}
```

`live`, `repo`, `image` and `status` are all optional — a missing link hides its
button, and a missing image falls back to a generated gradient so the card never
looks broken. Screenshots go in `public/projects/` (PNG or WebP, ~1600×1000).

## Structure

```
src/
├── content/             ← all site content, as JSON + a typed loader
├── types/content.ts     the shapes the JSON must satisfy
├── components/
│   ├── deck/            Deck, Slide, SlideRail, SlideProgress, SlideHint,
│   │                    DeckContext, useDeckNavigation, slideMotion
│   ├── background/      AnimatedBackground, OrbField, GridLayer, NoiseLayer
│   ├── layout/          Navbar
│   └── ui/              SlideHeading, SpotlightCard, ProjectCard,
│                        ProjectPreview, SkillMarquee, Button, BrandIcons
├── hooks/               useTheme, useMediaQuery, useCarousel
├── lib/                 utils (cn), motion (shared easing)
├── slides/              HeroSlide … ContactSlide + registry
└── styles/globals.css   design tokens, deck/slide CSS, utilities, keyframes
```

## How the deck works

**Scrolling is the browser's, not ours.** `.deck` is a scroll container with
`scroll-snap-type: y mandatory`; each `.slide` is `100dvh` with
`scroll-snap-align: start` and `scroll-snap-stop: always` (which stops a fast
trackpad flick from skipping a slide). JavaScript only *observes* which slide is
in view via `IntersectionObserver` — it never hijacks the wheel or touch, so
momentum, trackpad gestures and assistive-tech scrolling all behave normally.

**Keyboard**: ↑/↓, PageUp/PageDown, Home/End move one slide at a time.
Key handling is skipped while focus is in a form field, link or button.

**It degrades on purpose.** Snapping turns off — slides revert to natural height
and the page scrolls normally — when the viewport is shorter than 620px or the
visitor has `prefers-reduced-motion: reduce`. Mandatory snapping plus content
taller than the screen is how snap decks trap content; this avoids it. As a
second guard, a slide's inner wrapper scrolls internally if its content ever
outgrows the viewport.

**Animations replay.** `<Slide>` flips a `motion` variant scope between `idle`
and `active`, so anything using the exported `slideItem` variant animates in
every time that slide is entered — going back up the deck feels as alive as
going down.

**The background reacts.** `AnimatedBackground` reads the active slide's `hue`
from `site.json` and springs three blurred orbs to that colour, drifting them
across the deck as you advance. A masked grid sits behind and an inlined SVG
grain sits on top to kill gradient banding. The continuous float animation is
dropped under reduced motion.

## Design notes

- Dark-first with a light theme toggle; both are driven by CSS custom properties
  in `globals.css`. Gradient and accent colours resolve per theme so headings
  stay readable on a light ground.
- Colours, fonts and easing live in the `@theme` block — change them there once.
- Skip link, visible focus rings, semantic landmarks, `aria-current` on nav.

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

If the repo is *not* named `username.github.io`, set the base path in
`vite.config.ts`:

```ts
export default defineConfig({ base: '/your-repo-name/', /* ... */ })
```

Best free URL: name the repo `username.github.io` — then no base path is needed.

### Netlify

Build command `npm run build`, publish directory `dist`.

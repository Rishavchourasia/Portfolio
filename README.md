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
│   │                    DeckContext, useDeckNavigation, useContentFits,
│   │                    slideMotion
│   ├── background/      AnimatedBackground, OrbField, GridLayer, NoiseLayer
│   ├── layout/          Navbar
│   └── ui/              SlideHeading, SpotlightCard, ProjectCard, CarouselItem,
│                        ProjectPreview, SkillMarquee, StyleGuide,
│                        CursorFollower, Button, BrandIcons
├── hooks/               useTheme, useMediaQuery, useCarousel, useDocumentMeta
├── lib/                 utils (cn), motion (easing), tokens (style-guide data)
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

**Three snap modes, chosen at runtime.** Mandatory snapping plus content taller
than the screen is how snap decks trap content, so the deck refuses to use it
unless the content measurably fits:

| Mode | When | Behaviour |
| --- | --- | --- |
| `mandatory` | Viewport ≥768×640 **and** every slide measurably fits | Full deck: fixed-height slides, one per screen |
| `proximity` | Phones, short windows, or any slide that overflows | Slides take their natural height; the browser snaps only if you already land near a boundary |
| `none` | `prefers-reduced-motion: reduce` | Plain scrolling |

`useContentFits` does the measuring. It deliberately builds each slide's height
from `offsetTop`/`offsetHeight` rather than `scrollHeight`, because slide
children rest at a translated `y` until their slide becomes active and
`scrollHeight` counts that entrance offset as overflow. Two thresholds (8px to
fail, 32px to recover) give the result hysteresis so a borderline slide can't
oscillate the deck between modes. A `ResizeObserver` plus `document.fonts.ready`
re-measures on reflow.

**Animations replay.** `<Slide>` flips a `motion` variant scope between `idle`
and `active`, so anything using the exported `slideItem` variant animates in
every time that slide is entered — going back up the deck feels as alive as
going down.

**The background reacts.** `AnimatedBackground` reads the active slide's `hue`
from `site.json` and springs three blurred orbs to that colour, drifting them
across the deck as you advance. A masked grid sits behind and an inlined SVG
grain sits on top to kill gradient banding. The continuous float animation is
dropped under reduced motion.

## Responsive behaviour

Sizing is fluid rather than stepped. Spacing comes from `clamp()` tokens
(`--slide-pad-top`, `--slide-gutter`, …) and headings from `clamp()` with `vw`,
so there are no layout jumps between breakpoints.

Because every size is rem-based, short screens scale the whole UI at once:

```css
@media (min-width: 768px) and (max-height: 900px) {
  html { font-size: clamp(13px, 1.62vh, 16px); }
}
```

Below that 13px floor a second query trims the frame instead of the type —
optional slide subtitles are hidden and the project card tightens — which is
what keeps a 1280×720 laptop on the full deck.

Verified with no horizontal overflow and a stable snap mode at 375×812,
430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1920×1080 and 2560×1440.

## Design tokens panel

The palette icon in the navbar opens a slide-over listing the typefaces,
colour tokens and elevation ramp actually in use. Values are read off the live
stylesheet with `getComputedStyle`, so the panel reflects the current theme and
can never drift from what the page paints. Each value is click-to-copy.

Edit the registry in `src/lib/tokens.ts` to document a new token.

## Design notes

- Dark-first with a light theme toggle. Light is a cool paper ground (`#eef1f7`),
  not white — white cards on a white page have no edge to sit on. Accent and
  gradient colours darken in light mode so headings and links keep their
  contrast, and the background orbs desaturate so they read as washes instead
  of mud.
- Depth comes from three `--elev-*` tokens: a cast shadow plus a lit top edge on
  dark, a soft cast shadow alone on light. Cards rest at elevation 1–2 and lift
  to 3 on hover.
- Theme lives in a module-level store (`useSyncExternalStore`) because the navbar
  writes it and the animated background reads it.
- Project cards are scroll-linked: scale, opacity and a slight Y-rotation track
  each card's distance from the centre of the track, so cards settle into focus
  as you scroll.
- A cursor ring follows the pointer and snaps around whatever nav item or button
  is under it. Fine pointers only, and never under reduced motion.
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

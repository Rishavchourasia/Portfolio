# Before you publish

Everything below lives in `src/content/*.json`. Nothing here needs a code change.
The site runs and deploys fine as-is — these are the placeholders to replace.

## 1. Your résumé

- [ ] Drop the PDF at `public/resume.pdf`
- [ ] Set `"resumeUrl": "/resume.pdf"` in `src/content/profile.json`

It's `""` right now, which hides the two Résumé buttons rather than linking to a
404. Setting it turns both back on.

## 2. Your links

In `src/content/profile.json` → `socials`:

- [ ] `github` — currently `https://github.com/` (bare domain)
- [ ] `linkedin` — currently `https://www.linkedin.com/` (bare domain)
- [ ] `twitter` — optional, empty hides nothing (not rendered yet)

An empty string hides that link everywhere.

## 3. Your real work history — ✅ done

`src/content/experience.json` now holds Troogue.ai and goMensa, taken from your
résumé. Two things worth a second look:

- [ ] The `summary` line on each role is mine, condensed from your bullets — check
      it says what you'd say.
- [ ] `stack` chips are the tools you worked in, not everything the system used.
      Troogue lists React, Next.js, TypeScript, Node.js, REST, Jest; Spring Boot,
      PostgreSQL and Redis appear in the bullet text instead, since you
      integrated against them. Move them up if you'd rather claim them.

## 4. Your real projects

The Work slide now splits into **Company** and **Personal** tabs
(`category: "company" | "personal"` in `src/content/projects.json`).

- [x] Company — both real, from your résumé: **Contact Center Admin** (internal
      data portal) and the **Static Site** (marketing/content, Next.js SSG).
      Both ship with `live`/`repo` empty since they're internal or you didn't
      give me a URL — the card just says "Links coming soon" instead of a dead
      link. Add a `live` URL to the static site if it's public.
- [ ] Personal — three of four are still placeholders (`Project Two/Three/Four`).
      For each: `title`, `tagline`, `description`, `live`/`repo`, `tags`, `year`.
- [ ] `image` on any project — put a screenshot in `public/projects/` and point
      at it, e.g. `"/projects/my-app.png"`. Without one you get a generated
      gradient, which looks fine but a real screenshot is better.

## 5. Education — added, check it's right

`src/content/profile.json` → `education`. Shown as a small one-line footnote
under your bio on the About slide (not a headline, per your call) — BMS
Institute of Technology, B.Tech Information Science, 2018–2022. If you'd
rather it wasn't shown at all, delete that block from `AboutSlide.tsx`.

## 6. Check the copy is actually yours

- [ ] `src/content/profile.json` → `bio`, `tagline`, `values`
- [x] `stats` — now your real figures: 25K+ users, Lighthouse 62→94, 40% faster
      builds. (Previously invented; replaced when the résumé came in.)
- [x] `src/content/skills.json` — now your seven real categories, verbatim from
      what you sent. The one-line `blurb` under each group title is mine; the
      skills themselves are untouched.

## 7. Regenerate the social card

Once your name or role changes:

```bash
npm run og
```

Opens a page that renders the card and writes `public/og.jpg`. Close the tab
when it says it's done.

## 8. Deploy

See the README. Vercel gives you `your-name.vercel.app` for free.

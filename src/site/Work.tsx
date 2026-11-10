import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Play, X } from 'lucide-react'
import { projects } from '@/content'
import { ProjectPreview } from '@/components/ui/ProjectPreview'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { scrollToId, setScrollLocked } from '@/lib/smoothScroll'
import type { Project } from '@/types/content'
import { FadeUp, RevealLines } from './Reveal'
import { useReveal } from './intro'

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

// Personal builds lead, as on the old Work slide.
const ORDERED = [...projects.filter((p) => p.category === 'personal'), ...projects.filter((p) => p.category !== 'personal')]
const TOTAL = ORDERED.length
const pad = (n: number) => String(n).padStart(2, '0')

const splitTitle = (title: string) => {
  const [name = title, kind = ''] = title.split(/\s+—\s+/)
  return { name, kind }
}

const hueFor = (seed: string) => [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7)

function WorkIndex() {
  const years = projects.map((p) => Number(p.year)).filter(Boolean)
  const range = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : ''
  const [chipsRef, chipsShown] = useReveal<HTMLUListElement>(0.4)

  return (
    <div className="px-gutter pt-[18vh] pb-[14vh]">
      <FadeUp>
        <p className="eyebrow">Selected work · {range}</p>
      </FadeUp>
      <RevealLines
        className="mt-6 max-w-5xl text-[clamp(2.1rem,5vw,4.2rem)] leading-[1.02] font-bold tracking-[-0.035em]"
        lines={[
          `${NUMBER_WORDS[TOTAL] ?? TOTAL} builds,`,
          <span key="v" className="voice text-[1.08em]">from the first commit to production.</span>,
        ]}
      />
      <ul ref={chipsRef} className="mt-10 flex flex-wrap gap-3">
        {ORDERED.map((p, i) => (
          <motion.li
            key={p.slug}
            initial={{ opacity: 0, y: 14, rotate: 0 }}
            animate={chipsShown ? { opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 } : undefined}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
          >
            <button
              type="button"
              onClick={() => scrollToId(`case-${p.slug}`)}
              className="group flex items-center gap-2 rounded-md border border-[var(--color-stamp)] px-3 py-2 text-xs font-bold tracking-[0.12em] text-[#f08a7f] uppercase transition-colors hover:bg-[var(--color-stamp)] hover:text-[#f6e9df]"
            >
              <span className="voice text-sm tracking-normal text-current normal-case">{pad(i + 1)}</span>
              {splitTitle(p.title).name}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/** Cycles a project's screenshots inside a browser frame. */
function ScreenCycler({ project, active }: { project: Project; active: boolean }) {
  const screens = project.screens ?? []
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!active || screens.length < 2) return
    const id = window.setInterval(() => setI((n) => (n + 1) % screens.length), 3200)
    return () => window.clearInterval(id)
  }, [active, screens.length])
  const screen = screens[i]

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--color-ink-900)] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
        <span className="ml-2 truncate rounded-full bg-[color-mix(in_oklab,var(--text)_7%,transparent)] px-2.5 py-0.5 font-mono text-[10px] text-muted">
          {project.slug} · {screen?.caption}
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        <AnimatePresence initial={false}>
          <motion.img
            key={screen?.src}
            src={screen?.src}
            alt={`${project.title}: ${screen?.caption}`}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

/** For work without screenshots: the tagline set as a poster over a light line. */
function Poster({ project }: { project: Project }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="voice max-w-3xl text-[clamp(1.8rem,4vw,3.4rem)] leading-[1.1] text-[var(--color-cream)]">
        “{project.tagline}”
      </p>
      <ul className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {project.tags.map((tag, i) => (
          <li
            key={tag}
            className="rounded-md border border-[var(--border-strong)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase"
            style={{ rotate: `${((i * 37) % 7) - 3}deg` }}
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CaseCard({
  project,
  index,
  progress,
  onOpen,
}: {
  project: Project
  index: number
  progress: MotionValue<number>
  onOpen: () => void
}) {
  const { name, kind } = splitTitle(project.title)
  const hue = hueFor(project.slug)
  const steps = Math.max(1, TOTAL - 1)
  // 0 → 1 while the next card slides over this one.
  const exit = useTransform(progress, (p) => Math.min(1, Math.max(0, p * steps - index)))
  // 0 → 1 while this card itself slides into place.
  const enter = useTransform(progress, (p) => Math.min(1, Math.max(0, p * steps - index + 1)))
  const scale = useTransform(exit, [0, 1], [1, 0.9])
  const dim = useTransform(exit, [0, 1], [0, 0.75])
  const visualY = useTransform(enter, [0, 1], ['18%', '0%'])
  const visualTilt = useTransform(enter, [0, 1], [18, 0])
  const [visualRef, inView] = useReveal<HTMLDivElement>(0.3)

  return (
    <section id={`case-${project.slug}`} aria-label={name} className="sticky top-0 h-[100svh] overflow-hidden">
      <motion.div
        style={{ scale }}
        className="relative h-full origin-top overflow-hidden rounded-t-[clamp(1.25rem,3vw,2.5rem)] border-t border-[var(--border-strong)] bg-[var(--color-ink-950)]"
      >
        {/* Atmosphere: a coloured bloom, a horizon light line, a few stars. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 55% at 50% 58%, hsl(${hue} 70% 45% / 0.28), transparent 70%),
                         radial-gradient(40% 30% at 85% 10%, hsl(${(hue + 60) % 360} 70% 50% / 0.12), transparent 70%)`,
          }}
        />
        <div aria-hidden className="absolute inset-x-[12%] top-[62%] h-px bg-[var(--color-cream)] opacity-70 shadow-[0_0_24px_4px_rgba(236,230,220,0.45),0_0_80px_14px_hsl(var(--h)_80%_60%/0.35)]" style={{ ['--h' as string]: hue }} />

        <div className="absolute top-20 right-[var(--gutter)] text-right sm:top-24">
          <p className="voice text-4xl leading-none">
            {pad(index + 1)}
            <span className="text-base text-muted not-italic"> / {pad(TOTAL)}</span>
          </p>
          <p className="voice mt-1 text-base text-[var(--color-cream)]">
            {project.category === 'personal' ? 'Personal build' : 'Company work'} · {project.year}
          </p>
        </div>

        <motion.div
          ref={visualRef}
          style={{ y: visualY, rotateX: visualTilt, transformPerspective: 1400 }}
          className="absolute inset-x-[var(--gutter)] top-[16%] bottom-[30%] flex items-center justify-center"
        >
          {project.screens?.length ? (
            <div className="w-full max-w-[min(860px,calc((100svh*0.54)*1.6))]">
              <ScreenCycler project={project} active={inView} />
            </div>
          ) : (
            <Poster project={project} />
          )}
        </motion.div>

        <div className="absolute inset-x-[var(--gutter)] bottom-8 sm:bottom-10">
          <h3 className="text-[clamp(2.6rem,9vw,8rem)] leading-[0.85] font-extrabold tracking-[-0.045em] uppercase">{name}</h3>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border-strong)] pt-4">
            <div>
              <p className="voice text-xl text-[var(--color-cream)] sm:text-2xl">{kind || project.tagline}</p>
              <p className="mt-1 text-xs text-muted">
                {project.status ? `${project.year} · ${project.status}` : project.year} · {project.tags.slice(0, 4).join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
            {project.videos?.length ? (
              <button type="button" onClick={onOpen} className="voice inline-flex items-center gap-2 text-lg underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70">
                <Play size={14} className="fill-current" /> Watch it run
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpen}
              className="group inline-flex items-center gap-3 rounded-xl bg-[var(--color-cream)] px-5 py-3 text-sm font-semibold text-[var(--color-cream-ink)] transition-transform hover:-translate-y-0.5"
            >
              Open case
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            </div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
    </section>
  )
}

/** The proof: the few numbers that show the build does what it claims. */
function Results({ results }: { results: NonNullable<Project['results']> }) {
  return (
    <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
      {results.map((r) => (
        <div key={r.label} className="bg-[var(--color-ink-900)] p-5 sm:p-6">
          <dt className="voice text-[clamp(2.2rem,4vw,3rem)] leading-none text-[var(--color-lavender)]">{r.value}</dt>
          <dd className="mt-2 text-sm leading-snug text-muted">{r.label}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Recorded demos and test runs, e.g. an automated load test. */
function Videos({ project }: { project: Project }) {
  return (
    <div className="mt-10">
      <p className="eyebrow">See it working</p>
      <div className={`mt-4 grid gap-6 ${(project.videos?.length ?? 0) > 1 ? 'md:grid-cols-2' : ''}`}>
        {project.videos?.map((v) => (
          <figure key={v.src} className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-black">
            <video
              src={v.src}
              poster={v.poster}
              controls
              playsInline
              preload="metadata"
              onPlay={() => track('case_video_play', { project: project.slug, video: v.title })}
              className="aspect-video w-full bg-black"
            >
              {/* Silent screen recordings may have no captions file; an empty track is ignored. */}
              <track kind="captions" src={v.captions} srcLang="en" label="English" default />

            </video>
            <figcaption className="border-t border-[var(--border)] bg-[var(--color-ink-900)] px-5 py-4">
              <p className="font-semibold">{v.title}</p>
              {v.caption && <p className="mt-1 text-sm text-muted">{v.caption}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function CaseDialog({ project, index, onClose }: { project: Project | null; index: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !project) return
    dialog.showModal()
    setScrollLocked(true)
    const onClick = (e: MouseEvent) => e.target === dialog && dialog.close()
    dialog.addEventListener('click', onClick)
    return () => {
      dialog.removeEventListener('click', onClick)
      setScrollLocked(false)
    }
  }, [project])

  if (!project) return null
  const { name, kind } = splitTitle(project.title)

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={`${name} case study`}
      data-lenis-prevent
      className="m-auto max-h-[92dvh] w-[min(94vw,1100px)] overflow-y-auto rounded-3xl border border-[var(--border-strong)] bg-[var(--color-ink-900)] p-0 text-[var(--text)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--color-ink-900)]/90 px-6 py-4 backdrop-blur">
        <p className="voice text-xl">
          {pad(index + 1)} <span className="text-sm text-muted not-italic">/ {pad(TOTAL)}</span>
        </p>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close case study"
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-cream-ink)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-6 pt-8 pb-10 sm:px-10">
        <h3 className="text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase">{name}</h3>
        {kind && <p className="voice mt-2 text-2xl">{kind}</p>}
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[color-mix(in_oklab,var(--text)_85%,transparent)]">{project.tagline}</p>

        {project.problem && (
          <div className="mt-10 rounded-2xl border border-[color-mix(in_oklab,var(--color-stamp)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-stamp)_8%,transparent)] p-6 sm:p-8">
            <p className="eyebrow text-[#f08a7f]">The problem</p>
            <p className="voice mt-4 max-w-3xl text-[clamp(1.35rem,2.6vw,1.9rem)] leading-snug text-[var(--color-cream)]">{project.problem}</p>
          </div>
        )}

        {project.results?.length ? <Results results={project.results} /> : null}

        {project.videos?.length ? <Videos project={project} /> : null}

        {(project.screens?.length || project.architecture) && (
          <ProjectPreview project={project} className="mt-10" />
        )}

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">The approach</p>
            <p className="mt-4 leading-relaxed text-muted">{project.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag} className="rounded-md border border-[var(--border-strong)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase">
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-5 text-sm">
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-[var(--color-lavender)]">
                  Source <ArrowUpRight size={14} />
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-[var(--color-lavender)]">
                  Live <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
          {project.highlights?.length ? (
            <div>
              <p className="eyebrow">What I did</p>
              <ol className="mt-4 space-y-4">
                {project.highlights.map((h, i) => (
                  <li key={h} className="flex gap-4 border-b border-[var(--border)] pb-4 leading-relaxed">
                    <span className="voice text-lg">{pad(i + 1)}</span>
                    <span className="text-[color-mix(in_oklab,var(--text)_85%,transparent)]">{h}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  )
}

/** Selected work: an index of chips, then one full-screen case per project, each stacking over the last. */
export function Work() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const open = (i: number) => {
    setOpenIndex(i)
    const p = ORDERED[i]
    if (p) track('case_open', { project: p.slug })
  }

  return (
    <section id="work" aria-label="Selected work" className="relative">
      <WorkIndex />
      <div ref={stackRef} className="relative">
        {ORDERED.map((project, i) => (
          <CaseCard key={project.slug} project={project} index={i} progress={scrollYProgress} onOpen={() => open(i)} />
        ))}
      </div>
      <CaseDialog
        project={openIndex === null ? null : (ORDERED[openIndex] ?? null)}
        index={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  )
}

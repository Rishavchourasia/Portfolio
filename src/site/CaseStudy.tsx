import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CodeXml, Link2, Lock, X } from 'lucide-react'
import { ArchitectureDiagram } from '@/components/ui/ArchitectureDiagram'
import { ProjectPreview } from '@/components/ui/ProjectPreview'
import { useScrollerLenis } from '@/hooks/useScrollerLenis'
import { track } from '@/lib/analytics'
import { EASE } from '@/lib/motion'
import { caseUrl, leaveCase, navigate } from '@/lib/route'
import { setScrollLocked } from '@/lib/smoothScroll'
import type { Project } from '@/types/content'
import { Frame } from './Work'
import { NameZoom } from './NameZoom'
import { REDUCED, toTiles, type Tile } from './zoomTiles'
import { ORDERED, TOTAL, hueFor, pad, splitTitle } from './workData'

const CURTAIN = [0.76, 0, 0.24, 1] as const

/* ------------------------------------------------------------------ */
/* Opening: the name as a window onto the work, zoomed through.        */
/* ------------------------------------------------------------------ */

function tilesFor(project: Project): Tile[] {
  const hue = hueFor(project.slug)
  const screens = project.screens ?? []
  const pieces: ReactNode[] = screens.length
    ? screens.map((s) => (
        <img key={s.src} src={s.src} alt="" decoding="async" className="aspect-[16/10] w-full rounded-md object-cover object-top brightness-125" />
      ))
    : [
        ...(project.architecture
          ? [
              <div key="diagram" className="on-ink relative aspect-[16/10] overflow-hidden rounded-md bg-[var(--color-ink-900)]">
                <ArchitectureDiagram title={project.title} architecture={project.architecture} />
              </div>,
            ]
          : []),
        ...(project.results ?? []).map((r) => (
          <div key={r.label} className="aspect-[16/10] rounded-md p-[6%]" style={{ background: `hsl(${hue} 45% 22%)` }}>
            <p className="voice text-[clamp(1.6rem,4vw,3.4rem)] leading-none text-[var(--color-cream)]">{r.value}</p>
            <p className="mt-2 text-[clamp(0.6rem,1vw,0.85rem)] text-[var(--color-cream)]/70">{r.label}</p>
          </div>
        )),
        <div key="tags" className="flex aspect-[16/10] flex-wrap content-center gap-1.5 rounded-md bg-[var(--color-cream)] p-[6%]">
          {project.tags.map((t) => (
            <span key={t} className="rounded border border-[var(--color-cream-ink)]/30 px-1.5 py-0.5 text-[clamp(0.5rem,0.9vw,0.75rem)] font-bold tracking-wider text-[var(--color-cream-ink)] uppercase">
              {t}
            </span>
          ))}
        </div>,
        <div key="tagline" className="grid aspect-[16/10] place-items-center rounded-md p-[6%]" style={{ background: `hsl(${(hue + 50) % 360} 55% 35%)` }}>
          <p className="voice text-center text-[clamp(0.9rem,1.8vw,1.5rem)] leading-tight text-[var(--color-cream)]">“{project.tagline}”</p>
        </div>,
      ]
  return toTiles(pieces)
}

function ZoomOpening({ project, index, container }: { project: Project; index: number; container: RefObject<HTMLDivElement | null> }) {
  const { name, kind } = splitTitle(project.title)
  return (
    <NameZoom
      word={name}
      label={`${name}, opening`}
      id={project.slug}
      tiles={tilesFor(project)}
      hue={hueFor(project.slug)}
      container={container}
      caption={
        <div>
          <p className="voice text-2xl">
            {pad(index + 1)} <span className="text-sm text-muted not-italic">/ {pad(TOTAL)}</span>
          </p>
          <p className="mt-2 max-w-md text-sm font-extrabold tracking-[0.04em] uppercase sm:text-base">{kind || project.tagline}</p>
        </div>
      }
    />
  )
}

/* ------------------------------------------------------------------ */
/* The sheet: details pinned on the left, the work bending on the right. */
/* ------------------------------------------------------------------ */

type Bend = { rotateX: MotionValue<number>; skewY: MotionValue<number> }

/** A piece of the work that tilts and skews with scroll speed, like a sheet of paper flexing. */
function Flex({ bend, root, children, className = '' }: { bend: Bend; root: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ rotateX: bend.rotateX, skewY: bend.skewY, transformPerspective: 1100 }}
      initial={{ opacity: 0, y: 80, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ root, once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Screen({ project, screen }: { project: Project; screen: NonNullable<Project['screens']>[number] }) {
  return (
    <div className="on-ink">
      <Frame address={`${project.slug} · ${screen.caption}`}>
        <img src={screen.src} alt={`${project.title}: ${screen.caption}`} decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
      </Frame>
      <p className="mt-3 font-mono text-[11px] text-muted">{screen.caption}</p>
    </div>
  )
}

function Details({ project, index }: { project: Project; index: number }) {
  const { name, kind } = splitTitle(project.title)
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + caseUrl(project.slug))
      setCopied(true)
      track('case_link_copy', { project: project.slug })
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // No clipboard access: the address bar holds the same link.
    }
  }

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <p className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">
        {pad(index + 1)} / {pad(TOTAL)} · {project.category === 'personal' ? 'Personal build' : 'Company work'} · {project.year}
      </p>
      <h1 className="mt-4 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.88] font-extrabold tracking-[-0.045em] uppercase">{name}</h1>
      {kind && <p className="voice mt-2 text-2xl">{kind}</p>}
      <p className="mt-5 max-w-md leading-relaxed">{project.tagline}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('case_source', { project: project.slug, from: 'case' })}
            className="group inline-flex items-center gap-2 rounded-xl bg-[var(--color-cream-ink)] px-4 py-2.5 text-sm font-semibold text-[var(--color-cream)] transition-transform hover:-translate-y-0.5"
          >
            <CodeXml size={15} /> Source on GitHub
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
        {project.live && (
          <a href={project.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-sm font-semibold">
            Live app <ArrowUpRight size={14} />
          </a>
        )}
        {!project.repo && project.category === 'company' && (
          <p className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] px-3.5 py-2 text-sm text-muted">
            <Lock size={13} /> Built at work, so the code is private.
          </p>
        )}
        <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3.5 py-2 text-sm text-muted transition-colors hover:text-[var(--text)]">
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
        </button>
      </div>

      {project.results?.length ? (
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6">
          {project.results.map((r) => (
            <div key={r.label}>
              <dt className="voice text-[clamp(1.8rem,3vw,2.6rem)] leading-none">{r.value}</dt>
              <dd className="mt-2 text-xs leading-snug text-muted">{r.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="mt-8 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <li key={t} className="rounded-md border border-[var(--border-strong)] px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stream({ project, bend, root }: { project: Project; bend: Bend; root: RefObject<HTMLDivElement | null> }) {
  const screens = project.screens ?? []
  const [lead, ...rest] = screens
  const items: ReactNode[] = []

  if (project.problem)
    items.push(
      <div key="problem">
        <p className="eyebrow">The problem</p>
        <p className="voice mt-4 text-[clamp(1.5rem,2.8vw,2.3rem)] leading-snug">{project.problem}</p>
      </div>,
    )
  if (lead) items.push(<Flex key={lead.src} bend={bend} root={root}><Screen project={project} screen={lead} /></Flex>)
  items.push(
    <div key="approach">
      <p className="eyebrow">The approach</p>
      <p className="mt-4 text-lg leading-relaxed">{project.description}</p>
    </div>,
  )
  if (project.architecture)
    items.push(
      <Flex key="architecture" bend={bend} root={root}>
        <div className="on-ink">
          <ProjectPreview project={{ ...project, screens: [] }} />
        </div>
      </Flex>,
    )
  rest.slice(0, 2).forEach((s) => items.push(<Flex key={s.src} bend={bend} root={root}><Screen project={project} screen={s} /></Flex>))
  if (project.highlights?.length)
    items.push(
      <div key="highlights">
        <p className="eyebrow">What I did</p>
        <ol className="mt-4">
          {project.highlights.map((h, i) => (
            <li key={h} className="flex gap-4 border-b border-[var(--border)] py-4 leading-relaxed">
              <span className="voice text-lg">{pad(i + 1)}</span>
              <span>{h}</span>
            </li>
          ))}
        </ol>
      </div>,
    )
  project.videos?.forEach((v) =>
    items.push(
      <Flex key={v.src} bend={bend} root={root}>
        <figure className="on-ink overflow-hidden rounded-2xl bg-black">
          <video src={v.src} poster={v.poster} controls playsInline preload="metadata" className="aspect-video w-full" onPlay={() => track('case_video_play', { project: project.slug, video: v.title })}>
            <track kind="captions" src={v.captions} srcLang="en" label="English" default />
          </video>
          <figcaption className="bg-[var(--color-ink-900)] px-5 py-4">
            <p className="font-semibold">{v.title}</p>
            {v.caption && <p className="mt-1 text-sm text-muted">{v.caption}</p>}
          </figcaption>
        </figure>
      </Flex>,
    ),
  )
  rest.slice(2).forEach((s) => items.push(<Flex key={s.src} bend={bend} root={root}><Screen project={project} screen={s} /></Flex>))

  return <div className="space-y-[clamp(4rem,10vh,8rem)]">{items}</div>
}

function NextCase({ index }: { index: number }) {
  const next = ORDERED[(index + 1) % TOTAL]
  if (!next) return null
  const { name, kind } = splitTitle(next.title)
  return (
    <button
      type="button"
      onClick={() => {
        track('case_open', { project: next.slug, from: 'next' })
        navigate(caseUrl(next.slug), true)
      }}
      className="group block w-full border-t border-[var(--border)] px-gutter pt-12 pb-16 text-left"
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted uppercase">
        Next case <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span className="mt-4 block text-[clamp(3rem,11vw,10rem)] leading-[0.85] font-extrabold tracking-[-0.05em] uppercase transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3">
        {name}
      </span>
      {kind && <span className="voice mt-3 block text-2xl">{kind}</span>}
    </button>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Rises from the bottom. Leaving for the home page it drops away again; when
 * the next case replaces it, it holds still underneath while the new one rises.
 * `leaving` comes from the AnimatePresence around it.
 */
const SHEET = {
  below: { y: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  shown: { y: '0%', borderTopLeftRadius: 0, borderTopRightRadius: 0, transition: { duration: 0.9, ease: CURTAIN } },
  gone: (leaving: boolean) =>
    leaving
      ? { y: '100%', transition: { duration: 0.8, ease: CURTAIN } }
      : { zIndex: 99, transition: { duration: 0.9, zIndex: { duration: 0 } } },
}

/**
 * A case study as its own page at /work/<slug>. It rises over the home page
 * (which stays where the reader left it), opens by zooming through the
 * project's name into its work, then lays the work out on a paper sheet.
 */
export function CaseStudy({ index }: { index: number }) {
  const project = ORDERED[index]
  const scrollerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: scrollerRef })
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 260, damping: 40 })
  const bend: Bend = {
    rotateX: useTransform(velocity, [-2500, 0, 2500], [9, 0, -9], { clamp: true }),
    skewY: useTransform(velocity, [-2500, 0, 2500], [-2.5, 0, 2.5], { clamp: true }),
  }

  useEffect(() => {
    setScrollLocked(true, 'case')
    return () => setScrollLocked(false, 'case')
  }, [])

  useEffect(() => {
    if (!project) return
    track('case_view', { project: project.slug })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && leaveCase()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project])

  // The page has its own smooth scroll; the home page's is held still underneath.
  useScrollerLenis(scrollerRef, contentRef)

  if (!project) return null
  const { name } = splitTitle(project.title)

  return (
    <motion.article
      aria-label={`${name} case study`}
      className="fixed inset-0 z-[100] overflow-hidden bg-[var(--color-ink-950)] text-[var(--text)]"
      variants={SHEET}
      initial="below"
      animate="shown"
      exit="gone"
    >
      <div ref={scrollerRef} data-lenis-prevent className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain">
        <div ref={contentRef}>
          <ZoomOpening project={project} index={index} container={scrollerRef} />

          {/* The sheet rises over the last screen of the opening while it is still pinned. */}
          <div className={`paper relative z-10 ${REDUCED ? '' : '-mt-[100svh]'}`}>
            <div className="grid gap-12 px-gutter pt-20 pb-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.45fr)] lg:gap-[6vw] lg:pt-28">
              <Details project={project} index={index} />
              <Stream project={project} bend={bend} root={scrollerRef} />
            </div>
            <NextCase index={index} />
          </div>
        </div>
      </div>

      {/* Difference blending keeps the controls legible over both the dark opening and the paper. */}
      {/* Solid pills, so the controls stay legible over dark screens, cream paper and running text alike. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-gutter py-4 sm:py-5">
        <button type="button" onClick={leaveCase} className="group pointer-events-auto rounded-full border border-[rgba(236,230,220,0.16)] bg-[rgba(11,10,15,0.72)] text-[#ece6dc] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-[rgba(236,230,220,0.4)] inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> All work
        </button>
        <button type="button" onClick={leaveCase} aria-label="Close case study" className="pointer-events-auto rounded-full border border-[rgba(236,230,220,0.16)] bg-[rgba(11,10,15,0.72)] text-[#ece6dc] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-[rgba(236,230,220,0.4)] grid h-10 w-10 place-items-center">
          <X size={16} />
        </button>
      </div>
    </motion.article>
  )
}

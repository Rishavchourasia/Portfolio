import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile, site } from '@/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { track } from '@/lib/analytics'
import { navigate, useCaseSlug, usePage, type Page } from '@/lib/route'
import { setScrollLocked, startSmoothScroll } from '@/lib/smoothScroll'
import { About } from '@/site/About'
import { CaseStudy } from '@/site/CaseStudy'
import { Contact } from '@/site/Contact'
import { Experience } from '@/site/Experience'
import { Header } from '@/site/Header'
import { Hero } from '@/site/Hero'
import { IntroContext, NAV } from '@/site/intro'
import { Preloader } from '@/site/Preloader'
import { ScrollRail } from '@/site/ScrollRail'
import { Skills } from '@/site/Skills'
import { Work } from '@/site/Work'
import { ORDERED } from '@/site/workData'
import { AboutPage } from '@/site/pages/AboutPage'
import { ExperiencePage } from '@/site/pages/ExperiencePage'
import { SkillsPage } from '@/site/pages/SkillsPage'
import { WorkPage } from '@/site/pages/WorkPage'

const PAGE_VIEWS: Record<Page, (props: { covered: boolean }) => ReactNode> = {
  work: WorkPage,
  about: AboutPage,
  experience: ExperiencePage,
  skills: SkillsPage,
}

const INTRO_KEY = 'portfolio:intro-seen'

// The intro plays once per browser session, never under reduced motion, and
// never in front of a page or case study someone opened from a direct link.
const introAlreadySeen = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (window.location.pathname !== '/') return true
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  useDocumentMeta(site.meta)
  const [introDone, setIntroDone] = useState(introAlreadySeen)

  useEffect(() => startSmoothScroll(), [])

  // /work/<slug> lays that case study over the home page; anything unknown falls back home.
  const slug = useCaseSlug()
  const caseIndex = slug ? ORDERED.findIndex((p) => p.slug === slug) : -1
  const caseOpen = caseIndex >= 0
  // /work, /about, /experience and /skills: a page of its own over the home page.
  const page = usePage()
  const PageView = page ? PAGE_VIEWS[page] : null
  const sheetOpen = caseOpen || page !== null

  // The tab title follows the address: the case, else the page, else the site.
  useEffect(() => {
    const project = caseOpen ? ORDERED[caseIndex] : undefined
    const label = page ? NAV.find((n) => n.id === page)?.label : undefined
    if (project) document.title = `${project.title.split(/\s+—\s+/)[0]} case study · ${profile.name}`
    else if (label) document.title = `${label} · ${profile.name}`
    else document.title = site.meta.title
  }, [caseOpen, caseIndex, page])
  useEffect(() => {
    if (slug && caseIndex < 0) navigate('/', true)
  }, [slug, caseIndex])
  useEffect(() => setScrollLocked(!introDone, 'intro'), [introDone])

  const finishIntro = useCallback(() => {
    setIntroDone(true)
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // Private mode: the intro just plays again next visit.
    }
  }, [])

  // One page, so sections stand in for page views in analytics.
  useEffect(() => {
    const seen = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting && !seen.has(id)) {
            seen.add(id)
            track('section_view', { section_id: id })
          }
        }
      },
      { threshold: 0.3 },
    )
    for (const id of ['top', ...NAV.map((n) => n.id)]) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <IntroContext.Provider value={introDone}>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-lg focus:bg-[var(--color-cream)] focus:px-5 focus:py-2.5 focus:text-sm focus:text-[var(--color-cream-ink)]"
      >
        Skip to work
      </a>
      <div className="grain" aria-hidden />
      <ScrollRail />
      <div inert={sheetOpen}>
      <Header />
      <main>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      </div>
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet-backdrop"
            aria-hidden
            className="fixed inset-0 z-[95] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.2 } }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
      {/* `custom` tells a leaving sheet whether the reader is going home or on to the next one. */}
      <AnimatePresence custom={page === null} initial={false}>
        {page && PageView && <PageView key={page} covered={caseOpen} />}
      </AnimatePresence>
      {/* `custom` tells the leaving case whether the reader is going home or on to the next case. */}
      <AnimatePresence custom={!caseOpen} initial={false}>{caseOpen && <CaseStudy key={slug} index={caseIndex} />}</AnimatePresence>
      <Preloader ready={introDone} markReady={finishIntro} />
    </IntroContext.Provider>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { site } from '@/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { track } from '@/lib/analytics'
import { setScrollLocked, startSmoothScroll } from '@/lib/smoothScroll'
import { About } from '@/site/About'
import { Contact } from '@/site/Contact'
import { Experience } from '@/site/Experience'
import { Header } from '@/site/Header'
import { Hero } from '@/site/Hero'
import { IntroContext, NAV } from '@/site/intro'
import { Preloader } from '@/site/Preloader'
import { ScrollRail } from '@/site/ScrollRail'
import { Skills } from '@/site/Skills'
import { Work } from '@/site/Work'

const INTRO_KEY = 'portfolio:intro-seen'

// The intro plays once per browser session, and never under reduced motion.
const introAlreadySeen = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
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
  useEffect(() => setScrollLocked(!introDone), [introDone])

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
      <Header />
      <main>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Preloader ready={introDone} markReady={finishIntro} />
    </IntroContext.Provider>
  )
}

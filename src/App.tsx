import { AnimatedBackground } from '@/components/background'
import { Deck, SlideHint, SlideProgress, SlideRail } from '@/components/deck'
import { Navbar } from '@/components/layout/Navbar'
import { SLIDE_REGISTRY } from '@/slides/registry'
import { site, slideIds } from '@/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function App() {
  useDocumentMeta(site.meta)

  return (
    <Deck slideIds={slideIds}>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-80 focus:rounded-full focus:bg-accent-500 focus:px-5 focus:py-2.5 focus:text-sm focus:text-ink-950"
      >
        Skip to content
      </a>

      <AnimatedBackground />
      <SlideProgress />
      <Navbar />
      <SlideRail />
      <SlideHint />

      {site.slides.map((slide) => {
        const SlideComponent = SLIDE_REGISTRY[slide.id]
        return SlideComponent ? <SlideComponent key={slide.id} label={slide.label} /> : null
      })}
    </Deck>
  )
}

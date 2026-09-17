import { Aurora } from '@/components/ui/Aurora'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Experience } from '@/sections/Experience'
import { Projects } from '@/sections/Projects'
import { Contact } from '@/sections/Contact'

export default function App() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-80 focus:rounded-full focus:bg-accent-500 focus:px-5 focus:py-2.5 focus:text-sm focus:text-ink-950"
      >
        Skip to content
      </a>

      <Aurora />
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

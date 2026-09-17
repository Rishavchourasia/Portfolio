import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { navLinks } from '@/data/navigation'
import { profile } from '@/data/profile'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useTheme } from '@/hooks/useTheme'
import { cn, scrollToId } from '@/lib/utils'

const ids = navLinks.map((l) => l.id)

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useScrollSpy(ids)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'py-3' : 'py-5',
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500',
            scrolled ? 'glass w-[92%] shadow-2xl shadow-black/20' : 'w-[94%] border border-transparent',
          )}
        >
          <a
            href="#top"
            className="font-display text-sm font-semibold tracking-tight"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <span className="text-accent-400">{'{'}</span>
            {profile.firstName.toLowerCase()}
            <span className="text-accent-400">{'}'}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => go(link.id)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm transition-colors',
                    active === link.id ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]',
                  )}
                >
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[color-mix(in_oklab,var(--text)_10%,transparent)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="glass rounded-full p-2.5 transition-colors hover:border-accent-500/50"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-accent-400 sm:inline-flex"
            >
              Resume
            </a>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="glass rounded-full p-2.5 md:hidden"
            >
              <Menu size={15} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-[var(--bg)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex justify-end p-6">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="glass rounded-full p-3">
                <X size={18} />
              </button>
            </div>
            <ul className="mt-8 flex flex-col gap-2 px-8">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  <button
                    onClick={() => go(link.id)}
                    className="font-display w-full border-b border-[var(--border)] py-5 text-left text-3xl font-medium"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { motion, useScroll, useSpring } from 'framer-motion'

/** A hairline on the right edge that fills as the page is read. */
export function ScrollRail() {
  const { scrollYProgress } = useScroll()
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return (
    <div aria-hidden className="fixed top-1/2 right-3 z-50 hidden h-28 w-px -translate-y-1/2 bg-[var(--border-strong)] mix-blend-difference md:block">
      <motion.span style={{ scaleY: fill }} className="absolute inset-0 origin-top bg-[var(--color-cream)]" />
    </div>
  )
}

import { useRef, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Card with a cursor-following radial glow on its border and surface. */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, color-mix(in oklab, var(--color-accent-500) 16%, transparent), transparent 70%)`

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
      }}
      onPointerLeave={() => {
        mx.set(-200)
        my.set(-200)
      }}
      className={cn(
        'group glass relative overflow-hidden rounded-2xl transition-colors duration-300 hover:border-accent-500/40',
        className,
      )}
    >
      <motion.div
        aria-hidden
        style={{ background }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

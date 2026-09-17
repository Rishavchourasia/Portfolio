import { useRef, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

type Elevation = 1 | 2 | 3

const ELEVATION: Record<Elevation, string> = {
  1: 'shadow-[var(--elev-1)]',
  2: 'shadow-[var(--elev-2)]',
  3: 'shadow-[var(--elev-3)]',
}

type Props = {
  children: ReactNode
  className?: string
  /** Resting depth. Hover always lifts one step further. */
  elevation?: Elevation
  /** Disable the hover lift for cards inside a scroll-animated track. */
  staticLift?: boolean
}

/**
 * Card with a cursor-following radial glow, a specular top edge and real
 * elevation. Shadows come from the `--elev-*` tokens, so depth reads correctly
 * in both themes — a cast shadow on light, a lit edge plus shadow on dark.
 */
export function SpotlightCard({ children, className, elevation = 1, staticLift }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(-300)
  const my = useMotionValue(-300)
  const glow = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, color-mix(in oklab, var(--color-accent-500) 16%, transparent), transparent 70%)`

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        mx.set(event.clientX - rect.left)
        my.set(event.clientY - rect.top)
      }}
      onPointerLeave={() => {
        mx.set(-300)
        my.set(-300)
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl',
        'transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)]',
        ELEVATION[elevation],
        !staticLift &&
          'hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--elev-3)]',
        className,
      )}
    >
      {/* specular highlight along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--text)_28%,transparent)] to-transparent"
      />

      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">{children}</div>
    </div>
  )
}

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost'
  children: ReactNode
}

export function ButtonLink({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium',
        'transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:outline-none',
        variant === 'primary' &&
          'bg-accent-500 text-ink-950 shadow-[0_8px_30px_-8px] shadow-accent-500/60 hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-accent-400/70',
        variant === 'ghost' && 'glass hover:-translate-y-0.5 hover:border-accent-500/50',
        className,
      )}
    >
      {children}
    </a>
  )
}

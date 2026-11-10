import { profile } from '@/content'
import { cn } from '@/lib/utils'

const initials = profile.name
  .split(/\s+/)
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

/** The red seal beside the signature, printed like a chop mark. */
export function Stamp({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-grid h-6 w-6 rotate-[-4deg] place-items-center rounded-[3px] bg-[var(--color-stamp)] font-sans text-[9px] font-extrabold tracking-tight text-[#f6e9df] shadow-[inset_0_0_0_2px_rgba(246,233,223,0.35)]',
        className,
      )}
    >
      {initials}
    </span>
  )
}


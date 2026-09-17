import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, X } from 'lucide-react'
import { COLOR_GROUPS, ELEVATIONS, FONTS, readColorTokens, readToken } from '@/lib/tokens'
import { useTheme } from '@/hooks/useTheme'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        } catch {
          /* clipboard blocked — the value is on screen anyway */
        }
      }}
      aria-label={`Copy ${value}`}
      className="rounded-md p-1.5 text-muted transition-colors hover:text-accent-400"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function Swatch({
  label,
  varName,
  note,
  value,
}: {
  label: string
  varName: string
  note?: string
  value: string
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <span
        className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border-strong)]"
        style={{ background: `var(${varName})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{label}</p>
        <p className="truncate font-mono text-[10px] text-muted">{value || varName}</p>
        {note && <p className="truncate text-[10px] text-muted">{note}</p>}
      </div>
      <CopyButton value={value || varName} />
    </li>
  )
}

/**
 * Slide-over reference for the design system: live font stacks, the colour
 * tokens for the current theme, and the elevation ramp. Values are read from
 * the running stylesheet, so this cannot drift from what the page renders.
 */
export function StyleGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme } = useTheme()
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  /**
   * The WAI-ARIA dialog pattern this panel follows requires focus to move
   * into it on open, stay trapped there while it's open, and return to
   * whatever triggered it on close — none of which `role="dialog"` provides
   * on its own. There's only one dialog in the app; if a second one shows up,
   * this is worth lifting into a shared `useFocusTrap` hook instead of
   * copying it.
   */
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [open])

  /**
   * Read during render rather than in an effect: these are pure reads of the
   * live stylesheet, so deriving them avoids a second render pass on open.
   * `theme` is a real dependency — it is what swaps the custom properties on
   * `:root` — and is captured alongside the values it produced.
   */
  const snapshot = useMemo(
    () =>
      open
        ? {
            theme,
            // Three items, read only when this panel is opened — the spread
            // here is not a hot path, and it's the more readable form.
            // eslint-disable-next-line oxc/no-map-spread
            fonts: FONTS.map((font) => ({ ...font, stack: readToken(font.varName) })),
            colors: readColorTokens(),
          }
        : null,
    [open, theme],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-70 bg-black/45 backdrop-blur-sm"
          />

          {/*
            A native <dialog> would need `showModal()`/`close()` coordinated
            against AnimatePresence's own exit-animation lifecycle — two
            imperative systems fighting for when the element actually leaves
            the DOM — for a slide-over that already implements the WAI-ARIA
            dialog pattern by hand (focus moved in and trapped above, role,
            aria-modal, an accessible label, Escape to close). Every major
            headless UI library makes the same call for exactly this reason.
          */}
          <motion.aside
            ref={panelRef}
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-modal="true"
            aria-label="Design tokens"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className={cn(
              'fixed inset-y-0 right-0 z-80 flex w-full max-w-[26rem] flex-col',
              'border-l border-[var(--border)] bg-[var(--bg)] shadow-[var(--elev-3)]',
            )}
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Design tokens</h2>
                <p className="text-xs text-muted">
                  Live values — {snapshot?.theme} theme
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close design tokens"
                className="glass rounded-full p-2.5 transition-colors hover:border-accent-500/50"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
              <section>
                <h3 className="mb-3 font-mono text-[10px] tracking-[0.2em] text-accent-400 uppercase">
                  Typefaces
                </h3>
                <ul className="space-y-3">
                  {snapshot?.fonts.map((font) => (
                    <li
                      key={font.varName}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium">{font.label}</p>
                          <p className="text-[11px] text-muted">{font.usage}</p>
                        </div>
                        <CopyButton value={font.stack} />
                      </div>
                      <p className={cn('mt-3 text-xl leading-snug', font.className)}>{font.sample}</p>
                      <p className="mt-2 truncate font-mono text-[10px] text-muted">{font.stack}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {COLOR_GROUPS.map((group) => (
                <section key={group.title}>
                  <h3 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-accent-400 uppercase">
                    {group.title}
                  </h3>
                  <p className="mb-3 text-[11px] text-muted">{group.blurb}</p>
                  <ul className="space-y-2">
                    {group.tokens.map((token) => (
                      <Swatch
                        key={token.varName}
                        {...token}
                        value={snapshot?.colors[token.varName] ?? token.varName}
                      />
                    ))}
                  </ul>
                </section>
              ))}

              <section>
                <h3 className="mb-3 font-mono text-[10px] tracking-[0.2em] text-accent-400 uppercase">
                  Elevation
                </h3>
                <ul className="space-y-3">
                  {ELEVATIONS.map((step) => (
                    <li key={step.varName} className="flex items-center gap-3">
                      <span
                        className="h-12 w-16 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)]"
                        style={{ boxShadow: `var(${step.varName})` }}
                      />
                      <div>
                        <p className="text-[13px] font-medium">{step.label}</p>
                        <p className="text-[11px] text-muted">{step.usage}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

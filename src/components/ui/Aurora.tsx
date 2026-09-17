/** Ambient background: soft colour blobs + a masked grid. Purely decorative. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="animate-float-slow absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-accent-600/20 blur-[120px]" />
      <div
        className="animate-float-slow absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{ background: 'color-mix(in oklab, var(--color-violet-alt) 22%, transparent)', animationDelay: '-6s' }}
      />
      <div
        className="animate-float-slow absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full blur-[140px]"
        style={{ background: 'color-mix(in oklab, var(--color-mint) 14%, transparent)', animationDelay: '-11s' }}
      />
    </div>
  )
}

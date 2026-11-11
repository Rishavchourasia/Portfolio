import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'
import { EASE } from '@/lib/motion'

/** "98" → 98, "25K+" → 25 with suffix "K+", so numbers can count up. */
function parseStat(value: string) {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value)
  return match ? { n: Number(match[1]), suffix: match[2] ?? '' } : null
}

/** Counts a stat like "25K+" up from zero once `run` turns true. */
export function CountUp({ value, run }: { value: string; run: boolean }) {
  const parsed = parseStat(value)
  const target = parsed?.n ?? 0
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const controls = animate(0, target, { duration: reduced ? 0 : 1.8, ease: EASE, onUpdate: setN })
    return () => controls.stop()
  }, [run, target])

  if (!parsed) return <>{value}</>
  return (
    <span aria-label={value} className="tabular-nums">
      <span aria-hidden>
        {Math.round(n)}
        {parsed.suffix}
      </span>
    </span>
  )
}

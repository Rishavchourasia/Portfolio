import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { profile } from '@/content'
import { EASE } from '@/lib/motion'

const CURTAIN = [0.76, 0, 0.24, 1] as const

/** The signature's own coordinate space; the canvas maps back onto it. */
const VIEW = { w: 900, h: 320, x: 450, y: 215, size: 230 }
const SIGNATURE_FONT = '"Mrs Saint Delafield", "Instrument Serif", cursive'

const DRAW_S = 2.1
const DISSOLVE_MS = 1500

type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }

/**
 * Sample the signature's pixels and blow them away as drifting dust, the
 * moment the ink is complete. Drawn on a canvas laid exactly over the SVG.
 */
function dissolve(canvas: HTMLCanvasElement, svg: SVGSVGElement, colors: string[]) {
  const dpr = Math.min(window.devicePixelRatio, 2)
  const rect = svg.getBoundingClientRect()
  const scale = rect.width / VIEW.w
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  ctx.scale(dpr, dpr)

  ctx.font = `${VIEW.size * scale}px ${SIGNATURE_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.fillText(profile.firstName, rect.left + VIEW.x * scale, rect.top + VIEW.y * scale)

  const { data, width } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const step = Math.round(2 * dpr)
  const cx = rect.left + rect.width / 2
  const particles: Particle[] = []
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < width; x += step) {
      if ((data[(y * width + x) * 4 + 3] ?? 0) < 128) continue
      const px = x / dpr
      const py = y / dpr
      particles.push({
        x: px,
        y: py,
        vx: (px - cx) * 0.004 + (Math.random() - 0.5) * 1.4,
        vy: -Math.random() * 1.8 - 0.3,
        life: 0.7 + Math.random() * 0.6,
        size: Math.random() * 1.6 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#fff',
      })
    }
  }

  let frame = 0
  const start = performance.now()
  const tick = (now: number) => {
    const t = (now - start) / DISSOLVE_MS
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      const k = Math.min(1, t / p.life)
      if (k >= 1) continue
      const ease = k * k
      const x = p.x + p.vx * ease * 120 + Math.sin(p.y * 0.05 + t * 6) * 6 * k
      const y = p.y + p.vy * ease * 140
      ctx.globalAlpha = 1 - k
      ctx.fillStyle = p.color
      ctx.fillRect(x, y, p.size, p.size)
    }
    if (t < 1.4) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

/**
 * Opening curtain: the first name is signed in ink while a counter runs to
 * 100, then the signature breaks into dust and the panel lifts away with the
 * hero playing in underneath. Shown once per session, and never under
 * reduced motion (the app starts ready there).
 */
export function Preloader({ ready, markReady }: { ready: boolean; markReady: () => void }) {
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'signing' | 'dust'>('loading')
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ready) return
    let stopDust = () => {}
    let timer = 0
    let cancelled = false
    const counter = animate(0, 100, {
      duration: DRAW_S + 0.25,
      ease: [0.7, 0, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    })

    // Don't start inking until the script face is in, or it signs in Georgia.
    const fontReady = document.fonts?.load(`100px ${SIGNATURE_FONT}`).catch(() => []) ?? Promise.resolve([])
    const loaded = Promise.race([fontReady, new Promise((r) => setTimeout(r, 1200))])
    void loaded.then(() => {
      if (cancelled) return
      setPhase('signing')
      timer = window.setTimeout(() => {
        const svg = svgRef.current
        const canvas = canvasRef.current
        if (svg && canvas) {
          const css = getComputedStyle(document.documentElement)
          const text = css.getPropertyValue('--text').trim() || '#fff'
          const accent = css.getPropertyValue('--color-accent-400').trim() || text
          stopDust = dissolve(canvas, svg, [text, text, text, accent])
        }
        setPhase('dust')
        timer = window.setTimeout(markReady, 650)
      }, (DRAW_S + 0.35) * 1000)
    })

    return () => {
      cancelled = true
      counter.stop()
      stopDust()
      window.clearTimeout(timer)
    }
    // Runs once; `ready` only ever flips from false to true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="preloader"
          aria-hidden
          className="fixed inset-0 z-[90] flex flex-col justify-between overflow-hidden bg-[var(--bg)] p-6 sm:p-8"
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1.1, ease: CURTAIN }}
        >
          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            <span>Portfolio ©{new Date().getFullYear()}</span>
            <span>{profile.location}</span>
          </div>

          <div className="relative flex flex-col items-center">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="w-[min(88vw,760px)] overflow-visible"
            >
              {phase !== 'loading' && (
                <motion.text
                  x={VIEW.x}
                  y={VIEW.y}
                  textAnchor="middle"
                  fontSize={VIEW.size}
                  fontFamily={SIGNATURE_FONT}
                  fill="var(--text)"
                  stroke="var(--text)"
                  strokeWidth={1.4}
                  strokeDasharray={1800}
                  initial={{ strokeDashoffset: 1800, fillOpacity: 0 }}
                  animate={
                    phase === 'dust'
                      ? { opacity: 0, transition: { duration: 0.12 } }
                      : { strokeDashoffset: 0, fillOpacity: 1 }
                  }
                  transition={{
                    strokeDashoffset: { duration: DRAW_S, ease: [0.45, 0, 0.25, 1] },
                    fillOpacity: { duration: 0.7, delay: DRAW_S - 0.6 },
                  }}
                >
                  {profile.firstName}
                </motion.text>
              )}
            </svg>
            <motion.p
              className="-mt-4 font-serif text-[clamp(1.1rem,2.2vw,1.6rem)] text-muted italic"
              initial={{ opacity: 0, y: 12 }}
              animate={phase === 'dust' ? { opacity: 0, y: -12 } : phase === 'signing' ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: phase === 'signing' ? 1 : 0 }}
            >
              {profile.role}, building for the web.
            </motion.p>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="h-px flex-1 self-center bg-[var(--border)]">
              <div className="h-full origin-left bg-accent-500" style={{ transform: `scaleX(${count / 100})` }} />
            </div>
            <span className="font-display text-5xl leading-none font-semibold tabular-nums sm:text-7xl">
              {String(count).padStart(3, '0')}
            </span>
          </div>

          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

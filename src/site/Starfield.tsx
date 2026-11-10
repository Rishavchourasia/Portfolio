import { useEffect, useRef } from 'react'

const COUNT = 170
const RADIUS = 110

/**
 * Faint drifting stars that scatter from the cursor and spring back, so the
 * dark behind the hero feels alive without competing with it.
 */
export function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      size: Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }))

    let w = 0
    let h = 0
    const resize = () => {
      const box = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      w = box.width
      h = box.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: -9999, y: -9999 }
    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      mouse.x = e.clientX - box.left
      mouse.y = e.clientY - box.top
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })
    io.observe(canvas)

    let frame = 0
    const draw = (now: number) => {
      if (!reduced) frame = requestAnimationFrame(draw)
      if (!visible && !reduced) return
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        if (!reduced) s.y -= 0.00009
        if (s.y < 0) s.y = 1
        const px = s.x * w + s.ox
        const py = s.y * h + s.oy
        const dx = px - mouse.x
        const dy = py - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < RADIUS && d > 0) {
          const f = (1 - d / RADIUS) * 2.2
          s.vx += (dx / d) * f
          s.vy += (dy / d) * f
        }
        s.vx = (s.vx - s.ox * 0.04) * 0.88
        s.vy = (s.vy - s.oy * 0.04) * 0.88
        s.ox += s.vx
        s.oy += s.vy
        ctx.globalAlpha = 0.18 + 0.45 * Math.sin(now / 700 + s.phase) ** 2
        ctx.fillStyle = s.size > 1.4 ? '#a99cff' : '#ece6dc'
        ctx.fillRect(px, py, s.size, s.size)
      }
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}

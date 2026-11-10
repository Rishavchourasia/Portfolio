import { useEffect, useRef } from 'react'

const COUNT = 2200

/**
 * A slowly turning cloud of violet points, lumpy rather than a clean sphere,
 * that tilts towards the cursor. Points nearer the viewer are larger and
 * brighter, which is all the 3D the eye needs.
 */
export function ParticleCloud({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Points on a sphere, pushed in and out by a few low-frequency waves so
    // the outline reads as a soft, organic mass.
    const points = Array.from({ length: COUNT }, () => {
      const u = Math.random() * 2 - 1
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      const x = r * Math.cos(a)
      const y = u
      const z = r * Math.sin(a)
      const lump = 1 + 0.18 * Math.sin(x * 3.1 + y * 2.3) + 0.12 * Math.cos(z * 4.2 - y * 1.7)
      const depth = 0.55 + Math.random() * 0.45
      return { x: x * lump * depth, y: y * lump * depth * 1.15, z: z * lump * depth, hue: 245 + Math.random() * 40 }
    })

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      const box = canvas.getBoundingClientRect()
      w = box.width
      h = box.height
      dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()

    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      tilt.tx = (e.clientY / window.innerHeight - 0.5) * 0.8
      tilt.ty = (e.clientX / window.innerWidth - 0.5) * 0.8
    }

    let visible = false
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    io.observe(canvas)

    let frame = 0
    const draw = (now: number) => {
      if (!reduced) frame = requestAnimationFrame(draw)
      if (!visible && !reduced) return
      const t = reduced ? 0 : now / 1000
      tilt.x += (tilt.tx - tilt.x) * 0.04
      tilt.y += (tilt.ty - tilt.y) * 0.04
      const ry = t * 0.18 + tilt.y
      const rx = tilt.x
      const [cy, sy, cx, sx] = [Math.cos(ry), Math.sin(ry), Math.cos(rx), Math.sin(rx)]
      const scale = Math.min(w, h) * 0.38

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const p of points) {
        const breathe = 1 + 0.03 * Math.sin(t * 1.3 + p.y * 4)
        const x1 = p.x * cy - p.z * sy
        const z1 = p.x * sy + p.z * cy
        const y1 = p.y * cx - z1 * sx
        const z2 = p.y * sx + z1 * cx
        const persp = 2.4 / (2.4 - z2)
        const px = w / 2 + x1 * scale * persp * breathe
        const py = h / 2 + y1 * scale * persp * breathe
        const near = (z2 + 1) / 2
        ctx.globalAlpha = 0.15 + near * 0.75
        ctx.fillStyle = `hsl(${p.hue} 90% ${62 + near * 18}%)`
        const s = 0.6 + near * 1.6
        ctx.fillRect(px, py, s, s)
      }
      ctx.globalAlpha = 1
    }
    frame = requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}

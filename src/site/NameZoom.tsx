import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { REDUCED, type Tile } from './zoomTiles'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** 0 → 1 as `v` goes from `a` to `b`. Kept as plain functions: framer-motion hands
 *  range-mapped opacity to the browser's scroll timeline, which misreads nested scrollers. */
const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
const FAMILY = '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif'
const FONT = `800 100px ${FAMILY}`

type Geometry = {
  w: number
  h: number
  size: number
  lines: { text: string; y: number }[]
  /** A point deep inside a letter, so zooming on it opens the whole screen. */
  ox: number
  oy: number
  /** Scale at which that letter's stroke covers the screen. */
  max: number
}

/**
 * Lays the word out to fill the screen, then finds the thickest point of
 * ink near the middle: the zoom is anchored there so the letter's stroke,
 * not a gap between letters, grows to cover the viewport.
 */
function measure(word: string, w: number, h: number): Geometry {
  const words = word.toUpperCase().split(/\s+/)
  const lines = words.length > 1 && word.length > 12 ? words : [words.join(' ')]
  const canvas = document.createElement('canvas')
  const probe = canvas.getContext('2d', { willReadFrequently: true })
  if (!probe) return { w, h, size: 100, lines: [], ox: w / 2, oy: h / 2, max: 60 }
  probe.font = FONT
  const widest = Math.max(...lines.map((l) => probe.measureText(l).width))
  const lead = 0.86
  const size = Math.min((0.9 * w * 100) / widest, (0.66 * h) / (lines.length * lead))
  const block = lines.length * size * lead
  const first = h / 2 - block / 2 + size * 0.74
  const laid = lines.map((text, i) => ({ text, y: first + i * size * lead }))

  // Rasterise at half size and search for the deepest inside point.
  const f = 0.5
  const cw = Math.ceil(w * f)
  const ch = Math.ceil(h * f)
  canvas.width = cw
  canvas.height = ch
  probe.scale(f, f)
  probe.font = FONT.replace('100px', `${size}px`)
  probe.textAlign = 'center'
  probe.textBaseline = 'alphabetic'
  for (const l of laid) probe.fillText(l.text, w / 2, l.y)
  const { data } = probe.getImageData(0, 0, cw, ch)
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < cw && y < ch && (data[(y * cw + x) * 4 + 3] ?? 0) > 128
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]] as const
  let best = { score: -Infinity, x: cw / 2, y: ch / 2, r: 8 }
  for (let y = 0; y < ch; y += 3) {
    for (let x = 0; x < cw; x += 3) {
      if (!inside(x, y)) continue
      let r = Infinity
      for (const [dx, dy] of dirs) {
        let s = 1
        while (s < 160 && inside(Math.round(x + dx * s), Math.round(y + dy * s))) s++
        r = Math.min(r, s)
      }
      const score = r - 0.06 * Math.hypot(x - cw / 2, y - ch / 2)
      if (score > best.score) best = { score, x, y, r }
    }
  }
  const ox = best.x / f
  const oy = best.y / f
  const reach = Math.max(Math.hypot(ox, oy), Math.hypot(w - ox, oy), Math.hypot(ox, h - oy), Math.hypot(w - ox, h - oy))
  return { w, h, size, lines: laid, ox, oy, max: (reach / (best.r / f)) * 1.15 }
}

function DepthLayer({ tile, progress }: { tile: Tile; progress: MotionValue<number> }) {
  // Every layer scales about the screen's centre, so pieces fly outwards as they grow: a dolly zoom.
  const scale = useTransform(progress, (p) => 1 + tile.depth * 2.2 * p ** 1.6)
  return (
    <motion.div className="absolute inset-0" style={{ scale }}>
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ${tile.h ? '[&>*]:aspect-auto [&>*]:h-full' : ''}`}
        style={{ left: `${tile.x}%`, top: `${tile.y}%`, width: `${tile.w}%`, height: tile.h ? `${tile.h}%` : undefined }}
      >
        {tile.node}
      </div>
    </motion.div>
  )
}

/**
 * A word cut out of a dark cover, over a collage of work. Scrolling zooms
 * into one of its letters until the cover is gone, then flies on through
 * the collage. Scrolling back zooms out again.
 *
 * `container` is the scroller when this sits inside one (a case study);
 * leave it out on the page itself. `endDim` is how dark the collage gets by
 * the end, 1 to hand over to a dark section that follows.
 */
export function NameZoom({
  word,
  label,
  id,
  tiles,
  hue,
  caption,
  container,
  endDim = 0.35,
  heightClass = 'h-[340svh]',
}: {
  word: string
  label: string
  id: string
  tiles: Tile[]
  hue: number
  caption: ReactNode
  container?: RefObject<HTMLDivElement | null>
  endDim?: number
  heightClass?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ container, target: ref, offset: ['start start', 'end end'] })
  const [geo, setGeo] = useState<Geometry | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = () => {
      const el = ref.current?.firstElementChild
      if (!(el instanceof HTMLElement) || cancelled) return
      setGeo(measure(word, el.clientWidth, el.clientHeight))
    }
    void document.fonts.load(FONT).catch(() => []).then(run)
    window.addEventListener('resize', run)
    return () => {
      cancelled = true
      window.removeEventListener('resize', run)
    }
  }, [word])

  // The first 40% of the scroll opens the word; the rest flies through the collage.
  const maskScale = useTransform(p, (v) => (geo ? geo.max ** clamp01(v / 0.4) : 1))
  const maskOpacity = useTransform(p, (v) => 1 - ramp(v, 0.36, 0.42))
  const captionOpacity = useTransform(p, (v) => 1 - ramp(v, 0, 0.08))
  const dim = useTransform(p, (v) => endDim * ramp(v, 0.6, 1))
  const outline = useTransform(p, (v) => 0.7 * (1 - ramp(v, 0, 0.05)))

  return (
    <section ref={ref} aria-label={label} className={`relative ${REDUCED ? 'h-[100svh]' : heightClass}`}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(70% 60% at 50% 50%, hsl(${hue} 60% 38%), transparent 75%),
                         radial-gradient(50% 50% at 85% 15%, hsl(${(hue + 60) % 360} 70% 45% / 0.6), transparent 70%),
                         var(--color-ink-900)`,
          }}
        />
        {tiles.map((tile) => (
          <DepthLayer key={`${tile.x}-${tile.y}`} tile={tile} progress={p} />
        ))}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--color-ink-950)]" style={{ opacity: dim }} />

        {/* The cover with the word cut out of it. Until it is measured, the cover is solid. */}
        {REDUCED ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <p className="px-gutter text-center text-[clamp(3rem,12vw,10rem)] leading-[0.86] font-extrabold uppercase">{word}</p>
          </div>
        ) : geo ? (
          <motion.svg
            aria-hidden
            width={geo.w}
            height={geo.h}
            className="pointer-events-none absolute inset-0"
            style={{ scale: maskScale, opacity: maskOpacity, transformOrigin: `${geo.ox}px ${geo.oy}px` }}
          >
            <defs>
              <mask id={`zoom-${id}`}>
                <rect width={geo.w} height={geo.h} fill="white" />
                {geo.lines.map((l) => (
                  <text key={l.text} x={geo.w / 2} y={l.y} textAnchor="middle" fontFamily={FAMILY} fontWeight={800} fontSize={geo.size} fill="black">
                    {l.text}
                  </text>
                ))}
              </mask>
            </defs>
            <rect width={geo.w} height={geo.h} fill="var(--color-ink-950)" mask={`url(#zoom-${id})`} />
            {/* A hairline round the letters, so the word reads before the zoom starts. */}
            <motion.g style={{ opacity: outline }} fill="none" stroke="var(--color-cream)" strokeWidth={1.2}>
              {geo.lines.map((l) => (
                <text key={l.text} x={geo.w / 2} y={l.y} textAnchor="middle" fontFamily={FAMILY} fontWeight={800} fontSize={geo.size}>
                  {l.text}
                </text>
              ))}
            </motion.g>
          </motion.svg>
        ) : (
          <div className="absolute inset-0 bg-[var(--color-ink-950)]" />
        )}

        <motion.div style={{ opacity: captionOpacity }} className="absolute inset-x-[var(--gutter)] bottom-8 flex items-end justify-between gap-6">
          {caption}
          {!REDUCED && <p className="text-right text-[11px] font-bold tracking-[0.2em] text-muted uppercase">Scroll to zoom in</p>}
        </motion.div>
      </div>
    </section>
  )
}

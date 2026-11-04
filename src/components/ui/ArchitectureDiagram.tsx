import { useId } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Architecture, ArchitectureEdge, ArchitectureNode, NodeSide } from '@/types/content'

/** Same 16:10 as the preview frame, so the diagram fills it edge to edge. */
const VIEW_W = 800
const VIEW_H = 500

const DEFAULT_W = 150
const HEAD_H = 58
const CHIP_H = 22
const CHIP_GAP = 6
const CHIP_MIN_W = 96
const PAD = 10

type Box = ArchitectureNode & { w: number; h: number; left: number; right: number; top: number; bottom: number; cols: number }

function layout(node: ArchitectureNode): Box {
  const w = node.w ?? DEFAULT_W
  const n = node.items?.length ?? 0
  const cols = n ? Math.max(1, Math.min(n, Math.floor((w - PAD * 2 + CHIP_GAP) / (CHIP_MIN_W + CHIP_GAP)))) : 1
  const rows = n ? Math.ceil(n / cols) : 0
  const h = HEAD_H + (rows ? rows * (CHIP_H + CHIP_GAP) + PAD - CHIP_GAP : 0)
  return { ...node, w, h, cols, left: node.x - w / 2, right: node.x + w / 2, top: node.y - h / 2, bottom: node.y + h / 2 }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const NORMAL: Record<NodeSide, [number, number]> = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] }
const OPPOSITE: Record<NodeSide, NodeSide> = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }

/**
 * Boxes that share a column connect top-to-bottom and boxes that share a row
 * connect side-to-side, so those lines run straight; anything else goes along
 * whichever axis it travels further.
 */
function autoSides(a: Box, b: Box): [NodeSide, NodeSide] {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const shareColumn = a.left < b.right && b.left < a.right
  const shareRow = a.top < b.bottom && b.top < a.bottom
  const vertical = shareColumn !== shareRow ? shareColumn : Math.abs(dy) > Math.abs(dx)
  const side: NodeSide = vertical ? (dy > 0 ? 'bottom' : 'top') : dx > 0 ? 'right' : 'left'
  return [side, OPPOSITE[side]]
}

const pointOn = (box: Box, side: NodeSide, t: number): [number, number] =>
  side === 'left' ? [box.left, t] : side === 'right' ? [box.right, t] : side === 'top' ? [t, box.top] : [t, box.bottom]

/**
 * Where a connection meets a side. When two boxes overlap along that side,
 * both ends share one coordinate inside the overlap so the line runs straight;
 * otherwise each end leans towards the other box.
 */
function anchors(a: Box, aSide: NodeSide, b: Box, bSide: NodeSide) {
  const vertical = aSide === 'top' || aSide === 'bottom'
  const inset = vertical ? 20 : 14
  const [aLo, aHi] = vertical ? [a.left + inset, a.right - inset] : [a.top + inset, a.bottom - inset]
  const [bLo, bHi] = vertical ? [b.left + inset, b.right - inset] : [b.top + inset, b.bottom - inset]
  const [aC, bC] = vertical ? [a.x, b.x] : [a.y, b.y]
  const lo = Math.max(aLo, bLo)
  const hi = Math.min(aHi, bHi)
  const aT = lo <= hi && aSide === OPPOSITE[bSide] ? clamp((aC + bC) / 2, lo, hi) : clamp(bC, aLo, aHi)
  const bT = lo <= hi && aSide === OPPOSITE[bSide] ? aT : clamp(aC, bLo, bHi)
  return [pointOn(a, aSide, aT), pointOn(b, bSide, bT)] as const
}

function route(edge: ArchitectureEdge, boxes: Map<string, Box>) {
  const a = boxes.get(edge.from)
  const b = boxes.get(edge.to)
  if (!a || !b) return null
  const [autoFrom, autoTo] = autoSides(a, b)
  const fromSide = edge.fromSide ?? autoFrom
  const toSide = edge.toSide ?? autoTo
  const [[x1, y1], [x2, y2]] = anchors(a, fromSide, b, toSide)
  const k = Math.max(24, Math.hypot(x2 - x1, y2 - y1) * 0.4)
  const [n1x, n1y] = NORMAL[fromSide]
  const [n2x, n2y] = NORMAL[toSide]
  const [c1x, c1y] = [x1 + n1x * k, y1 + n1y * k]
  const [c2x, c2y] = [x2 + n2x * k, y2 + n2y * k]
  // Midpoint of the cubic at t = 0.5, where the label sits.
  const mx = (x1 + 3 * c1x + 3 * c2x + x2) / 8
  const my = (y1 + 3 * c1y + 3 * c2y + y2) / 8
  return { d: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`, mx, my }
}

const KIND_STROKE: Record<ArchitectureNode['kind'], string> = {
  client: 'var(--border-strong)',
  edge: 'var(--border-strong)',
  service: 'color-mix(in oklab, var(--color-accent-500) 70%, transparent)',
  data: 'color-mix(in oklab, var(--color-mint) 70%, transparent)',
  queue: 'color-mix(in oklab, var(--color-violet-alt) 75%, transparent)',
  external: 'color-mix(in oklab, var(--text-muted) 60%, transparent)',
}

const KIND_DOT: Record<ArchitectureNode['kind'], string> = {
  client: 'var(--text-muted)',
  edge: 'var(--text-muted)',
  service: 'var(--color-accent-500)',
  data: 'var(--color-mint)',
  queue: 'var(--color-violet-alt)',
  external: 'var(--text-muted)',
}

/** Animated flow diagram of a project's architecture, drawn from content JSON. */
export function ArchitectureDiagram({ title, architecture }: { title: string; architecture: Architecture }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const arrowId = `arch-arrow-${useId().replace(/[^\w-]/g, "")}`
  const boxes = new Map(architecture.nodes.map((node) => [node.id, layout(node)]))
  const label = (id: string) => boxes.get(id)?.label ?? id
  const summary = architecture.edges
    .map((e) => `${label(e.from)} to ${label(e.to)}${e.label ? ` (${e.label})` : ''}`)
    .join('; ')

  const nodeDelay = (i: number) => (reducedMotion ? 0 : 0.05 + i * 0.06)
  const edgeDelay = (i: number) => (reducedMotion ? 0 : 0.35 + i * 0.08)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}
    >
      <title>{`${title} architecture: ${summary}.`}</title>
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" fill="color-mix(in oklab, var(--text-muted) 80%, transparent)" />
        </marker>
      </defs>

      {architecture.edges.map((edge, i) => {
        const r = route(edge, boxes)
        if (!r) return null
        const dur = 2.4 + (i % 3) * 0.4
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <motion.path
              d={r.d}
              fill="none"
              stroke="color-mix(in oklab, var(--text) 26%, transparent)"
              strokeWidth={1.6}
              markerEnd={`url(#${arrowId})`}
              markerStart={edge.bidirectional ? `url(#${arrowId})` : undefined}
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: edgeDelay(i), ease: EASE }}
            />
            {!reducedMotion && (
              <>
                <circle r={3.6} fill="var(--color-accent-500)" opacity={0}>
                  <animateMotion dur={`${dur}s`} begin={`${edgeDelay(i) + 0.7}s`} repeatCount="indefinite" path={r.d} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${dur}s`} begin={`${edgeDelay(i) + 0.7}s`} repeatCount="indefinite" />
                </circle>
                {edge.bidirectional && (
                  <circle r={3.6} fill="var(--color-violet-alt)" opacity={0}>
                    <animateMotion dur={`${dur}s`} begin={`${edgeDelay(i) + 0.7 + dur / 2}s`} repeatCount="indefinite" path={r.d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${dur}s`} begin={`${edgeDelay(i) + 0.7 + dur / 2}s`} repeatCount="indefinite" />
                  </circle>
                )}
              </>
            )}
            {edge.label && (
              <motion.text
                x={r.mx}
                y={r.my}
                dy={-7}
                textAnchor="middle"
                fontSize={13}
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
                stroke="var(--bg)"
                strokeWidth={5}
                paintOrder="stroke"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: edgeDelay(i) + 0.5 }}
              >
                {edge.label}
              </motion.text>
            )}
          </g>
        )
      })}

      {[...boxes.values()].map((box, i) => (
        <motion.g
          key={box.id}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: nodeDelay(i), ease: EASE }}
        >
          <rect
            x={box.left}
            y={box.top}
            width={box.w}
            height={box.h}
            rx={12}
            fill="color-mix(in oklab, var(--text) 5%, var(--bg))"
            stroke={KIND_STROKE[box.kind]}
            strokeWidth={1.5}
            strokeDasharray={box.kind === 'external' ? '5 4' : undefined}
          />
          <circle cx={box.left + 16} cy={box.top + (box.sub ? 21 : HEAD_H / 2)} r={4} fill={KIND_DOT[box.kind]} />
          <text
            x={box.left + 28}
            y={box.top + (box.sub ? 26 : HEAD_H / 2 + 6)}
            fontSize={17}
            fontWeight={600}
            fill="var(--text)"
          >
            {box.label}
          </text>
          {box.sub && (
            <text x={box.left + 16} y={box.top + 46} fontSize={12.5} fill="var(--text-muted)">
              {box.sub}
            </text>
          )}
          {box.items?.map((item, j) => {
            const chipW = (box.w - PAD * 2 - CHIP_GAP * (box.cols - 1)) / box.cols
            const cx = box.left + PAD + (j % box.cols) * (chipW + CHIP_GAP)
            const cy = box.top + HEAD_H + Math.floor(j / box.cols) * (CHIP_H + CHIP_GAP)
            return (
              <g key={item}>
                <rect
                  x={cx}
                  y={cy}
                  width={chipW}
                  height={CHIP_H}
                  rx={6}
                  fill="color-mix(in oklab, var(--color-accent-500) 12%, transparent)"
                  stroke="color-mix(in oklab, var(--color-accent-500) 30%, transparent)"
                />
                <text x={cx + chipW / 2} y={cy + 15} textAnchor="middle" fontSize={12} fill="var(--text)">
                  {item}
                </text>
              </g>
            )
          })}
        </motion.g>
      ))}
    </svg>
  )
}

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Orb = {
  /** Offset from the active hue, so the trio always harmonises. */
  hueShift: number
  size: string
  /** Base position in percent. */
  x: number
  y: number
  opacity: number
  duration: number
  delay: number
}

const ORBS: Orb[] = [
  { hueShift: 0, size: '42rem', x: -12, y: -18, opacity: 0.32, duration: 19, delay: 0 },
  { hueShift: 62, size: '36rem', x: 78, y: 28, opacity: 0.28, duration: 23, delay: -7 },
  { hueShift: -48, size: '30rem', x: 26, y: 82, opacity: 0.22, duration: 27, delay: -13 },
]

type Props = {
  hue: number
  drift: { x: number; y: number }
  animate: boolean
}

/** Three blurred colour orbs that re-tint and re-position per slide. */
export function OrbField({ hue, drift, animate }: Props) {
  return (
    <>
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={cn('absolute rounded-full blur-[130px] will-change-transform')}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          initial={false}
          animate={{
            backgroundColor: `hsl(${hue + orb.hueShift} 85% 58% / ${orb.opacity})`,
            x: `${drift.x * (i + 1) * 0.6}%`,
            y: `${drift.y * (i + 1) * 0.4}%`,
          }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {animate && (
            <motion.div
              className="h-full w-full rounded-full"
              animate={{ scale: [1, 1.14, 1] }}
              transition={{
                duration: orb.duration,
                delay: orb.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useDeck } from './DeckContext'

/** "Scroll" affordance on the first slide; retires once the user moves. */
export function SlideHint() {
  const { hasMoved, next } = useDeck()

  return (
    <AnimatePresence>
      {!hasMoved && (
        <motion.button
          onClick={next}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit flex-col items-center gap-1.5 text-muted transition-colors hover:text-accent-400"
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

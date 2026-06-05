/**
 * FeedbackFlash — full-screen colour overlay for correct / wrong feedback.
 *
 * Mount it inside the game view. Pass state='correct' or 'wrong' to trigger
 * the flash; 'idle' renders nothing.
 *
 * The flash auto-dismisses via the animation duration — no need for the
 * parent to reset it unless you want to re-trigger.
 *
 * Uses AnimatePresence from framer-motion for the enter/exit transition.
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';

type FlashState = 'correct' | 'wrong' | 'idle';

interface FeedbackFlashProps {
  state: FlashState;
}

const OVERLAY: Record<Exclude<FlashState, 'idle'>, string> = {
  correct: 'rgba(57, 255, 136, 0.18)',   // --color-lime
  wrong:   'rgba(255, 59,  59,  0.22)',  // --color-red-glow
};

const ICON: Record<Exclude<FlashState, 'idle'>, string> = {
  correct: '✓',
  wrong:   '✗',
};

const ICON_COLOR: Record<Exclude<FlashState, 'idle'>, string> = {
  correct: 'var(--color-lime)',
  wrong:   'var(--color-red-glow)',
};

export function FeedbackFlash({ state }: FeedbackFlashProps) {
  const visible = state !== 'idle';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, exit: { duration: 0.3 } }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: OVERLAY[state] }}
          aria-live="assertive"
          aria-label={state === 'correct' ? '¡Correcto!' : 'Incorrecto'}
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-8xl font-[family-name:var(--font-display)]"
            style={{ color: ICON_COLOR[state] }}
            aria-hidden
          >
            {ICON[state]}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

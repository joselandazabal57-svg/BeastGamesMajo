/**
 * SpinButton — the chunky gold spin button (T04 §B.5.4).
 *
 * Three exact states:
 *   - available: "¡GIRAR!" gold gradient + hard shadow + subtle shimmer
 *   - spinning:  "GIRANDO…" disabled, 80% opacity
 *   - none:      "SIN GIROS POR HOY" gray, no shadow, disabled
 */

'use client';

import { motion } from 'framer-motion';

type SpinButtonState = 'available' | 'spinning' | 'none';

interface SpinButtonProps {
  state: SpinButtonState;
  onSpin: () => void;
}

export function SpinButton({ state, onSpin }: SpinButtonProps) {
  const disabled = state !== 'available';

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!disabled) onSpin();
      }}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97, y: 3 }}
      className="relative w-full h-16 rounded-[20px] overflow-hidden cursor-pointer disabled:cursor-not-allowed"
      style={{
        fontFamily: 'var(--font-display), system-ui, sans-serif',
        fontSize: '26px',
        letterSpacing: '0.04em',
        ...(state === 'none'
          ? {
              background: 'var(--color-panel-2)',
              color: 'var(--color-ink-dim)',
              boxShadow: 'none',
            }
          : {
              background: 'linear-gradient(180deg, var(--color-gold), var(--color-gold-2))',
              color: '#1A0E00',
              boxShadow: '0 6px 0 #B35E00',
              opacity: state === 'spinning' ? 0.8 : 1,
            }),
      }}
      aria-label={
        state === 'available' ? 'Girar la ruleta' : state === 'spinning' ? 'Girando' : 'Sin giros por hoy'
      }
    >
      {state === 'available' ? '¡GIRAR!' : state === 'spinning' ? 'GIRANDO…' : 'SIN GIROS POR HOY'}

      {/* Subtle shimmer sweep every 3s when available */}
      {state === 'available' && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,.45), transparent)',
          }}
          initial={{ left: '-20%' }}
          animate={{ left: '120%' }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 2.1, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}

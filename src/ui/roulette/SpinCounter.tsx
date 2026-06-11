/**
 * SpinCounter — pill showing available spins (T04 §B.5.2).
 *
 * Exact copy:
 *   with spins:    "✨ Tienes N giros" (N in gold)
 *   without spins: "⏰ Vuelve mañana por tu giro gratis"
 *                  + "o gana una ronda con 8 aciertos ⭐"
 */

'use client';

interface SpinCounterProps {
  spins: number;
}

export function SpinCounter({ spins }: SpinCounterProps) {
  return (
    <div
      className="mx-auto px-5 py-2.5 rounded-full text-center"
      style={{
        background: 'var(--color-panel-2)',
        fontFamily: 'var(--font-body), system-ui, sans-serif',
        fontWeight: 600,
        fontSize: '16px',
      }}
    >
      {spins > 0 ? (
        <span>
          ✨ Tienes{' '}
          <span style={{ color: 'var(--color-gold)' }}>{spins}</span>{' '}
          {spins === 1 ? 'giro' : 'giros'}
        </span>
      ) : (
        <span className="flex flex-col gap-0.5">
          <span>⏰ Vuelve mañana por tu giro gratis</span>
          <span style={{ fontSize: '13px', color: 'var(--color-ink-dim)', fontWeight: 400 }}>
            o gana una ronda con 8 aciertos ⭐
          </span>
        </span>
      )}
    </div>
  );
}

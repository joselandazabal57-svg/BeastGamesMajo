/**
 * CoinBadge — shows a coin count with optional pulse animation on change.
 *
 * Can be wired to the prize ledger (total coins) or the transient game
 * score. Caller decides which value to pass.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface CoinBadgeProps {
  coins: number;
  /** Show the delta "+N" bubble when value increases. Default true. */
  showDelta?: boolean;
  className?: string;
}

export function CoinBadge({
  coins,
  showDelta = true,
  className = '',
}: CoinBadgeProps) {
  const prev = useRef(coins);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    const diff = coins - prev.current;
    prev.current = coins;
    if (diff <= 0 || !showDelta) return;
    setDelta(diff);
    const t = setTimeout(() => setDelta(null), 1200);
    return () => clearTimeout(t);
  }, [coins, showDelta]);

  return (
    <span
      className={['relative inline-flex items-center gap-1.5', className].join(
        ' ',
      )}
    >
      <span aria-hidden className="text-lg leading-none">
        🪙
      </span>
      <span
        className="font-[family-name:var(--font-display)] text-lg leading-none text-(--color-gold)"
        aria-label={`${coins} monedas`}
      >
        {coins.toLocaleString('es')}
      </span>

      {delta !== null && (
        <span
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-(--color-lime) animate-bounce pointer-events-none"
          aria-live="polite"
        >
          +{delta}
        </span>
      )}
    </span>
  );
}

/**
 * PrizeLadder — vertical display of the 10-rung prize ladder.
 *
 * Rendered top-to-bottom with the highest prize (rung 9) at the top so the
 * "climb" metaphor reads naturally on screen.
 *
 * Props:
 *  - currentRung: the rung the player just reached (0-based). Pass -1 before
 *    the first correct answer (no rung highlighted).
 *  - compact: if true, shows a narrower, scrollable version (for sidebar use).
 */

'use client';

import { PRIZES, type Prize } from '@/domain/scoring/prizeLadder';

interface PrizeLadderProps {
  currentRung?: number;
  compact?: boolean;
  className?: string;
}

export function PrizeLadder({
  currentRung = -1,
  compact = false,
  className = '',
}: PrizeLadderProps) {
  // Reverse so highest prize appears at the top.
  const reversed = [...PRIZES].reverse() as Prize[];

  return (
    <ol
      className={['flex flex-col gap-0.5', className].join(' ')}
      aria-label="Escalera de premios"
    >
      {reversed.map((prize) => {
        const isActive = prize.rung === currentRung;
        const isPassed = prize.rung < currentRung;

        return (
          <li
            key={prize.rung}
            aria-current={isActive ? 'step' : undefined}
            className={[
              'flex items-center gap-3 rounded-lg px-3 transition-all duration-200',
              compact ? 'py-1.5' : 'py-2',
              isActive
                ? 'bg-(--color-gold)/20 border border-(--color-gold) shadow-[0_0_12px_var(--color-gold)/30]'
                : 'border border-transparent',
              isPassed ? 'opacity-40' : '',
            ].join(' ')}
          >
            {/* Rung number */}
            <span
              className={[
                'flex-none w-6 text-center text-xs font-bold',
                isActive ? 'text-(--color-gold)' : 'text-white/30',
              ].join(' ')}
            >
              {prize.rung + 1}
            </span>

            {/* Prize emoji */}
            <span className="flex-none text-xl leading-none" aria-hidden>
              {prize.emoji}
            </span>

            {/* Prize title */}
            <span
              className={[
                'flex-1 text-sm font-semibold',
                compact ? 'truncate' : '',
                isActive ? 'text-(--color-gold)' : 'text-white/70',
              ].join(' ')}
            >
              {prize.title}
            </span>

            {/* Coin value */}
            {!compact && (
              <span className="flex-none text-xs text-white/40 font-mono">
                {prize.coins.toLocaleString('es')}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

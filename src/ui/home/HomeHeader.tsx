/**
 * HomeHeader — sticky top bar for the home screen.
 *
 * Shows the app title, coins from the prize ledger, trophy count (if any),
 * and the audio toggle.
 */

'use client';

import { useProgressStore } from '@/state';
import { CoinBadge, AudioToggle } from '@/ui/shared';

export function HomeHeader() {
  const coins = useProgressStore((s) => s.prizeLedger.coins);
  const trophies = useProgressStore((s) => s.prizeLedger.trophies);

  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      {/* Title */}
      <div className="flex flex-col leading-none">
        <h1
          className="font-[family-name:var(--font-display)] text-4xl uppercase"
          style={{
            background: 'linear-gradient(180deg,#ffffff,var(--color-gold))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Beast Games
        </h1>
        {trophies > 0 && (
          <span className="text-xs text-(--color-gold)/60 font-semibold mt-0.5">
            🏆 {trophies} {trophies === 1 ? 'trofeo' : 'trofeos'}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <CoinBadge coins={coins} />
        <AudioToggle />
      </div>
    </header>
  );
}

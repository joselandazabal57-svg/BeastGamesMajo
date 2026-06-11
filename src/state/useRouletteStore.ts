/**
 * useRouletteStore — reactive cache of the Ruleta Bestial state.
 *
 * Source of truth: tasks_for_AI/T04-ruleta-navegacion.md §B.
 *
 * CRITICAL ORDER (T04 §B.5 estados borde): decide → persist → animate.
 * `spinWheel()` decides the prize, persists it (consuming the spin and
 * applying instant awards) and only THEN returns the segment so the UI can
 * animate. If the app dies mid-animation, the prize is already safe in
 * Dexie (`pendingPrizeId`) and the reveal is shown on next visit.
 */

'use client';

import { create } from 'zustand';
import { spin, segmentById, type Segment } from '@/domain/roulette/wheel';
import { POWERUPS, type PowerupId } from '@/domain/shop/powerups';
import { rouletteRepo } from '@/infra/db/repos';
import { inventoryRepo } from '@/infra/db/repos';
import { useProgressStore } from './useProgressStore';
import { useInventoryStore } from './useInventoryStore';

/** Today's date as 'YYYY-MM-DD' in the device's local timezone. */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Reward paid for the bonus question (reto sorpresa). */
export const RETO_WIN_COINS = 400;
export const RETO_CONSOLATION_COINS = 50;

type RouletteState = {
  lastFreeSpinDay: string;
  earnedSpins: number;
  pendingX2: boolean;
  /** Prize decided+persisted but not yet revealed. Null = none. */
  pendingPrizeId: string | null;
  /** For the powerup prize: which powerup was granted (transient, for the reveal copy). */
  lastGrantedPowerup: PowerupId | null;
  loaded: boolean;
};

type RouletteActions = {
  loadFromDb: () => Promise<void>;
  /** Spins available right now (recomputed against today's local date). */
  availableSpins: () => number;
  /**
   * Full spin flow: decide → persist (consume spin + instant award +
   * pendingPrize) → return segment for the UI to animate.
   * Throws if no spins available.
   */
  spinWheel: () => Promise<Segment>;
  /** Player acknowledged the reveal (non-reto prizes). Clears pending. */
  confirmReveal: () => Promise<void>;
  /** Resolve the reto bonus question: pays 400/50 and clears pending. */
  resolveReto: (correct: boolean) => Promise<void>;
  /** Grant an earned spin (round with ≥8/10 correct). Cap 3. */
  grantSpinForRound: () => Promise<void>;
  /**
   * Consume the pending x2 for a starting round. Returns true if it was
   * pending (caller applies coinMultiplier 2 to the round).
   */
  consumePendingX2: () => Promise<boolean>;
  reset: () => void;
};

const INITIAL: RouletteState = {
  lastFreeSpinDay: '',
  earnedSpins: 0,
  pendingX2: false,
  pendingPrizeId: null,
  lastGrantedPowerup: null,
  loaded: false,
};

export const useRouletteStore = create<RouletteState & RouletteActions>(
  (set, get) => ({
    ...INITIAL,

    async loadFromDb() {
      const row = await rouletteRepo.get();
      set({
        lastFreeSpinDay: row.lastFreeSpinDay,
        earnedSpins: row.earnedSpins,
        pendingX2: row.pendingX2,
        pendingPrizeId: row.pendingPrizeId,
        loaded: true,
      });
    },

    availableSpins() {
      const s = get();
      const daily = s.lastFreeSpinDay !== todayLocalISO() ? 1 : 0;
      return daily + s.earnedSpins;
    },

    async spinWheel() {
      // 1. DECIDE — the outcome is fixed before any animation starts.
      const segment = spin(Math.random);

      // 2. PERSIST — consume the spin first (throws if none available).
      const today = todayLocalISO();
      const afterConsume = await rouletteRepo.consumeSpin(today);

      // Apply instant awards now so a mid-animation crash can't lose them.
      let grantedPowerup: PowerupId | null = null;
      switch (segment.kind) {
        case 'coins':
        case 'bestial':
          await useProgressStore.getState().addCoins(segment.value);
          break;
        case 'powerup': {
          const pick = POWERUPS[Math.floor(Math.random() * POWERUPS.length)]!;
          grantedPowerup = pick.id;
          await inventoryRepo.add(pick.id, 1);
          await useInventoryStore.getState().loadFromDb();
          break;
        }
        case 'x2-next':
          await rouletteRepo.setPendingX2(true);
          break;
        case 'reto':
          // Nothing to award yet — paid when the bonus question is answered.
          break;
      }
      await rouletteRepo.setPendingPrize(segment.id);

      set({
        lastFreeSpinDay: afterConsume.lastFreeSpinDay,
        earnedSpins: afterConsume.earnedSpins,
        pendingX2: segment.kind === 'x2-next' ? true : get().pendingX2,
        pendingPrizeId: segment.id,
        lastGrantedPowerup: grantedPowerup,
      });

      // 3. The caller ANIMATES landing exactly on `segment`.
      return segment;
    },

    async confirmReveal() {
      await rouletteRepo.setPendingPrize(null);
      set({ pendingPrizeId: null, lastGrantedPowerup: null });
    },

    async resolveReto(correct) {
      const coins = correct ? RETO_WIN_COINS : RETO_CONSOLATION_COINS;
      await useProgressStore.getState().addCoins(coins);
      await rouletteRepo.setPendingPrize(null);
      set({ pendingPrizeId: null });
    },

    async grantSpinForRound() {
      const row = await rouletteRepo.grantEarnedSpin();
      set({ earnedSpins: row.earnedSpins });
    },

    async consumePendingX2() {
      if (!get().pendingX2) return false;
      await rouletteRepo.setPendingX2(false);
      set({ pendingX2: false });
      return true;
    },

    reset: () => set(INITIAL),
  }),
);

export { segmentById };

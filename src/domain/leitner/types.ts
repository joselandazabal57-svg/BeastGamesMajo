/**
 * Leitner domain types.
 *
 * Source of truth: docs/hltc-beast-games.md §5.4
 * No I/O, no React, no Dexie. Pure data shapes.
 */

export type Box = 0 | 1 | 2 | 3 | 4;

export type ItemId = string;

/**
 * Per-item adaptive state.
 *
 * Invariants:
 * - `box` in [0..4]
 * - `sessionsUntilReview >= 0`
 * - `consecutiveCorrect >= 0`
 * - `totalSeen >= totalWrong >= 0`
 * - `totalSeen` and `totalWrong` are monotonically non-decreasing
 */
export type LeitnerState = {
  itemId: ItemId;
  box: Box;
  sessionsUntilReview: number;
  consecutiveCorrect: number;
  totalSeen: number;
  totalWrong: number;
  /** Unix ms timestamp of the last time this item was answered. */
  lastSeenAt: number;
};

/**
 * Minimal item shape needed by the Leitner engine.
 *
 * The full Item type lives in `src/content/types.ts` (added in F9).
 * The engine only requires `id` to operate; richer fields are passed through.
 */
export type LeitnerItem = {
  id: ItemId;
};

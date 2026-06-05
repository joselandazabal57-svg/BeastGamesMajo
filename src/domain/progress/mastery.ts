/**
 * Progress / mastery aggregation.
 *
 * Source of truth: docs/hltc-beast-games.md §12 (success criteria) + T3.4-T3.5.
 *
 * Pure functions over `LeitnerState[]`. No I/O.
 */

import type { LeitnerState } from '@/domain/leitner/types';

export type ModuleMastery = {
  masteredCount: number;
  inProgressCount: number;
  weakCount: number;
  /** Integer 0..100. */
  masteryPercent: number;
};

/**
 * T3.4 — Aggregate per-module mastery counters.
 *
 * Definitions (HLTC):
 *   - mastered:   box >= 3 AND consecutiveCorrect >= 3
 *   - weak:       totalWrong >= 2 AND box <= 1
 *   - inProgress: everything else (including fresh items never answered)
 *
 * `masteryPercent` = round(100 * masteredCount / total). Empty input returns 0.
 */
export function moduleMastery(
  states: readonly LeitnerState[],
): ModuleMastery {
  if (states.length === 0) {
    return {
      masteredCount: 0,
      inProgressCount: 0,
      weakCount: 0,
      masteryPercent: 0,
    };
  }

  let mastered = 0;
  let weak = 0;
  for (const s of states) {
    if (s.box >= 3 && s.consecutiveCorrect >= 3) {
      mastered++;
    } else if (s.totalWrong >= 2 && s.box <= 1) {
      weak++;
    }
  }
  const inProgress = states.length - mastered - weak;
  return {
    masteredCount: mastered,
    inProgressCount: inProgress,
    weakCount: weak,
    masteryPercent: Math.round((100 * mastered) / states.length),
  };
}

/**
 * Per-table accuracy for the `tablas` module.
 * Returns one entry per multiplication table from 2 to 9.
 * Each value is the percentage of correct answers seen for items that involve
 * that table number (either as the first or second factor — items 7×8 and 8×7
 * are tracked separately but contribute to both 7 and 8 here).
 *
 * Used to evaluate the ≥90% success criterion (HLTC §12.7).
 */
export type TableNumber = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * T3.5 — Compute % accuracy per multiplication table (2..9).
 *
 * Item id convention from F9: `tablas.mult.AxB` where A,B in [2..9].
 * Items not matching this pattern are ignored.
 *
 * Accuracy = (totalSeen - totalWrong) / totalSeen, * 100, rounded to int.
 * A table with zero seen items reports 0.
 */
export function tableMasteryForTablas(
  states: readonly LeitnerState[],
): Record<TableNumber, number> {
  const seen: Record<TableNumber, number> = blank();
  const correct: Record<TableNumber, number> = blank();

  const itemPattern = /^tablas\.mult\.(\d+)x(\d+)$/;

  for (const s of states) {
    const m = itemPattern.exec(s.itemId);
    if (!m) continue;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (!isTableNumber(a) || !isTableNumber(b)) continue;

    const right = s.totalSeen - s.totalWrong;
    seen[a] += s.totalSeen;
    seen[b] += s.totalSeen;
    correct[a] += right;
    correct[b] += right;
  }

  const out: Record<TableNumber, number> = blank();
  for (const k of [2, 3, 4, 5, 6, 7, 8, 9] as const) {
    out[k] = seen[k] === 0 ? 0 : Math.round((100 * correct[k]) / seen[k]);
  }
  return out;
}

function blank(): Record<TableNumber, number> {
  return { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

function isTableNumber(n: number): n is TableNumber {
  return Number.isInteger(n) && n >= 2 && n <= 9;
}

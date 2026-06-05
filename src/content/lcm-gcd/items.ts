/**
 * MCM / MCD content bank — F12.
 *
 * 64 items split evenly between:
 *   32 MCD (Greatest Common Divisor) items — prompt target: 'mcd'
 *   32 MCM (Least Common Multiple) items  — prompt target: 'mcm'
 *
 * Item ID conventions:
 *   MCD → `mcm-mcd.mcd.${a}-${b}`  (a < b, gcd(a,b) > 1)
 *   MCM → `mcm-mcd.mcm.${a}-${b}`  (a < b, lcm(a,b) ≤ 70)
 *
 * Difficulty scale (same for both types):
 *   1 = Easy   — result is obvious / one divides the other
 *   2 = Medium — shared factor requires recognition
 *   3 = Hard   — larger numbers, Euclidean algorithm thinking
 */

import type { Item } from '@/content/types';

/* ── helpers ─────────────────────────────────────────────────────── */

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const tmp = b;
    b = a % b;
    a = tmp;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/* ── MCD pairs: [a, b, difficulty] — 32 items ────────────────────── */

const MCD_PAIRS: ReadonlyArray<readonly [number, number, 1 | 2 | 3]> = [
  // Easy — one operand divides the other (GCD = smaller)
  [3, 9, 1], [4, 8, 1], [4, 12, 1], [5, 10, 1], [5, 15, 1],
  [6, 12, 1], [6, 18, 1], [7, 14, 1], [8, 16, 1], [9, 18, 1],
  [10, 20, 1],
  // Medium — share a factor but neither divides the other
  [4, 6, 2], [6, 9, 2], [6, 10, 2], [8, 10, 2], [8, 12, 2],
  [9, 12, 2], [10, 15, 2], [12, 16, 2], [12, 18, 2], [15, 20, 2],
  [10, 14, 2],
  // Hard — larger numbers, multi-step reasoning
  [18, 24, 3], [18, 27, 3], [20, 30, 3], [24, 32, 3], [24, 36, 3],
  [28, 42, 3], [30, 45, 3], [36, 48, 3], [30, 50, 3], [42, 56, 3],
] as const;

/* ── MCM pairs: [a, b, difficulty] — 32 items ────────────────────── */

const MCM_PAIRS: ReadonlyArray<readonly [number, number, 1 | 2 | 3]> = [
  // Easy — small result (≤ 12)
  [2, 4, 1], [2, 6, 1], [2, 8, 1], [2, 10, 1], [3, 6, 1],
  [3, 9, 1], [3, 12, 1], [4, 8, 1], [4, 12, 1], [5, 10, 1],
  [6, 12, 1],
  // Medium — result 13..40
  [4, 6, 2], [4, 10, 2], [4, 14, 2], [6, 8, 2], [6, 9, 2],
  [6, 10, 2], [6, 15, 2], [8, 12, 2], [9, 12, 2], [10, 15, 2],
  [12, 18, 2],
  // Hard — result > 40
  [8, 10, 3], [8, 14, 3], [9, 15, 3], [10, 12, 3], [10, 14, 3],
  [12, 16, 3], [14, 21, 3], [15, 20, 3], [12, 20, 3], [16, 24, 3],
] as const;

/* ── Build item bank ─────────────────────────────────────────────── */

export const LCM_GCD_ITEMS: readonly Item[] = (() => {
  const items: Item[] = [];

  for (const [a, b, d] of MCD_PAIRS) {
    items.push({
      id: `mcm-mcd.mcd.${a}-${b}`,
      moduleId: 'mcm-mcd',
      kind: 'mcd',
      prompt: { type: 'lcm-gcd', numbers: [a, b], target: 'mcd' },
      answer: { type: 'numeric', value: gcd(a, b) },
      difficulty: d,
      feedbackTemplateId: `mcm-mcd.mcd.${d === 1 ? 'easy' : d === 2 ? 'medium' : 'hard'}`,
    });
  }

  for (const [a, b, d] of MCM_PAIRS) {
    items.push({
      id: `mcm-mcd.mcm.${a}-${b}`,
      moduleId: 'mcm-mcd',
      kind: 'mcm',
      prompt: { type: 'lcm-gcd', numbers: [a, b], target: 'mcm' },
      answer: { type: 'numeric', value: lcm(a, b) },
      difficulty: d,
      feedbackTemplateId: `mcm-mcd.mcm.${d === 1 ? 'easy' : d === 2 ? 'medium' : 'hard'}`,
    });
  }

  return items;
})();

/**
 * Varias-cifras content bank — F11.
 *
 * 64 items: two-digit number (11..18) × single digit (2..9).
 * Covers the first tier of multi-digit multiplication that comes after
 * mastering single-digit tables.
 *
 * Item ID: `varias-cifras.mult.${a}x${b}`
 * Prompt type: multidigit (operands: [a, b], op: '×')
 * Answer: numeric (a × b)
 *
 * Difficulty scale:
 *   b ≤ 4  → 1 (easy)
 *   b 5–6  → 2 (medium)
 *   b ≥ 7  → 3 (hard)
 */

import type { Item } from '@/content/types';

function difficulty(b: number): 1 | 2 | 3 {
  if (b <= 4) return 1;
  if (b <= 6) return 2;
  return 3;
}

function feedbackId(d: 1 | 2 | 3): string {
  if (d === 1) return 'varias-cifras.easy';
  if (d === 2) return 'varias-cifras.medium';
  return 'varias-cifras.hard';
}

export const MULTIDIGIT_ITEMS: readonly Item[] = (() => {
  const items: Item[] = [];
  // a: two-digit operand (11..18), b: single-digit multiplier (2..9)
  for (let a = 11; a <= 18; a++) {
    for (let b = 2; b <= 9; b++) {
      const d = difficulty(b);
      items.push({
        id: `varias-cifras.mult.${a}x${b}`,
        moduleId: 'varias-cifras',
        kind: 'mult',
        prompt: { type: 'multidigit', operands: [a, b], op: '×' },
        answer: { type: 'numeric', value: a * b },
        difficulty: d,
        feedbackTemplateId: feedbackId(d),
      });
    }
  }
  return items;
})();

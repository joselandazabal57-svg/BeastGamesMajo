/**
 * Leitner box configuration.
 *
 * Source of truth: docs/hltc-beast-games.md §5.5
 *
 * Box | Sessions until next review
 *  B0 | 0 (re-eligible this session)
 *  B1 | 1
 *  B2 | 2
 *  B3 | 4
 *  B4 | 8
 */

import type { Box } from './types';

export const BOX_INTERVALS = [0, 1, 2, 4, 8] as const;

export const MAX_BOX: Box = 4;

/**
 * Number of sessions to wait before the item becomes eligible for review again,
 * for an item currently at the given box.
 */
export function intervalFor(box: Box): number {
  return BOX_INTERVALS[box];
}

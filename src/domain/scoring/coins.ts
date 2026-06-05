/**
 * Coin awards per rung.
 *
 * Source of truth: docs/hltc-beast-games.md §5.8 (mirrors prizeLadder coins).
 * Kept as a separate module so non-prize game modes (memoria, practicar) can
 * compute coin rewards without going through the ladder modal flow.
 */

import { LADDER_LENGTH, PRIZES } from './prizeLadder';

/**
 * Coins awarded for correctly answering the question at the given rung.
 * Rung is 0-based.
 */
export function coinsForCorrect(rung: number): number {
  if (!Number.isInteger(rung) || rung < 0 || rung >= LADDER_LENGTH) {
    throw new RangeError(
      `coinsForCorrect: rung must be an integer in [0..${LADDER_LENGTH - 1}], got ${rung}`,
    );
  }
  return PRIZES[rung]!.coins;
}

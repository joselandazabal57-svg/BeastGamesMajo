/**
 * Prize ladder.
 *
 * Source of truth: docs/hltc-beast-games.md §5.8 + prototype reto-bestial.html.
 *
 * The ladder is identical across all modules and game modes. 10 rungs, one
 * prize per rung, climaxing in the Grand Trophy.
 */

export type Prize = {
  /** 0-based rung index (0..9). */
  rung: number;
  /** Emoji shown in the reveal modal. */
  emoji: string;
  /** Display title in Spanish. */
  title: string;
  /** Coin value awarded when this rung is reached. */
  coins: number;
  /** Non-coin reward kind, used by progress/ledger aggregation. */
  kind: 'coin' | 'gem' | 'ticket' | 'medal' | 'trophy';
};

export const PRIZES: readonly Prize[] = [
  { rung: 0, emoji: '🪙', title: '100 monedas', coins: 100, kind: 'coin' },
  { rung: 1, emoji: '🪙', title: '250 monedas', coins: 250, kind: 'coin' },
  { rung: 2, emoji: '💎', title: '1 gema', coins: 300, kind: 'gem' },
  { rung: 3, emoji: '🪙', title: '500 monedas', coins: 500, kind: 'coin' },
  { rung: 4, emoji: '🎟️', title: 'Boleto dorado', coins: 750, kind: 'ticket' },
  { rung: 5, emoji: '💎', title: '3 gemas', coins: 900, kind: 'gem' },
  { rung: 6, emoji: '🥈', title: 'Medalla de plata', coins: 1200, kind: 'medal' },
  { rung: 7, emoji: '🪙', title: '2.000 monedas', coins: 2000, kind: 'coin' },
  { rung: 8, emoji: '💎', title: '10 gemas', coins: 3000, kind: 'gem' },
  { rung: 9, emoji: '🏆', title: '¡GRAN TROFEO!', coins: 5000, kind: 'trophy' },
] as const;

export const LADDER_LENGTH = PRIZES.length;

/**
 * Return the prize for a given rung (0..9).
 * Throws if rung is out of range — the caller has a bug if this happens.
 */
export function prizeForRung(rung: number): Prize {
  if (!Number.isInteger(rung) || rung < 0 || rung >= LADDER_LENGTH) {
    throw new RangeError(
      `prizeForRung: rung must be an integer in [0..${LADDER_LENGTH - 1}], got ${rung}`,
    );
  }
  return PRIZES[rung]!;
}

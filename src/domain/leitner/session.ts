/**
 * Session management for Leitner.
 *
 * Source of truth: docs/hltc-beast-games.md §5.6
 *
 * A "session" is a contiguous block of app use. It is considered closed when
 * 30+ minutes pass without interaction, or when the app is reopened after a
 * 30+-minute gap. On session close, every item with `sessionsUntilReview > 0`
 * is decremented by 1 — moving items closer to becoming eligible again.
 */

import type { LeitnerState } from './types';

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * T2.6 — Decrement `sessionsUntilReview` by 1 for every state where it is > 0.
 * Items at 0 stay at 0 (idempotent on already-eligible items).
 *
 * Returns a new array; original states are not mutated.
 */
export function decrementSessionIntervals(
  states: readonly LeitnerState[],
): LeitnerState[] {
  return states.map((s) =>
    s.sessionsUntilReview > 0
      ? { ...s, sessionsUntilReview: s.sessionsUntilReview - 1 }
      : s,
  );
}

/**
 * T2.7 — Decide whether a session is considered closed.
 *
 * Returns `true` iff the elapsed time between `lastInteractionMs` and `now`
 * is greater than or equal to SESSION_TIMEOUT_MS.
 */
export function isSessionClosed(
  lastInteractionMs: number,
  now: number,
): boolean {
  return now - lastInteractionMs >= SESSION_TIMEOUT_MS;
}

/**
 * Leitner engine — pure functions for adaptive item selection.
 *
 * Source of truth: docs/hltc-beast-games.md §5.4, §5.5
 *
 * All functions are deterministic given their inputs (modulo `Date.now()`
 * being passed in explicitly via `now`).
 */

import type { Box, ItemId, LeitnerItem, LeitnerState } from './types';
import { MAX_BOX, intervalFor } from './boxes';

/**
 * T2.3 — Create the initial state for a freshly-encountered item.
 *
 * Item is born in B0 with `sessionsUntilReview = 0`, eligible immediately.
 * All counters start at zero. `lastSeenAt` is intentionally `0` so callers
 * can distinguish "never seen" from "seen at epoch", but `applyAnswer` will
 * always set a real timestamp on first interaction.
 */
export function initialState(itemId: ItemId): LeitnerState {
  return {
    itemId,
    box: 0,
    sessionsUntilReview: 0,
    consecutiveCorrect: 0,
    totalSeen: 0,
    totalWrong: 0,
    lastSeenAt: 0,
  };
}

/**
 * T2.4 — Apply the result of answering an item.
 *
 * Rules (HLTC §5.5):
 *   - Correct: box → min(box+1, 4); sessionsUntilReview = intervalFor(newBox);
 *              consecutiveCorrect++; totalSeen++.
 *   - Wrong:   box = 0; sessionsUntilReview = 0; consecutiveCorrect = 0;
 *              totalSeen++; totalWrong++. (Hard reset — conservative for the
 *              learner; prioritises mastery over speed.)
 *
 * Always updates `lastSeenAt` to the supplied `now`.
 */
export function applyAnswer(
  state: LeitnerState,
  correct: boolean,
  now: number,
): LeitnerState {
  if (correct) {
    const nextBox: Box = Math.min(state.box + 1, MAX_BOX) as Box;
    return {
      ...state,
      box: nextBox,
      sessionsUntilReview: intervalFor(nextBox),
      consecutiveCorrect: state.consecutiveCorrect + 1,
      totalSeen: state.totalSeen + 1,
      lastSeenAt: now,
    };
  }
  return {
    ...state,
    box: 0,
    sessionsUntilReview: 0,
    consecutiveCorrect: 0,
    totalSeen: state.totalSeen + 1,
    totalWrong: state.totalWrong + 1,
    lastSeenAt: now,
  };
}

/**
 * T2.5 — Pick the next item to ask.
 *
 * Eligibility: only items with a state whose `sessionsUntilReview === 0`.
 * Items not present in `states` are treated as fresh (B0, eligible).
 *
 * Priority order:
 *   1. Lower box first (B0 before B1 before ...).
 *   2. Within the same box, higher `totalWrong` first (struggle more = see more).
 *   3. Final tie-break: deterministic pseudo-random using `lastSeenAt` as seed
 *      so the same input yields the same output (testable, replayable).
 *
 * Returns `null` if no items are eligible.
 */
export function selectNextItem<T extends LeitnerItem>(
  states: readonly LeitnerState[],
  items: readonly T[],
): T | null {
  if (items.length === 0) return null;

  const stateById = new Map<ItemId, LeitnerState>();
  for (const s of states) stateById.set(s.itemId, s);

  type Candidate = { item: T; state: LeitnerState };
  const eligible: Candidate[] = [];

  for (const item of items) {
    const existing = stateById.get(item.id);
    const state = existing ?? initialState(item.id);
    if (state.sessionsUntilReview === 0) {
      eligible.push({ item, state });
    }
  }

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    // 1. Box ascending
    if (a.state.box !== b.state.box) return a.state.box - b.state.box;
    // 2. totalWrong descending
    if (a.state.totalWrong !== b.state.totalWrong) {
      return b.state.totalWrong - a.state.totalWrong;
    }
    // 3. Deterministic tie-break by hashing lastSeenAt + itemId
    const aSeed = hash32(`${a.state.lastSeenAt}:${a.item.id}`);
    const bSeed = hash32(`${b.state.lastSeenAt}:${b.item.id}`);
    return aSeed - bSeed;
  });

  return eligible[0]!.item;
}

/**
 * Tiny deterministic string hash (FNV-1a variant, 32-bit).
 * Used only as a tie-breaker in selection — not for security.
 */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Force unsigned 32-bit
  return h >>> 0;
}

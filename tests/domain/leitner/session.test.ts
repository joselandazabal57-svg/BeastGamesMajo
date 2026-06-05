import { describe, it, expect } from 'vitest';
import {
  decrementSessionIntervals,
  isSessionClosed,
  SESSION_TIMEOUT_MS,
} from '@/domain/leitner/session';
import { initialState } from '@/domain/leitner/engine';
import type { LeitnerState } from '@/domain/leitner/types';

describe('Leitner session', () => {
  // (a) decrement only applies to > 0
  it('decrementSessionIntervals — decrements only states with sessionsUntilReview > 0', () => {
    const states: LeitnerState[] = [
      { ...initialState('a'), sessionsUntilReview: 3 },
      { ...initialState('b'), sessionsUntilReview: 0 },
      { ...initialState('c'), sessionsUntilReview: 1 },
    ];
    const out = decrementSessionIntervals(states);
    expect(out[0]!.sessionsUntilReview).toBe(2);
    expect(out[1]!.sessionsUntilReview).toBe(0);
    expect(out[2]!.sessionsUntilReview).toBe(0);
  });

  it('decrementSessionIntervals — does not mutate inputs', () => {
    const states: LeitnerState[] = [
      { ...initialState('a'), sessionsUntilReview: 3 },
    ];
    const before = structuredClone(states);
    decrementSessionIntervals(states);
    expect(states).toEqual(before);
  });

  // (b) idempotent on already-zero
  it('decrementSessionIntervals — applying twice to a 0-state stays 0', () => {
    const states: LeitnerState[] = [
      { ...initialState('a'), sessionsUntilReview: 0 },
    ];
    const once = decrementSessionIntervals(states);
    const twice = decrementSessionIntervals(once);
    expect(twice[0]!.sessionsUntilReview).toBe(0);
  });

  it('decrementSessionIntervals — handles empty list', () => {
    expect(decrementSessionIntervals([])).toEqual([]);
  });

  // (c) isSessionClosed boundary
  it('isSessionClosed — false just under 30 minutes', () => {
    const last = 1_000_000_000;
    const now = last + SESSION_TIMEOUT_MS - 1;
    expect(isSessionClosed(last, now)).toBe(false);
  });

  it('isSessionClosed — true at exactly 30 minutes', () => {
    const last = 1_000_000_000;
    const now = last + SESSION_TIMEOUT_MS;
    expect(isSessionClosed(last, now)).toBe(true);
  });

  it('isSessionClosed — true well past 30 minutes', () => {
    const last = 1_000_000_000;
    const now = last + SESSION_TIMEOUT_MS * 5;
    expect(isSessionClosed(last, now)).toBe(true);
  });

  it('isSessionClosed — clock skew (now < last) returns false', () => {
    expect(isSessionClosed(2_000_000_000, 1_000_000_000)).toBe(false);
  });
});

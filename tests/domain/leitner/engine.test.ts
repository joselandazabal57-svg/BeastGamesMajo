import { describe, it, expect } from 'vitest';
import {
  initialState,
  applyAnswer,
  selectNextItem,
} from '@/domain/leitner/engine';
import { intervalFor } from '@/domain/leitner/boxes';
import type { LeitnerState } from '@/domain/leitner/types';

const NOW = 1_700_000_000_000;

function makeItems(ids: readonly string[]) {
  return ids.map((id) => ({ id }));
}

describe('Leitner engine', () => {
  // (a) new item starts in B0
  it('initialState — new item is born in box 0, eligible immediately', () => {
    const s = initialState('tablas.mult.7x8');
    expect(s).toEqual({
      itemId: 'tablas.mult.7x8',
      box: 0,
      sessionsUntilReview: 0,
      consecutiveCorrect: 0,
      totalSeen: 0,
      totalWrong: 0,
      lastSeenAt: 0,
    });
  });

  // (b) correct answer climbs a box
  it('applyAnswer correct — climbs one box and sets interval', () => {
    const s0 = initialState('x');
    const s1 = applyAnswer(s0, true, NOW);
    expect(s1.box).toBe(1);
    expect(s1.sessionsUntilReview).toBe(intervalFor(1));
    expect(s1.consecutiveCorrect).toBe(1);
    expect(s1.totalSeen).toBe(1);
    expect(s1.totalWrong).toBe(0);
    expect(s1.lastSeenAt).toBe(NOW);
  });

  // (c) correct at B4 stays at B4
  it('applyAnswer correct at max box — stays at B4', () => {
    let s: LeitnerState = initialState('x');
    for (let i = 0; i < 6; i++) s = applyAnswer(s, true, NOW + i);
    expect(s.box).toBe(4);
    expect(s.sessionsUntilReview).toBe(intervalFor(4));
    expect(s.consecutiveCorrect).toBe(6);
  });

  // (d) wrong resets to B0 from any box
  it('applyAnswer wrong — resets to box 0 from any state', () => {
    let s: LeitnerState = initialState('x');
    s = applyAnswer(s, true, NOW); // B1
    s = applyAnswer(s, true, NOW); // B2
    s = applyAnswer(s, true, NOW); // B3
    expect(s.box).toBe(3);
    const wrong = applyAnswer(s, false, NOW + 1000);
    expect(wrong.box).toBe(0);
    expect(wrong.sessionsUntilReview).toBe(0);
    expect(wrong.consecutiveCorrect).toBe(0);
    expect(wrong.totalWrong).toBe(1);
    expect(wrong.totalSeen).toBe(4);
    expect(wrong.lastSeenAt).toBe(NOW + 1000);
  });

  // (e) selectNextItem returns null when nothing is eligible
  it('selectNextItem — returns null when all states have sessionsUntilReview > 0', () => {
    const items = makeItems(['a', 'b', 'c']);
    const states: LeitnerState[] = items.map((it) => ({
      ...initialState(it.id),
      box: 2,
      sessionsUntilReview: 2,
    }));
    expect(selectNextItem(states, items)).toBeNull();
  });

  it('selectNextItem — returns null on empty items list', () => {
    expect(selectNextItem([], [])).toBeNull();
  });

  // (f) selectNextItem prioritises low box
  it('selectNextItem — prioritises lower box', () => {
    const items = makeItems(['a', 'b', 'c']);
    const states: LeitnerState[] = [
      { ...initialState('a'), box: 3 },
      { ...initialState('b'), box: 1 },
      { ...initialState('c'), box: 2 },
    ];
    // All have sessionsUntilReview = 0 from initialState — make sure
    states.forEach((s) => (s.sessionsUntilReview = 0));
    const picked = selectNextItem(states, items);
    expect(picked?.id).toBe('b');
  });

  // (g) prioritises higher totalWrong within same box
  it('selectNextItem — within same box, higher totalWrong wins', () => {
    const items = makeItems(['easy', 'struggled', 'medium']);
    const states: LeitnerState[] = [
      { ...initialState('easy'), box: 1, sessionsUntilReview: 0, totalWrong: 0 },
      { ...initialState('struggled'), box: 1, sessionsUntilReview: 0, totalWrong: 5 },
      { ...initialState('medium'), box: 1, sessionsUntilReview: 0, totalWrong: 2 },
    ];
    const picked = selectNextItem(states, items);
    expect(picked?.id).toBe('struggled');
  });

  // (h) counters monotonic
  it('applyAnswer — totalSeen and totalWrong are monotonically non-decreasing', () => {
    let s: LeitnerState = initialState('x');
    const seenSeries: number[] = [s.totalSeen];
    const wrongSeries: number[] = [s.totalWrong];
    const sequence = [true, false, true, true, false, false, true];
    for (const correct of sequence) {
      s = applyAnswer(s, correct, NOW);
      seenSeries.push(s.totalSeen);
      wrongSeries.push(s.totalWrong);
    }
    for (let i = 1; i < seenSeries.length; i++) {
      expect(seenSeries[i]).toBeGreaterThanOrEqual(seenSeries[i - 1]!);
      expect(wrongSeries[i]).toBeGreaterThanOrEqual(wrongSeries[i - 1]!);
    }
    // Final counts
    expect(s.totalSeen).toBe(sequence.length);
    expect(s.totalWrong).toBe(sequence.filter((x) => !x).length);
  });

  it('selectNextItem — items with no existing state are treated as fresh and eligible', () => {
    const items = makeItems(['unseen1', 'unseen2']);
    const picked = selectNextItem([], items);
    expect(picked).not.toBeNull();
    expect(['unseen1', 'unseen2']).toContain(picked!.id);
  });

  it('selectNextItem — tie-break is deterministic', () => {
    const items = makeItems(['x', 'y', 'z']);
    const states: LeitnerState[] = items.map((it) => ({
      ...initialState(it.id),
      box: 0,
      sessionsUntilReview: 0,
      totalWrong: 0,
      lastSeenAt: 0,
    }));
    const a = selectNextItem(states, items);
    const b = selectNextItem(states, items);
    const c = selectNextItem(states, items);
    expect(a?.id).toBe(b?.id);
    expect(b?.id).toBe(c?.id);
  });
});

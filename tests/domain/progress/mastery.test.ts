import { describe, it, expect } from 'vitest';
import {
  moduleMastery,
  tableMasteryForTablas,
} from '@/domain/progress/mastery';
import { initialState } from '@/domain/leitner/engine';
import type { LeitnerState } from '@/domain/leitner/types';

function state(over: Partial<LeitnerState> & { itemId: string }): LeitnerState {
  return { ...initialState(over.itemId), ...over };
}

describe('moduleMastery', () => {
  it('returns zeros on empty input', () => {
    expect(moduleMastery([])).toEqual({
      masteredCount: 0,
      inProgressCount: 0,
      weakCount: 0,
      masteryPercent: 0,
    });
  });

  it('classifies states by the HLTC rules', () => {
    const states: LeitnerState[] = [
      // mastered: box>=3, consecutiveCorrect>=3
      state({ itemId: 'a', box: 4, consecutiveCorrect: 5 }),
      state({ itemId: 'b', box: 3, consecutiveCorrect: 3 }),
      // weak: totalWrong>=2, box<=1
      state({ itemId: 'c', box: 0, totalWrong: 3, totalSeen: 5 }),
      state({ itemId: 'd', box: 1, totalWrong: 2, totalSeen: 4 }),
      // in progress: everything else
      state({ itemId: 'e', box: 2, consecutiveCorrect: 1 }),
      state({ itemId: 'f' }), // fresh
    ];
    const m = moduleMastery(states);
    expect(m.masteredCount).toBe(2);
    expect(m.weakCount).toBe(2);
    expect(m.inProgressCount).toBe(2);
    expect(m.masteryPercent).toBe(33);
  });

  it('mastered requires BOTH box>=3 and consecutiveCorrect>=3', () => {
    const states: LeitnerState[] = [
      // High box but low streak → not mastered
      state({ itemId: 'a', box: 4, consecutiveCorrect: 1 }),
      // High streak but low box → not mastered
      state({ itemId: 'b', box: 2, consecutiveCorrect: 5 }),
    ];
    expect(moduleMastery(states).masteredCount).toBe(0);
  });

  it('full mastery yields 100%', () => {
    const states: LeitnerState[] = ['a', 'b', 'c'].map((id) =>
      state({ itemId: id, box: 4, consecutiveCorrect: 4 }),
    );
    expect(moduleMastery(states).masteryPercent).toBe(100);
  });
});

describe('tableMasteryForTablas', () => {
  it('returns 0 for every table when there are no states', () => {
    const m = tableMasteryForTablas([]);
    for (const k of [2, 3, 4, 5, 6, 7, 8, 9] as const) {
      expect(m[k]).toBe(0);
    }
  });

  it('ignores items not matching the tablas.mult.AxB pattern', () => {
    const states: LeitnerState[] = [
      state({ itemId: 'divisiones.div.56_7', totalSeen: 10, totalWrong: 0 }),
      state({ itemId: 'random-id', totalSeen: 5, totalWrong: 5 }),
    ];
    const m = tableMasteryForTablas(states);
    for (const k of [2, 3, 4, 5, 6, 7, 8, 9] as const) {
      expect(m[k]).toBe(0);
    }
  });

  it('attributes seen/correct counts to both factor tables', () => {
    // 7x8: seen 10, wrong 1 → 9 correct. Both table 7 and table 8 get +10/+9.
    // 7x3: seen 4, wrong 0 → 4 correct. Tables 7 and 3 get +4/+4.
    const states: LeitnerState[] = [
      state({ itemId: 'tablas.mult.7x8', totalSeen: 10, totalWrong: 1 }),
      state({ itemId: 'tablas.mult.7x3', totalSeen: 4, totalWrong: 0 }),
    ];
    const m = tableMasteryForTablas(states);
    // Table 7: seen 14, correct 13 → 93%
    expect(m[7]).toBe(93);
    // Table 8: seen 10, correct 9 → 90%
    expect(m[8]).toBe(90);
    // Table 3: seen 4, correct 4 → 100%
    expect(m[3]).toBe(100);
    // Tables with no data → 0
    expect(m[2]).toBe(0);
    expect(m[5]).toBe(0);
  });

  it('handles out-of-range factor numbers safely', () => {
    // 1x5: 1 is not in [2..9], should be skipped
    const states: LeitnerState[] = [
      state({ itemId: 'tablas.mult.1x5', totalSeen: 10, totalWrong: 0 }),
    ];
    const m = tableMasteryForTablas(states);
    expect(m[5]).toBe(0);
  });
});

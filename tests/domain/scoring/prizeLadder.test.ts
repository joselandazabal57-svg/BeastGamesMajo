import { describe, it, expect } from 'vitest';
import {
  PRIZES,
  LADDER_LENGTH,
  prizeForRung,
} from '@/domain/scoring/prizeLadder';

describe('prizeLadder', () => {
  it('exposes exactly 10 prizes', () => {
    expect(LADDER_LENGTH).toBe(10);
    expect(PRIZES).toHaveLength(10);
  });

  it('every prize has a unique 0-based rung in order', () => {
    PRIZES.forEach((p, i) => expect(p.rung).toBe(i));
  });

  it('coin values are strictly non-decreasing', () => {
    for (let i = 1; i < PRIZES.length; i++) {
      expect(PRIZES[i]!.coins).toBeGreaterThanOrEqual(PRIZES[i - 1]!.coins);
    }
  });

  it('top rung is the Grand Trophy', () => {
    expect(PRIZES[9]!.kind).toBe('trophy');
    expect(PRIZES[9]!.coins).toBe(5000);
  });

  it('prizeForRung returns the right prize', () => {
    expect(prizeForRung(0).coins).toBe(100);
    expect(prizeForRung(9).coins).toBe(5000);
  });

  it.each([-1, 10, 1.5, NaN, Infinity])(
    'prizeForRung throws on invalid rung %s',
    (bad) => {
      expect(() => prizeForRung(bad as number)).toThrow(RangeError);
    },
  );
});

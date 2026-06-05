import { describe, it, expect } from 'vitest';
import { coinsForCorrect } from '@/domain/scoring/coins';

describe('coinsForCorrect', () => {
  it('returns expected values for known rungs', () => {
    expect(coinsForCorrect(0)).toBe(100);
    expect(coinsForCorrect(4)).toBe(750);
    expect(coinsForCorrect(9)).toBe(5000);
  });

  it.each([-1, 10, 1.5, NaN])('throws on invalid rung %s', (bad) => {
    expect(() => coinsForCorrect(bad as number)).toThrow(RangeError);
  });
});

/**
 * Tests for domain/roulette/wheel.ts (T04 §B.3 / TB.4).
 */

import { describe, it, expect } from 'vitest';
import {
  SEGMENTS,
  spin,
  segmentAngle,
  segmentById,
  assertProbabilitiesSumToOne,
  type Segment,
} from '@/domain/roulette/wheel';

/** Small deterministic PRNG (mulberry32) for the seeded distribution test. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('SEGMENTS catalog', () => {
  it('has exactly 8 segments', () => {
    expect(SEGMENTS).toHaveLength(8);
  });

  it('probabilities sum to exactly 1.0', () => {
    const totalBp = SEGMENTS.reduce((acc, s) => acc + Math.round(s.probability * 10_000), 0);
    expect(totalBp).toBe(10_000);
  });

  it('has unique ids', () => {
    expect(new Set(SEGMENTS.map((s) => s.id)).size).toBe(8);
  });

  it('matches the closed catalog probabilities', () => {
    const probs: Record<string, number> = {
      'coins-100': 0.2,
      'coins-200': 0.2,
      'coins-300': 0.15,
      'coins-500': 0.1,
      'powerup': 0.15,
      'x2-next': 0.1,
      'reto': 0.08,
      'bestial': 0.02,
    };
    for (const s of SEGMENTS) expect(s.probability).toBe(probs[s.id]);
  });

  it('every segment is a prize (no lose-a-turn kind exists)', () => {
    for (const s of SEGMENTS) {
      expect(['coins', 'powerup', 'x2-next', 'reto', 'bestial']).toContain(s.kind);
    }
  });

  it('segmentById returns the segment or throws', () => {
    expect(segmentById('bestial').value).toBe(1000);
    expect(() => segmentById('nope')).toThrow();
  });

  it('assertProbabilitiesSumToOne throws on a dishonest catalog', () => {
    const bad: Segment[] = [
      { id: 'a', label: 'a', kind: 'coins', value: 1, probability: 0.6, color: '#000', emoji: '🪙' },
      { id: 'b', label: 'b', kind: 'coins', value: 1, probability: 0.6, color: '#000', emoji: '🪙' },
    ];
    expect(() => assertProbabilitiesSumToOne(bad)).toThrow(/sum to 1\.0/);
    expect(() => assertProbabilitiesSumToOne(SEGMENTS)).not.toThrow();
  });
});

describe('spin', () => {
  it('is deterministic given the same rand', () => {
    const a = spin(() => 0.5);
    const b = spin(() => 0.5);
    expect(a.id).toBe(b.id);
  });

  it('maps rand=0 to the first segment and rand→1 to the last', () => {
    expect(spin(() => 0).id).toBe('coins-100');
    expect(spin(() => 0.9999999).id).toBe('bestial');
  });

  it('walks the cumulative distribution at exact boundaries', () => {
    // cumulative: .20 .40 .55 .65 .80 .90 .98 1.00
    expect(spin(() => 0.19).id).toBe('coins-100');
    expect(spin(() => 0.2).id).toBe('coins-200');
    expect(spin(() => 0.54).id).toBe('coins-300');
    expect(spin(() => 0.64).id).toBe('coins-500');
    expect(spin(() => 0.79).id).toBe('powerup');
    expect(spin(() => 0.89).id).toBe('x2-next');
    expect(spin(() => 0.97).id).toBe('reto');
    expect(spin(() => 0.98).id).toBe('bestial');
  });

  it('10.000 seeded spins land within ±2% of expected per segment', () => {
    const rand = mulberry32(42);
    const counts: Record<string, number> = {};
    const N = 10_000;
    for (let i = 0; i < N; i++) {
      const s = spin(rand);
      counts[s.id] = (counts[s.id] ?? 0) + 1;
    }
    for (const seg of SEGMENTS) {
      const observed = (counts[seg.id] ?? 0) / N;
      expect(Math.abs(observed - seg.probability)).toBeLessThanOrEqual(0.02);
    }
  });
});

describe('segmentAngle', () => {
  it('returns equal 45° wedges regardless of probability', () => {
    for (let i = 0; i < 8; i++) {
      const { start, end } = segmentAngle(i);
      expect(end - start).toBe(45);
      expect(start).toBe(i * 45);
    }
  });

  it('throws on out-of-range index', () => {
    expect(() => segmentAngle(-1)).toThrow();
    expect(() => segmentAngle(8)).toThrow();
    expect(() => segmentAngle(1.5)).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { LCM_GCD_ITEMS } from '@/content/lcm-gcd/items';
import { TEMPLATE_IDS } from '@/content/feedback/templates';

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const tmp = b;
    b = a % b;
    a = tmp;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

const MCD_ITEMS = LCM_GCD_ITEMS.filter((i) => i.kind === 'mcd');
const MCM_ITEMS = LCM_GCD_ITEMS.filter((i) => i.kind === 'mcm');

const MCD_ID_RE = /^mcm-mcd\.mcd\.(\d+)-(\d+)$/;
const MCM_ID_RE = /^mcm-mcd\.mcm\.(\d+)-(\d+)$/;

describe('mcm-mcd content', () => {
  it('has exactly 64 items total', () => {
    expect(LCM_GCD_ITEMS).toHaveLength(64);
  });

  it('has exactly 32 MCD items and 32 MCM items', () => {
    expect(MCD_ITEMS).toHaveLength(32);
    expect(MCM_ITEMS).toHaveLength(32);
  });

  it('no duplicate IDs', () => {
    const ids = LCM_GCD_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items belong to moduleId "mcm-mcd"', () => {
    for (const item of LCM_GCD_ITEMS) {
      expect(item.moduleId).toBe('mcm-mcd');
    }
  });

  it('all prompts are lcm-gcd type', () => {
    for (const item of LCM_GCD_ITEMS) {
      expect(item.prompt.type).toBe('lcm-gcd');
    }
  });

  it('MCD items have target "mcd" and correct GCD answers', () => {
    for (const item of MCD_ITEMS) {
      expect(item.prompt.type).toBe('lcm-gcd');
      if (item.prompt.type === 'lcm-gcd') {
        expect(item.prompt.target).toBe('mcd');
        const [a, b] = item.prompt.numbers;
        expect(item.answer.type).toBe('numeric');
        if (item.answer.type === 'numeric') {
          expect(item.answer.value).toBe(gcd(a!, b!));
        }
      }
    }
  });

  it('MCM items have target "mcm" and correct LCM answers', () => {
    for (const item of MCM_ITEMS) {
      expect(item.prompt.type).toBe('lcm-gcd');
      if (item.prompt.type === 'lcm-gcd') {
        expect(item.prompt.target).toBe('mcm');
        const [a, b] = item.prompt.numbers;
        expect(item.answer.type).toBe('numeric');
        if (item.answer.type === 'numeric') {
          expect(item.answer.value).toBe(lcm(a!, b!));
        }
      }
    }
  });

  it('MCD IDs match convention mcm-mcd.mcd.{a}-{b}', () => {
    for (const item of MCD_ITEMS) {
      expect(item.id).toMatch(MCD_ID_RE);
    }
  });

  it('MCM IDs match convention mcm-mcd.mcm.{a}-{b}', () => {
    for (const item of MCM_ITEMS) {
      expect(item.id).toMatch(MCM_ID_RE);
    }
  });

  it('all prompts have exactly 2 numbers', () => {
    for (const item of LCM_GCD_ITEMS) {
      if (item.prompt.type === 'lcm-gcd') {
        expect(item.prompt.numbers).toHaveLength(2);
      }
    }
  });

  it('MCD values are always > 0', () => {
    for (const item of MCD_ITEMS) {
      if (item.answer.type === 'numeric') {
        expect(item.answer.value).toBeGreaterThan(0);
      }
    }
  });

  it('MCM values are always >= larger input number', () => {
    for (const item of MCM_ITEMS) {
      if (item.prompt.type === 'lcm-gcd' && item.answer.type === 'numeric') {
        const max = Math.max(...item.prompt.numbers);
        expect(item.answer.value).toBeGreaterThanOrEqual(max);
      }
    }
  });

  it('difficulty is always 1, 2, or 3', () => {
    for (const item of LCM_GCD_ITEMS) {
      expect([1, 2, 3]).toContain(item.difficulty);
    }
  });

  it('all feedbackTemplateIds reference a registered template', () => {
    for (const item of LCM_GCD_ITEMS) {
      expect(TEMPLATE_IDS.has(item.feedbackTemplateId)).toBe(true);
    }
  });
});

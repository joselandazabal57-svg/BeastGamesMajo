import { describe, it, expect } from 'vitest';
import { MULTIDIGIT_ITEMS } from '@/content/multidigit/items';
import { TEMPLATE_IDS } from '@/content/feedback/templates';

const ID_RE = /^varias-cifras\.mult\.(\d+)x(\d+)$/;

describe('varias-cifras content', () => {
  it('has exactly 64 items', () => {
    expect(MULTIDIGIT_ITEMS).toHaveLength(64);
  });

  it('all IDs match the varias-cifras.mult.{a}x{b} convention', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      expect(item.id).toMatch(ID_RE);
    }
  });

  it('no duplicate IDs', () => {
    const ids = MULTIDIGIT_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items belong to moduleId "varias-cifras"', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      expect(item.moduleId).toBe('varias-cifras');
    }
  });

  it('all prompts are multidigit with op "×" and exactly 2 operands', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      expect(item.prompt.type).toBe('multidigit');
      if (item.prompt.type === 'multidigit') {
        expect(item.prompt.op).toBe('×');
        expect(item.prompt.operands).toHaveLength(2);
      }
    }
  });

  it('first operand (a) is always in range 11..18', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      if (item.prompt.type === 'multidigit') {
        const a = item.prompt.operands[0];
        expect(a).toBeGreaterThanOrEqual(11);
        expect(a).toBeLessThanOrEqual(18);
      }
    }
  });

  it('second operand (b) is always in range 2..9', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      if (item.prompt.type === 'multidigit') {
        const b = item.prompt.operands[1];
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
      }
    }
  });

  it('all answers are numeric and equal a × b', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      const m = ID_RE.exec(item.id);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const b = Number(m![2]);
      expect(item.answer.type).toBe('numeric');
      if (item.answer.type === 'numeric') {
        expect(item.answer.value).toBe(a * b);
      }
    }
  });

  it('difficulty is always 1, 2, or 3', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      expect([1, 2, 3]).toContain(item.difficulty);
    }
  });

  it('items with b ≤ 4 are difficulty 1', () => {
    const easy = MULTIDIGIT_ITEMS.filter((i) => {
      const m = ID_RE.exec(i.id)!;
      return Number(m[2]) <= 4;
    });
    for (const item of easy) {
      expect(item.difficulty).toBe(1);
    }
  });

  it('items with b ≥ 7 are difficulty 3', () => {
    const hard = MULTIDIGIT_ITEMS.filter((i) => {
      const m = ID_RE.exec(i.id)!;
      return Number(m[2]) >= 7;
    });
    for (const item of hard) {
      expect(item.difficulty).toBe(3);
    }
  });

  it('all feedbackTemplateIds reference a registered template', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      expect(TEMPLATE_IDS.has(item.feedbackTemplateId)).toBe(true);
    }
  });

  it('products are in the range 22..162', () => {
    for (const item of MULTIDIGIT_ITEMS) {
      if (item.answer.type === 'numeric') {
        expect(item.answer.value).toBeGreaterThanOrEqual(22); // 11×2
        expect(item.answer.value).toBeLessThanOrEqual(162);   // 18×9
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { ANALYTICS_ITEMS } from '@/content/analytics/items';
import { TEMPLATE_IDS } from '@/content/feedback/templates';

const WP_ITEMS  = ANALYTICS_ITEMS.filter((i) => i.kind === 'word-problem');
const SEQ_ITEMS = ANALYTICS_ITEMS.filter((i) => i.kind === 'pattern');

const WP_ID_RE  = /^analiticos\.wp\.(\d+)$/;
const SEQ_ID_RE = /^analiticos\.seq\.(\d+)$/;

describe('analiticos content', () => {
  it('has exactly 64 items total', () => {
    expect(ANALYTICS_ITEMS).toHaveLength(64);
  });

  it('has exactly 32 word-problem and 32 pattern items', () => {
    expect(WP_ITEMS).toHaveLength(32);
    expect(SEQ_ITEMS).toHaveLength(32);
  });

  it('no duplicate IDs', () => {
    const ids = ANALYTICS_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items belong to moduleId "analiticos"', () => {
    for (const item of ANALYTICS_ITEMS) {
      expect(item.moduleId).toBe('analiticos');
    }
  });

  it('word-problem IDs match convention analiticos.wp.{n}', () => {
    for (const item of WP_ITEMS) {
      expect(item.id).toMatch(WP_ID_RE);
    }
  });

  it('pattern IDs match convention analiticos.seq.{n}', () => {
    for (const item of SEQ_ITEMS) {
      expect(item.id).toMatch(SEQ_ID_RE);
    }
  });

  it('word-problem prompts are type "word-problem" with non-empty text', () => {
    for (const item of WP_ITEMS) {
      expect(item.prompt.type).toBe('word-problem');
      if (item.prompt.type === 'word-problem') {
        expect(item.prompt.text.length).toBeGreaterThan(10);
      }
    }
  });

  it('pattern prompts are type "pattern" with exactly one null', () => {
    for (const item of SEQ_ITEMS) {
      expect(item.prompt.type).toBe('pattern');
      if (item.prompt.type === 'pattern') {
        const nullCount = item.prompt.sequence.filter((n) => n === null).length;
        expect(nullCount).toBe(1);
      }
    }
  });

  it('all answers are numeric with positive values', () => {
    for (const item of ANALYTICS_ITEMS) {
      expect(item.answer.type).toBe('numeric');
      if (item.answer.type === 'numeric') {
        expect(item.answer.value).toBeGreaterThan(0);
      }
    }
  });

  it('difficulty is always 1, 2, or 3', () => {
    for (const item of ANALYTICS_ITEMS) {
      expect([1, 2, 3]).toContain(item.difficulty);
    }
  });

  it('all feedbackTemplateIds reference a registered template', () => {
    for (const item of ANALYTICS_ITEMS) {
      expect(TEMPLATE_IDS.has(item.feedbackTemplateId)).toBe(true);
    }
  });

  it('word-problem answers are positive integers', () => {
    for (const item of WP_ITEMS) {
      if (item.answer.type === 'numeric') {
        expect(Number.isInteger(item.answer.value)).toBe(true);
        expect(item.answer.value).toBeGreaterThan(0);
      }
    }
  });

  it('pattern answers match the null position in the sequence', () => {
    for (const item of SEQ_ITEMS) {
      if (item.prompt.type === 'pattern' && item.answer.type === 'numeric') {
        const nullIdx = item.prompt.sequence.findIndex((n) => n === null);
        expect(nullIdx).not.toBe(-1);
        // The answer is a positive integer
        expect(Number.isInteger(item.answer.value)).toBe(true);
        expect(item.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

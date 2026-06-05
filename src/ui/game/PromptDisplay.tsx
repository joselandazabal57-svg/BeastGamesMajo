/**
 * PromptDisplay — renders an ItemPrompt as a readable question.
 *
 * F16 supports: arithmetic (a op b = ?).
 * Future phases add multidigit, lcm-gcd, word-problem, etc.
 */

'use client';

import type { ItemPrompt } from '@/content/types';

interface PromptDisplayProps {
  prompt: ItemPrompt;
}

export function PromptDisplay({ prompt }: PromptDisplayProps) {
  if (prompt.type === 'arithmetic') {
    return (
      <div
        className="flex items-center justify-center gap-3 py-6"
        aria-label={`${prompt.a} ${prompt.op} ${prompt.b} = ?`}
        role="math"
      >
        <Number value={prompt.a} />
        <Op value={prompt.op} />
        <Number value={prompt.b} />
        <span
          className="font-[family-name:var(--font-display)] text-5xl leading-none text-white/25"
          aria-hidden
        >
          =
        </span>
        <span
          className="font-[family-name:var(--font-display)] text-6xl leading-none"
          style={{ color: 'var(--color-gold)' }}
          aria-hidden
        >
          ?
        </span>
      </div>
    );
  }

  // Fallback for prompt types not yet implemented (F11-F13).
  return (
    <div className="py-8 text-center text-white/30 text-sm">
      [Tipo de pregunta no soportado todavía]
    </div>
  );
}

function Number({ value }: { value: number }) {
  return (
    <span
      className="font-[family-name:var(--font-display)] text-7xl leading-none text-white"
      aria-hidden
    >
      {value}
    </span>
  );
}

function Op({ value }: { value: string }) {
  return (
    <span
      className="font-[family-name:var(--font-display)] text-5xl leading-none"
      style={{ color: 'var(--color-gold-2)' }}
      aria-hidden
    >
      {value}
    </span>
  );
}

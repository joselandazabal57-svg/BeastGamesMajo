/**
 * PromptDisplay — renders an ItemPrompt as a readable question.
 *
 * F16 supports: arithmetic (a op b = ?)
 * F11 adds:     multidigit (operands[0] op operands[1] … = ?)
 * F12 adds:     lcm-gcd (MCM/MCD(a, b) = ?)
 * F13 adds:     word-problem (text block) + pattern (sequence with ?)
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
        <Equals />
        <QuestionMark />
      </div>
    );
  }

  if (prompt.type === 'multidigit') {
    const ariaLabel =
      prompt.operands.join(` ${prompt.op} `) + ' = ?';
    return (
      <div
        className="flex items-center justify-center flex-wrap gap-2 py-6"
        aria-label={ariaLabel}
        role="math"
      >
        {prompt.operands.map((n, i) => (
          <span key={i} className="flex items-center gap-2">
            {/* Two-digit numbers use slightly smaller font to stay in frame */}
            <span
              className="font-[family-name:var(--font-display)] text-6xl leading-none text-white"
              aria-hidden
            >
              {n}
            </span>
            {i < prompt.operands.length - 1 && <Op value={prompt.op} />}
          </span>
        ))}
        <Equals />
        <QuestionMark />
      </div>
    );
  }

  if (prompt.type === 'lcm-gcd') {
    const label = prompt.target.toUpperCase();
    const numsStr = prompt.numbers.join(', ');
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-6"
        aria-label={`${label} de ${numsStr} = ?`}
        role="math"
      >
        {/* Function label: MCM or MCD */}
        <span
          className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-widest"
          style={{ color: 'var(--color-gold-2)' }}
          aria-hidden
        >
          {label}
        </span>
        {/* Numbers in parentheses */}
        <div className="flex items-center gap-2">
          <span
            className="font-[family-name:var(--font-display)] text-4xl leading-none text-white/40"
            aria-hidden
          >
            (
          </span>
          {prompt.numbers.map((n, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                className="font-[family-name:var(--font-display)] text-6xl leading-none text-white"
                aria-hidden
              >
                {n}
              </span>
              {i < prompt.numbers.length - 1 && (
                <span
                  className="font-[family-name:var(--font-display)] text-4xl leading-none text-white/40"
                  aria-hidden
                >
                  ,
                </span>
              )}
            </span>
          ))}
          <span
            className="font-[family-name:var(--font-display)] text-4xl leading-none text-white/40"
            aria-hidden
          >
            )
          </span>
          <Equals />
          <QuestionMark />
        </div>
      </div>
    );
  }

  if (prompt.type === 'word-problem') {
    return (
      <div
        className="flex flex-col gap-5 py-4 px-2 w-full max-w-xs"
        role="region"
        aria-label={prompt.text}
      >
        <p className="text-base text-white/80 leading-snug text-center">
          {prompt.text}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Equals />
          <QuestionMark />
        </div>
      </div>
    );
  }

  if (prompt.type === 'pattern') {
    const ariaLabel =
      prompt.sequence.map((n) => (n === null ? '?' : String(n))).join(', ');
    return (
      <div
        className="flex flex-col items-center gap-3 py-4"
        role="math"
        aria-label={`Secuencia: ${ariaLabel}`}
      >
        <div className="flex items-center flex-wrap justify-center gap-1.5">
          {prompt.sequence.map((n, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {n === null ? (
                <span
                  className="font-[family-name:var(--font-display)] text-5xl leading-none"
                  style={{ color: 'var(--color-gold)' }}
                  aria-hidden
                >
                  ?
                </span>
              ) : (
                <span
                  className="font-[family-name:var(--font-display)] text-5xl leading-none text-white"
                  aria-hidden
                >
                  {n}
                </span>
              )}
              {i < prompt.sequence.length - 1 && (
                <span
                  className="font-[family-name:var(--font-display)] text-3xl leading-none text-white/25"
                  aria-hidden
                >
                  ,
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-1">
          ¿Qué número falta?
        </p>
      </div>
    );
  }

  // Unreachable — all ItemPrompt types are handled above.
  return null;
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

function Equals() {
  return (
    <span
      className="font-[family-name:var(--font-display)] text-5xl leading-none text-white/25"
      aria-hidden
    >
      =
    </span>
  );
}

function QuestionMark() {
  return (
    <span
      className="font-[family-name:var(--font-display)] text-6xl leading-none"
      style={{ color: 'var(--color-gold)' }}
      aria-hidden
    >
      ?
    </span>
  );
}

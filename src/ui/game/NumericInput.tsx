/**
 * NumericInput — tactile numeric keypad for entering answers.
 *
 * Layout: 3×4 grid — rows [7 8 9] [4 5 6] [1 2 3] [⌫ 0 ✓].
 * The display shows the current input above the pad.
 * Backspace clears the last digit; ✓ confirms (disabled when empty).
 *
 * maxDigits defaults to 3 (covers all table/division answers ≤ 9×9 = 81,
 * and larger results in future modules up to 3 digits).
 */

'use client';

import { useState, useCallback } from 'react';

interface NumericInputProps {
  onConfirm: (value: number) => void;
  /** Freeze the pad during feedback/transition. */
  disabled?: boolean;
  maxDigits?: number;
  /** Clears the display when this key changes (e.g. new question). */
  resetKey?: number;
}

export function NumericInput({
  onConfirm,
  disabled = false,
  maxDigits = 3,
}: NumericInputProps) {
  const [input, setInput] = useState('');

  const append = useCallback(
    (digit: string) => {
      if (disabled) return;
      setInput((prev) => (prev.length >= maxDigits ? prev : prev + digit));
    },
    [disabled, maxDigits],
  );

  const backspace = useCallback(() => {
    if (disabled) return;
    setInput((prev) => prev.slice(0, -1));
  }, [disabled]);

  const confirm = useCallback(() => {
    if (disabled || input === '') return;
    const value = parseInt(input, 10);
    setInput('');
    onConfirm(value);
  }, [disabled, input, onConfirm]);

  const KEYS: Array<{ label: string; action: () => void; accent?: boolean; muted?: boolean }> = [
    { label: '7', action: () => append('7') },
    { label: '8', action: () => append('8') },
    { label: '9', action: () => append('9') },
    { label: '4', action: () => append('4') },
    { label: '5', action: () => append('5') },
    { label: '6', action: () => append('6') },
    { label: '1', action: () => append('1') },
    { label: '2', action: () => append('2') },
    { label: '3', action: () => append('3') },
    { label: '⌫', action: backspace, muted: true },
    { label: '0', action: () => append('0') },
    { label: '✓', action: confirm, accent: true },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Display */}
      <div
        className="w-full rounded-xl flex items-center justify-center min-h-[4rem] border border-white/10"
        style={{ background: 'var(--color-panel)' }}
        aria-live="polite"
        aria-label={input ? `Valor ingresado: ${input}` : 'Sin valor ingresado'}
      >
        {input ? (
          <span className="font-[family-name:var(--font-display)] text-5xl text-white leading-none">
            {input}
          </span>
        ) : (
          <span className="text-white/20 text-3xl select-none" aria-hidden>
            —
          </span>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5 w-full" role="group" aria-label="Teclado numérico">
        {KEYS.map((key) => {
          const isConfirm = key.label === '✓';
          const isEmpty = input === '';

          return (
            <button
              key={key.label}
              type="button"
              onClick={key.action}
              disabled={disabled || (isConfirm && isEmpty)}
              aria-label={
                key.label === '⌫'
                  ? 'Borrar último dígito'
                  : key.label === '✓'
                    ? 'Confirmar respuesta'
                    : key.label
              }
              className={[
                'h-14 rounded-xl font-[family-name:var(--font-display)] text-2xl leading-none',
                'transition-all duration-100 active:scale-[0.93]',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100',
                key.accent
                  ? 'text-(--color-bg) font-bold cursor-pointer'
                  : key.muted
                    ? 'border border-white/10 text-white/60 cursor-pointer'
                    : 'border border-white/10 text-white cursor-pointer',
              ].join(' ')}
              style={
                key.accent
                  ? { background: 'var(--color-gold)' }
                  : { background: 'var(--color-panel)' }
              }
            >
              {key.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

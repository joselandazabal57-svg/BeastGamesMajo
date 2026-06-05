/**
 * MasteryBar — progress bar for module mastery (0..100 %).
 *
 * Uses the same accent colour system as the Module type:
 *   gold | magenta | lime | gold-2
 */

'use client';

type Accent = 'gold' | 'magenta' | 'lime' | 'gold-2';

const ACCENT_COLOR: Record<Accent, string> = {
  gold: 'var(--color-gold)',
  magenta: 'var(--color-magenta)',
  lime: 'var(--color-lime)',
  'gold-2': 'var(--color-gold-2)',
};

interface MasteryBarProps {
  /** Integer 0..100 */
  percent: number;
  accent?: Accent;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function MasteryBar({
  percent,
  accent = 'gold',
  label,
  showPercent = false,
  className = '',
}: MasteryBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color = ACCENT_COLOR[accent];

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-white/60">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-mono">{clamped}%</span>}
        </div>
      )}

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progreso'}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

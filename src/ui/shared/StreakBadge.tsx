/**
 * StreakBadge — shows the current answer streak with a flame icon.
 *
 * Hidden (renders nothing) when streak === 0 to avoid visual clutter.
 * Animates in via CSS when streak first appears.
 */

'use client';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className = '' }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full',
        'bg-(--color-gold)/15 border border-(--color-gold)/40',
        'animate-in fade-in zoom-in-75 duration-200',
        className,
      ].join(' ')}
      role="status"
      aria-label={`Racha de ${streak}`}
    >
      <span aria-hidden className="text-base leading-none">
        🔥
      </span>
      <span className="font-[family-name:var(--font-display)] text-base leading-none text-(--color-gold)">
        {streak}
      </span>
    </span>
  );
}

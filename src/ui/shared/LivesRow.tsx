/**
 * LivesRow — renders heart icons for the current life count.
 *
 * Filled hearts = lives remaining. Empty hearts = lives lost.
 * Max defaults to 3 (the game default from useGameStore).
 */

'use client';

interface LivesRowProps {
  lives: number;
  max?: number;
  className?: string;
}

export function LivesRow({ lives, max = 3, className = '' }: LivesRowProps) {
  return (
    <span
      className={['inline-flex items-center gap-1', className].join(' ')}
      role="status"
      aria-label={`${lives} de ${max} vidas`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={[
            'text-xl leading-none transition-all duration-300',
            i < lives ? 'opacity-100 scale-100' : 'opacity-25 scale-90',
          ].join(' ')}
        >
          ❤️
        </span>
      ))}
    </span>
  );
}

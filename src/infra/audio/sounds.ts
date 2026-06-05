/**
 * Sound effect catalogue.
 *
 * Source of truth: docs/hltc-beast-games.md §B2 (audio decision).
 *
 * Six effects, no music. Assets land in /public/sounds/ during F7. Until then,
 * the AudioManager fails gracefully (logs warn, plays nothing).
 */

export type SoundId =
  | 'correct'
  | 'wrong'
  | 'prize'
  | 'ladder-up'
  | 'gameover'
  | 'victory';

export const SOUND_PATHS: Record<SoundId, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  prize: '/sounds/prize.mp3',
  'ladder-up': '/sounds/ladder-up.mp3',
  gameover: '/sounds/gameover.mp3',
  victory: '/sounds/victory.mp3',
};

export const ALL_SOUND_IDS: readonly SoundId[] = Object.keys(
  SOUND_PATHS,
) as SoundId[];

/**
 * useGameStore — state of the round currently being played.
 *
 * Source of truth: docs/hltc-beast-games.md §4.1 (State layer).
 *
 * This store is intentionally ephemeral: it lives in memory while a round is
 * being played and is wiped on `endGame`. Persistence happens via the
 * progress store at round end.
 */

'use client';

import { create } from 'zustand';
import type { ModuleId, GameMode, Item } from '@/content/types';
import { checkAnswer, type UserResponse } from '@/domain/validation/answer';
import { applyAnswer } from '@/domain/leitner/engine';
import type { LeitnerState } from '@/domain/leitner/types';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type AnsweredItem = {
  itemId: string;
  correct: boolean;
  /** New Leitner state after applying the answer. Persisted on endGame. */
  newState: LeitnerState;
};

type GameState = {
  moduleId: ModuleId | null;
  gameMode: GameMode | null;
  items: readonly Item[];
  /** Current item being asked. Null between rounds. */
  currentItem: Item | null;
  /** 0-based rung in the prize ladder (0..9). */
  rung: number;
  lives: number;
  streak: number;
  bestStreak: number;
  /** Milliseconds remaining on the current question; null = no timer. */
  timeLeft: number | null;
  /** Coins earned in this round (transient — pushed to ledger at endGame). */
  score: number;
  status: GameStatus;
  answered: AnsweredItem[];
};

type GameActions = {
  startGame: (params: {
    moduleId: ModuleId;
    gameMode: GameMode;
    items: readonly Item[];
    firstItem: Item;
    lives?: number;
    timeLimitMs?: number;
  }) => void;
  setCurrentItem: (item: Item) => void;
  answer: (
    response: UserResponse,
    currentLeitnerState: LeitnerState,
    now: number,
  ) => { correct: boolean; expected: string };
  tickTimer: (deltaMs: number) => void;
  pause: () => void;
  resume: () => void;
  endGame: () => void;
  reset: () => void;
};

const INITIAL: GameState = {
  moduleId: null,
  gameMode: null,
  items: [],
  currentItem: null,
  rung: 0,
  lives: 3,
  streak: 0,
  bestStreak: 0,
  timeLeft: null,
  score: 0,
  status: 'idle',
  answered: [],
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...INITIAL,

  startGame: ({ moduleId, gameMode, items, firstItem, lives = 3, timeLimitMs }) =>
    set({
      ...INITIAL,
      moduleId,
      gameMode,
      items,
      currentItem: firstItem,
      lives,
      timeLeft: timeLimitMs ?? null,
      status: 'playing',
    }),

  setCurrentItem: (item) => set({ currentItem: item }),

  answer: (response, currentLeitnerState, now) => {
    const s = get();
    if (!s.currentItem || s.status !== 'playing') {
      throw new Error('answer() called outside of a playing round');
    }
    const { correct, expected } = checkAnswer(s.currentItem.answer, response);
    const newLeitner = applyAnswer(currentLeitnerState, correct, now);
    const newStreak = correct ? s.streak + 1 : 0;
    set({
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
      lives: correct ? s.lives : s.lives - 1,
      rung: correct ? Math.min(s.rung + 1, 9) : s.rung,
      score: correct ? s.score + currentLeitnerState.box * 10 + 50 : s.score,
      answered: [
        ...s.answered,
        { itemId: s.currentItem.id, correct, newState: newLeitner },
      ],
    });
    return { correct, expected };
  },

  tickTimer: (deltaMs) => {
    const s = get();
    if (s.timeLeft === null || s.status !== 'playing') return;
    const next = s.timeLeft - deltaMs;
    set({ timeLeft: Math.max(0, next) });
  },

  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'playing' }),
  endGame: () => set({ status: 'finished' }),
  reset: () => set(INITIAL),
}));

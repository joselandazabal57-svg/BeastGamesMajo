/**
 * Content layer type stubs.
 *
 * F9-F13 expand these with concrete item banks. This file declares only the
 * shapes the state and UI layers depend on.
 *
 * Source of truth: docs/hltc-beast-games.md §5.1-§5.3, §6, §7.
 */

import type { ItemAnswer } from '@/domain/validation/answer';

export const MODULE_IDS = [
  'tablas',
  'divisiones',
  'varias-cifras',
  'mcm-mcd',
  'analiticos',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const GAME_MODES = ['reto-reloj', 'memoria', 'jefe-final'] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const LEARN_MODE = 'aprender' as const;
export const PRACTICE_MODE = 'practicar' as const;

/* ItemPrompt — discriminated union (HLTC §5.2) */
export type ArithmeticOp = '×' | '÷';

export type ItemPrompt =
  | { type: 'arithmetic'; a: number; b: number; op: ArithmeticOp }
  | { type: 'multidigit'; operands: readonly number[]; op: '×' }
  | { type: 'lcm-gcd'; numbers: readonly number[]; target: 'mcm' | 'mcd' }
  | { type: 'word-problem'; text: string }
  | { type: 'pattern'; sequence: readonly (number | null)[] }
  | { type: 'comparison'; left: ItemPrompt; right: ItemPrompt };

/* Core item shape used across content modules. */
export type Item = {
  id: string;
  moduleId: ModuleId;
  kind: string;
  prompt: ItemPrompt;
  answer: ItemAnswer;
  difficulty: 1 | 2 | 3;
  feedbackTemplateId: string;
};

/* Module metadata used by the home screen. F9 fills MODULES. */
export type Module = {
  id: ModuleId;
  label: string;
  emoji: string;
  accent: 'gold' | 'magenta' | 'lime' | 'gold-2';
};

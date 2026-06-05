/**
 * Module catalogue — filled in F9 as promised by src/content/types.ts.
 *
 * One entry per ModuleId. Order determines display order on the home screen.
 */

import type { Module } from './types';

export const MODULES: readonly Module[] = [
  {
    id: 'tablas',
    label: 'Tablas',
    emoji: '✖️',
    accent: 'gold',
  },
  {
    id: 'divisiones',
    label: 'Divisiones',
    emoji: '➗',
    accent: 'magenta',
  },
  {
    id: 'varias-cifras',
    label: 'Varias cifras',
    emoji: '🔢',
    accent: 'lime',
  },
  {
    id: 'mcm-mcd',
    label: 'MCM / MCD',
    emoji: '⚙️',
    accent: 'gold-2',
  },
  {
    id: 'analiticos',
    label: 'Analíticos',
    emoji: '🧩',
    accent: 'gold',
  },
] as const;

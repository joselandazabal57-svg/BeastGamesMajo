/**
 * Content registry — central map from ModuleId to its item bank.
 *
 * Each phase that adds a content module adds one entry here:
 *   F10 → tablas, divisiones
 *   F11 → varias-cifras
 *   F12 → mcm-mcd
 *   F13 → analiticos
 *
 * The game route uses `getModuleItems()` to load items without knowing
 * which modules are available yet.
 */

import type { ModuleId, Item } from '@/content/types';
import { TABLES_ITEMS } from '@/content/tables/items';
import { DIVISIONS_ITEMS } from '@/content/divisions/items';
import { MULTIDIGIT_ITEMS } from '@/content/multidigit/items';

export const CONTENT_REGISTRY: Partial<Record<ModuleId, readonly Item[]>> = {
  tablas: TABLES_ITEMS,
  divisiones: DIVISIONS_ITEMS,
  'varias-cifras': MULTIDIGIT_ITEMS,
  // 'mcm-mcd':    MCM_MCD_ITEMS,   ← F12
  // analiticos:   ANALYTICS_ITEMS, ← F13
};

/** Returns the item bank for a module, or undefined if not yet available. */
export function getModuleItems(moduleId: ModuleId): readonly Item[] | undefined {
  return CONTENT_REGISTRY[moduleId];
}

/** True if a module has at least one item available to play. */
export function hasContent(moduleId: ModuleId): boolean {
  const items = CONTENT_REGISTRY[moduleId];
  return items !== undefined && items.length > 0;
}

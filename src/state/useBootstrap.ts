/**
 * useBootstrap — one-shot client bootstrap on app open.
 *
 * Source of truth: docs/hltc-beast-games.md §5.6 (sessions) + §8 (errors).
 *
 * Order matters:
 *   1. Check isDbAvailable.
 *   2. settings.beginSession(now) — applies stale-session decrement
 *      to Leitner states BEFORE we cache them.
 *   3. settings.loadFromDb (syncs audioManager too).
 *   4. progress.loadFromDb.
 *
 * The hook returns one of:
 *   - { status: 'loading' }
 *   - { status: 'no-db' }    — IndexedDB unavailable; UI shows blocker
 *   - { status: 'ready' }
 *   - { status: 'error', error }
 */

'use client';

import { useEffect, useState } from 'react';
import { isDbAvailable, settingsRepo } from '@/infra/db/repos';
import { useSettingsStore } from './useSettingsStore';
import { useProgressStore } from './useProgressStore';
import { audioManager } from '@/infra/audio/manager';

export type BootstrapStatus =
  | { status: 'loading' }
  | { status: 'no-db' }
  | { status: 'ready' }
  | { status: 'error'; error: unknown };

export function useBootstrap(): BootstrapStatus {
  const [state, setState] = useState<BootstrapStatus>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const available = await isDbAvailable();
        if (!available) {
          if (!cancelled) setState({ status: 'no-db' });
          return;
        }
        // 1. Begin session (handles decrement if stale).
        await settingsRepo.beginSession(Date.now());
        // 2. Hydrate stores.
        await useSettingsStore.getState().loadFromDb();
        await useProgressStore.getState().loadFromDb();
        // 3. Preload audio (no-op if disabled).
        audioManager.preload();
        if (!cancelled) setState({ status: 'ready' });
      } catch (error) {
        if (!cancelled) setState({ status: 'error', error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

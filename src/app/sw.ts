/// <reference lib="webworker" />
/**
 * Service Worker — Serwist entrypoint.
 *
 * Source of truth: docs/hltc-beast-games.md §3.2.
 *
 * Strategy: precache the entire Next.js build manifest on first install,
 * then cache-first for every subsequent request. This is what makes the
 * app work fully offline after the first load.
 */

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

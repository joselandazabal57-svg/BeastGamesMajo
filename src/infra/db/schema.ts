/**
 * Dexie schema for Beast Games local storage.
 *
 * Source of truth: docs/hltc-beast-games.md §5 (data contracts).
 *
 * Tables:
 *   - settings      (singleton row, key = 'singleton')
 *   - leitnerStates (key = itemId)
 *   - prizeLedger   (singleton row, key = 'singleton')
 *   - sessionLog    (auto-increment id)
 *
 * Versioning: we start at v1. Any future schema change bumps the version and
 * adds a Dexie migration block.
 */

import Dexie, { type Table } from 'dexie';
import type { LeitnerState } from '@/domain/leitner/types';

export const SINGLETON_KEY = 'singleton' as const;

export type Settings = {
  /** Always 'singleton'. */
  id: typeof SINGLETON_KEY;
  audioEnabled: boolean;
  hasOnboarded: boolean;
  /** Unix ms timestamp of the last user interaction. Used for session-close detection. */
  lastInteractionAt: number;
};

export type PrizeLedger = {
  /** Always 'singleton'. */
  id: typeof SINGLETON_KEY;
  coins: number;
  gems: number;
  trophies: number;
  badges: string[];
};

export type SessionLogEntry = {
  id?: number;
  startedAt: number;
  endedAt: number;
  itemsAnswered: number;
  correct: number;
  wrong: number;
  coinsEarned: number;
};

/**
 * The Leitner state row as stored in Dexie. Schema-wise it's the same shape as
 * the domain `LeitnerState` — itemId is the primary key.
 */
export type LeitnerStateRow = LeitnerState;

export class BeastGamesDB extends Dexie {
  settings!: Table<Settings, typeof SINGLETON_KEY>;
  leitnerStates!: Table<LeitnerStateRow, string>;
  prizeLedger!: Table<PrizeLedger, typeof SINGLETON_KEY>;
  sessionLog!: Table<SessionLogEntry, number>;

  constructor() {
    super('beast-games');
    this.version(1).stores({
      // Primary key first; other fields after the comma are indexed columns.
      settings: 'id',
      leitnerStates: 'itemId, box, lastSeenAt',
      prizeLedger: 'id',
      sessionLog: '++id, startedAt',
    });
  }
}

/**
 * Lazy singleton. Constructing Dexie in module scope at import time would
 * fail in non-browser environments (SSR build, Node tests). We instantiate
 * on first access from a browser-side caller.
 */
let _db: BeastGamesDB | null = null;
export function getDb(): BeastGamesDB {
  if (_db === null) {
    _db = new BeastGamesDB();
  }
  return _db;
}

/** For tests: reset the singleton so a fresh in-memory Dexie can be created. */
export function _resetDbForTests(): void {
  _db = null;
}

/**
 * Default rows used to bootstrap the DB on first launch.
 */
export const DEFAULT_SETTINGS: Settings = {
  id: SINGLETON_KEY,
  audioEnabled: true,
  hasOnboarded: false,
  lastInteractionAt: 0,
};

export const DEFAULT_PRIZE_LEDGER: PrizeLedger = {
  id: SINGLETON_KEY,
  coins: 0,
  gems: 0,
  trophies: 0,
  badges: [],
};

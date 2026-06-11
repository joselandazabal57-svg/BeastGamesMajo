/**
 * Tests for rouletteRepo (T04 §B.4 / TB.14) + v2→v3 migration safety.
 */

import { beforeEach, describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { rouletteRepo, MAX_EARNED_SPINS, prizeRepo, leitnerRepo } from '@/infra/db/repos';
import {
  BeastGamesDB,
  _resetDbForTests,
  SINGLETON_KEY,
  DEFAULT_PRIZE_LEDGER,
} from '@/infra/db/schema';
import { initialState } from '@/domain/leitner/engine';

const DB_NAME = 'beast-games';
const TODAY = '2026-06-12';
const TOMORROW = '2026-06-13';

beforeEach(async () => {
  try {
    const tmp = new Dexie(DB_NAME);
    await tmp.delete();
  } catch {
    /* ignore */
  }
  _resetDbForTests();
});

describe('rouletteRepo', () => {
  it('seeds defaults on first read', async () => {
    const row = await rouletteRepo.get();
    expect(row.lastFreeSpinDay).toBe('');
    expect(row.earnedSpins).toBe(0);
    expect(row.pendingX2).toBe(false);
    expect(row.pendingPrizeId).toBeNull();
  });

  it('availableSpins = daily(1) + earned', async () => {
    expect(await rouletteRepo.availableSpins(TODAY)).toBe(1); // fresh: daily available
    await rouletteRepo.grantEarnedSpin();
    await rouletteRepo.grantEarnedSpin();
    expect(await rouletteRepo.availableSpins(TODAY)).toBe(3);
  });

  it('consumeSpin uses the daily free spin FIRST', async () => {
    await rouletteRepo.grantEarnedSpin();
    const after = await rouletteRepo.consumeSpin(TODAY);
    expect(after.lastFreeSpinDay).toBe(TODAY); // daily consumed
    expect(after.earnedSpins).toBe(1); // earned untouched
  });

  it('consumeSpin falls back to earned spins once daily is used', async () => {
    await rouletteRepo.grantEarnedSpin();
    await rouletteRepo.consumeSpin(TODAY); // daily
    const after = await rouletteRepo.consumeSpin(TODAY); // earned
    expect(after.earnedSpins).toBe(0);
  });

  it('consumeSpin throws when no spins remain', async () => {
    await rouletteRepo.consumeSpin(TODAY); // daily
    await expect(rouletteRepo.consumeSpin(TODAY)).rejects.toThrow(/giros/i);
  });

  it('the daily spin does NOT stack: a new day grants exactly one again', async () => {
    await rouletteRepo.consumeSpin(TODAY);
    expect(await rouletteRepo.availableSpins(TODAY)).toBe(0);
    // Next day: one daily again (not two).
    expect(await rouletteRepo.availableSpins(TOMORROW)).toBe(1);
  });

  it('grantEarnedSpin caps at MAX_EARNED_SPINS (3)', async () => {
    for (let i = 0; i < 5; i++) await rouletteRepo.grantEarnedSpin();
    const row = await rouletteRepo.get();
    expect(row.earnedSpins).toBe(MAX_EARNED_SPINS);
  });

  it('setPendingX2 and setPendingPrize persist', async () => {
    await rouletteRepo.setPendingX2(true);
    await rouletteRepo.setPendingPrize('bestial');
    const row = await rouletteRepo.get();
    expect(row.pendingX2).toBe(true);
    expect(row.pendingPrizeId).toBe('bestial');
    await rouletteRepo.setPendingPrize(null);
    expect((await rouletteRepo.get()).pendingPrizeId).toBeNull();
  });
});

describe('schema migration v2 → v3', () => {
  it('preserves v2 data and exposes the empty roulette table', async () => {
    // Build a DB with the v1+v2 schema only and populate it.
    const v2 = new Dexie(DB_NAME);
    v2.version(1).stores({
      settings: 'id',
      leitnerStates: 'itemId, box, lastSeenAt',
      prizeLedger: 'id',
      sessionLog: '++id, startedAt',
    });
    v2.version(2).stores({
      inventory: 'powerupId',
      streaks: 'id',
      records: 'key',
      globalsRecord: 'id',
    });
    await v2.open();
    await v2.table('prizeLedger').put({ ...DEFAULT_PRIZE_LEDGER, coins: 777 });
    await v2.table('leitnerStates').put(initialState('tablas.mult.6x7'));
    await v2.table('inventory').put({ powerupId: 'escudo', quantity: 2 });
    await v2.close();

    // Open with the full v3 schema.
    _resetDbForTests();
    const db = new BeastGamesDB();
    await db.open();

    expect((await db.prizeLedger.get(SINGLETON_KEY))?.coins).toBe(777);
    expect(await db.leitnerStates.count()).toBe(1);
    expect((await db.inventory.get('escudo'))?.quantity).toBe(2);
    // New v3 table accessible and empty.
    expect(await db.roulette.count()).toBe(0);
    await db.close();

    // Repos still work over the migrated DB.
    _resetDbForTests();
    expect((await prizeRepo.get()).coins).toBe(777);
    expect((await leitnerRepo.getAll())).toHaveLength(1);
    expect(await rouletteRepo.availableSpins(TODAY)).toBe(1);
  });
});

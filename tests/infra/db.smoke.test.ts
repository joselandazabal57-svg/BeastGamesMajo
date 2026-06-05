/**
 * Smoke test for the Dexie repos using fake-indexeddb.
 *
 * NOTE: this is NOT part of the contract's mandatory test coverage
 * (which only requires src/domain). It exists to validate the infra
 * layer end-to-end inside Node, complementing V4.2.
 */

import { beforeEach, describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import {
  settingsRepo,
  leitnerRepo,
  prizeRepo,
  sessionLogRepo,
  isDbAvailable,
} from '@/infra/db/repos';
import { _resetDbForTests, getDb } from '@/infra/db/schema';
import { applyAnswer, initialState } from '@/domain/leitner/engine';

beforeEach(async () => {
  // Wipe between tests so each starts clean.
  try {
    await getDb().delete();
  } catch {
    /* ignore if not yet created */
  }
  _resetDbForTests();
});

describe('infra/db smoke', () => {
  it('isDbAvailable returns true with fake-indexeddb installed', async () => {
    expect(await isDbAvailable()).toBe(true);
  });

  it('settings — first read seeds defaults', async () => {
    const s = await settingsRepo.get();
    expect(s.audioEnabled).toBe(true);
    expect(s.hasOnboarded).toBe(false);
    expect(s.lastInteractionAt).toBe(0);
  });

  it('settings — setAudio + markOnboarded persist', async () => {
    await settingsRepo.get(); // seed
    await settingsRepo.setAudio(false);
    await settingsRepo.markOnboarded();
    const s = await settingsRepo.get();
    expect(s.audioEnabled).toBe(false);
    expect(s.hasOnboarded).toBe(true);
  });

  it('leitnerRepo.getOrInit returns and persists a fresh state', async () => {
    const s = await leitnerRepo.getOrInit('tablas.mult.7x8');
    expect(s.box).toBe(0);
    expect(s.itemId).toBe('tablas.mult.7x8');

    // Re-fetching returns the same persisted row, not a fresh init.
    const s2 = await leitnerRepo.getOrInit('tablas.mult.7x8');
    expect(s2).toEqual(s);
  });

  it('leitnerRepo.bulkApply round-trips multiple states', async () => {
    const states = [
      applyAnswer(initialState('a'), true, 100),
      applyAnswer(initialState('b'), false, 100),
      applyAnswer(initialState('c'), true, 100),
    ];
    await leitnerRepo.bulkApply(states);
    const all = await leitnerRepo.getAll();
    expect(all).toHaveLength(3);
    const a = all.find((s) => s.itemId === 'a');
    expect(a?.box).toBe(1);
  });

  it('leitnerRepo.getByModule filters by prefix', async () => {
    await leitnerRepo.put(initialState('tablas.mult.2x3'));
    await leitnerRepo.put(initialState('divisiones.div.6_2'));
    const tablas = await leitnerRepo.getByModule('tablas');
    expect(tablas).toHaveLength(1);
    expect(tablas[0]!.itemId).toBe('tablas.mult.2x3');
  });

  it('prizeRepo — addCoins/Gems/Trophy accumulate', async () => {
    await prizeRepo.addCoins(100);
    await prizeRepo.addCoins(250);
    await prizeRepo.addGems(3);
    const l = await prizeRepo.addTrophy();
    expect(l.coins).toBe(350);
    expect(l.gems).toBe(3);
    expect(l.trophies).toBe(1);
  });

  it('prizeRepo — addBadge is idempotent', async () => {
    await prizeRepo.addBadge('tablas-master');
    const l = await prizeRepo.addBadge('tablas-master');
    expect(l.badges).toEqual(['tablas-master']);
  });

  it('sessionLog appends and retrieves entries newest-first', async () => {
    await sessionLogRepo.append({
      startedAt: 100,
      endedAt: 200,
      itemsAnswered: 5,
      correct: 4,
      wrong: 1,
      coinsEarned: 700,
    });
    await sessionLogRepo.append({
      startedAt: 300,
      endedAt: 400,
      itemsAnswered: 10,
      correct: 10,
      wrong: 0,
      coinsEarned: 5000,
    });
    const recent = await sessionLogRepo.recent();
    expect(recent).toHaveLength(2);
    expect(recent[0]!.startedAt).toBe(300);
  });

  it('beginSession with a stale lastInteractionAt decrements Leitner intervals', async () => {
    // Seed an item at box 2 with sessionsUntilReview=2 to verify decrement.
    await leitnerRepo.put({
      itemId: 'x',
      box: 2,
      sessionsUntilReview: 2,
      consecutiveCorrect: 2,
      totalSeen: 2,
      totalWrong: 0,
      lastSeenAt: 1_000,
    });
    // Seed settings with an old interaction time.
    await settingsRepo.get();
    await settingsRepo.touch(1_000);

    // Begin a session "much later" (over 30 min).
    await settingsRepo.beginSession(1_000 + 60 * 60 * 1000);

    const x = await leitnerRepo.getOrInit('x');
    expect(x.sessionsUntilReview).toBe(1); // decremented
  });

  it('hardReset wipes everything', async () => {
    await settingsRepo.get();
    await prizeRepo.addCoins(500);
    await leitnerRepo.put(initialState('y'));
    await settingsRepo.hardReset();
    expect((await leitnerRepo.getAll()).length).toBe(0);
    // settings.get reseeds defaults after reset
    const s = await settingsRepo.get();
    expect(s.audioEnabled).toBe(true);
    const l = await prizeRepo.get();
    expect(l.coins).toBe(0);
  });
});

/**
 * GameScreen — the core game loop for "reto-reloj" mode.
 *
 * State machine (local `phase`):
 *   'loading'  → start-up, boots the game store
 *   'question' → waiting for user input; timer running
 *   'feedback' → brief flash after answer (700ms), input locked
 *   'finished' → game over (lives=0) or completed (N questions done)
 *
 * Responsibilities:
 *   - Wire useGameStore.startGame() on mount.
 *   - Run the 100ms timer tick via setInterval.
 *   - On answer: call useGameStore.answer(), persist via useProgressStore,
 *     award coins, play sound, show FeedbackFlash, then advance.
 *   - On timeout: treat as wrong answer.
 *   - On advance: pick next item via selectNextItem() (Leitner engine).
 *
 * Constants (reto-reloj):
 *   TIME_PER_Q  = 10s per question
 *   TOTAL_Q     = 10 questions per round (one per ladder rung)
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore, useProgressStore } from '@/state';
import { selectNextItem, initialState } from '@/domain/leitner/engine';
import { coinsForCorrect } from '@/domain/scoring/coins';
import { audioManager } from '@/infra/audio/manager';
import type { Item, ModuleId } from '@/content/types';
import { PromptDisplay } from './PromptDisplay';
import { NumericInput } from './NumericInput';
import { GameHUD } from './GameHUD';
import { FeedbackFlash, PrizeLadder, Button, LivesRow } from '@/ui/shared';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TIME_PER_Q_MS = 10_000;
const TOTAL_Q = 10;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Phase = 'loading' | 'question' | 'feedback' | 'finished';
type FinishReason = 'gameover' | 'completed';

/* ------------------------------------------------------------------ */
/* GameScreen                                                          */
/* ------------------------------------------------------------------ */

interface GameScreenProps {
  moduleId: ModuleId;
  items: readonly Item[];
}

export function GameScreen({ moduleId, items }: GameScreenProps) {
  const router = useRouter();

  /* Game store selectors */
  const gameStatus = useGameStore((s) => s.status);
  const currentItem = useGameStore((s) => s.currentItem);
  const lives = useGameStore((s) => s.lives);
  const timeLeft = useGameStore((s) => s.timeLeft);
  const startGame = useGameStore((s) => s.startGame);
  const answerAction = useGameStore((s) => s.answer);
  const setCurrentItem = useGameStore((s) => s.setCurrentItem);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const endGame = useGameStore((s) => s.endGame);
  const reset = useGameStore((s) => s.reset);

  /* Progress store actions */
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const addCoins = useProgressStore((s) => s.addCoins);

  /* Local state machine */
  const [phase, setPhase] = useState<Phase>('loading');
  const [flash, setFlash] = useState<'correct' | 'wrong' | 'idle'>('idle');
  const [finishReason, setFinishReason] = useState<FinishReason>('completed');
  const [questionCount, setQuestionCount] = useState(0);
  const [showLadder, setShowLadder] = useState(false);

  /* Refs to avoid stale closures in timeout callbacks */
  const phaseRef = useRef<Phase>('loading');
  phaseRef.current = phase;

  /* ── Boot ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const statesByItem = useProgressStore.getState().statesByItem;
    const moduleStates = Object.values(statesByItem).filter((s) =>
      s.itemId.startsWith(moduleId + '.'),
    );
    const first = selectNextItem(moduleStates, items) ?? items[0];
    if (!first) {
      router.back();
      return;
    }
    startGame({
      moduleId,
      gameMode: 'reto-reloj',
      items,
      firstItem: first,
      lives: 3,
      timeLimitMs: TIME_PER_Q_MS,
    });
    setPhase('question');

    return () => {
      reset();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Timer tick (only during 'question' phase) ─────────────────── */
  useEffect(() => {
    if (phase !== 'question') return;
    const id = setInterval(() => tickTimer(100), 100);
    return () => clearInterval(id);
  }, [phase, tickTimer]);

  /* ── Detect timeout ────────────────────────────────────────────── */
  useEffect(() => {
    if (phase === 'question' && timeLeft === 0) {
      handleWrong(true);
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ───────────────────────────────────────────────────── */

  function pickNext(): Item | undefined {
    const statesByItem = useProgressStore.getState().statesByItem;
    const moduleStates = Object.values(statesByItem).filter((s) =>
      s.itemId.startsWith(moduleId + '.'),
    );
    return selectNextItem(moduleStates, items) ?? items[0];
  }

  function advance(nextCount: number) {
    if (nextCount >= TOTAL_Q) {
      setFinishReason('completed');
      setPhase('finished');
      endGame();
      audioManager.play('victory');
      return;
    }
    const next = pickNext();
    if (next) setCurrentItem(next);
    useGameStore.setState({ timeLeft: TIME_PER_Q_MS });
    setQuestionCount(nextCount);
    setPhase('question');
  }

  const handleAnswer = useCallback(
    (value: number) => {
      if (phaseRef.current !== 'question') return;
      const item = useGameStore.getState().currentItem;
      if (!item) return;

      const statesByItem = useProgressStore.getState().statesByItem;
      const leitnerState =
        statesByItem[item.id] ?? initialState(item.id);

      const oldRung = useGameStore.getState().rung;
      const { correct } = answerAction(
        { type: 'numeric', value },
        leitnerState,
        Date.now(),
      );

      void recordAnswer(item.id, moduleId, correct, Date.now());

      if (correct) {
        void addCoins(coinsForCorrect(oldRung));
        audioManager.play('correct');
        setTimeout(() => audioManager.play('ladder-up'), 150);
        setFlash('correct');
        setPhase('feedback');
        setTimeout(() => {
          setFlash('idle');
          const newCount = questionCount + 1;
          advance(newCount);
        }, 700);
      } else {
        handleWrong(false);
      }
    },
    [phaseRef, answerAction, recordAnswer, addCoins, moduleId, questionCount], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function handleWrong(isTimeout: boolean) {
    if (phaseRef.current !== 'question') return;

    if (!isTimeout) {
      const item = useGameStore.getState().currentItem;
      if (item) {
        const statesByItem = useProgressStore.getState().statesByItem;
        const leitnerState = statesByItem[item.id] ?? initialState(item.id);
        answerAction({ type: 'numeric', value: -1 }, leitnerState, Date.now());
        void recordAnswer(item.id, moduleId, false, Date.now());
      }
    } else {
      // Timeout: decrement lives without going through full answer flow
      useGameStore.setState((s) => ({ lives: Math.max(0, s.lives - 1) }));
    }

    audioManager.play('wrong');
    setFlash('wrong');
    setPhase('feedback');

    setTimeout(() => {
      setFlash('idle');
      const newLives = useGameStore.getState().lives;
      if (newLives <= 0) {
        setFinishReason('gameover');
        setPhase('finished');
        endGame();
        audioManager.play('gameover');
        return;
      }
      const newCount = questionCount + 1;
      advance(newCount);
    }, 700);
  }

  /* ── Render ────────────────────────────────────────────────────── */

  if (phase === 'loading' || gameStatus === 'idle') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-4 border-white/10 border-t-(--color-gold) animate-spin"
          aria-label="Cargando"
        />
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <FinishedScreen
        reason={finishReason}
        onReplay={() => {
          router.refresh();
        }}
        onHome={() => router.back()}
      />
    );
  }

  return (
    <motion.div
      className="min-h-full flex flex-col px-5 pt-4 pb-6 gap-4 max-w-sm mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* HUD */}
      <GameHUD maxTimeMs={TIME_PER_Q_MS} />

      {/* Progress pill */}
      <div className="flex items-center justify-between text-xs text-white/30">
        <span>
          {questionCount + 1} / {TOTAL_Q}
        </span>
        <button
          type="button"
          onClick={() => setShowLadder((v) => !v)}
          className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          aria-label="Ver escalera de premios"
        >
          🏆 Escalera
        </button>
      </div>

      {/* Prize ladder (toggleable) */}
      {showLadder && (
        <div
          className="rounded-2xl p-3 border border-white/10"
          style={{ background: 'var(--color-panel)' }}
        >
          <PrizeLadder
            currentRung={useGameStore.getState().rung}
            compact
          />
        </div>
      )}

      {/* Prompt */}
      <div className="flex-1 flex items-center justify-center">
        {currentItem && <PromptDisplay prompt={currentItem.prompt} />}
      </div>

      {/* Numeric input */}
      <NumericInput
        onConfirm={handleAnswer}
        disabled={phase !== 'question'}
      />

      {/* Feedback overlay */}
      <FeedbackFlash state={flash} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* FinishedScreen                                                      */
/* ------------------------------------------------------------------ */

function FinishedScreen({
  reason,
  onReplay,
  onHome,
}: {
  reason: FinishReason;
  onReplay: () => void;
  onHome: () => void;
}) {
  const rung = useGameStore((s) => s.rung);
  const score = useGameStore((s) => s.score);
  const bestStreak = useGameStore((s) => s.bestStreak);
  const isVictory = reason === 'completed';

  return (
    <motion.div
      className="min-h-full flex flex-col items-center justify-center px-6 gap-6 text-center max-w-sm mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <span className="text-8xl" aria-hidden>
        {isVictory ? '🏆' : '💀'}
      </span>

      <h1
        className="font-[family-name:var(--font-display)] text-4xl uppercase"
        style={{ color: isVictory ? 'var(--color-gold)' : 'var(--color-red-glow)' }}
      >
        {isVictory ? '¡Lo lograste!' : 'Game Over'}
      </h1>

      {/* Stats grid */}
      <div
        className="w-full grid grid-cols-3 gap-2 rounded-2xl p-4 border border-white/10"
        style={{ background: 'var(--color-panel)' }}
      >
        <Stat label="Peldaño" value={rung + 1} suffix="/10" />
        <Stat label="Monedas" value={score} />
        <Stat label="Racha" value={bestStreak} />
      </div>

      {/* Lives remaining */}
      {!isVictory && (
        <div className="flex flex-col items-center gap-1">
          <LivesRow lives={useGameStore.getState().lives} />
          <p className="text-xs text-white/30">vidas al terminar</p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Button fullWidth onClick={onReplay}>
          Jugar de nuevo
        </Button>
        <Button variant="ghost" fullWidth onClick={onHome}>
          Inicio
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-[family-name:var(--font-display)] text-3xl leading-none"
        style={{ color: 'var(--color-gold)' }}
      >
        {value}
        {suffix && (
          <span className="text-lg text-white/30">{suffix}</span>
        )}
      </span>
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}

/**
 * /practicar/[moduleId] — Free practice screen.
 *
 * Like reto-reloj but with no timer, no lives, and no prize ladder.
 * Records answers and updates Leitner state so the game benefits from practice.
 * Earns a small number of coins (half the game rate) as encouragement.
 *
 * Flow: question → numeric input → answer → feedback (700ms) → next
 * Session ends after TOTAL_PRACTICE_Q questions or when player hits "Terminar".
 */

'use client';

import { use, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MODULE_IDS, type ModuleId } from '@/content/types';
import { MODULES } from '@/content/modules';
import { getModuleItems } from '@/content/registry';
import { useProgressStore } from '@/state';
import { selectNextItem, initialState } from '@/domain/leitner/engine';
import { coinsForCorrect } from '@/domain/scoring/coins';
import { audioManager } from '@/infra/audio/manager';
import { Button, FeedbackFlash, StreakBadge } from '@/ui/shared';
import { PromptDisplay, NumericInput } from '@/ui/game';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_PRACTICE_Q = 15;
/** Practice earns a fraction of the game coins (no prize ladder). */
const PRACTICE_COIN_DIVISOR = 2;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Phase = 'question' | 'feedback' | 'done';

function isModuleId(s: string): s is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(s);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function PracticarPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const router = useRouter();

  if (!isModuleId(moduleId)) {
    return <ErrorScreen message={`Módulo no encontrado: "${moduleId}"`} onBack={() => router.back()} />;
  }

  const items = getModuleItems(moduleId);
  if (!items || items.length === 0) {
    return <ErrorScreen message="Este módulo aún no tiene contenido." onBack={() => router.back()} />;
  }

  return <PracticeSession moduleId={moduleId} items={items} />;
}

/* ------------------------------------------------------------------ */
/* PracticeSession                                                      */
/* ------------------------------------------------------------------ */

function PracticeSession({
  moduleId,
  items,
}: {
  moduleId: ModuleId;
  items: ReturnType<typeof getModuleItems> & {};
}) {
  const router = useRouter();
  const moduleData = MODULES.find((m) => m.id === moduleId);

  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const addCoins    = useProgressStore((s) => s.addCoins);

  const [phase, setPhase] = useState<Phase>('question');
  const [flash, setFlash] = useState<'correct' | 'wrong' | 'idle'>('idle');
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount]   = useState(0);
  const [streak, setStreak]               = useState(0);
  const [bestStreak, setBestStreak]       = useState(0);
  const [lastCorrect, setLastCorrect]     = useState<boolean | null>(null);
  const [lastAnswer, setLastAnswer]       = useState<number | null>(null);

  const [currentItem, setCurrentItem] = useState(() => {
    const statesByItem = useProgressStore.getState().statesByItem;
    const moduleStates = Object.values(statesByItem).filter((s) =>
      s.itemId.startsWith(moduleId + '.'),
    );
    return selectNextItem(moduleStates, items) ?? items[0]!;
  });

  const phaseRef = useRef<Phase>('question');
  phaseRef.current = phase;

  function pickNext() {
    const statesByItem = useProgressStore.getState().statesByItem;
    const moduleStates = Object.values(statesByItem).filter((s) =>
      s.itemId.startsWith(moduleId + '.'),
    );
    return selectNextItem(moduleStates, items) ?? items[0]!;
  }

  const handleAnswer = useCallback(
    (value: number) => {
      if (phaseRef.current !== 'question') return;

      const item = currentItem;
      const statesByItem = useProgressStore.getState().statesByItem;
      const leitnerState = statesByItem[item.id] ?? initialState(item.id);

      // Check correctness
      const correct =
        item.answer.type === 'numeric' && item.answer.value === value;

      void recordAnswer(item.id, moduleId, correct, Date.now());

      if (correct) {
        const coins = Math.max(1, Math.floor(coinsForCorrect(0) / PRACTICE_COIN_DIVISOR));
        void addCoins(coins);
        audioManager.play('correct');
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        setCorrectCount((c) => c + 1);
        setFlash('correct');
      } else {
        audioManager.play('wrong');
        setStreak(0);
        setFlash('wrong');
      }

      setLastCorrect(correct);
      setLastAnswer(
        item.answer.type === 'numeric' ? item.answer.value : null,
      );
      setPhase('feedback');

      setTimeout(() => {
        setFlash('idle');
        const next = questionCount + 1;
        if (next >= TOTAL_PRACTICE_Q) {
          setQuestionCount(next);
          setPhase('done');
          return;
        }
        setCurrentItem(pickNext());
        setQuestionCount(next);
        setLastCorrect(null);
        setLastAnswer(null);
        setPhase('question');
      }, 900);
    },
    [currentItem, questionCount, moduleId, recordAnswer, addCoins], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const accentColor = moduleData
    ? `var(--color-${moduleData.accent})`
    : 'var(--color-gold)';

  /* ── Done screen ── */
  if (phase === 'done') {
    return (
      <motion.main
        className="min-h-full flex flex-col items-center justify-center px-6 gap-6 text-center max-w-sm mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <span className="text-8xl" aria-hidden>✏️</span>
        <h1
          className="font-[family-name:var(--font-display)] text-4xl uppercase"
          style={{ color: accentColor }}
        >
          Práctica lista
        </h1>
        <div
          className="w-full grid grid-cols-3 gap-2 rounded-2xl p-4 border border-white/10"
          style={{ background: 'var(--color-panel)' }}
        >
          <PracticeStat label="Correctas" value={correctCount} color="var(--color-lime)" />
          <PracticeStat
            label="Errores"
            value={TOTAL_PRACTICE_Q - correctCount}
            color="var(--color-red-glow)"
          />
          <PracticeStat label="Racha máx." value={bestStreak} color={accentColor} />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button fullWidth onClick={() => router.refresh()}>
            Otra ronda
          </Button>
          <Button variant="ghost" fullWidth onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="min-h-full flex flex-col px-5 pt-4 pb-6 gap-4 max-w-sm mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
        >
          ← Volver
        </button>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          <span className="text-xs text-white/30">
            {questionCount + 1} / {TOTAL_PRACTICE_Q}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(questionCount / TOTAL_PRACTICE_Q) * 100}%`,
            background: accentColor,
          }}
        />
      </div>

      {/* Prompt */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <PromptDisplay prompt={currentItem.prompt} />

        {/* Show correct answer after wrong response */}
        {phase === 'feedback' && lastCorrect === false && lastAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <p className="text-xs text-white/30 uppercase tracking-wider">
              Respuesta correcta
            </p>
            <span
              className="font-[family-name:var(--font-display)] text-4xl leading-none"
              style={{ color: 'var(--color-gold)' }}
            >
              {lastAnswer}
            </span>
          </motion.div>
        )}
      </div>

      {/* Numeric input */}
      <NumericInput
        onConfirm={handleAnswer}
        disabled={phase !== 'question'}
      />

      {/* Feedback overlay */}
      <FeedbackFlash state={flash} />
    </motion.main>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function PracticeStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-[family-name:var(--font-display)] text-3xl leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}

function ErrorScreen({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <main className="min-h-full flex flex-col items-center justify-center gap-6 p-8 text-center max-w-sm mx-auto">
      <span className="text-6xl" aria-hidden>🚧</span>
      <p className="text-sm text-white/60 leading-relaxed">{message}</p>
      <Button variant="ghost" onClick={onBack}>← Volver</Button>
    </main>
  );
}

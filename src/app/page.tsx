/**
 * Home placeholder — Fase 8 UI compartida showcase.
 *
 * This page exercises every shared component so visual QA can be done
 * in the browser. Fases 9+ will replace it with the real home screen.
 */

'use client';

import { useState } from 'react';
import {
  Button,
  CoinBadge,
  LivesRow,
  StreakBadge,
  PrizeLadder,
  MasteryBar,
  AudioToggle,
  FeedbackFlash,
  Modal,
} from '@/ui/shared';

export default function Home() {
  const [coins, setCoins] = useState(1250);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(4);
  const [rung, setRung] = useState(2);
  const [flash, setFlash] = useState<'correct' | 'wrong' | 'idle'>('idle');
  const [modalOpen, setModalOpen] = useState(false);

  function triggerFlash(state: 'correct' | 'wrong') {
    setFlash(state);
    setTimeout(() => setFlash('idle'), 700);
  }

  return (
    <main className="min-h-full flex flex-col gap-8 px-5 py-8 max-w-sm mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1
          className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none"
          style={{
            background: 'linear-gradient(180deg,#fff,var(--color-gold))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Beast<br />Games
        </h1>
        <AudioToggle />
      </header>

      <p className="text-(--color-gold) text-xs font-semibold uppercase tracking-[0.2em]">
        ★ UI compartida · Fase 8 ★
      </p>

      {/* Coins + Lives + Streak row */}
      <section
        className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-white/10"
        style={{ background: 'var(--color-panel)' }}
        aria-label="Estado del jugador"
      >
        <CoinBadge coins={coins} />
        <LivesRow lives={lives} />
        <StreakBadge streak={streak} />
      </section>

      {/* Buttons to mutate state */}
      <section className="grid grid-cols-2 gap-3">
        <Button onClick={() => setCoins((c) => c + 250)}>+250 monedas</Button>
        <Button variant="ghost" onClick={() => setLives((l) => Math.max(0, l - 1))}>
          Perder vida
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStreak((s) => (s === 0 ? 0 : s - 1))}
        >
          Bajar racha
        </Button>
        <Button onClick={() => setStreak((s) => s + 1)}>+1 racha</Button>
        <Button
          onClick={() => {
            setCoins((c) => c + 300);
            setStreak((s) => s + 1);
            setRung((r) => Math.min(9, r + 1));
            triggerFlash('correct');
          }}
        >
          ✓ Correcto
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            setLives((l) => Math.max(0, l - 1));
            setStreak(0);
            triggerFlash('wrong');
          }}
        >
          ✗ Incorrecto
        </Button>
      </section>

      {/* Modal trigger */}
      <Button variant="ghost" fullWidth onClick={() => setModalOpen(true)}>
        Abrir modal de prueba
      </Button>

      {/* Mastery bars */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Progreso por módulo
        </h2>
        <MasteryBar percent={72} accent="gold" label="Tablas" showPercent />
        <MasteryBar percent={45} accent="magenta" label="Divisiones" showPercent />
        <MasteryBar percent={100} accent="lime" label="Varias cifras" showPercent />
        <MasteryBar percent={18} accent="gold-2" label="MCM / MCD" showPercent />
        <MasteryBar percent={0} accent="gold" label="Analíticos" showPercent />
      </section>

      {/* Prize ladder */}
      <section
        className="p-4 rounded-2xl border border-white/10"
        style={{ background: 'var(--color-panel)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
          Escalera · rung actual: {rung + 1}
        </h2>
        <PrizeLadder currentRung={rung} />
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRung((r) => Math.max(-1, r - 1))}
          >
            ↓
          </Button>
          <Button
            size="sm"
            onClick={() => setRung((r) => Math.min(9, r + 1))}
          >
            ↑
          </Button>
        </div>
      </section>

      {/* FeedbackFlash */}
      <FeedbackFlash state={flash} />

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="¡Premio!"
      >
        <div className="text-center flex flex-col gap-4">
          <span className="text-7xl">🏆</span>
          <p className="text-white/70 text-sm">
            Ganaste el Gran Trofeo y 5.000 monedas.
          </p>
          <Button fullWidth onClick={() => setModalOpen(false)}>
            ¡Genial!
          </Button>
        </div>
      </Modal>
    </main>
  );
}

/**
 * /modulo/[moduleId] — module detail page.
 *
 * Shows mastery stats for the module and lets the player pick a game mode:
 *   - reto-reloj (⏱): timed, 3 lives, prize ladder
 *   - memoria    (🧠): relaxed, adaptive Leitner
 *   - jefe-final (👊): no net, full 10-rung ladder climb
 *
 * Also has Aprender (📖) and Practicar (✏️) buttons for non-game modes.
 *
 * Game/learn/practice screens are built in future phases. Clicking any mode
 * button shows a "próximamente" modal so nothing 404s in the meantime.
 *
 * Note: Next.js 16 passes params as Promise — use React.use() in Client
 * Components (see dynamic-routes.md).
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MODULE_IDS, type ModuleId } from '@/content/types';
import { MODULES } from '@/content/modules';
import { hasContent } from '@/content/registry';
import { useProgressStore } from '@/state';
import { Button, MasteryBar, Modal } from '@/ui/shared';

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

type GameMode = 'reto-reloj' | 'memoria' | 'jefe-final';

function isModuleId(s: string): s is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(s);
}

/* ------------------------------------------------------------------ */
/* Mode cards config                                                   */
/* ------------------------------------------------------------------ */

type ModeConfig = {
  id: GameMode;
  emoji: string;
  label: string;
  description: string;
  accentVar: string;
};

const GAME_MODES: readonly ModeConfig[] = [
  {
    id: 'reto-reloj',
    emoji: '⏱',
    label: 'Reto Reloj',
    description: 'Responde antes de que el tiempo se acabe. 3 vidas. Escalera de premios.',
    accentVar: 'var(--color-gold)',
  },
  {
    id: 'memoria',
    emoji: '🧠',
    label: 'Memoria',
    description: 'Sin límite de tiempo. El sistema Leitner decide qué practicar.',
    accentVar: 'var(--color-magenta)',
  },
  {
    id: 'jefe-final',
    emoji: '👊',
    label: 'Jefe Final',
    description: 'La escalera completa. Sin red de seguridad.',
    accentVar: 'var(--color-red-glow)',
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const router = useRouter();

  // Mastery data from store.
  const moduleMastery = useProgressStore((s) => s.moduleMastery);

  // "próximamente" modal state.
  const [comingSoon, setComingSoon] = useState(false);

  // Validate the moduleId.
  if (!isModuleId(moduleId)) {
    return (
      <main className="min-h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-5xl" aria-hidden>❓</span>
        <p className="text-white/60 text-sm">Módulo no encontrado: {moduleId}</p>
        <Button variant="ghost" onClick={() => router.back()}>
          ← Volver
        </Button>
      </main>
    );
  }

  const moduleData = MODULES.find((m) => m.id === moduleId);
  if (!moduleData) {
    // Should be unreachable since moduleId is validated above, but satisfies TS.
    return null;
  }

  const mastery = moduleMastery[moduleId] ?? {
    masteredCount: 0,
    inProgressCount: 0,
    weakCount: 0,
    masteryPercent: 0,
  };

  const total = mastery.masteredCount + mastery.inProgressCount + mastery.weakCount;

  return (
    <motion.main
      className="min-h-full flex flex-col px-5 pt-5 pb-10 gap-6 max-w-sm mx-auto"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="self-start flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors cursor-pointer"
        aria-label="Volver a inicio"
      >
        ← Inicio
      </button>

      {/* Module identity */}
      <header className="flex items-center gap-4">
        <div
          className="flex-none flex items-center justify-center w-16 h-16 rounded-2xl text-4xl"
          style={{ background: 'var(--color-panel)' }}
          aria-hidden
        >
          {moduleData.emoji}
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none">
            {moduleData.label}
          </h1>
          <MasteryBar
            percent={mastery.masteryPercent}
            accent={moduleData.accent}
            showPercent
          />
        </div>
      </header>

      {/* Mastery stats */}
      <section
        className="grid grid-cols-3 gap-2 rounded-2xl p-4 border border-white/10"
        style={{ background: 'var(--color-panel)' }}
        aria-label="Estadísticas de maestría"
      >
        <Stat label="Dominadas" value={mastery.masteredCount} color="var(--color-lime)" />
        <Stat label="Aprendiendo" value={mastery.inProgressCount} color="var(--color-gold)" />
        <Stat label="Frágiles" value={mastery.weakCount} color="var(--color-red-glow)" />
      </section>

      {total === 0 && (
        <p className="text-xs text-white/30 text-center -mt-3">
          Aún no has practicado este módulo.
        </p>
      )}

      {/* Game modes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
          Modo de juego
        </h2>
        <div className="flex flex-col gap-2">
          {GAME_MODES.map((mode) => {
            // T05: all modes are live for modules that have content.
            const isLive = isModuleId(moduleId) && hasContent(moduleId);
            return (
              <ModeCard
                key={mode.id}
                mode={mode}
                onPlay={
                  isLive
                    ? () => router.push(`/jugar/${moduleId}/${mode.id}`)
                    : () => setComingSoon(true)
                }
                live={isLive}
              />
            );
          })}
        </div>
      </section>

      {/* Free practice */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
          Sin presión
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={
              hasContent(moduleId)
                ? () => router.push(`/aprender/${moduleId}`)
                : () => setComingSoon(true)
            }
            className="flex-col h-16 gap-1"
          >
            <span className="text-xl" aria-hidden>📖</span>
            <span className="text-xs">Aprender</span>
          </Button>
          <Button
            variant="ghost"
            onClick={
              hasContent(moduleId)
                ? () => router.push(`/practicar/${moduleId}`)
                : () => setComingSoon(true)
            }
            className="flex-col h-16 gap-1"
          >
            <span className="text-xl" aria-hidden>✏️</span>
            <span className="text-xs">Practicar</span>
          </Button>
        </div>
      </section>

      {/* Coming soon modal */}
      <Modal
        open={comingSoon}
        onClose={() => setComingSoon(false)}
        title="¡Pronto!"
      >
        <p className="text-center text-white/60 text-sm">
          Este modo se activa en la próxima fase.
          <br />
          Los módulos de contenido y las pantallas de juego están en construcción.
        </p>
        <Button fullWidth onClick={() => setComingSoon(false)}>
          Entendido
        </Button>
      </Modal>
    </motion.main>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span
        className="font-[family-name:var(--font-display)] text-2xl leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[10px] text-white/40 leading-tight">{label}</span>
    </div>
  );
}

function ModeCard({
  mode,
  onPlay,
  live = false,
}: {
  mode: ModeConfig;
  onPlay: () => void;
  live?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onPlay}
      className="flex items-center gap-4 p-4 rounded-xl border text-left w-full cursor-pointer transition-colors duration-150"
      style={{
        background: 'var(--color-panel)',
        borderColor: `color-mix(in srgb, ${mode.accentVar} ${live ? '45%' : '25%'}, transparent)`,
      }}
      aria-label={`Jugar ${mode.label}${live ? '' : ' (próximamente)'}`}
    >
      <span className="flex-none text-3xl leading-none" aria-hidden>
        {mode.emoji}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className="font-[family-name:var(--font-display)] text-lg uppercase leading-none"
          style={{ color: mode.accentVar }}
        >
          {mode.label}
        </span>
        <span className="text-xs text-white/40 leading-snug">
          {mode.description}
        </span>
      </div>
      {live ? (
        <span
          className="flex-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: mode.accentVar, color: 'var(--color-bg)' }}
        >
          Jugar
        </span>
      ) : (
        <span className="flex-none text-[10px] text-white/20 uppercase tracking-wider">
          Pronto
        </span>
      )}
    </motion.button>
  );
}

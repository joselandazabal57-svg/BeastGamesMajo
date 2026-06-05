/**
 * HomeScreen — the main entry point after bootstrap.
 *
 * Renders the header and a staggered grid of module cards, each wired to the
 * live mastery data from useProgressStore.
 */

'use client';

import { motion } from 'framer-motion';
import { HomeHeader } from './HomeHeader';
import { ModuleCard } from './ModuleCard';
import { MODULES } from '@/content/modules';
import { useProgressStore } from '@/state';

const STAGGER = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  },
};

export function HomeScreen() {
  const moduleMastery = useProgressStore((s) => s.moduleMastery);

  return (
    <div className="min-h-full flex flex-col">
      <HomeHeader />

      <main className="flex-1 flex flex-col px-5 pb-8 gap-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mt-1">
          Elige un módulo
        </p>

        <motion.div
          className="flex flex-col gap-3"
          variants={STAGGER.container}
          initial="hidden"
          animate="show"
          role="list"
          aria-label="Módulos de matemáticas"
        >
          {MODULES.map((module) => (
            <motion.div key={module.id} variants={STAGGER.item} role="listitem">
              <ModuleCard
                module={module}
                mastery={moduleMastery[module.id] ?? {
                  masteredCount: 0,
                  inProgressCount: 0,
                  weakCount: 0,
                  masteryPercent: 0,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

# T05 — Modos de Juego (Memoria + Jefe Final) + Logros

**Tipo**: Brief de implementación
**Estado**: ✅ EJECUTADO (2026-06-12)
**Contrato fuente**: `docs/hltc-beast-games.md` + briefs T01/T02/T04
**Idioma**: contenido en español, código en inglés.

> Nota: la mayor parte de la implementación (modos + sistema de logros) fue
> creada el 2026-06-11 por una sesión previa. Esta ejecución la completó:
> wiring del logro de compra, tests de dominio, test de migración v3→v4,
> validación y documentación.

---

## Objective

Cerrar la funcionalidad central del juego con los dos modos que faltaban
(Memoria 🧠 y Jefe Final 👊, antes mostraban "próximamente") y añadir un
sistema de logros desbloqueables que premia el progreso a largo plazo.

## Out of scope
- Compra de logros o de cualquier ventaja con dinero real.
- Logros que requieran servidor o comparación con otros usuarios.
- Cambios al motor Leitner (`engine.ts`, `boxes.ts`, `session.ts`).

---

## F25 — Modo Memoria 🧠

`src/ui/game/MemoriaScreen.tsx`. Relajado, sin reloj ni vidas:
- 15 preguntas, Leitner elige qué practicar (`selectNextItem`).
- Monedas planas: 25 por acierto (mitad del ritmo competitivo).
- Tras fallar muestra la respuesta correcta 1.5s.
- Rachas y récords se registran normalmente; NO otorga giro de ruleta.
- Acento magenta. Pantalla final con precisión y monedas.

## F26 — Modo Jefe Final 👊

`src/ui/game/BossFinalScreen.tsx`. Máxima dificultad:
- 1 sola vida — un error = Game Over.
- 8s por pregunta (vs. 12s de reto-reloj).
- 10 preguntas (escalera completa). Monedas ×3.
- Sin ventajas (modo puro). Borde rojo pulsante + screen-shake al fallar.
- Otorga giro de ruleta con ≥8/10. Desbloquea `jefe-derrotado` y, con 10/10,
  `jefe-perfecto`.

Ambos modos están conectados en `/jugar/[moduleId]/[mode]` y activados en
`/modulo/[moduleId]` (todos los modos `isLive` si el módulo tiene contenido).

## F27 — Sistema de Logros 🏅

- **Dominio** `src/domain/achievements/`:
  - `catalog.ts`: 18 logros cerrados con `AchievementId` union, 4 categorías
    (juego, progreso, tienda, ruleta), `achievementById` con throw.
  - `check.ts`: `checkAchievements(snapshot)` puro — devuelve solo los IDs
    NUEVOS (cumplen condición y no estaban desbloqueados). Snapshot ensamblado
    por el store desde progress/streaks/inventory + flags de señal.
- **Datos**: Dexie v4 con tabla `achievements` (PK `achievementId`), aditiva,
  migración sin pérdida. `achievementsRepo.unlock` idempotente (preserva el
  primer timestamp).
- **Store** `useAchievementsStore`: `loadFromDb`, `checkAndUnlock` (ensambla
  snapshot, persiste nuevos, encola toasts), señales `signalBossComplete`,
  `signalRetoComplete`, `signalBestial`, `signalPurchase`, cola de toasts.
- **UI**: `AchievementToast` (toast flotante 3.5s + sonido), `AchievementBadge`
  (grid en /records, bloqueados en gris), `AchievementToastProvider` global en
  el layout. Sección "🏅 Logros N/18" en el Salón de Récords.
- **Disparadores de `checkAndUnlock`**: fin de ronda en GameScreen (reto-reloj),
  MemoriaScreen y BossFinalScreen; revelación/reto de la ruleta; y compra en la
  tienda (PowerupCard → `signalPurchase` + `checkAndUnlock`).

---

## Execution Report

### Task Status
- [x] F25 — MemoriaScreen completo y ruteado
- [x] F26 — BossFinalScreen completo y ruteado
- [x] F27.1 — catalog.ts (18 logros, 4 categorías, union type)
- [x] F27.2 — check.ts (checker puro, filtra ya-desbloqueados)
- [x] F27.3 — Dexie v4 tabla achievements + achievementsRepo idempotente
- [x] F27.4 — useAchievementsStore (snapshot, señales, cola de toasts)
- [x] F27.5 — AchievementToast + AchievementBadge + Provider en layout
- [x] F27.6 — Sección de logros en /records (N/18, badges bloqueados)
- [x] F27.7 — checkAndUnlock disparado en los 3 modos + ruleta + compra
- [x] F27.8 — Wiring de compra (signalPurchase + checkAndUnlock en PowerupCard) ← completado esta sesión
- [x] F27.9 — Tests dominio (catalog 7, check 16) ← esta sesión
- [x] F27.10 — Test migración v3→v4 sin pérdida + idempotencia unlock ← esta sesión

### Validation Executed
- [x] tsc --noEmit exit 0
- [x] vitest run: 233/233 verde (24 archivos)
- [x] cobertura src/domain: 100% líneas/funciones/statements, 98% ramas (umbral 90%)
- [x] build de producción limpio; rutas /jugar/[m]/memoria y /jefe-final operativas
- [ ] [BLOCKED-ENV] Manual en navegador: jugar Memoria y Jefe Final completos;
      ver toast de logro al desbloquear; ver grid N/18 en récords. Lógica
      cubierta por tests + smoke 200 en todas las rutas.

### Blockers
- Validaciones manuales de UX requieren navegador humano.
- check.ts tiene 1 rama defensiva sin cubrir (`!m` con mastery indefinida,
  imposible por el tipo); cobertura global de ramas 98% > umbral 90%.

### Final Statement
- [x] Todo texto visible en español
- [x] Migración v3→v4 sin pérdida de datos (test con fake-indexeddb)
- [x] No se introdujo compra de logros ni mecánica fuera del contrato
- [x] Motor Leitner intacto

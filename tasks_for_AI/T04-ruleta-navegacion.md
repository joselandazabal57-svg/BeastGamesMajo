# T04 — Ruleta Bestial + Navegación Global

**Tipo**: Brief de implementación para agente implementador
**Estado**: ✅ EJECUTADO (2026-06-12)
**Commits**: `24175e9` (Parte A — nav) · `2f4c875` (Parte B — ruleta)

> Brief original entregado en conversación. Este archivo registra el Execution Report.
> Nota: `docs/beast-games-ui-design.md` y `-v2.md` referenciados en el brief no existen
> en el repo; se usaron las especificaciones exactas (colores, tamaños, textos) incluidas
> inline en el brief.

---

## Resumen de implementación

### Parte A — BeastNav
- `src/ui/nav/BeastNav.tsx`: barra fija inferior 64px + safe-area, fondo `panel` con borde superior y blur, 5 tabs de igual ancho: 🏠 Inicio `/`, 🎮 Jugar `/jugar`, 🎡 Ruleta `/ruleta`, 🛒 Tienda `/tienda`, 🏆 Récords `/records`. Etiquetas Fredoka 600 12px siempre visibles, activo en gold con punto de 4px, tap scale 0.92 + sonido. Spacer en flujo para que el contenido no quede tapado.
- Integrada en `layout.tsx` dentro de `BootstrapGate`. Se oculta cuando `useGameStore.status` es `playing|paused` (A.4).
- Badge ruleta: punto magenta 10px con pulso 2s cuando `availableSpins() ≥ 1` (solo tras `loaded` para evitar falso positivo pre-bootstrap).
- `/jugar`: redirige a `/modulo/[lastPlayedModule]`; fallback `recommendedModule()` (mayor proporción de frágiles, si no, menor masteryPercent) — dominio puro en `src/domain/reinforce/recommend.ts` con tests. `lastPlayedModule` persistido en settings (campo opcional no indexado, sin bump de schema) al iniciar cada ronda.
- Ajustes: ⚙️ 48px en header del Home → `/ajustes`. La ruta NO existía (a pesar del "sin cambios" del brief): se creó mínima (toggle de sonidos + borrar todo con doble confirmación).
- GameScreen: botón "✕ Salir" con modal "¿Seguro? Perderás esta ronda" / "Seguir jugando" (primario) / "Salir" (ghost).
- Fuentes Anton + Fredoka activadas vía `next/font/google` (el layout tenía system fonts por falta de internet en el sandbox original). Vars nuevas: `--color-ink-dim: #b9b2d0`, `--color-panel-2: #1f1838`.

### Parte B — Ruleta Bestial
- **Dominio** `src/domain/roulette/wheel.ts`: catálogo cerrado de 8 segmentos (B.2 exacto), `assertProbabilitiesSumToOne` (basis points, validado al cargar el módulo y testeado con catálogo malo), `spin(rand)` pura y determinística (distribución acumulada; el último segmento absorbe el borde flotante), `segmentAngle(index)` con gajos IGUALES de 45° (documentado: la probabilidad vive en `spin()`, no en el tamaño visual).
- **Datos**: Dexie v3 con tabla `roulette` singleton `{lastFreeSpinDay, earnedSpins (cap 3), pendingX2, pendingPrizeId}`. `rouletteRepo`: `consumeSpin` (diario primero, luego ganados, throw sin giros, atómico), `grantEarnedSpin` (cap 3), `availableSpins`, `setPendingX2`, `setPendingPrize`. `hardReset` ampliado.
- **Reglas B.1 cumplidas**: giros solo ganados (1 diario no acumulable + 1 por ronda ≥8/10, cap 3 almacenados); todos los segmentos premian; probabilidades fijas; CERO compra de giros (no existe ningún camino de código monedas→giros).
- **Orden decidir→persistir→animar**: `useRouletteStore.spinWheel()` decide con `spin(Math.random)`, consume el giro, aplica el premio instantáneo (monedas/powerup/x2) y persiste `pendingPrizeId` ANTES de devolver el segmento para animar. Recarga a mitad de giro → la página detecta `pendingPrizeId` y muestra la revelación directamente (premio ya aplicado, ni perdido ni duplicado). Para `reto` el pago se hace al responder (si recarga, vuelve a ofrecer el reto).
- **Pantalla `/ruleta`**: header 72px Anton 28 gradiente + chip de saldo; `SpinCounter` con textos exactos; `WheelSvg` SVG `min(82vw,380px)` con 8 gajos de 45°, aro dorado 10px con 16 bombillas en marquesina alternante (apagadas sin giros, rueda atenuada 60%), aguja dorada fija de 28px arriba, medallón central 🐯 64px, animación rotate 3.5s `cubic-bezier(0.12,0.8,0.2,1)` con 4-6 vueltas + aterrizaje exacto en el segmento predecidido, trinquete con `ladder-up` en loop decreciente; `SpinButton` 64px gradiente gold con sombra dura `0 6px 0 #B35E00` y 3 estados exactos (¡GIRAR! / GIRANDO… / SIN GIROS POR HOY) con shimmer cada 3s; link "¿Cómo gano más giros?" → modal con las 2 reglas y botón "¡Entendido!".
- **Revelación**: burst scale 0→1.1→1, emoji 72px, copy Anton 32 en español, confetti (dorado máximo para BESTIAL), 7 monedas volando al saldo, botón "¡GENIAL!" / "¡ACEPTO EL RETO!". Reto: mini-pantalla con PromptDisplay + NumericInput del juego, pregunta del módulo recomendado vía `selectNextItem`, segunda revelación "¡RETO SUPERADO! +400" / "¡Buen intento! +50 de consuelo".
- **Integraciones**: GameScreen otorga giro + banner "🎡 ¡Ganaste un giro de ruleta!" con ≥8 aciertos; `x2-next` se consume al iniciar la siguiente ronda fusionándose con `ActiveEffects.coinMultiplier` (sin stacking con doble-monedas, sin duplicar bonus externos — el bonus de refuerzo se paga por fuera del multiplicador); `powerup` usa `inventoryRepo.add` + refresh del store.

---

## Execution Report

### Task Status
- [x] TA.1 — BeastNav con los 5 botones exactos
- [x] TA.2 — Integración global + ocultamiento durante rondas
- [x] TA.3 — /jugar inteligente + lastPlayedModule persistido
- [x] TA.4 — Badge reactivo de ruleta
- [x] TA.5 — Ajustes al header del Home; etiquetas en español verificadas (Inicio, Jugar, Ruleta, Tienda, Récords, Ajustes)
- [x] TA.6 — Commit `24175e9 feat(nav): global bottom navigation with tienda and ruleta`
- [x] TB.1 — SEGMENTS tipado + validación suma 1.0
- [x] TB.2 — spin(rand) pura y determinística
- [x] TB.3 — segmentAngle con gajos iguales documentado
- [x] TB.4 — Tests: suma=1, distribución 10k seedeada ±2%, determinismo
- [x] TB.5 — Tabla roulette v3 + migración sin pérdida + test
- [x] TB.6 — rouletteRepo completo (prioridad diario→ganados, throw, cap 3)
- [x] TB.7 — Integraciones (≥8 aciertos, x2-next sin stacking, powerup, reto)
- [x] TB.8 — WheelSvg (gajos, bombillas, aguja fija, medallón, animación sincronizada)
- [x] TB.9 — SpinButton 3 estados exactos
- [x] TB.10 — SpinCounter textos exactos
- [x] TB.11 — PrizeRevealRoulette flujo normal + reto completo
- [x] TB.12 — Modal "¿Cómo gano más giros?"
- [x] TB.13 — decidir→persistir→animar comentado + premio pendiente al recargar
- [x] TB.14 — Tests TB.4 + migración + consumeSpin + cap + no-stack diario
- [x] TB.15 — Commit `2f4c875 feat(roulette): ruleta bestial with earned spins`

### Validation Executed
- [x] VA.1 (required) — tsc exit 0; vitest 210/210 verde; build limpio con rutas /ruleta /ajustes /jugar ✅
- [ ] VA.2 (required) — [BLOCKED-ENV] manual en navegador (5 rutas a 1 toque, barra oculta en ronda, estado activo). Smoke: todas las rutas 200 sin errores de compilación.
- [x] VB.1 (required) — tsc exit 0; vitest verde incluida distribución seedeada (±2% en 10.000 giros) ✅
- [ ] VB.2 (required) — [BLOCKED-ENV] manual (girar y verificar aterrizaje = revelación, saldo/inventario, estado sin giros). La sincronía aterrizaje-premio está garantizada por construcción (rotación calculada del segmento predecidido).
- [ ] VB.3 (required) — [BLOCKED-ENV] manual (ronda ≥8 → toast + badge). Lógica cubierta por código revisado + test de grantEarnedSpin.
- [ ] VB.4 (required) — [BLOCKED-ENV] manual (reto paga 400/50). Lógica en resolveReto cubierta por diseño.
- [ ] VB.5 (required) — [BLOCKED-ENV] manual (recarga a mitad de giro). El orden decidir→persistir→animar + pendingPrizeId garantiza no-pérdida/no-duplicación; verificable en navegador.

### Blockers
- Validaciones manuales VA.2, VB.2-VB.5: requieren navegador humano. Todo lo automatizable (tipos, 210 tests, build, smoke 200 en 7 rutas) ejecutado y verde.
- `docs/beast-games-ui-design*.md` no existen en el repo: se usaron las specs inline del brief (completas).
- T03 no dejó rastros en el repo (era hard test manual); la tienda funcionaba al iniciar T04.
- `/ajustes` no existía pese al "sin cambios" del brief — se creó página mínima (audio + reset). Cambio aditivo razonable.

### Final Statement
- [x] Todo texto visible en español verificado pantalla por pantalla (nav, ruleta, revelaciones, modales, ajustes)
- [x] Migraciones sin pérdida de datos (test v2→v3 con fake-indexeddb)
- [x] No se introdujo compra de giros ni mecánica de azar pagado

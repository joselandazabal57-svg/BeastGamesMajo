/**
 * Analíticos content bank — F13.
 *
 * 64 items split evenly between:
 *   32 word-problem items — prompt type: 'word-problem'
 *   32 pattern items      — prompt type: 'pattern' (one null element)
 *
 * Item ID conventions:
 *   Word problems → `analiticos.wp.${n}`  (n: 1..32)
 *   Patterns      → `analiticos.seq.${n}` (n: 1..32)
 *
 * Difficulty scale (same for both types):
 *   1 = Easy   — single-step, small numbers
 *   2 = Medium — two-step or larger numbers
 *   3 = Hard   — multi-step, non-obvious rule, or larger products
 */

import type { Item } from '@/content/types';

/* ── Word problems ───────────────────────────────────────────────── */

type WPDef = {
  text: string;
  answer: number;
  difficulty: 1 | 2 | 3;
};

const WORD_PROBLEMS: readonly WPDef[] = [
  /* ── Easy (1–10) ── */
  {
    text: 'Un libro cuesta $8. ¿Cuánto cuestan 4 libros?',
    answer: 32,
    difficulty: 1,
  },
  {
    text: 'Pedro tiene 15 canicas y regala 7. ¿Cuántas le quedan?',
    answer: 8,
    difficulty: 1,
  },
  {
    text: 'En una caja hay 6 filas de 9 huevos. ¿Cuántos huevos hay?',
    answer: 54,
    difficulty: 1,
  },
  {
    text: 'Ana repartió 24 manzanas en 4 bolsas iguales. ¿Cuántas hay en cada bolsa?',
    answer: 6,
    difficulty: 1,
  },
  {
    text: 'Un tren tiene 5 vagones y en cada uno van 8 personas. ¿Cuántas personas van en total?',
    answer: 40,
    difficulty: 1,
  },
  {
    text: 'Julián ahorra $5 cada semana. ¿Cuánto ahorrará en 9 semanas?',
    answer: 45,
    difficulty: 1,
  },
  {
    text: 'En el parque hay 3 grupos de 7 niños cada uno. ¿Cuántos niños hay?',
    answer: 21,
    difficulty: 1,
  },
  {
    text: 'Un cuaderno tiene 48 hojas. Lo usas 6 días de forma igual. ¿Cuántas hojas usas por día?',
    answer: 8,
    difficulty: 1,
  },
  {
    text: 'Compras 5 paquetes de 6 galletas. ¿Cuántas galletas tienes?',
    answer: 30,
    difficulty: 1,
  },
  {
    text: 'Hay 36 estudiantes divididos en 4 equipos iguales. ¿Cuántos hay por equipo?',
    answer: 9,
    difficulty: 1,
  },

  /* ── Medium (11–21) ── */
  {
    text: 'Carlos recorre 12 km al día en bicicleta. ¿Cuántos km recorre en 7 días?',
    answer: 84,
    difficulty: 2,
  },
  {
    text: 'Una botella tiene 75 cl. Si llenan 4 botellas iguales, ¿cuántos cl hay en total?',
    answer: 300,
    difficulty: 2,
  },
  {
    text: 'Hay 84 fichas repartidas en 7 cajas iguales. ¿Cuántas hay por caja?',
    answer: 12,
    difficulty: 2,
  },
  {
    text: 'Un granjero tiene 9 filas de 15 árboles. ¿Cuántos árboles tiene?',
    answer: 135,
    difficulty: 2,
  },
  {
    text: 'Hay 96 naranjas para empacar en bolsas de 8. ¿Cuántas bolsas se necesitan?',
    answer: 12,
    difficulty: 2,
  },
  {
    text: 'Lucía estudia 45 minutos al día. ¿Cuántos minutos estudia en 6 días?',
    answer: 270,
    difficulty: 2,
  },
  {
    text: 'Un autobús tiene 48 asientos. Si van 3 autobuses llenos, ¿cuántos asientos hay en total?',
    answer: 144,
    difficulty: 2,
  },
  {
    text: 'Se fabrican 13 cajas de 8 juguetes. ¿Cuántos juguetes hay en total?',
    answer: 104,
    difficulty: 2,
  },
  {
    text: 'Hay 120 libros para colocar en estantes de 15. ¿Cuántos estantes se necesitan?',
    answer: 8,
    difficulty: 2,
  },
  {
    text: 'Una tienda vende 14 camisetas a $9 cada una. ¿Cuánto dinero reciben?',
    answer: 126,
    difficulty: 2,
  },
  {
    text: 'Se plantan 11 árboles por fila. Si hay 12 filas, ¿cuántos árboles hay?',
    answer: 132,
    difficulty: 2,
  },

  /* ── Hard (22–32) ── */
  {
    text: 'Una piscina mide 50 m de largo. Si nadas 18 largos, ¿cuántos metros recorres?',
    answer: 900,
    difficulty: 3,
  },
  {
    text: 'Un edificio tiene 16 pisos y en cada piso hay 8 apartamentos. ¿Cuántos apartamentos tiene?',
    answer: 128,
    difficulty: 3,
  },
  {
    text: 'Se necesitan 24 baldosas para cubrir 1 m². ¿Cuántas se necesitan para 15 m²?',
    answer: 360,
    difficulty: 3,
  },
  {
    text: 'Hay 252 estudiantes divididos en grupos de 9. ¿Cuántos grupos hay?',
    answer: 28,
    difficulty: 3,
  },
  {
    text: 'En una biblioteca hay 17 estantes con 24 libros cada uno. ¿Cuántos libros hay?',
    answer: 408,
    difficulty: 3,
  },
  {
    text: 'Se llenan 19 cajas con 16 naranjas cada una. ¿Cuántas naranjas hay en total?',
    answer: 304,
    difficulty: 3,
  },
  {
    text: 'Un cine tiene 24 filas de 18 asientos. ¿Cuántos asientos tiene en total?',
    answer: 432,
    difficulty: 3,
  },
  {
    text: 'Un fabricante produce 36 bicicletas por semana. ¿Cuántas produce en 11 semanas?',
    answer: 396,
    difficulty: 3,
  },
  {
    text: 'Un almacén recibió 15 pallets con 48 cajas cada uno. ¿Cuántas cajas hay?',
    answer: 720,
    difficulty: 3,
  },
  {
    text: 'Hay 336 personas para llenar autobuses de 28. ¿Cuántos autobuses se necesitan?',
    answer: 12,
    difficulty: 3,
  },
  {
    text: 'Una fábrica produce 45 piezas por hora. ¿Cuántas produce en 8 horas?',
    answer: 360,
    difficulty: 3,
  },
] as const;

/* ── Patterns (sequences with one null = ?) ─────────────────────── */

type SeqDef = {
  sequence: readonly (number | null)[];
  answer: number;
  difficulty: 1 | 2 | 3;
};

const PATTERNS: readonly SeqDef[] = [
  /* ── Easy: arithmetic sequences, step 2–7 (1–12) ── */
  { sequence: [2, 4, null, 8, 10],         answer: 6,  difficulty: 1 },
  { sequence: [3, 6, 9, null, 15],          answer: 12, difficulty: 1 },
  { sequence: [5, 10, 15, null, 25],        answer: 20, difficulty: 1 },
  { sequence: [4, 8, 12, null, 20],         answer: 16, difficulty: 1 },
  { sequence: [10, 20, null, 40, 50],       answer: 30, difficulty: 1 },
  { sequence: [null, 4, 6, 8, 10],          answer: 2,  difficulty: 1 },
  { sequence: [7, 14, null, 28, 35],        answer: 21, difficulty: 1 },
  { sequence: [6, 12, null, 24, 30],        answer: 18, difficulty: 1 },
  { sequence: [null, 9, 12, 15, 18],        answer: 6,  difficulty: 1 },
  { sequence: [8, 16, null, 32, 40],        answer: 24, difficulty: 1 },
  { sequence: [1, 3, 5, null, 9],           answer: 7,  difficulty: 1 },
  { sequence: [2, 5, 8, null, 14],          answer: 11, difficulty: 1 },

  /* ── Medium: larger steps or descending (13–24) ── */
  { sequence: [3, 7, 11, null, 19],         answer: 15, difficulty: 2 },
  { sequence: [1, 6, 11, null, 21],         answer: 16, difficulty: 2 },
  { sequence: [2, 8, 14, null, 26],         answer: 20, difficulty: 2 },
  { sequence: [4, null, 16, 22, 28],        answer: 10, difficulty: 2 },
  { sequence: [50, 45, 40, null, 30],       answer: 35, difficulty: 2 },
  { sequence: [100, 90, null, 70, 60],      answer: 80, difficulty: 2 },
  { sequence: [9, null, 21, 27, 33],        answer: 15, difficulty: 2 },
  { sequence: [12, 17, null, 27, 32],       answer: 22, difficulty: 2 },
  { sequence: [5, null, 17, 23, 29],        answer: 11, difficulty: 2 },
  { sequence: [25, 22, 19, null, 13],       answer: 16, difficulty: 2 },
  { sequence: [2, null, 10, 14, 18],        answer: 6,  difficulty: 2 },
  { sequence: [3, 8, null, 18, 23],         answer: 13, difficulty: 2 },

  /* ── Hard: geometric or polynomial patterns (25–32) ── */
  { sequence: [1, 4, 9, null, 25],          answer: 16, difficulty: 3 },
  { sequence: [2, 4, 8, null, 32],          answer: 16, difficulty: 3 },
  { sequence: [1, 2, 4, 8, null],           answer: 16, difficulty: 3 },
  { sequence: [3, 6, 12, null, 48],         answer: 24, difficulty: 3 },
  { sequence: [1, 3, 9, null, 81],          answer: 27, difficulty: 3 },
  { sequence: [2, 6, null, 54, 162],        answer: 18, difficulty: 3 },
  { sequence: [4, null, 16, 32, 64],        answer: 8,  difficulty: 3 },
  { sequence: [1, 1, 2, 3, null, 8],        answer: 5,  difficulty: 3 },
] as const;

/* ── Build item bank ─────────────────────────────────────────────── */

function wpFeedback(d: 1 | 2 | 3) {
  return d === 1 ? 'analiticos.wp.easy' : d === 2 ? 'analiticos.wp.medium' : 'analiticos.wp.hard';
}

function seqFeedback(d: 1 | 2 | 3) {
  return d === 1 ? 'analiticos.seq.easy' : d === 2 ? 'analiticos.seq.medium' : 'analiticos.seq.hard';
}

export const ANALYTICS_ITEMS: readonly Item[] = (() => {
  const items: Item[] = [];

  WORD_PROBLEMS.forEach((wp, idx) => {
    items.push({
      id: `analiticos.wp.${idx + 1}`,
      moduleId: 'analiticos',
      kind: 'word-problem',
      prompt: { type: 'word-problem', text: wp.text },
      answer: { type: 'numeric', value: wp.answer },
      difficulty: wp.difficulty,
      feedbackTemplateId: wpFeedback(wp.difficulty),
    });
  });

  PATTERNS.forEach((seq, idx) => {
    items.push({
      id: `analiticos.seq.${idx + 1}`,
      moduleId: 'analiticos',
      kind: 'pattern',
      prompt: { type: 'pattern', sequence: seq.sequence },
      answer: { type: 'numeric', value: seq.answer },
      difficulty: seq.difficulty,
      feedbackTemplateId: seqFeedback(seq.difficulty),
    });
  });

  return items;
})();

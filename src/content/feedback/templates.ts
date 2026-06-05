/**
 * Feedback template catalogue.
 *
 * Each Item carries a `feedbackTemplateId` string. The game UI looks up the
 * template here to render the hint (shown after a wrong answer) and the
 * encouragement message (shown after a correct answer that follows a wrong one).
 *
 * New modules add their own template IDs; this file is the single registry.
 */

export type FeedbackTemplate = {
  id: string;
  /** Short hint shown immediately after a wrong answer. Max ~60 chars. */
  hint: string;
  /** Positive message shown when the player recovers from a wrong answer. */
  encouragement: string;
};

export const FEEDBACK_TEMPLATES: readonly FeedbackTemplate[] = [
  /* ─── Tablas ────────────────────────────────────────────────────── */
  {
    id: 'tablas.easy',
    hint: 'Repasa las tablas del 2 al 5.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'tablas.medium',
    hint: 'Las tablas del 6 y el 7 necesitan práctica.',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'tablas.hard',
    hint: 'Las del 8 y el 9 son las más difíciles — ¡tú puedes!',
    encouragement: '¡Excelente recuperación!',
  },

  /* ─── Divisiones ─────────────────────────────────────────────────── */
  {
    id: 'divisiones.easy',
    hint: 'Piensa en la tabla del divisor.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'divisiones.medium',
    hint: 'Busca el múltiplo del divisor más cercano al dividendo.',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'divisiones.hard',
    hint: 'Repasa las tablas del 8 y el 9 — la división sale sola.',
    encouragement: '¡Excelente recuperación!',
  },

  /* ─── Varias cifras ──────────────────────────────────────────────── */
  {
    id: 'varias-cifras.easy',
    hint: 'Multiplica decenas y unidades por separado y suma.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'varias-cifras.medium',
    hint: 'Descompone: (10 × b) + (unidades × b).',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'varias-cifras.hard',
    hint: 'Multiplica unidades primero, lleva el acarreo, luego decenas.',
    encouragement: '¡Excelente recuperación!',
  },

  /* ─── MCM / MCD ──────────────────────────────────────────────────── */
  {
    id: 'mcm-mcd.mcd.easy',
    hint: 'El MCD es el número más grande que divide a ambos.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'mcm-mcd.mcd.medium',
    hint: 'Lista los factores de cada número y busca el mayor común.',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'mcm-mcd.mcd.hard',
    hint: 'Usa el algoritmo de Euclides: MCD(a,b) = MCD(b, a mod b).',
    encouragement: '¡Excelente recuperación!',
  },
  {
    id: 'mcm-mcd.mcm.easy',
    hint: 'El MCM es el múltiplo más pequeño que comparten los dos.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'mcm-mcd.mcm.medium',
    hint: 'MCM(a, b) = (a × b) ÷ MCD(a, b).',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'mcm-mcd.mcm.hard',
    hint: 'Calcula el MCD primero, luego MCM = (a × b) ÷ MCD.',
    encouragement: '¡Excelente recuperación!',
  },

  /* ─── Analíticos — problemas verbales ───────────────────────────── */
  {
    id: 'analiticos.wp.easy',
    hint: 'Lee el problema de nuevo e identifica la operación.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'analiticos.wp.medium',
    hint: 'Busca qué operación conecta los datos con la pregunta.',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'analiticos.wp.hard',
    hint: 'Descompón el problema en pasos: ¿qué sabes? ¿qué buscas?',
    encouragement: '¡Excelente recuperación!',
  },

  /* ─── Analíticos — secuencias y patrones ────────────────────────── */
  {
    id: 'analiticos.seq.easy',
    hint: 'Calcula la diferencia entre los números consecutivos.',
    encouragement: '¡Bien recuperado!',
  },
  {
    id: 'analiticos.seq.medium',
    hint: 'Busca si la diferencia entre términos es constante o crece.',
    encouragement: '¡Ya lo tienes!',
  },
  {
    id: 'analiticos.seq.hard',
    hint: '¿Se multiplica o divide por la misma cantidad? Busca el factor.',
    encouragement: '¡Excelente recuperación!',
  },
] as const;

/**
 * Look up a template by id. Returns undefined if the id is not registered
 * (caller's bug — use in dev assertions only).
 */
export function getTemplate(id: string): FeedbackTemplate | undefined {
  return FEEDBACK_TEMPLATES.find((t) => t.id === id);
}

/** All registered template IDs — useful for validation in tests. */
export const TEMPLATE_IDS = new Set(FEEDBACK_TEMPLATES.map((t) => t.id));

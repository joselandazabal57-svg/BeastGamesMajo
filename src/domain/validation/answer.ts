/**
 * Answer validation.
 *
 * Source of truth: docs/hltc-beast-games.md §5.3
 *
 * Compares a user's response against the expected `ItemAnswer`. The full
 * `Item` type lands in F9 (`src/content/types.ts`). For now we declare just
 * the answer shape required by the validator — this is the canonical shape
 * and content will import it.
 */

export type ItemAnswer =
  | { type: 'numeric'; value: number }
  | { type: 'choice'; correctIndex: number; choices: readonly string[] };

/**
 * The user response shape. Mirror of ItemAnswer:
 *  - numeric → a number the user typed
 *  - choice  → the index they tapped
 */
export type UserResponse =
  | { type: 'numeric'; value: number }
  | { type: 'choice'; index: number };

export type CheckResult = {
  correct: boolean;
  /** A human-readable representation of the expected answer, for feedback UI. */
  expected: string;
};

/**
 * Check whether a user response matches the item's expected answer.
 * Returns the verdict plus a textual `expected` for feedback display.
 *
 * If the response and answer types disagree, the caller has a bug — we throw
 * rather than silently fail, so it surfaces in tests.
 */
export function checkAnswer(
  answer: ItemAnswer,
  response: UserResponse,
): CheckResult {
  if (answer.type !== response.type) {
    throw new TypeError(
      `checkAnswer: response type "${response.type}" does not match answer type "${answer.type}"`,
    );
  }

  switch (answer.type) {
    case 'numeric': {
      // Discriminated union narrows response too via the equality check above.
      const r = response as Extract<UserResponse, { type: 'numeric' }>;
      return {
        correct: r.value === answer.value,
        expected: String(answer.value),
      };
    }
    case 'choice': {
      const r = response as Extract<UserResponse, { type: 'choice' }>;
      const expectedChoice = answer.choices[answer.correctIndex];
      if (expectedChoice === undefined) {
        throw new RangeError(
          `checkAnswer: correctIndex ${answer.correctIndex} out of bounds for choices.length=${answer.choices.length}`,
        );
      }
      return {
        correct: r.index === answer.correctIndex,
        expected: expectedChoice,
      };
    }
  }
}

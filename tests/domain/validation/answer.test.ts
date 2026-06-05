import { describe, it, expect } from 'vitest';
import {
  checkAnswer,
  type ItemAnswer,
  type UserResponse,
} from '@/domain/validation/answer';

describe('checkAnswer', () => {
  it('numeric — correct match returns correct=true', () => {
    const ans: ItemAnswer = { type: 'numeric', value: 56 };
    const res: UserResponse = { type: 'numeric', value: 56 };
    const result = checkAnswer(ans, res);
    expect(result.correct).toBe(true);
    expect(result.expected).toBe('56');
  });

  it('numeric — wrong match returns correct=false with expected as string', () => {
    const ans: ItemAnswer = { type: 'numeric', value: 56 };
    const res: UserResponse = { type: 'numeric', value: 48 };
    const result = checkAnswer(ans, res);
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('56');
  });

  it('choice — correct index returns correct=true', () => {
    const ans: ItemAnswer = {
      type: 'choice',
      correctIndex: 2,
      choices: ['A', 'B', 'C', 'D'],
    };
    const res: UserResponse = { type: 'choice', index: 2 };
    const result = checkAnswer(ans, res);
    expect(result.correct).toBe(true);
    expect(result.expected).toBe('C');
  });

  it('choice — wrong index returns correct=false with expected label', () => {
    const ans: ItemAnswer = {
      type: 'choice',
      correctIndex: 0,
      choices: ['Si', 'No'],
    };
    const res: UserResponse = { type: 'choice', index: 1 };
    const result = checkAnswer(ans, res);
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('Si');
  });

  it('mismatched types throw TypeError', () => {
    const ans: ItemAnswer = { type: 'numeric', value: 1 };
    const res = { type: 'choice', index: 0 } as unknown as UserResponse;
    expect(() => checkAnswer(ans, res)).toThrow(TypeError);
  });

  it('choice with out-of-range correctIndex throws RangeError', () => {
    const ans: ItemAnswer = {
      type: 'choice',
      correctIndex: 5,
      choices: ['A', 'B'],
    };
    const res: UserResponse = { type: 'choice', index: 0 };
    expect(() => checkAnswer(ans, res)).toThrow(RangeError);
  });
});

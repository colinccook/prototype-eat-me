import { describe, it, expect } from 'vitest';
import { evaluateFatContent, sortByFatContent } from '../../perspectives/fatContent';
import type { FoodItem } from '../../types';

const makeItem = (fat: number): FoodItem => ({
  name: 'Test',
  calories: 300,
  macros: { protein: 15, carbohydrates: 30, fat },
});

describe('evaluateFatContent', () => {
  it('returns green for fat at or below 3g', () => {
    const result = evaluateFatContent(makeItem(3));
    expect(result.rating).toBe('green');
    expect(result.label).toBe('Low fat');
    expect(result.value).toBe('3g');
  });

  it('returns green for zero fat', () => {
    const result = evaluateFatContent(makeItem(0));
    expect(result.rating).toBe('green');
  });

  it('returns amber for fat between 3 and 17.5g', () => {
    const result = evaluateFatContent(makeItem(10));
    expect(result.rating).toBe('amber');
    expect(result.label).toBe('Medium fat');
    expect(result.value).toBe('10g');
  });

  it('returns amber at boundary 3.1g', () => {
    const result = evaluateFatContent(makeItem(3.1));
    expect(result.rating).toBe('amber');
  });

  it('returns amber at boundary 17.5g', () => {
    const result = evaluateFatContent(makeItem(17.5));
    expect(result.rating).toBe('amber');
  });

  it('returns red for fat above 17.5g', () => {
    const result = evaluateFatContent(makeItem(20));
    expect(result.rating).toBe('red');
    expect(result.label).toBe('High fat');
    expect(result.value).toBe('20g');
  });

  it('returns red at boundary 17.6g', () => {
    const result = evaluateFatContent(makeItem(17.6));
    expect(result.rating).toBe('red');
  });
});

describe('sortByFatContent', () => {
  it('sorts items with lower fat first', () => {
    const a = makeItem(5);
    const b = makeItem(15);
    expect(sortByFatContent(a, b)).toBeLessThan(0);
  });

  it('returns zero for equal fat', () => {
    const a = makeItem(10);
    const b = makeItem(10);
    expect(sortByFatContent(a, b)).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { evaluateProteinEfficiency, sortByProteinEfficiency } from '../../perspectives/proteinEfficiency';
import type { FoodItem } from '../../types';

const makeItem = (protein: number, calories: number): FoodItem => ({
  name: 'Test',
  calories,
  macros: { protein, carbohydrates: 20, fat: 5 },
  type: 'food',
});

describe('evaluateProteinEfficiency', () => {
  it('returns green for 15g or more protein per 100 calories', () => {
    // 30g protein, 200 cal => 15g per 100 cal
    const result = evaluateProteinEfficiency(makeItem(30, 200));
    expect(result.rating).toBe('green');
    expect(result.label).toBe('High efficiency');
    expect(result.value).toBe('15.0g');
  });

  it('returns green for very high efficiency', () => {
    // 50g protein, 200 cal => 25g per 100 cal
    const result = evaluateProteinEfficiency(makeItem(50, 200));
    expect(result.rating).toBe('green');
  });

  it('returns amber for 8-15g protein per 100 calories', () => {
    // 20g protein, 200 cal => 10g per 100 cal
    const result = evaluateProteinEfficiency(makeItem(20, 200));
    expect(result.rating).toBe('amber');
    expect(result.label).toBe('Moderate');
    expect(result.value).toBe('10.0g');
  });

  it('returns amber at boundary 8g per 100 cal', () => {
    // 16g protein, 200 cal => 8g per 100 cal
    const result = evaluateProteinEfficiency(makeItem(16, 200));
    expect(result.rating).toBe('amber');
  });

  it('returns red for below 8g protein per 100 calories', () => {
    // 10g protein, 200 cal => 5g per 100 cal
    const result = evaluateProteinEfficiency(makeItem(10, 200));
    expect(result.rating).toBe('red');
    expect(result.label).toBe('Low efficiency');
    expect(result.value).toBe('5.0g');
  });

  it('returns grey when calories are zero', () => {
    const result = evaluateProteinEfficiency(makeItem(10, 0));
    expect(result.rating).toBe('grey');
    expect(result.value).toBe('N/A');
    expect(result.label).toBe('No data');
  });
});

describe('sortByProteinEfficiency', () => {
  it('sorts items with higher protein efficiency first (descending)', () => {
    const a = makeItem(30, 200); // 15g per 100 cal
    const b = makeItem(10, 200); // 5g per 100 cal
    expect(sortByProteinEfficiency(a, b)).toBeLessThan(0);
  });

  it('handles zero-calorie items', () => {
    const a = makeItem(10, 0);
    const b = makeItem(10, 200);
    expect(sortByProteinEfficiency(a, b)).toBeGreaterThan(0);
  });

  it('returns zero for equal efficiency', () => {
    const a = makeItem(10, 200);
    const b = makeItem(10, 200);
    expect(sortByProteinEfficiency(a, b)).toBe(0);
  });
});

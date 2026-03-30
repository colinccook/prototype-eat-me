import { describe, it, expect } from 'vitest';
import { evaluateFibreToCarb, sortByFibreToCarb } from '../../perspectives/fibreToCarb';
import type { FoodItem } from '../../types';

const makeItem = (carbs: number, fibre: number | null | undefined): FoodItem => ({
  name: 'Test',
  calories: 200,
  macros: { protein: 10, carbohydrates: carbs, fat: 5, fibre },
  type: 'food',
});

describe('evaluateFibreToCarb', () => {
  it('returns green for ratio below 5', () => {
    // carbs 10, fibre 3 => ratio 3.3
    const result = evaluateFibreToCarb(makeItem(10, 3));
    expect(result.rating).toBe('green');
    expect(result.label).toBe('Fantastic');
    expect(result.value).toBe('3.3:1');
  });

  it('returns green at the boundary (ratio just under 5)', () => {
    // carbs 24, fibre 5 => ratio 4.8
    const result = evaluateFibreToCarb(makeItem(24, 5));
    expect(result.rating).toBe('green');
  });

  it('returns amber for ratio between 5 and 10', () => {
    // carbs 35, fibre 5 => ratio 7.0
    const result = evaluateFibreToCarb(makeItem(35, 5));
    expect(result.rating).toBe('amber');
    expect(result.label).toBe('Okay');
    expect(result.value).toBe('7.0:1');
  });

  it('returns amber at ratio exactly 5', () => {
    // carbs 25, fibre 5 => ratio 5.0
    const result = evaluateFibreToCarb(makeItem(25, 5));
    expect(result.rating).toBe('amber');
  });

  it('returns red for ratio 10 or above', () => {
    // carbs 50, fibre 3 => ratio 16.7
    const result = evaluateFibreToCarb(makeItem(50, 3));
    expect(result.rating).toBe('red');
    expect(result.label).toBe('Avoid');
  });

  it('returns red at ratio exactly 10', () => {
    // carbs 50, fibre 5 => ratio 10.0
    const result = evaluateFibreToCarb(makeItem(50, 5));
    expect(result.rating).toBe('red');
  });

  it('returns grey when fibre is null', () => {
    const result = evaluateFibreToCarb(makeItem(30, null));
    expect(result.rating).toBe('grey');
    expect(result.value).toBe('N/A');
    expect(result.label).toBe('No data');
  });

  it('returns grey when fibre is undefined', () => {
    const result = evaluateFibreToCarb(makeItem(30, undefined));
    expect(result.rating).toBe('grey');
  });

  it('returns grey when fibre is zero', () => {
    const result = evaluateFibreToCarb(makeItem(30, 0));
    expect(result.rating).toBe('grey');
  });
});

describe('sortByFibreToCarb', () => {
  it('sorts items with lower ratio first', () => {
    const a = makeItem(10, 5); // ratio 2
    const b = makeItem(50, 5); // ratio 10
    expect(sortByFibreToCarb(a, b)).toBeLessThan(0);
  });

  it('pushes items without fibre data to the end', () => {
    const a = makeItem(10, 5);
    const b = makeItem(30, null);
    expect(sortByFibreToCarb(a, b)).toBeLessThan(0);
  });

  it('pushes items with zero fibre to the end', () => {
    const a = makeItem(10, 5);
    const b = makeItem(30, 0);
    expect(sortByFibreToCarb(a, b)).toBeLessThan(0);
  });

  it('keeps two items without fibre data stable', () => {
    const a = makeItem(30, null);
    const b = makeItem(40, null);
    // Both pushed to end; b returns -1 first since a returns 1
    expect(sortByFibreToCarb(a, b)).toBeGreaterThan(0);
  });
});

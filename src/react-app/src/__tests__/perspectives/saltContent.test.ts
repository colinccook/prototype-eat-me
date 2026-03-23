import { describe, it, expect } from 'vitest';
import { evaluateSaltContent, sortBySaltContent } from '../../perspectives/saltContent';
import type { FoodItem } from '../../types';

const makeItem = (salt: number | null | undefined): FoodItem => ({
  name: 'Test',
  calories: 300,
  macros: { protein: 15, carbohydrates: 30, fat: 10, salt },
});

describe('evaluateSaltContent', () => {
  it('returns green for salt at or below 0.3g', () => {
    const result = evaluateSaltContent(makeItem(0.2));
    expect(result.rating).toBe('green');
    expect(result.label).toBe('Low salt');
    expect(result.value).toBe('0.2g');
  });

  it('returns green at boundary 0.3g', () => {
    const result = evaluateSaltContent(makeItem(0.3));
    expect(result.rating).toBe('green');
  });

  it('returns green for zero salt', () => {
    const result = evaluateSaltContent(makeItem(0));
    expect(result.rating).toBe('green');
  });

  it('returns amber for salt between 0.3 and 1.5g', () => {
    const result = evaluateSaltContent(makeItem(0.8));
    expect(result.rating).toBe('amber');
    expect(result.label).toBe('Medium salt');
    expect(result.value).toBe('0.8g');
  });

  it('returns amber at boundary 1.5g', () => {
    const result = evaluateSaltContent(makeItem(1.5));
    expect(result.rating).toBe('amber');
  });

  it('returns red for salt above 1.5g', () => {
    const result = evaluateSaltContent(makeItem(2.5));
    expect(result.rating).toBe('red');
    expect(result.label).toBe('High salt');
    expect(result.value).toBe('2.5g');
  });

  it('returns red at boundary 1.6g', () => {
    const result = evaluateSaltContent(makeItem(1.6));
    expect(result.rating).toBe('red');
  });

  it('returns grey when salt is null', () => {
    const result = evaluateSaltContent(makeItem(null));
    expect(result.rating).toBe('grey');
    expect(result.value).toBe('N/A');
    expect(result.label).toBe('No data');
  });

  it('returns grey when salt is undefined', () => {
    const result = evaluateSaltContent(makeItem(undefined));
    expect(result.rating).toBe('grey');
  });
});

describe('sortBySaltContent', () => {
  it('sorts items with lower salt first', () => {
    const a = makeItem(0.5);
    const b = makeItem(2.0);
    expect(sortBySaltContent(a, b)).toBeLessThan(0);
  });

  it('pushes items without salt data to the end', () => {
    const a = makeItem(0.5);
    const b = makeItem(null);
    expect(sortBySaltContent(a, b)).toBeLessThan(0);
  });

  it('pushes undefined salt items to the end', () => {
    const a = makeItem(0.5);
    const b = makeItem(undefined);
    expect(sortBySaltContent(a, b)).toBeLessThan(0);
  });
});

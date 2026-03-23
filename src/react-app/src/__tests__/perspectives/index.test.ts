import { describe, it, expect } from 'vitest';
import { evaluateAll, allPerspectives } from '../../perspectives';
import type { FoodItem } from '../../types';

const fullItem: FoodItem = {
  name: 'Test Item',
  calories: 400,
  macros: { protein: 25, carbohydrates: 40, fat: 12, fibre: 6, salt: 0.8 },
};

const minimalItem: FoodItem = {
  name: 'Minimal Item',
  calories: 200,
  macros: { protein: 5, carbohydrates: 30, fat: 2 },
};

describe('allPerspectives', () => {
  it('contains all four perspectives', () => {
    const ids = allPerspectives.map(p => p.id);
    expect(ids).toContain('protein-efficiency');
    expect(ids).toContain('fibre-to-carb');
    expect(ids).toContain('fat-content');
    expect(ids).toContain('salt-content');
    expect(allPerspectives).toHaveLength(4);
  });

  it('each perspective has required fields', () => {
    for (const p of allPerspectives) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.why).toBeTruthy();
      expect(typeof p.evaluate).toBe('function');
      expect(typeof p.sort).toBe('function');
    }
  });
});

describe('evaluateAll', () => {
  it('returns a result for every perspective', () => {
    const results = evaluateAll(fullItem);
    expect(results).toHaveLength(allPerspectives.length);
    for (const { perspective, result } of results) {
      expect(perspective.id).toBeTruthy();
      expect(result.rating).toMatch(/^(green|amber|red|grey)$/);
      expect(result.value).toBeTruthy();
      expect(result.label).toBeTruthy();
      expect(result.description).toBeTruthy();
    }
  });

  it('returns grey for missing optional data', () => {
    const results = evaluateAll(minimalItem);
    const fibreResult = results.find(r => r.perspective.id === 'fibre-to-carb');
    const saltResult = results.find(r => r.perspective.id === 'salt-content');
    expect(fibreResult?.result.rating).toBe('grey');
    expect(saltResult?.result.rating).toBe('grey');
  });

  it('still evaluates non-optional data on minimal items', () => {
    const results = evaluateAll(minimalItem);
    const fatResult = results.find(r => r.perspective.id === 'fat-content');
    const proteinResult = results.find(r => r.perspective.id === 'protein-efficiency');
    expect(fatResult?.result.rating).not.toBe('grey');
    expect(proteinResult?.result.rating).not.toBe('grey');
  });
});

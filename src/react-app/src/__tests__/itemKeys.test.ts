import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItemKey,
  loadHiddenItems,
  saveHiddenItems,
  loadFavouriteItems,
  saveFavouriteItems,
} from '../itemKeys';
import type { FoodItem } from '../types';

// Minimal FoodItem factory
function makeItem(overrides: Partial<FoodItem> = {}): FoodItem {
  return {
    name: 'Test Burger',
    calories: 500,
    macros: { protein: 25, carbohydrates: 40, fat: 20 },
    restaurant: 'Test Restaurant',
    type: 'food',
    ...overrides,
  };
}

describe('getItemKey', () => {
  it('includes name and restaurant', () => {
    const item = makeItem({ name: 'Fries', restaurant: 'McBurger' });
    expect(getItemKey(item)).toBe('Fries::McBurger');
  });

  it('uses name only when restaurant is missing', () => {
    const item = makeItem({ name: 'Fries', restaurant: undefined });
    expect(getItemKey(item)).toBe('Fries');
  });
});

describe('hidden items persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty set when no data stored', () => {
    const result = loadHiddenItems();
    expect(result.size).toBe(0);
  });

  it('round-trips data through localStorage', () => {
    const set = new Set(['item1', 'item2']);
    saveHiddenItems(set);
    const loaded = loadHiddenItems();
    expect(loaded).toEqual(set);
  });

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('eatme-hidden-items', '{bad json');
    const loaded = loadHiddenItems();
    expect(loaded.size).toBe(0);
  });
});

describe('favourite items persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty set when no data stored', () => {
    const result = loadFavouriteItems();
    expect(result.size).toBe(0);
  });

  it('round-trips data through localStorage', () => {
    const set = new Set(['fav1', 'fav2', 'fav3']);
    saveFavouriteItems(set);
    const loaded = loadFavouriteItems();
    expect(loaded).toEqual(set);
  });

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('eatme-favourite-items', 'not-json');
    const loaded = loadFavouriteItems();
    expect(loaded.size).toBe(0);
  });

  it('handles non-array JSON gracefully', () => {
    localStorage.setItem('eatme-favourite-items', '{"a":1}');
    const loaded = loadFavouriteItems();
    expect(loaded.size).toBe(0);
  });
});

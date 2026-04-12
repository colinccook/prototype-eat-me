import { describe, it, expect } from 'vitest';
import type { FoodItem } from '../types';

/**
 * Replicates the food data normalization from scripts/merge-food-data.mjs.
 * The script accepts both plain arrays and {items: [...]} objects.
 */
function normalizeItems(foodData: unknown): Record<string, unknown>[] {
  return Array.isArray(foodData)
    ? foodData
    : (foodData as { items: Record<string, unknown>[] }).items;
}

/**
 * Replicates the per-item merge transformation from scripts/merge-food-data.mjs.
 * This keeps the test self-contained without requiring Node fs/child_process APIs.
 */
function mergeItem(
  item: Record<string, unknown>,
  restaurantName: string,
  today: string,
): Record<string, unknown> | null {
  if (item.archiveDate != null) {
    return null;
  }

  return {
    ...item,
    ingestionDate: (item.ingestionDate as string) ?? today,
    restaurant: restaurantName,
  };
}

describe('merge-food-data transformation logic', () => {
  const TODAY = '2026-04-12';
  const RESTAURANT = 'Test Restaurant';

  it('passes through type and categories fields when present', () => {
    const item = {
      name: 'Latte',
      calories: 150,
      macros: { protein: 8, carbohydrates: 15, fat: 5 },
      vegetarian: true,
      vegan: false,
      type: 'drink',
      categories: ['hot drinks', 'coffees'],
      ingestionDate: '2025-06-01',
    };

    const result = mergeItem(item, RESTAURANT, TODAY);

    expect(result).toMatchObject({
      name: 'Latte',
      type: 'drink',
      categories: ['hot drinks', 'coffees'],
      restaurant: RESTAURANT,
      ingestionDate: '2025-06-01',
    });
  });

  it('merges items without type and categories (backward compatibility)', () => {
    const item = {
      name: 'Classic Burger',
      calories: 500,
      macros: { protein: 25, carbohydrates: 40, fat: 20 },
      vegetarian: false,
      vegan: false,
      ingestionDate: '2025-06-01',
    };

    const result = mergeItem(item, RESTAURANT, TODAY);

    expect(result).toMatchObject({
      name: 'Classic Burger',
      restaurant: RESTAURANT,
    });
    expect(result).not.toHaveProperty('type');
    expect(result).not.toHaveProperty('categories');
  });

  it('skips archived items regardless of type and categories', () => {
    const item = {
      name: 'Discontinued Smoothie',
      calories: 200,
      macros: { protein: 3, carbohydrates: 40, fat: 1 },
      vegetarian: true,
      vegan: true,
      type: 'drink',
      categories: ['smoothies'],
      archiveDate: '2025-05-01',
    };

    const result = mergeItem(item, RESTAURANT, TODAY);

    expect(result).toBeNull();
  });

  it('backfills ingestionDate while preserving type and categories', () => {
    const item = {
      name: 'New Item',
      calories: 100,
      macros: { protein: 5, carbohydrates: 10, fat: 3 },
      vegetarian: true,
      vegan: true,
      type: 'other' as const,
      categories: ['condiments'],
    };

    const result = mergeItem(item, RESTAURANT, TODAY);

    expect(result).toMatchObject({
      name: 'New Item',
      type: 'other',
      categories: ['condiments'],
      ingestionDate: TODAY,
    });
  });

  it('FoodItem type accepts type and categories fields', () => {
    const item: FoodItem = {
      name: 'Test Coffee',
      calories: 5,
      macros: { protein: 0, carbohydrates: 1, fat: 0 },
      type: 'drink',
      categories: ['hot drinks'],
      vegetarian: true,
      vegan: true,
      restaurant: 'Café',
    };

    expect(item.type).toBe('drink');
    expect(item.categories).toEqual(['hot drinks']);
  });

  it('FoodItem type allows null for type and categories', () => {
    const item: FoodItem = {
      name: 'Unknown Item',
      calories: 100,
      macros: { protein: 5, carbohydrates: 10, fat: 3 },
      type: null,
      categories: null,
    };

    expect(item.type).toBeNull();
    expect(item.categories).toBeNull();
  });

  it('normalizes plain array food.json to items list', () => {
    const arrayData = [
      { name: 'Item A', calories: 100 },
      { name: 'Item B', calories: 200 },
    ];

    const items = normalizeItems(arrayData);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ name: 'Item A' });
  });

  it('normalizes object-wrapped food.json to items list', () => {
    const objectData = {
      items: [
        { name: 'Item C', calories: 300 },
      ],
    };

    const items = normalizeItems(objectData);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Item C' });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  filtersToSearchParams,
  searchParamsToFilters,
  getItemFromSearchParams,
  updateUrlWithItem,
  updateUrlWithFilters,
} from '../urlState';
import type { FilterOptions } from '../types';

const DEFAULT_FILTERS: FilterOptions = {
  vegetarianOnly: false,
  veganOnly: false,
  minCalories: null,
  maxCalories: null,
  sortBy: 'protein-per-calorie-desc',
  selectedRestaurants: [],
};

describe('filtersToSearchParams', () => {
  it('returns empty params for default filters', () => {
    const params = filtersToSearchParams(DEFAULT_FILTERS);
    expect(params.toString()).toBe('');
  });

  it('sets sort param when non-default', () => {
    const filters: FilterOptions = { ...DEFAULT_FILTERS, sortBy: 'calories-asc' };
    const params = filtersToSearchParams(filters);
    expect(params.get('sort')).toBe('calories-asc');
  });

  it('sets diet=vegetarian when vegetarianOnly', () => {
    const filters: FilterOptions = { ...DEFAULT_FILTERS, vegetarianOnly: true };
    const params = filtersToSearchParams(filters);
    expect(params.get('diet')).toBe('vegetarian');
  });

  it('sets diet=vegan when veganOnly', () => {
    const filters: FilterOptions = { ...DEFAULT_FILTERS, veganOnly: true };
    const params = filtersToSearchParams(filters);
    expect(params.get('diet')).toBe('vegan');
  });

  it('sets minCal when provided', () => {
    const filters: FilterOptions = { ...DEFAULT_FILTERS, minCalories: 200 };
    const params = filtersToSearchParams(filters);
    expect(params.get('minCal')).toBe('200');
  });

  it('sets maxCal when provided', () => {
    const filters: FilterOptions = { ...DEFAULT_FILTERS, maxCalories: 500 };
    const params = filtersToSearchParams(filters);
    expect(params.get('maxCal')).toBe('500');
  });

  it('does not set minCal when null or zero', () => {
    const params1 = filtersToSearchParams({ ...DEFAULT_FILTERS, minCalories: null });
    expect(params1.has('minCal')).toBe(false);
    const params2 = filtersToSearchParams({ ...DEFAULT_FILTERS, minCalories: 0 });
    expect(params2.has('minCal')).toBe(false);
  });

  it('sets restaurants when selected', () => {
    const filters: FilterOptions = {
      ...DEFAULT_FILTERS,
      selectedRestaurants: ['mcdonalds', 'kfc'],
    };
    const params = filtersToSearchParams(filters);
    expect(params.get('restaurants')).toBe('mcdonalds,kfc');
  });
});

describe('searchParamsToFilters', () => {
  it('returns default filters for empty params', () => {
    const params = new URLSearchParams();
    const filters = searchParamsToFilters(params);
    expect(filters).toEqual(DEFAULT_FILTERS);
  });

  it('parses sort param', () => {
    const params = new URLSearchParams('sort=fat-asc');
    const filters = searchParamsToFilters(params);
    expect(filters.sortBy).toBe('fat-asc');
  });

  it('ignores invalid sort param', () => {
    const params = new URLSearchParams('sort=invalid-sort');
    const filters = searchParamsToFilters(params);
    expect(filters.sortBy).toBe('protein-per-calorie-desc');
  });

  it('parses diet=vegetarian', () => {
    const params = new URLSearchParams('diet=vegetarian');
    const filters = searchParamsToFilters(params);
    expect(filters.vegetarianOnly).toBe(true);
    expect(filters.veganOnly).toBe(false);
  });

  it('parses diet=vegan', () => {
    const params = new URLSearchParams('diet=vegan');
    const filters = searchParamsToFilters(params);
    expect(filters.veganOnly).toBe(true);
    expect(filters.vegetarianOnly).toBe(false);
  });

  it('parses calorie range', () => {
    const params = new URLSearchParams('minCal=100&maxCal=600');
    const filters = searchParamsToFilters(params);
    expect(filters.minCalories).toBe(100);
    expect(filters.maxCalories).toBe(600);
  });

  it('ignores invalid calorie values', () => {
    const params = new URLSearchParams('minCal=abc&maxCal=-5');
    const filters = searchParamsToFilters(params);
    expect(filters.minCalories).toBeNull();
    expect(filters.maxCalories).toBeNull();
  });

  it('parses restaurants list', () => {
    const params = new URLSearchParams('restaurants=mcdonalds,kfc');
    const filters = searchParamsToFilters(params);
    expect(filters.selectedRestaurants).toEqual(['mcdonalds', 'kfc']);
  });

  it('filters out empty restaurant entries', () => {
    const params = new URLSearchParams('restaurants=mcdonalds,,kfc,');
    const filters = searchParamsToFilters(params);
    expect(filters.selectedRestaurants).toEqual(['mcdonalds', 'kfc']);
  });
});

describe('getItemFromSearchParams', () => {
  it('returns null when no item param', () => {
    const params = new URLSearchParams();
    expect(getItemFromSearchParams(params)).toBeNull();
  });

  it('returns item name without restaurant', () => {
    const params = new URLSearchParams('item=Big+Mac');
    const result = getItemFromSearchParams(params);
    expect(result).toEqual({ name: 'Big Mac', restaurant: undefined });
  });

  it('returns item name with restaurant', () => {
    const params = new URLSearchParams('item=Big+Mac&itemRestaurant=McDonalds');
    const result = getItemFromSearchParams(params);
    expect(result).toEqual({ name: 'Big Mac', restaurant: 'McDonalds' });
  });
});

describe('round-trip: filters -> params -> filters', () => {
  it('preserves filters through serialization and deserialization', () => {
    const original: FilterOptions = {
      vegetarianOnly: true,
      veganOnly: false,
      minCalories: 150,
      maxCalories: 800,
      sortBy: 'fat-asc',
      selectedRestaurants: ['subway', 'greggs'],
    };
    const params = filtersToSearchParams(original);
    const restored = searchParamsToFilters(params);
    expect(restored).toEqual(original);
  });
});

describe('updateUrlWithItem', () => {
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the URL with item and restaurant params', () => {
    updateUrlWithItem(DEFAULT_FILTERS, 'Big Mac', 'McDonalds');
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toContain('item=Big+Mac');
    expect(url).toContain('itemRestaurant=McDonalds');
  });

  it('updates the URL with item param only when no restaurant', () => {
    updateUrlWithItem(DEFAULT_FILTERS, 'Fries');
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toContain('item=Fries');
    expect(url).not.toContain('itemRestaurant');
  });
});

describe('updateUrlWithFilters', () => {
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears item params from URL', () => {
    updateUrlWithFilters(DEFAULT_FILTERS);
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).not.toContain('item=');
    expect(url).not.toContain('itemRestaurant=');
  });
});

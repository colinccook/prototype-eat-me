import type { FilterOptions, SortOption } from './types';

const VALID_SORT_OPTIONS: SortOption[] = [
  'calories-asc',
  'calories-desc',
  'protein-desc',
  'protein-per-calorie-desc',
  'fat-asc',
  'name-asc',
  'fibre-to-carb-asc',
  'salt-asc'
];

const DEFAULT_FILTERS: FilterOptions = {
  vegetarianOnly: false,
  veganOnly: false,
  minCalories: null,
  maxCalories: null,
  sortBy: 'protein-per-calorie-desc',
  selectedRestaurants: []
};

export function filtersToSearchParams(filters: FilterOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set('sort', filters.sortBy);
  }

  if (filters.vegetarianOnly) {
    params.set('diet', 'vegetarian');
  } else if (filters.veganOnly) {
    params.set('diet', 'vegan');
  }

  if (filters.minCalories !== null && filters.minCalories > 0) {
    params.set('minCal', String(filters.minCalories));
  }

  if (filters.maxCalories !== null && filters.maxCalories > 0) {
    params.set('maxCal', String(filters.maxCalories));
  }

  if (filters.selectedRestaurants.length > 0) {
    params.set('restaurants', filters.selectedRestaurants.join(','));
  }

  return params;
}

export function searchParamsToFilters(params: URLSearchParams): FilterOptions {
  const filters: FilterOptions = { ...DEFAULT_FILTERS };

  const sort = params.get('sort');
  if (sort && VALID_SORT_OPTIONS.includes(sort as SortOption)) {
    filters.sortBy = sort as SortOption;
  }

  const diet = params.get('diet');
  if (diet === 'vegetarian') {
    filters.vegetarianOnly = true;
  } else if (diet === 'vegan') {
    filters.veganOnly = true;
  }

  const minCal = params.get('minCal');
  if (minCal) {
    const parsed = parseInt(minCal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      filters.minCalories = parsed;
    }
  }

  const maxCal = params.get('maxCal');
  if (maxCal) {
    const parsed = parseInt(maxCal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      filters.maxCalories = parsed;
    }
  }

  const restaurants = params.get('restaurants');
  if (restaurants) {
    filters.selectedRestaurants = restaurants.split(',').filter(r => r.length > 0);
  }

  return filters;
}

export function buildShareUrl(filters: FilterOptions): string {
  const params = filtersToSearchParams(filters);
  const base = window.location.origin + window.location.pathname;
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}

export function buildItemShareUrl(
  filters: FilterOptions,
  itemName: string,
  itemRestaurant?: string
): string {
  const params = filtersToSearchParams(filters);
  params.set('item', itemName);
  if (itemRestaurant) {
    params.set('itemRestaurant', itemRestaurant);
  }
  const base = window.location.origin + window.location.pathname;
  return `${base}?${params.toString()}`;
}

export function getItemFromSearchParams(params: URLSearchParams): { name: string; restaurant?: string } | null {
  const item = params.get('item');
  if (!item) return null;
  const restaurant = params.get('itemRestaurant') || undefined;
  return { name: item, restaurant };
}

export function updateUrlWithFilters(filters: FilterOptions): void {
  const params = filtersToSearchParams(filters);
  const search = params.toString();
  const newUrl = search
    ? `${window.location.pathname}?${search}`
    : window.location.pathname;
  window.history.replaceState(null, '', newUrl);
}

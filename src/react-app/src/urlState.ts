import type { FilterOptions, FoodItem, SortOption } from './types';

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

const SORT_DESCRIPTIONS: Record<SortOption, string> = {
  'protein-per-calorie-desc': 'high protein-per-calorie',
  'protein-desc': 'high protein',
  'calories-asc': 'low calorie',
  'calories-desc': 'high calorie',
  'fat-asc': 'low fat',
  'fibre-to-carb-asc': 'high fibre',
  'salt-asc': 'low salt',
  'name-asc': ''
};

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

function getFilterDescription(filters: FilterOptions): string {
  const parts: string[] = [];
  const sortDesc = SORT_DESCRIPTIONS[filters.sortBy];
  if (sortDesc) parts.push(sortDesc);
  if (filters.veganOnly) parts.push('vegan');
  else if (filters.vegetarianOnly) parts.push('vegetarian');
  if (filters.maxCalories) parts.push(`under ${filters.maxCalories} cal`);
  return parts.join(', ');
}

function getItemHighlight(item: FoodItem, sortBy: SortOption): string {
  switch (sortBy) {
    case 'fat-asc':
      return `${item.macros.fat}g fat`;
    case 'calories-asc':
      return `${item.calories} calories`;
    case 'protein-desc':
    case 'protein-per-calorie-desc':
      return `${item.macros.protein}g protein`;
    case 'salt-asc':
      return item.macros.salt != null
        ? `${item.macros.salt}g salt` : `${item.calories} calories`;
    case 'fibre-to-carb-asc':
      return item.macros.fibre != null
        ? `${item.macros.fibre}g fibre` : `${item.calories} calories`;
    default:
      return `${item.calories} calories`;
  }
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for legacy browsers without Clipboard API (e.g. older WebViews)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export async function shareFilters(filters: FilterOptions): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = buildShareUrl(filters);
  const filterDesc = getFilterDescription(filters);
  const text = filterDesc
    ? `Check out these ${filterDesc} food options I found! 🍽️`
    : 'Check out these food options I found! 🍽️';

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Eat Me - Food Finder', text, url });
      return 'shared';
    } catch (err) {
      // User cancelled the share dialog
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    }
  }

  await copyToClipboard(url);
  return 'copied';
}

export async function shareItem(
  item: FoodItem,
  filters: FilterOptions
): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = buildItemShareUrl(filters, item.name, item.restaurant);
  const highlight = getItemHighlight(item, filters.sortBy);
  const from = item.restaurant ? ` from ${item.restaurant}` : '';
  const text = `Check out ${item.name}${from} — ${highlight}! 🍽️`;

  if (navigator.share) {
    try {
      await navigator.share({ title: `${item.name}${from}`, text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    }
  }

  await copyToClipboard(url);
  return 'copied';
}

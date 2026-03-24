import type { FoodItem } from './types';

/** Returns a stable unique key for a food item based on its name and restaurant. */
export function getItemKey(item: FoodItem): string {
  return item.restaurant ? `${item.name}::${item.restaurant}` : item.name;
}

const HIDDEN_KEY = 'eatme-hidden-items';
const FAVOURITES_KEY = 'eatme-favourite-items';

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr: unknown = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr as string[]);
    }
  } catch {
    // Corrupted data – start fresh
  }
  return new Set();
}

function writeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Ignore write errors (quota exceeded, storage disabled, etc.)
  }
}

// ──── Hidden items ────

export function loadHiddenItems(): Set<string> {
  return readSet(HIDDEN_KEY);
}

export function saveHiddenItems(set: Set<string>): void {
  writeSet(HIDDEN_KEY, set);
}

// ──── Favourite items ────

export function loadFavouriteItems(): Set<string> {
  return readSet(FAVOURITES_KEY);
}

export function saveFavouriteItems(set: Set<string>): void {
  writeSet(FAVOURITES_KEY, set);
}

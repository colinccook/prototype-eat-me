import type { FoodItem } from '../types';
import type { Perspective, PerspectiveResult } from './types';

const GREEN_THRESHOLD = 0.3;
const AMBER_THRESHOLD = 1.5;

export function evaluateSaltContent(item: FoodItem): PerspectiveResult {
  const salt = item.macros.salt;

  if (salt === undefined || salt === null) {
    return {
      rating: 'grey',
      value: 'N/A',
      label: 'No data',
      description: 'No salt data available for this item.',
    };
  }

  if (salt <= GREEN_THRESHOLD) {
    return {
      rating: 'green',
      value: `${salt}g`,
      label: 'Low salt',
      description: 'Low salt — good for blood pressure and heart health.',
    };
  }

  if (salt <= AMBER_THRESHOLD) {
    return {
      rating: 'amber',
      value: `${salt}g`,
      label: 'Medium salt',
      description: 'Moderate salt — keep an eye on your daily total.',
    };
  }

  return {
    rating: 'red',
    value: `${salt}g`,
    label: 'High salt',
    description: 'High salt content — consider lower-salt alternatives.',
  };
}

export function sortBySaltContent(a: FoodItem, b: FoodItem): number {
  const aSalt = a.macros.salt;
  const bSalt = b.macros.salt;

  if (aSalt === undefined || aSalt === null) return 1;
  if (bSalt === undefined || bSalt === null) return -1;

  return aSalt - bSalt;
}

export const saltContent: Perspective = {
  id: 'salt-content',
  name: 'Salt Content',
  why: 'High salt intake is linked to high blood pressure. Adults should have no more than 6g of salt per day.',
  evaluate: evaluateSaltContent,
  sort: sortBySaltContent,
};

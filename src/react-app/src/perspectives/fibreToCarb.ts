import type { FoodItem } from '../types';
import type { Perspective, PerspectiveResult } from './types';

const GREEN_THRESHOLD = 5;
const AMBER_THRESHOLD = 10;

export function evaluateFibreToCarb(item: FoodItem): PerspectiveResult {
  const fibre = item.macros.fibre;

  if (!fibre || fibre <= 0) {
    return {
      rating: 'grey',
      value: 'N/A',
      label: 'No data',
      description: 'No fibre data available for this item.',
    };
  }

  const ratio = item.macros.carbohydrates / fibre;

  if (ratio < GREEN_THRESHOLD) {
    return {
      rating: 'green',
      value: `${ratio.toFixed(1)}:1`,
      label: 'Fantastic',
      description: 'Great ratio — suggests higher fibre, less processed ingredients.',
    };
  }

  if (ratio < AMBER_THRESHOLD) {
    return {
      rating: 'amber',
      value: `${ratio.toFixed(1)}:1`,
      label: 'Okay',
      description: 'Moderate ratio — not bad, but could have more fibre.',
    };
  }

  return {
    rating: 'red',
    value: `${ratio.toFixed(1)}:1`,
    label: 'Avoid',
    description: 'High ratio — likely processed with little fibre.',
  };
}

export function sortByFibreToCarb(a: FoodItem, b: FoodItem): number {
  const aFibre = a.macros.fibre;
  const bFibre = b.macros.fibre;

  if (!aFibre || aFibre <= 0) return 1;
  if (!bFibre || bFibre <= 0) return -1;

  const aRatio = a.macros.carbohydrates / aFibre;
  const bRatio = b.macros.carbohydrates / bFibre;
  return aRatio - bRatio;
}

export const fibreToCarb: Perspective = {
  id: 'fibre-to-carb',
  name: 'Fibre to Carb Ratio',
  why: 'A lower carbs-to-fibre ratio suggests the food contains more fibre and is made from less processed ingredients. Aim for a ratio below 5.',
  evaluate: evaluateFibreToCarb,
  sort: sortByFibreToCarb,
};

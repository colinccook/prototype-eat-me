import type { FoodItem } from '../types';
import type { Perspective, PerspectiveResult } from './types';

const GREEN_THRESHOLD = 15;
const AMBER_THRESHOLD = 8;

export function evaluateProteinEfficiency(item: FoodItem): PerspectiveResult {
  if (item.calories <= 0) {
    return {
      rating: 'grey',
      value: 'N/A',
      label: 'No data',
      description: 'Calorie information unavailable.',
    };
  }

  const proteinPer100Cal = (item.macros.protein / item.calories) * 100;

  if (proteinPer100Cal >= GREEN_THRESHOLD) {
    return {
      rating: 'green',
      value: `${proteinPer100Cal.toFixed(1)}g`,
      label: 'High efficiency',
      description: 'Excellent protein per calorie — great for muscle building.',
    };
  }

  if (proteinPer100Cal >= AMBER_THRESHOLD) {
    return {
      rating: 'amber',
      value: `${proteinPer100Cal.toFixed(1)}g`,
      label: 'Moderate',
      description: 'Decent protein content relative to calories.',
    };
  }

  return {
    rating: 'red',
    value: `${proteinPer100Cal.toFixed(1)}g`,
    label: 'Low efficiency',
    description: 'Low protein relative to calories — not ideal for protein goals.',
  };
}

export function sortByProteinEfficiency(a: FoodItem, b: FoodItem): number {
  const aRatio = a.calories > 0 ? a.macros.protein / a.calories : 0;
  const bRatio = b.calories > 0 ? b.macros.protein / b.calories : 0;
  return bRatio - aRatio;
}

export const proteinEfficiency: Perspective = {
  id: 'protein-efficiency',
  name: 'Protein per 100 Calories',
  why: 'More protein per calorie means you can hit protein targets without excess calories. Essential for muscle building and satiety.',
  evaluate: evaluateProteinEfficiency,
  sort: sortByProteinEfficiency,
};

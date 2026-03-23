import type { FoodItem } from '../types';
import type { Perspective, PerspectiveResult } from './types';

const GREEN_THRESHOLD = 3;
const AMBER_THRESHOLD = 17.5;

export function evaluateFatContent(item: FoodItem): PerspectiveResult {
  const fat = item.macros.fat;

  if (fat <= GREEN_THRESHOLD) {
    return {
      rating: 'green',
      value: `${fat}g`,
      label: 'Low fat',
      description: 'Low fat content — a lighter choice.',
    };
  }

  if (fat <= AMBER_THRESHOLD) {
    return {
      rating: 'amber',
      value: `${fat}g`,
      label: 'Medium fat',
      description: 'Moderate fat — reasonable in a balanced diet.',
    };
  }

  return {
    rating: 'red',
    value: `${fat}g`,
    label: 'High fat',
    description: 'High fat content — consider lighter alternatives.',
  };
}

export function sortByFatContent(a: FoodItem, b: FoodItem): number {
  return a.macros.fat - b.macros.fat;
}

export const fatContent: Perspective = {
  id: 'fat-content',
  name: 'Fat Content',
  why: 'Keeping an eye on fat helps manage calorie intake. Low-fat options can support weight management goals.',
  evaluate: evaluateFatContent,
  sort: sortByFatContent,
};

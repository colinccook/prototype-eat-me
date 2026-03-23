import type { FoodItem } from '../types';

export type TrafficLightRating = 'green' | 'amber' | 'red' | 'grey';

export interface PerspectiveResult {
  rating: TrafficLightRating;
  value: string;
  label: string;
  description: string;
}

export interface Perspective {
  id: string;
  name: string;
  why: string;
  evaluate: (item: FoodItem) => PerspectiveResult;
  sort: (a: FoodItem, b: FoodItem) => number;
}

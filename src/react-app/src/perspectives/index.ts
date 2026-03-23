import type { FoodItem } from '../types';
import type { Perspective, PerspectiveResult } from './types';

export type { TrafficLightRating, PerspectiveResult, Perspective } from './types';

export { fibreToCarb } from './fibreToCarb';
export { fatContent } from './fatContent';
export { proteinEfficiency } from './proteinEfficiency';
export { saltContent } from './saltContent';

import { fibreToCarb } from './fibreToCarb';
import { fatContent } from './fatContent';
import { proteinEfficiency } from './proteinEfficiency';
import { saltContent } from './saltContent';

export const allPerspectives: Perspective[] = [
  proteinEfficiency,
  fibreToCarb,
  fatContent,
  saltContent,
];

export function evaluateAll(item: FoodItem): { perspective: Perspective; result: PerspectiveResult }[] {
  return allPerspectives.map(perspective => ({
    perspective,
    result: perspective.evaluate(item),
  }));
}

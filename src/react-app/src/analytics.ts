/**
 * Analytics event helpers for tracking user intent.
 *
 * Events are designed to answer the following questions:
 *  - Which regions and restaurants are most popular?
 *  - What dietary filters are people using?
 *  - Which sort options resonate with users?
 *  - How do users discover and engage with food items?
 *  - Is the share feature being used?
 *
 * All events are gated behind GDPR consent via firebase.ts.
 */

import { trackEvent } from './firebase';

/** User changed the active region */
export function trackRegionChange(regionId: string): void {
  trackEvent('region_change', { region_id: regionId });
}

/** User changed the sort order */
export function trackSortChange(sortBy: string): void {
  trackEvent('sort_change', { sort_by: sortBy });
}

/** User toggled a dietary filter */
export function trackDietaryFilter(filter: 'vegetarian' | 'vegan', enabled: boolean): void {
  trackEvent('dietary_filter', { filter, enabled });
}

/** User adjusted the calorie range */
export function trackCalorieFilter(min: number | null, max: number | null): void {
  const payload: { min_calories?: number; max_calories?: number } = {};

  if (min != null) {
    payload.min_calories = min;
  }

  if (max != null) {
    payload.max_calories = max;
  }

  trackEvent('calorie_filter', payload);
}

/** User selected/deselected restaurants */
export function trackRestaurantFilter(restaurants: string[]): void {
  trackEvent('restaurant_filter', {
    count: restaurants.length,
    restaurants: restaurants.join(','),
  });
}

/** User opened a food item detail */
export function trackFoodItemView(itemName: string, restaurant: string): void {
  trackEvent('food_item_view', { item_name: itemName, restaurant });
}

/** User shared filters or a food item */
export function trackShare(type: 'filters' | 'item', result: string): void {
  trackEvent('share', { type, result });
}

/** User responded to the GDPR cookie consent banner */
export function trackConsentResponse(accepted: boolean): void {
  trackEvent('consent_response', { accepted });
}

/** User dismissed the AI disclaimer banner */
export function trackDisclaimerDismissed(): void {
  trackEvent('disclaimer_dismissed');
}

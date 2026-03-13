export interface Macros {
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre?: number;
  salt?: number;
}

export interface FoodItem {
  name: string;
  calories: number;
  macros: Macros;
  ingredients?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
  restaurant?: string;
}

export interface Restaurant {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface RegionsIndex {
  regions: Region[];
}

export interface RestaurantsIndex {
  restaurants: Restaurant[];
}

export interface RestaurantFood {
  restaurant: string;
  items: FoodItem[];
}

export interface RegionFood {
  region: string;
  items: FoodItem[];
}

export type SortOption = 
  | 'calories-asc' 
  | 'calories-desc' 
  | 'protein-desc' 
  | 'protein-per-calorie-desc'
  | 'fat-asc'
  | 'name-asc'
  | 'fibre-to-carb-asc';

export interface FilterOptions {
  vegetarianOnly: boolean;
  veganOnly: boolean;
  maxCalories: number | null;
  sortBy: SortOption;
}

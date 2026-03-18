export interface Macros {
  protein: number;
  carbohydrates: number;
  fat: number;
  saturatedFat?: number | null;
  sugar?: number | null;
  fibre?: number | null;
  salt?: number | null;
}

export interface Allergens {
  gluten?: boolean | null;
  wheat?: boolean | null;
  milk?: boolean | null;
  eggs?: boolean | null;
  soya?: boolean | null;
  nuts?: boolean | null;
  peanuts?: boolean | null;
  sesame?: boolean | null;
  celery?: boolean | null;
  mustard?: boolean | null;
  fish?: boolean | null;
  crustaceans?: boolean | null;
  molluscs?: boolean | null;
  sulphites?: boolean | null;
  lupin?: boolean | null;
}

export interface FoodItem {
  name: string;
  calories: number;
  macros: Macros;
  allergens?: Allergens;
  ingredients?: string[] | null;
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
  | 'fibre-to-carb-asc'
  | 'salt-asc';

export interface FilterOptions {
  vegetarianOnly: boolean;
  veganOnly: boolean;
  minCalories: number | null;
  maxCalories: number | null;
  sortBy: SortOption;
  selectedRestaurants: string[];  // Empty array means all restaurants
}

import type { 
  RegionsIndex, 
  RestaurantsIndex, 
  RestaurantFood, 
  RegionFood 
} from './types';

const BASE_URL = import.meta.env.BASE_URL || '/';
const DATA_PATH = `${BASE_URL}data`;

export async function fetchRegions(): Promise<RegionsIndex> {
  const response = await fetch(`${DATA_PATH}/index.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch regions');
  }
  return response.json();
}

export async function fetchRestaurants(regionId: string): Promise<RestaurantsIndex> {
  const response = await fetch(`${DATA_PATH}/${regionId}/index.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants for region: ${regionId}`);
  }
  return response.json();
}

export async function fetchRestaurantFood(regionId: string, restaurantId: string): Promise<RestaurantFood> {
  const response = await fetch(`${DATA_PATH}/${regionId}/${restaurantId}/food.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch food for restaurant: ${restaurantId}`);
  }
  return response.json();
}

export async function fetchRegionFood(regionId: string): Promise<RegionFood> {
  const response = await fetch(`${DATA_PATH}/${regionId}/food.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch food for region: ${regionId}`);
  }
  return response.json();
}

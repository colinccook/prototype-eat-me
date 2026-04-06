import type { Restaurant } from '../types';

interface NavigationProps {
  restaurants: Restaurant[];
  selectedRestaurant: string | null;
  onRestaurantChange: (restaurantId: string | null) => void;
  isLoading: boolean;
}

function Navigation({ restaurants, selectedRestaurant, onRestaurantChange, isLoading }: NavigationProps) {
  return (
    <nav className="flex gap-4 flex-wrap p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-6 min-h-[70px] items-center">
      {restaurants.length > 0 && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label htmlFor="restaurant-select" className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px]">Restaurant</label>
          <select
            id="restaurant-select"
            value={selectedRestaurant || ''}
            onChange={(e) => onRestaurantChange(e.target.value || null)}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-md text-[0.95rem] bg-white cursor-pointer transition-[border-color] duration-200 focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Restaurants</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

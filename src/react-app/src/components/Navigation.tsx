import type { Restaurant } from '../types';
import './Navigation.css';

interface NavigationProps {
  restaurants: Restaurant[];
  selectedRestaurant: string | null;
  onRestaurantChange: (restaurantId: string | null) => void;
  isLoading: boolean;
}

function Navigation({
  restaurants,
  selectedRestaurant,
  onRestaurantChange,
  isLoading
}: NavigationProps) {
  return (
    <nav className="navigation">
      {restaurants.length > 0 && (
        <div className="nav-section">
          <label htmlFor="restaurant-select">Restaurant</label>
          <select
            id="restaurant-select"
            value={selectedRestaurant || ''}
            onChange={(e) => onRestaurantChange(e.target.value || null)}
            disabled={isLoading}
          >
            <option value="">All Restaurants</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && (
        <div className="nav-status" role="status" aria-live="polite">
          Syncing data...
        </div>
      )}
    </nav>
  );
}

export default Navigation;

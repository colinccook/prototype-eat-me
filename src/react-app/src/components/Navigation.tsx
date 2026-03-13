import type { Region, Restaurant } from '../types';
import './Navigation.css';

interface NavigationProps {
  regions: Region[];
  restaurants: Restaurant[];
  selectedRegion: string | null;
  selectedRestaurant: string | null;
  onRegionChange: (regionId: string | null) => void;
  onRestaurantChange: (restaurantId: string | null) => void;
}

function Navigation({
  regions,
  restaurants,
  selectedRegion,
  selectedRestaurant,
  onRegionChange,
  onRestaurantChange
}: NavigationProps) {
  return (
    <nav className="navigation">
      <div className="nav-section">
        <label htmlFor="region-select">Region</label>
        <select
          id="region-select"
          value={selectedRegion || ''}
          onChange={(e) => onRegionChange(e.target.value || null)}
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRegion && restaurants.length > 0 && (
        <div className="nav-section">
          <label htmlFor="restaurant-select">Restaurant</label>
          <select
            id="restaurant-select"
            value={selectedRestaurant || ''}
            onChange={(e) => onRestaurantChange(e.target.value || null)}
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
    </nav>
  );
}

export default Navigation;

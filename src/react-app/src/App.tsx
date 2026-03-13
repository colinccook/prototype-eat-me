import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Region, 
  Restaurant, 
  FoodItem, 
  FilterOptions 
} from './types';
import { 
  fetchRegions, 
  fetchRestaurants, 
  fetchRestaurantFood, 
  fetchRegionFood 
} from './api';
import { clearDataCache } from './serviceWorkerRegistration';
import Navigation from './components/Navigation';
import FilterPanel from './components/FilterPanel';
import FoodList from './components/FoodList';
import './App.css';

function App() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    vegetarianOnly: false,
    veganOnly: false,
    maxCalories: null,
    sortBy: 'name-asc'
  });

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await fetchRegions();
        setRegions(data.regions);
      } catch (err) {
        setError('Failed to load regions');
        console.error(err);
      }
    };
    loadRegions();
  }, []);

  // Load restaurants when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setRestaurants([]);
      setFoodItems([]);
      return;
    }

    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants(selectedRegion);
        setRestaurants(data.restaurants);
      } catch (err) {
        setError('Failed to load restaurants');
        console.error(err);
      }
    };
    loadRestaurants();
  }, [selectedRegion]);

  // Load food items when region or restaurant changes
  useEffect(() => {
    if (!selectedRegion) {
      setFoodItems([]);
      return;
    }

    const loadFood = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (selectedRestaurant) {
          const data = await fetchRestaurantFood(selectedRegion, selectedRestaurant);
          setFoodItems(data.items.map(item => ({ ...item, restaurant: data.restaurant })));
        } else {
          const data = await fetchRegionFood(selectedRegion);
          setFoodItems(data.items);
        }
      } catch (err) {
        setError('Failed to load food items');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFood();
  }, [selectedRegion, selectedRestaurant]);

  const handleRegionChange = useCallback((regionId: string | null) => {
    setSelectedRegion(regionId);
    setSelectedRestaurant(null);
  }, []);

  const handleRestaurantChange = useCallback((restaurantId: string | null) => {
    setSelectedRestaurant(restaurantId);
  }, []);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const success = await clearDataCache();
      if (success) {
        // Reload the page to fetch fresh data
        window.location.reload();
      } else {
        // If service worker isn't available, just reload
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      // Fallback: just reload the page
      window.location.reload();
    }
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...foodItems];

    // Apply dietary filters
    if (filters.vegetarianOnly) {
      items = items.filter(item => item.vegetarian);
    }
    if (filters.veganOnly) {
      items = items.filter(item => item.vegan);
    }

    // Apply calorie filter
    if (filters.maxCalories !== null && filters.maxCalories > 0) {
      items = items.filter(item => item.calories <= filters.maxCalories!);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'calories-asc':
        items.sort((a, b) => a.calories - b.calories);
        break;
      case 'calories-desc':
        items.sort((a, b) => b.calories - a.calories);
        break;
      case 'protein-desc':
        items.sort((a, b) => b.macros.protein - a.macros.protein);
        break;
      case 'protein-per-calorie-desc':
        items.sort((a, b) => {
          const aRatio = a.calories > 0 ? a.macros.protein / a.calories : 0;
          const bRatio = b.calories > 0 ? b.macros.protein / b.calories : 0;
          return bRatio - aRatio;
        });
        break;
    }

    return items;
  }, [foodItems, filters]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Eat Me</h1>
        <p className="tagline">Find food that fits your goals</p>
      </header>

      <main className="app-main">
        <Navigation
          regions={regions}
          restaurants={restaurants}
          selectedRegion={selectedRegion}
          selectedRestaurant={selectedRestaurant}
          onRegionChange={handleRegionChange}
          onRestaurantChange={handleRestaurantChange}
        />

        {selectedRegion && (
          <div className="content-layout">
            <aside className="sidebar">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
              />
            </aside>
            <section className="main-content">
              <FoodList
                items={filteredItems}
                sortBy={filters.sortBy}
                isLoading={isLoading}
                error={error}
              />
            </section>
          </div>
        )}

        {!selectedRegion && (
          <div className="welcome-message">
            <h2>Welcome to Eat Me</h2>
            <p>Select a region above to start exploring food options that match your dietary goals.</p>
            <ul className="feature-list">
              <li>🥗 Filter by vegetarian or vegan options</li>
              <li>🔥 Set your calorie budget</li>
              <li>💪 Find high-protein foods</li>
              <li>📊 Sort by protein per calorie for optimal nutrition</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Eat Me - Making informed food choices easier</p>
        <button 
          className="refresh-button"
          onClick={handleRefreshData}
          disabled={isRefreshing}
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
      </footer>
    </div>
  );
}

export default App;

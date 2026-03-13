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

const DEFAULT_REGION_ID = 'uk';
const DEFAULT_REGIONS: Region[] = [
  { id: DEFAULT_REGION_ID, name: 'United Kingdom' }
];
const MIN_LOADING_DURATION_MS = 200;

const updateGlobalLoadingFlag = (flag: boolean) => {
  if (typeof document !== 'undefined') {
    document.body.dataset.loading = flag ? 'true' : 'false';
  }
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__eatMeLoading = flag;
  }
};

function App() {
  const [regions, setRegions] = useState<Region[]>(DEFAULT_REGIONS);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(DEFAULT_REGION_ID);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setRegions(data.regions.length > 0 ? data.regions : DEFAULT_REGIONS);
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
      setIsLoading(false);
      setFoodItems([]);
      return;
    }

    const loadRestaurants = async () => {
      try {
        setRestaurants([]);
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
    const loadFood = async () => {
      const start = performance.now();
      setIsLoading(true);
      setError(null);
      setFoodItems([]);
      if (!selectedRegion) {
        setIsLoading(false);
        return;
      }
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
        const elapsed = performance.now() - start;
        if (elapsed < MIN_LOADING_DURATION_MS) {
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_DURATION_MS - elapsed));
        }
        setIsLoading(false);
        updateGlobalLoadingFlag(false);
      }
    };
    loadFood();
  }, [selectedRegion, selectedRestaurant]);

  useEffect(() => {
    updateGlobalLoadingFlag(isLoading);
  }, [isLoading]);

  const handleRegionChange = useCallback((regionId: string | null) => {
    if (regionId === selectedRegion) {
      return;
    }
    setSelectedRestaurant(null);
    setRestaurants([]);
    setFoodItems([]);
    setError(null);
    const loading = Boolean(regionId);
    setIsLoading(loading);
    updateGlobalLoadingFlag(loading);
    setSelectedRegion(regionId);
  }, [selectedRegion]);

  const handleRestaurantChange = useCallback((restaurantId: string | null) => {
    setSelectedRestaurant(restaurantId);
  }, []);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    // Attempt to clear the service worker cache, then reload regardless
    await clearDataCache().catch(() => {
      // Ignore errors - we'll reload anyway
    });
    window.location.reload();
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
      case 'fat-asc':
        items.sort((a, b) => a.macros.fat - b.macros.fat);
        break;
      case 'fibre-to-carb-asc':
        // Fibre to carb ratio: how many times fibre fits into carbs (carbs/fibre)
        // Lower is better. Items without fibre data go to the end.
        items.sort((a, b) => {
          const aFibre = a.macros.fibre;
          const bFibre = b.macros.fibre;
          
          // Items without fibre data go to the end
          if (!aFibre || aFibre <= 0) return 1;
          if (!bFibre || bFibre <= 0) return -1;
          
          const aRatio = a.macros.carbohydrates / aFibre;
          const bRatio = b.macros.carbohydrates / bFibre;
          return aRatio - bRatio;
        });
        break;
      case 'salt-asc':
        // Sort by salt (low to high). Items without salt data go to the end.
        items.sort((a, b) => {
          const aSalt = a.macros.salt;
          const bSalt = b.macros.salt;
          
          // Items without salt data go to the end
          if (aSalt === undefined || aSalt === null) return 1;
          if (bSalt === undefined || bSalt === null) return -1;
          
          return aSalt - bSalt;
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
        {isLoading && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <p>Syncing data...</p>
          </div>
        )}

        <Navigation
          regions={regions}
          restaurants={restaurants}
          selectedRegion={selectedRegion}
          selectedRestaurant={selectedRestaurant}
          onRegionChange={handleRegionChange}
          onRestaurantChange={handleRestaurantChange}
          isLoading={isLoading}
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

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  Region, 
  Restaurant, 
  FoodItem, 
  FilterOptions 
} from './types';
import { 
  fetchRegions, 
  fetchRestaurants, 
  fetchRegionFood 
} from './api';
import { clearDataCache } from './serviceWorkerRegistration';
import { searchParamsToFilters, getItemFromSearchParams, updateUrlWithFilters } from './urlState';
import { setAnalyticsConsent } from './firebase';
import {
  trackRegionChange,
  trackSortChange,
  trackDietaryFilter,
  trackCalorieFilter,
  trackRestaurantFilter,
  trackConsentResponse,
  trackDisclaimerDismissed,
} from './analytics';
import HeaderPills from './components/HeaderPills';
import FoodList from './components/FoodList';
import './App.css';

const DEFAULT_REGION_ID = 'uk';
const DEFAULT_REGIONS: Region[] = [
  { id: DEFAULT_REGION_ID, name: 'United Kingdom' }
];
const MIN_LOADING_DURATION_MS = 200;

// Pull-to-refresh constants
const PULL_THRESHOLD = 100; // pixels needed to trigger refresh
const MAX_PULL_DISTANCE = 150; // maximum visual pull distance

const updateGlobalLoadingFlag = (flag: boolean) => {
  if (typeof document !== 'undefined') {
    document.body.dataset.loading = flag ? 'true' : 'false';
  }
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__eatMeLoading = flag;
  }
};

/** Returns today's local date as YYYY-MM-DD (used for daily disclaimer reset). */
const getLocalDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function App() {
  const [regions, setRegions] = useState<Region[]>(DEFAULT_REGIONS);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(DEFAULT_REGION_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  
  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const params = new URLSearchParams(window.location.search);
    return searchParamsToFilters(params);
  });

  // Read initial item deep-link from URL
  const [initialItem, setInitialItem] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return getItemFromSearchParams(params);
  });

  // GDPR cookie consent state – null means user hasn't decided yet
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('eatme-cookie-consent');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return null;
  });

  // AI disclaimer dismissed state (resets daily at local midnight)
  const [disclaimerDismissed, setDisclaimerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('eatme-disclaimer-dismissed') === getLocalDateString();
  });

  // Sync consent to Firebase on mount and when it changes
  useEffect(() => {
    if (cookieConsent === true) {
      setAnalyticsConsent(true);
    }
  }, [cookieConsent]);

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

  // Load all food items when region changes (always load all for multi-select filtering)
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
        const data = await fetchRegionFood(selectedRegion);
        setFoodItems(data.items);
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
  }, [selectedRegion]);

  useEffect(() => {
    updateGlobalLoadingFlag(isLoading);
  }, [isLoading]);

  // Sync filters to URL whenever they change, and track analytics
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    updateUrlWithFilters(filters);

    const prev = prevFiltersRef.current;
    if (prev.sortBy !== filters.sortBy) {
      trackSortChange(filters.sortBy);
    }
    if (prev.vegetarianOnly !== filters.vegetarianOnly) {
      trackDietaryFilter('vegetarian', filters.vegetarianOnly);
    }
    if (prev.veganOnly !== filters.veganOnly) {
      trackDietaryFilter('vegan', filters.veganOnly);
    }
    if (prev.minCalories !== filters.minCalories || prev.maxCalories !== filters.maxCalories) {
      trackCalorieFilter(filters.minCalories, filters.maxCalories);
    }
    if (prev.selectedRestaurants.join(',') !== filters.selectedRestaurants.join(',')) {
      trackRestaurantFilter(filters.selectedRestaurants);
    }
    prevFiltersRef.current = filters;
  }, [filters]);

  const handleClearInitialItem = useCallback(() => {
    setInitialItem(null);
    // Remove item params from URL, keep filter params
    updateUrlWithFilters(filters);
  }, [filters]);

  const handleCookieAccept = useCallback(() => {
    localStorage.setItem('eatme-cookie-consent', 'true');
    setCookieConsent(true);
    setAnalyticsConsent(true);
    trackConsentResponse(true);
  }, []);

  const handleCookieRefuse = useCallback(() => {
    localStorage.setItem('eatme-cookie-consent', 'false');
    setCookieConsent(false);
    setAnalyticsConsent(false);
  }, []);

  const handleDisclaimerDismiss = useCallback(() => {
    localStorage.setItem('eatme-disclaimer-dismissed', getLocalDateString());
    setDisclaimerDismissed(true);
    trackDisclaimerDismissed();
  }, []);

  const handleRegionChange = useCallback((regionId: string | null) => {
    if (regionId === selectedRegion) {
      return;
    }
    if (regionId) {
      trackRegionChange(regionId);
    }
    setRestaurants([]);
    setFoodItems([]);
    setError(null);
    // Reset restaurant filter when region changes
    setFilters(prev => ({ ...prev, selectedRestaurants: [] }));
    const loading = Boolean(regionId);
    setIsLoading(loading);
    updateGlobalLoadingFlag(loading);
    setSelectedRegion(regionId);
  }, [selectedRegion]);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    // Attempt to clear the service worker cache, then reload regardless
    await clearDataCache().catch(() => {
      // Ignore errors - we'll reload anyway
    });
    window.location.reload();
  }, []);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't allow pull-to-refresh when a tray/modal is open
    const isTrayOpen = document.body.dataset.trayOpen === 'true';
    if (isTrayOpen) {
      touchStartY.current = null;
      return;
    }
    
    // Only allow pull-to-refresh when page is scrolled to top
    // Use window.scrollY to check page scroll position for entire page pull-to-refresh
    if (window.scrollY === 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;
    
    if (delta > 0) {
      setIsPulling(true);
      // Apply resistance to make pull feel natural
      const resistance = 0.5;
      const resistedDelta = Math.min(delta * resistance, MAX_PULL_DISTANCE);
      setPullDistance(resistedDelta);
      
      // Prevent default scrolling when pulling at top of page
      if (window.scrollY === 0) {
        e.preventDefault();
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null) return;
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger refresh
      handleRefreshData();
    }
    
    // Reset pull state
    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = null;
  }, [pullDistance, isRefreshing, handleRefreshData]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...foodItems];

    // Apply restaurant filter (if specific restaurants are selected)
    if (filters.selectedRestaurants.length > 0) {
      items = items.filter(item => 
        item.restaurant && filters.selectedRestaurants.includes(item.restaurant)
      );
    }

    // Apply dietary filters
    if (filters.vegetarianOnly) {
      items = items.filter(item => item.vegetarian);
    }
    if (filters.veganOnly) {
      items = items.filter(item => item.vegan);
    }

    // Apply calorie filter
    if (filters.minCalories !== null && filters.minCalories > 0) {
      items = items.filter(item => item.calories >= filters.minCalories!);
    }
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
    <div 
      ref={appRef}
      className={`app ${isPulling ? 'pulling' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className={`pull-to-refresh-indicator ${isRefreshing ? 'refreshing' : ''} ${pullDistance >= PULL_THRESHOLD ? 'ready' : ''}`}
          style={{ 
            opacity: isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
            transform: `translateY(${isRefreshing ? 0 : -50 + (pullDistance / 2)}px)`
          }}
        >
          <div className="pull-spinner"></div>
          <span className="pull-text">
            {isRefreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      <header className="app-header">
        <div className="header-top">
          <div className="header-title">
            <h1>Eat Me</h1>
            <p className="tagline">Find food that fits your goals</p>
          </div>
        </div>
        <HeaderPills
          regions={regions}
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
          restaurants={restaurants}
          filters={filters}
          onFiltersChange={setFilters}
          isLoading={isLoading}
        />
      </header>

      <main className="app-main">


        {selectedRegion && (
          <section className="main-content">
            <FoodList
              items={filteredItems}
              sortBy={filters.sortBy}
              filters={filters}
              isLoading={isLoading}
              error={error}
              initialItem={initialItem}
              onClearInitialItem={handleClearInitialItem}
              showCookieConsent={cookieConsent === null}
              onCookieAccept={handleCookieAccept}
              onCookieRefuse={handleCookieRefuse}
              showDisclaimer={!disclaimerDismissed}
              onDisclaimerDismiss={handleDisclaimerDismiss}
            />
          </section>
        )}

        {!selectedRegion && (
          <div className="welcome-message">
            <h2>Welcome to Eat Me</h2>
            <p>Use the pills above to select a region and start exploring food options that match your dietary goals.</p>
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
      </footer>
    </div>
  );
}

export default App;

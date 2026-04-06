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
import { fibreToCarb, fatContent, proteinEfficiency, saltContent } from './perspectives';
import {
  getItemKey,
  loadHiddenItems,
  saveHiddenItems,
  loadFavouriteItems,
  saveFavouriteItems,
} from './itemKeys';
import HeaderPills from './components/HeaderPills';
import FoodList from './components/FoodList';
import FavouritesList from './components/FavouritesList';
import BottomAppBar from './components/BottomAppBar';
import type { AppTab } from './components/BottomAppBar';


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
  const pullDistanceRef = useRef(0);
  
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

  // Hidden & favourite items – persisted in localStorage
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(() => loadHiddenItems());
  const [favouriteItems, setFavouriteItems] = useState<Set<string>>(() => loadFavouriteItems());

  // Bottom app bar tab
  const [activeTab, setActiveTab] = useState<AppTab>('search');

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

  // ── Hide / Favourite handlers ──

  const handleHideItem = useCallback((item: FoodItem) => {
    setHiddenItems(prev => {
      const next = new Set(prev);
      next.add(getItemKey(item));
      saveHiddenItems(next);
      return next;
    });
  }, []);

  const handleFavouriteItem = useCallback((item: FoodItem) => {
    setFavouriteItems(prev => {
      const next = new Set(prev);
      next.add(getItemKey(item));
      saveFavouriteItems(next);
      return next;
    });
  }, []);

  const handleUnfavouriteItem = useCallback((item: FoodItem) => {
    setFavouriteItems(prev => {
      const next = new Set(prev);
      next.delete(getItemKey(item));
      saveFavouriteItems(next);
      return next;
    });
  }, []);

  const handleShowAll = useCallback(() => {
    setHiddenItems(new Set());
    saveHiddenItems(new Set());
    setFavouriteItems(new Set());
    saveFavouriteItems(new Set());
  }, []);

  const handleClearAllFavourites = useCallback(() => {
    setFavouriteItems(new Set());
    saveFavouriteItems(new Set());
  }, []);

  const handleHideRestaurant = useCallback((restaurant: string) => {
    setFilters(prev => ({
      ...prev,
      selectedRestaurants: prev.selectedRestaurants.length > 0
        ? prev.selectedRestaurants.filter(r => r !== restaurant)
        : restaurants.map(r => r.name).filter(r => r !== restaurant),
    }));
  }, [restaurants]);

  const handleOnlyShowRestaurant = useCallback((restaurant: string) => {
    setFilters(prev => ({
      ...prev,
      selectedRestaurants: [restaurant],
    }));
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
    if (!selectedRegion) return;
    setIsRefreshing(true);
    // Clear the service worker data cache so fresh data is fetched from the network
    await clearDataCache().catch(() => {
      // Ignore errors - we'll re-fetch anyway
    });
    try {
      const [foodData, restaurantData] = await Promise.all([
        fetchRegionFood(selectedRegion),
        fetchRestaurants(selectedRegion),
      ]);
      setFoodItems(foodData.items);
      setRestaurants(restaurantData.restaurants);
    } catch (err) {
      setError('Unable to refresh. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedRegion]);

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

  // Attach touchmove as a native event listener with { passive: false } so that
  // e.preventDefault() works.  React 19 registers onTouchMove as passive which
  // causes preventDefault() to throw and crash the app.
  useEffect(() => {
    const element = appRef.current;
    if (!element) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const currentY = e.touches[0].clientY;
      const delta = currentY - touchStartY.current;

      if (delta > 0) {
        setIsPulling(true);
        // Apply resistance to make pull feel natural
        const resistance = 0.5;
        const resistedDelta = Math.min(delta * resistance, MAX_PULL_DISTANCE);
        pullDistanceRef.current = resistedDelta;
        setPullDistance(resistedDelta);

        // Prevent default scrolling when pulling at top of page
        if (window.scrollY === 0) {
          e.preventDefault();
        }
      }
    };

    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      element.removeEventListener('touchmove', handleTouchMove, { passive: false } as EventListenerOptions);
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null) return;
    
    if (pullDistanceRef.current >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger refresh
      handleRefreshData();
    }
    
    // Reset pull state
    pullDistanceRef.current = 0;
    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = null;
  }, [isRefreshing, handleRefreshData]);

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
        items.sort(proteinEfficiency.sort);
        break;
      case 'fat-asc':
        items.sort(fatContent.sort);
        break;
      case 'fibre-to-carb-asc':
        items.sort(fibreToCarb.sort);
        break;
      case 'salt-asc':
        items.sort(saltContent.sort);
        break;
    }

    return items;
  }, [foodItems, filters]);

  return (
    <div 
      ref={appRef}
      className={`min-h-screen flex flex-col relative${isPulling ? ' select-none' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 flex items-center justify-center gap-2 p-4 bg-gray-200 text-gray-800 text-sm z-[1000] pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          style={{ 
            opacity: isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
            transform: `translateY(${isRefreshing ? 0 : -50 + (pullDistance / 2)}px)`
          }}
        >
          <div className={`w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full${isRefreshing ? ' animate-spin' : ''}`}></div>
          <span className={pullDistance >= PULL_THRESHOLD ? 'font-semibold' : ''}>
            {isRefreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      <header
        className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white px-4 py-4 sm:px-8 sm:py-6"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="m-0 text-2xl sm:text-3xl font-bold">Eat Me</h1>
            <p className="mt-1 mb-0 text-[0.85rem] sm:text-[0.95rem] opacity-90">Find food that fits your goals</p>
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

      <main
        className="flex-1 px-6 max-w-[1400px] mx-auto w-full relative"
        style={{
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right, 0px))'
        }}
      >

        {selectedRegion && (
          <section className="w-full">
            {activeTab === 'search' && (
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
                hiddenItems={hiddenItems}
                favouriteItems={favouriteItems}
                onHideItem={handleHideItem}
                onFavouriteItem={handleFavouriteItem}
                onShowAll={handleShowAll}
                onHideRestaurant={handleHideRestaurant}
                onOnlyShowRestaurant={handleOnlyShowRestaurant}
              />
            )}
            {activeTab === 'favourites' && (
              <FavouritesList
                allItems={foodItems}
                favouriteItems={favouriteItems}
                sortBy={filters.sortBy}
                filters={filters}
                onUnfavourite={handleUnfavouriteItem}
                onClearAll={handleClearAllFavourites}
              />
            )}
          </section>
        )}

        {!selectedRegion && (
          <div className="bg-white rounded-xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h2 className="mt-0 mb-4 text-gray-900">Welcome to Eat Me</h2>
            <p className="text-gray-500 mb-8">Use the pills above to select a region and start exploring food options that match your dietary goals.</p>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 text-left">
              <li className="bg-gray-50 p-4 rounded-lg text-[0.95rem]">🥗 Filter by vegetarian or vegan options</li>
              <li className="bg-gray-50 p-4 rounded-lg text-[0.95rem]">🔥 Set your calorie budget</li>
              <li className="bg-gray-50 p-4 rounded-lg text-[0.95rem]">💪 Find high-protein foods</li>
              <li className="bg-gray-50 p-4 rounded-lg text-[0.95rem]">📊 Sort by protein per calorie for optimal nutrition</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="bg-gray-500 text-gray-100 text-center px-6 py-6 mt-auto" style={{ paddingBottom: 'calc(1.5rem + 60px)' }}>
        <p className="m-0 text-[0.9rem]">Eat Me - Making informed food choices easier</p>
      </footer>

      <BottomAppBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'search') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        favouriteCount={favouriteItems.size}
      />
    </div>
  );
}

export default App;

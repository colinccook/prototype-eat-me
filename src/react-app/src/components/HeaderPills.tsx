import { useState } from 'react';
import type { Region, Restaurant, FilterOptions, SortOption } from '../types';
import Pill from './Pill';
import Tray from './Tray';

type DietMode = 'off' | 'vegetarian' | 'vegan';

interface HeaderPillsProps {
  regions: Region[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
  restaurants: Restaurant[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

interface SortOptionInfo {
  value: SortOption;
  label: string;
  description: string;
}

const SORT_OPTIONS: SortOptionInfo[] = [
  { value: 'protein-per-calorie-desc', label: 'Protein per Calorie', description: 'Best for building muscle while staying lean. Shows foods that give you the most protein bang for your calorie buck.' },
  { value: 'protein-desc', label: 'Highest Protein', description: 'Great for muscle building. Find the most protein-packed meals regardless of calories.' },
  { value: 'calories-asc', label: 'Lowest Calories', description: 'Perfect for weight loss. Find the lightest meals to stay within your daily budget.' },
  { value: 'calories-desc', label: 'Highest Calories', description: 'Ideal for bulking or high-energy needs. Find meals that pack the most fuel.' },
  { value: 'fat-asc', label: 'Lowest Fat', description: 'Good for heart health or low-fat diets. Find meals with minimal fat content.' },
  { value: 'fibre-to-carb-asc', label: 'Best Fibre Ratio', description: 'Great for blood sugar control. Shows carbs that come with plenty of healthy fibre.' },
  { value: 'salt-asc', label: 'Lowest Salt', description: 'Important for blood pressure management. Find meals that go easy on the sodium.' },
  { value: 'name-asc', label: 'A-Z', description: 'Simple alphabetical order. Useful when you know what you\'re looking for.' }
];

const DIET_OPTIONS = [
  { value: 'off' as DietMode, label: 'All Foods', description: 'Show everything. No dietary restrictions applied.' },
  { value: 'vegetarian' as DietMode, label: 'Vegetarian', description: 'No meat or fish. Includes eggs, dairy, and plant-based foods.' },
  { value: 'vegan' as DietMode, label: 'Vegan', description: 'Fully plant-based. No animal products including eggs, dairy, or honey.' }
];

const QUICK_CALORIE_OPTIONS = [100, 200, 400, 600, 800, 1000, 1200];

const trayOptionBase = 'tray-option flex flex-col items-start gap-1 p-4 bg-gray-50 border-2 border-transparent rounded-xl cursor-pointer text-left w-full transition-all duration-200 hover:bg-gray-100 hover:border-gray-200 active:bg-gray-200';
const trayOptionActive = 'bg-gradient-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] border-[#667eea]';
const trayFormBtnBase = 'tray-form-button flex-1 px-4 py-3 border-0 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200';

function HeaderPills({ regions, selectedRegion, onRegionChange, restaurants, filters, onFiltersChange, isLoading }: HeaderPillsProps) {
  const [activeTrays, setActiveTrays] = useState({
    region: false, restaurants: false, sort: false, calories: false, diet: false
  });
  
  const [calorieInput, setCalorieInput] = useState<string>(filters.maxCalories?.toString() || '');
  const [minCalorieInput, setMinCalorieInput] = useState<string>(filters.minCalories?.toString() || '');

  const openTray = (tray: keyof typeof activeTrays) => {
    setActiveTrays({ region: false, restaurants: false, sort: false, calories: false, diet: false, [tray]: true });
  };

  const closeTray = () => {
    setActiveTrays({ region: false, restaurants: false, sort: false, calories: false, diet: false });
  };

  const getRegionDisplayValue = () => {
    if (!selectedRegion) return 'Select';
    const region = regions.find(r => r.id === selectedRegion);
    return region?.id.toUpperCase() || 'Select';
  };

  const getRestaurantsDisplayValue = () => {
    if (filters.selectedRestaurants.length === 0) return 'All';
    if (filters.selectedRestaurants.length === 1) {
      const restaurant = restaurants.find(r => r.name === filters.selectedRestaurants[0]);
      return restaurant?.name || 'All';
    }
    return `${filters.selectedRestaurants.length} selected`;
  };

  const getSortDisplayValue = () => {
    const option = SORT_OPTIONS.find(o => o.value === filters.sortBy);
    return option?.label || 'Select';
  };

  const getCaloriesDisplayValue = () => {
    if (filters.minCalories && filters.maxCalories) return `${filters.minCalories}-${filters.maxCalories}`;
    if (filters.minCalories) return `≥${filters.minCalories}`;
    if (!filters.maxCalories) return 'Any';
    return `≤${filters.maxCalories}`;
  };

  const getDietMode = (): DietMode => {
    if (filters.veganOnly) return 'vegan';
    if (filters.vegetarianOnly) return 'vegetarian';
    return 'off';
  };

  const getDietDisplayValue = () => {
    const mode = getDietMode();
    if (mode === 'vegan') return 'Vegan';
    if (mode === 'vegetarian') return 'Veggie';
    return 'All';
  };

  const handleRegionSelect = (regionId: string) => {
    onRegionChange(regionId);
    closeTray();
  };

  const handleRestaurantToggle = (restaurantName: string) => {
    const currentSelected = filters.selectedRestaurants;
    let newSelected: string[];
    if (currentSelected.includes(restaurantName)) {
      newSelected = currentSelected.filter(name => name !== restaurantName);
    } else {
      newSelected = [...currentSelected, restaurantName];
    }
    onFiltersChange({ ...filters, selectedRestaurants: newSelected });
  };

  const handleSelectAllRestaurants = () => {
    onFiltersChange({ ...filters, selectedRestaurants: [] });
    closeTray();
  };

  const handleSortSelect = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
    closeTray();
  };

  const handleCaloriesSubmit = () => {
    const minValue = minCalorieInput ? parseInt(minCalorieInput, 10) : null;
    const maxValue = calorieInput ? parseInt(calorieInput, 10) : null;
    onFiltersChange({
      ...filters,
      minCalories: minValue && minValue > 0 ? minValue : null,
      maxCalories: maxValue && maxValue > 0 ? maxValue : null
    });
    closeTray();
  };

  const handleCaloriesClear = () => {
    setCalorieInput('');
    setMinCalorieInput('');
    onFiltersChange({ ...filters, minCalories: null, maxCalories: null });
    closeTray();
  };

  const handleQuickCalorieSelect = (bound: 'min' | 'max', value: number) => {
    if (bound === 'min') {
      setMinCalorieInput(value.toString());
      onFiltersChange({ ...filters, minCalories: value });
    } else {
      setCalorieInput(value.toString());
      onFiltersChange({ ...filters, maxCalories: value });
    }
    closeTray();
  };

  const handleDietSelect = (mode: DietMode) => {
    onFiltersChange({ ...filters, vegetarianOnly: mode === 'vegetarian', veganOnly: mode === 'vegan' });
    closeTray();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Region pill */}
      <div className="flex flex-wrap gap-2">
        <Pill label="Region" value={getRegionDisplayValue()} onClick={() => openTray('region')} isActive={activeTrays.region} icon="🌍" />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <Pill label="Restaurants" value={getRestaurantsDisplayValue()} onClick={() => openTray('restaurants')} isActive={activeTrays.restaurants || filters.selectedRestaurants.length > 0} icon="🍽️" />
        <Pill label="Sort" value={getSortDisplayValue()} onClick={() => openTray('sort')} isActive={activeTrays.sort} icon="↕️" />
        <Pill label="Calories" value={getCaloriesDisplayValue()} onClick={() => openTray('calories')} isActive={activeTrays.calories || !!filters.minCalories || !!filters.maxCalories} icon="🔥" />
        <Pill label="Diet" value={getDietDisplayValue()} onClick={() => openTray('diet')} isActive={activeTrays.diet || getDietMode() !== 'off'} icon="🥗" />
      </div>

      {/* Region Tray */}
      <Tray isOpen={activeTrays.region} onClose={closeTray} title="Select Region">
        <div className="flex flex-col gap-3">
          {regions.map((region) => (
            <button key={region.id} className={`${trayOptionBase} ${selectedRegion === region.id ? trayOptionActive : ''}`} onClick={() => handleRegionSelect(region.id)} disabled={isLoading}>
              <span className={`text-base font-semibold ${selectedRegion === region.id ? 'text-[#667eea]' : 'text-gray-900'}`}>{region.name}</span>
              <span className="text-[0.85rem] text-gray-500">Browse restaurants and food options in {region.name}</span>
            </button>
          ))}
        </div>
      </Tray>

      {/* Restaurants Tray */}
      <Tray isOpen={activeTrays.restaurants} onClose={closeTray} title="Select Restaurants">
        <div className="flex flex-col gap-2">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              className={`${trayOptionBase} ${filters.selectedRestaurants.includes(restaurant.name) ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-[#667eea]' : ''}`}
              onClick={() => handleRestaurantToggle(restaurant.name)}
              aria-pressed={filters.selectedRestaurants.includes(restaurant.name)}
            >
              <span className={`text-base font-semibold ${filters.selectedRestaurants.includes(restaurant.name) ? 'text-white' : 'text-gray-900'}`}>{restaurant.name}</span>
            </button>
          ))}
          
          <div className="flex gap-3 mt-1">
            <button className={`${trayFormBtnBase} secondary bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300`} onClick={handleSelectAllRestaurants} aria-label="Clear restaurant filters and show all restaurants">Show All</button>
            {filters.selectedRestaurants.length > 0 && (
              <button className={`${trayFormBtnBase} primary bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:opacity-90 active:opacity-80`} onClick={closeTray}>Done</button>
            )}
          </div>
        </div>
      </Tray>

      {/* Sort Tray */}
      <Tray isOpen={activeTrays.sort} onClose={closeTray} title="Sort By">
        <div className="flex flex-col gap-3">
          {SORT_OPTIONS.map((option) => (
            <button key={option.value} className={`${trayOptionBase} ${filters.sortBy === option.value ? trayOptionActive : ''}`} onClick={() => handleSortSelect(option.value)}>
              <span className={`text-base font-semibold ${filters.sortBy === option.value ? 'text-[#667eea]' : 'text-gray-900'}`}>{option.label}</span>
              <span className="text-[0.85rem] text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      </Tray>

      {/* Calories Tray */}
      <Tray isOpen={activeTrays.calories} onClose={closeTray} title="Calorie Budget">
        <div className="flex flex-col gap-4">
          <div className="tray-form-group flex flex-col gap-2">
            <label className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px]">Quick Select Minimum</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_CALORIE_OPTIONS.map((value) => (
                <button key={`min-${value}`} className={`px-3 py-2 rounded-lg text-[0.9rem] font-medium cursor-pointer transition-all duration-200 min-w-[50px] text-center border-2 ${filters.minCalories === value ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-[#667eea]' : 'bg-gray-50 border-transparent text-gray-800 hover:bg-gray-100 hover:border-gray-200 active:bg-gray-200'}`} onClick={() => handleQuickCalorieSelect('min', value)}>{value}</button>
              ))}
            </div>
          </div>
          <div className="tray-form-group flex flex-col gap-2">
            <label className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px]">Quick Select Maximum</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_CALORIE_OPTIONS.map((value) => (
                <button key={`max-${value}`} className={`px-3 py-2 rounded-lg text-[0.9rem] font-medium cursor-pointer transition-all duration-200 min-w-[50px] text-center border-2 ${filters.maxCalories === value ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-[#667eea]' : 'bg-gray-50 border-transparent text-gray-800 hover:bg-gray-100 hover:border-gray-200 active:bg-gray-200'}`} onClick={() => handleQuickCalorieSelect('max', value)}>{value}</button>
              ))}
            </div>
          </div>
          <div className="tray-form-group flex flex-col gap-2">
            <label className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px]" htmlFor="min-calorie-input">Minimum Calories</label>
            <input id="min-calorie-input" type="number" className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[#667eea]" placeholder="e.g., 200" value={minCalorieInput} onChange={(e) => setMinCalorieInput(e.target.value)} min="0" step="50" />
          </div>
          <div className="tray-form-group flex flex-col gap-2">
            <label className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px]" htmlFor="calorie-input">Maximum Calories</label>
            <input id="calorie-input" type="number" className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[#667eea]" placeholder="e.g., 500" value={calorieInput} onChange={(e) => setCalorieInput(e.target.value)} min="0" step="50" />
            <span className="text-[0.85rem] text-gray-400">Fill both fields to set a calorie range, or leave either one empty to use a single limit.</span>
          </div>
          <div className="flex gap-3">
            <button className={`${trayFormBtnBase} secondary bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300`} onClick={handleCaloriesClear}>Clear</button>
            <button className={`${trayFormBtnBase} primary bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:opacity-90 active:opacity-80`} onClick={handleCaloriesSubmit}>Apply</button>
          </div>
        </div>
      </Tray>

      {/* Diet Tray */}
      <Tray isOpen={activeTrays.diet} onClose={closeTray} title="Dietary Preference">
        <div className="flex flex-col gap-3">
          {DIET_OPTIONS.map((option) => (
            <button key={option.value} className={`${trayOptionBase} ${getDietMode() === option.value ? trayOptionActive : ''}`} onClick={() => handleDietSelect(option.value)}>
              <span className={`text-base font-semibold ${getDietMode() === option.value ? 'text-[#667eea]' : 'text-gray-900'}`}>{option.label}</span>
              <span className="text-[0.85rem] text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      </Tray>
    </div>
  );
}

export default HeaderPills;

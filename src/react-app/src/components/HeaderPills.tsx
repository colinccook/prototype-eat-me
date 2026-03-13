import { useState } from 'react';
import type { Region, FilterOptions, SortOption } from '../types';
import Pill from './Pill';
import Tray from './Tray';
import './HeaderPills.css';

type DietMode = 'off' | 'vegetarian' | 'vegan';

interface HeaderPillsProps {
  regions: Region[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
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
  { 
    value: 'protein-per-calorie-desc', 
    label: 'Protein per Calorie', 
    description: 'Best for building muscle while staying lean. Shows foods that give you the most protein bang for your calorie buck.' 
  },
  { 
    value: 'protein-desc', 
    label: 'Highest Protein', 
    description: 'Great for muscle building. Find the most protein-packed meals regardless of calories.' 
  },
  { 
    value: 'calories-asc', 
    label: 'Lowest Calories', 
    description: 'Perfect for weight loss. Find the lightest meals to stay within your daily budget.' 
  },
  { 
    value: 'calories-desc', 
    label: 'Highest Calories', 
    description: 'Ideal for bulking or high-energy needs. Find meals that pack the most fuel.' 
  },
  { 
    value: 'fat-asc', 
    label: 'Lowest Fat', 
    description: 'Good for heart health or low-fat diets. Find meals with minimal fat content.' 
  },
  { 
    value: 'fibre-to-carb-asc', 
    label: 'Best Fibre Ratio', 
    description: 'Great for blood sugar control. Shows carbs that come with plenty of healthy fibre.' 
  },
  { 
    value: 'salt-asc', 
    label: 'Lowest Salt', 
    description: 'Important for blood pressure management. Find meals that go easy on the sodium.' 
  },
  { 
    value: 'name-asc', 
    label: 'A-Z', 
    description: 'Simple alphabetical order. Useful when you know what you\'re looking for.' 
  }
];

const DIET_OPTIONS = [
  { 
    value: 'off' as DietMode, 
    label: 'All Foods', 
    description: 'Show everything. No dietary restrictions applied.' 
  },
  { 
    value: 'vegetarian' as DietMode, 
    label: 'Vegetarian', 
    description: 'No meat or fish. Includes eggs, dairy, and plant-based foods.' 
  },
  { 
    value: 'vegan' as DietMode, 
    label: 'Vegan', 
    description: 'Fully plant-based. No animal products including eggs, dairy, or honey.' 
  }
];

function HeaderPills({
  regions,
  selectedRegion,
  onRegionChange,
  filters,
  onFiltersChange,
  isLoading
}: HeaderPillsProps) {
  const [activeTrays, setActiveTrays] = useState({
    region: false,
    sort: false,
    calories: false,
    diet: false
  });
  
  const [calorieInput, setCalorieInput] = useState<string>(
    filters.maxCalories?.toString() || ''
  );

  const openTray = (tray: keyof typeof activeTrays) => {
    setActiveTrays({ region: false, sort: false, calories: false, diet: false, [tray]: true });
  };

  const closeTray = () => {
    setActiveTrays({ region: false, sort: false, calories: false, diet: false });
  };

  // Get display values for pills
  const getRegionDisplayValue = () => {
    if (!selectedRegion) return 'Select';
    const region = regions.find(r => r.id === selectedRegion);
    return region?.id.toUpperCase() || 'Select';
  };

  const getSortDisplayValue = () => {
    const option = SORT_OPTIONS.find(o => o.value === filters.sortBy);
    return option?.label || 'Select';
  };

  const getCaloriesDisplayValue = () => {
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

  // Handlers
  const handleRegionSelect = (regionId: string) => {
    onRegionChange(regionId);
    closeTray();
  };

  const handleSortSelect = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
    closeTray();
  };

  const handleCaloriesSubmit = () => {
    const value = calorieInput ? parseInt(calorieInput, 10) : null;
    onFiltersChange({ ...filters, maxCalories: value && value > 0 ? value : null });
    closeTray();
  };

  const handleCaloriesClear = () => {
    setCalorieInput('');
    onFiltersChange({ ...filters, maxCalories: null });
    closeTray();
  };

  const handleDietSelect = (mode: DietMode) => {
    onFiltersChange({
      ...filters,
      vegetarianOnly: mode === 'vegetarian',
      veganOnly: mode === 'vegan'
    });
    closeTray();
  };

  return (
    <div className="header-pills">
      <div className="pills-container">
        <Pill
          label="Region"
          value={getRegionDisplayValue()}
          onClick={() => openTray('region')}
          isActive={activeTrays.region}
          icon="🌍"
        />
        <Pill
          label="Sort"
          value={getSortDisplayValue()}
          onClick={() => openTray('sort')}
          isActive={activeTrays.sort}
          icon="↕️"
        />
        <Pill
          label="Calories"
          value={getCaloriesDisplayValue()}
          onClick={() => openTray('calories')}
          isActive={activeTrays.calories || !!filters.maxCalories}
          icon="🔥"
        />
        <Pill
          label="Diet"
          value={getDietDisplayValue()}
          onClick={() => openTray('diet')}
          isActive={activeTrays.diet || getDietMode() !== 'off'}
          icon="🥗"
        />
      </div>

      {/* Region Tray */}
      <Tray isOpen={activeTrays.region} onClose={closeTray} title="Select Region">
        <div className="tray-options">
          {regions.map((region) => (
            <button
              key={region.id}
              className={`tray-option ${selectedRegion === region.id ? 'active' : ''}`}
              onClick={() => handleRegionSelect(region.id)}
              disabled={isLoading}
            >
              <span className="tray-option-label">{region.name}</span>
              <span className="tray-option-description">
                Browse restaurants and food options in {region.name}
              </span>
            </button>
          ))}
        </div>
      </Tray>

      {/* Sort Tray */}
      <Tray isOpen={activeTrays.sort} onClose={closeTray} title="Sort By">
        <div className="tray-options">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`tray-option ${filters.sortBy === option.value ? 'active' : ''}`}
              onClick={() => handleSortSelect(option.value)}
            >
              <span className="tray-option-label">{option.label}</span>
              <span className="tray-option-description">{option.description}</span>
            </button>
          ))}
        </div>
      </Tray>

      {/* Calories Tray */}
      <Tray isOpen={activeTrays.calories} onClose={closeTray} title="Calorie Budget">
        <div className="tray-form">
          <div className="tray-form-group">
            <label className="tray-form-label" htmlFor="calorie-input">
              Maximum Calories per Item
            </label>
            <input
              id="calorie-input"
              type="number"
              className="tray-form-input"
              placeholder="e.g., 500"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
              min="0"
              step="50"
            />
            <span className="tray-form-helper">
              Only show foods with this many calories or fewer. Leave empty for no limit.
            </span>
          </div>
          <div className="tray-form-actions">
            <button 
              className="tray-form-button secondary" 
              onClick={handleCaloriesClear}
            >
              Clear
            </button>
            <button 
              className="tray-form-button primary" 
              onClick={handleCaloriesSubmit}
            >
              Apply
            </button>
          </div>
        </div>
      </Tray>

      {/* Diet Tray */}
      <Tray isOpen={activeTrays.diet} onClose={closeTray} title="Dietary Preference">
        <div className="tray-options">
          {DIET_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`tray-option ${getDietMode() === option.value ? 'active' : ''}`}
              onClick={() => handleDietSelect(option.value)}
            >
              <span className="tray-option-label">{option.label}</span>
              <span className="tray-option-description">{option.description}</span>
            </button>
          ))}
        </div>
      </Tray>
    </div>
  );
}

export default HeaderPills;

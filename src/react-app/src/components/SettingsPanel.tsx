import { useState } from 'react';
import type { Region, FilterOptions } from '../types';

interface SettingsPanelProps {
  regions: Region[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

function SettingsPanel({ regions, selectedRegion, onRegionChange, filters, onFiltersChange, isLoading }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDietaryChange = (type: 'vegetarian' | 'vegan', checked: boolean) => {
    onFiltersChange({
      ...filters,
      vegetarianOnly: type === 'vegetarian' ? checked : (checked ? false : filters.vegetarianOnly),
      veganOnly: type === 'vegan' ? checked : (checked ? false : filters.veganOnly)
    });
  };

  const hasActiveDietarySettings = filters.vegetarianOnly || filters.veganOnly;

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-4 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-4 py-3 min-h-[48px] bg-transparent border-0 cursor-pointer text-[0.95rem] font-semibold text-gray-800 transition-[background-color] duration-200 [-webkit-tap-highlight-color:transparent] hover:bg-gray-50 active:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="settings-content"
      >
        <span className="text-[1.1rem]">⚙️</span>
        <span>Settings</span>
        {hasActiveDietarySettings && <span className="bg-[#667eea] text-white text-[0.7rem] px-2 py-[0.2rem] rounded-[10px] font-medium uppercase tracking-[0.3px]">Active</span>}
        <span className={`ml-auto text-[0.75rem] text-gray-500 transition-transform duration-200${isOpen ? ' rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div id="settings-content" className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-4">
            <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-[0.5px] text-gray-500">Region</h3>
            <select
              id="region-select"
              value={selectedRegion || ''}
              onChange={(e) => onRegionChange(e.target.value || null)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[0.95rem] bg-white cursor-pointer focus:outline-none focus:border-[#0066cc] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-[0.5px] text-gray-500">Dietary Preferences</h3>
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-[0.95rem] text-gray-800">
              <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer" checked={filters.vegetarianOnly} onChange={(e) => handleDietaryChange('vegetarian', e.target.checked)} />
              Vegetarian Only
            </label>
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-[0.95rem] text-gray-800">
              <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer" checked={filters.veganOnly} onChange={(e) => handleDietaryChange('vegan', e.target.checked)} />
              Vegan Only
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;

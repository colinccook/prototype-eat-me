import { useState } from 'react';
import type { Region, FilterOptions } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  regions: Region[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

function SettingsPanel({
  regions,
  selectedRegion,
  onRegionChange,
  filters,
  onFiltersChange,
  isLoading
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleVegetarianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      vegetarianOnly: e.target.checked,
      veganOnly: e.target.checked ? false : filters.veganOnly
    });
  };

  const handleVeganChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      veganOnly: e.target.checked,
      vegetarianOnly: e.target.checked ? false : filters.vegetarianOnly
    });
  };

  const hasActiveSettings = filters.vegetarianOnly || filters.veganOnly;

  return (
    <div className="settings-panel">
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="settings-content"
      >
        <span className="settings-icon">⚙️</span>
        <span>Settings</span>
        {hasActiveSettings && <span className="settings-badge">Active</span>}
        <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div id="settings-content" className="settings-content">
          <div className="settings-section">
            <h3>Region</h3>
            <select
              id="region-select"
              value={selectedRegion || ''}
              onChange={(e) => onRegionChange(e.target.value || null)}
              disabled={isLoading}
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <h3>Dietary Preferences</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.vegetarianOnly}
                onChange={handleVegetarianChange}
              />
              Vegetarian Only
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.veganOnly}
                onChange={handleVeganChange}
              />
              Vegan Only
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;

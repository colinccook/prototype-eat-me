import type { FilterOptions, SortOption } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleMaxCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      maxCalories: value ? parseInt(value, 10) : null
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as SortOption
    });
  };

  return (
    <div className="filter-panel">
      <h2>Filters</h2>

      <div className="filter-section">
        <h3>Calorie Budget</h3>
        <div className="input-group">
          <input 
            type="number" 
            placeholder="Max calories"
            value={filters.maxCalories || ''}
            onChange={handleMaxCaloriesChange}
            min="0"
            step="50"
          />
          <span className="input-suffix">kcal</span>
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select value={filters.sortBy} onChange={handleSortChange}>
          <option value="name-asc">Name (A-Z)</option>
          <option value="calories-asc">Calories (Low to High)</option>
          <option value="calories-desc">Calories (High to Low)</option>
          <option value="protein-desc">Protein (High to Low)</option>
          <option value="protein-per-calorie-desc">Protein per Calorie (Best)</option>
          <option value="fat-asc">Fat (Low to High)</option>
          <option value="fibre-to-carb-asc">Fibre to Carb Ratio (Best)</option>
          <option value="salt-asc">Salt (Low to High)</option>
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;

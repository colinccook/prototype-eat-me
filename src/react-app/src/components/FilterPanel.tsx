import type { FilterOptions, SortOption } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleMaxCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({ ...filters, maxCalories: value ? parseInt(value, 10) : null });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, sortBy: e.target.value as SortOption });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h2 className="m-0 mb-6 text-xl text-gray-900">Filters</h2>

      <div className="mb-6">
        <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-[0.5px] text-gray-500">Calorie Budget</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Max calories"
            value={filters.maxCalories || ''}
            onChange={handleMaxCaloriesChange}
            min="0"
            step="50"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-[0.95rem] focus:outline-none focus:border-[#0066cc]"
          />
          <span className="text-[0.85rem] text-gray-500">kcal</span>
        </div>
      </div>

      <div className="mb-6 last:mb-0">
        <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-[0.5px] text-gray-500">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-[0.95rem] bg-white cursor-pointer focus:outline-none focus:border-[#0066cc]"
        >
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

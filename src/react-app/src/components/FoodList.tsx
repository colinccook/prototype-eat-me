import type { FoodItem, SortOption } from '../types';
import FoodCard from './FoodCard';
import './FoodList.css';

interface FoodListProps {
  items: FoodItem[];
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
}

function FoodList({ items, sortBy, isLoading, error }: FoodListProps) {
  if (isLoading) {
    return (
      <div className="food-list-status">
        <div className="loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="food-list-status error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="food-list-status">
        <p>No items match your filters. Try adjusting your criteria.</p>
      </div>
    );
  }

  return (
    <div className="food-list">
      <div className="food-list-header">
        <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''} found</span>
      </div>
      <div className="food-grid">
        {items.map((item, index) => (
          <FoodCard key={`${item.name}-${item.restaurant}-${index}`} item={item} sortBy={sortBy} />
        ))}
      </div>
    </div>
  );
}

export default FoodList;

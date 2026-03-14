import { useState, useCallback } from 'react';
import type { FoodItem, SortOption } from '../types';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import SkeletonCard from './SkeletonCard';
import './FoodList.css';
import './SkeletonCard.css';

interface FoodListProps {
  items: FoodItem[];
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
}

function FoodList({ items, sortBy, isLoading, error }: FoodListProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (isLoading) {
    return (
      <div className="food-list skeleton-loading-status">
        <div className="skeleton-loading-header">
          <div className="skeleton-mini-spinner"></div>
          <div className="skeleton-text skeleton-loading-text"></div>
        </div>
        <div className="skeleton-grid" role="status" aria-label="Loading menu items">
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
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
          <FoodCard 
            key={`${item.name}-${item.restaurant}-${index}`} 
            item={item} 
            sortBy={sortBy}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
      <FoodDetailModal item={selectedItem} sortBy={sortBy} onClose={handleCloseModal} />
    </div>
  );
}

export default FoodList;

import { useState, useCallback } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { getItemKey } from '../itemKeys';
import { trackFoodItemView } from '../analytics';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import SwipeableCard from './SwipeableCard';
import './FoodList.css';

interface FavouritesListProps {
  /** All food items in the current region (used to resolve keys back to items). */
  allItems: FoodItem[];
  favouriteItems: Set<string>;
  sortBy: SortOption;
  filters: FilterOptions;
  onUnfavourite: (item: FoodItem) => void;
}

function FavouritesList({ allItems, favouriteItems, sortBy, filters, onUnfavourite }: FavouritesListProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const items = allItems.filter(item => favouriteItems.has(getItemKey(item)));

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
    trackFoodItemView(item.name, item.restaurant ?? '');
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (items.length === 0) {
    return (
      <div className="food-list-status">
        <p>No favourites yet. Swipe right on a food item to add it here.</p>
      </div>
    );
  }

  return (
    <div className="food-list">
      <div className="food-list-header">
        <span className="item-count">{items.length} favourite{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="food-grid">
        {items.map((item) => (
          <SwipeableCard
            key={getItemKey(item)}
            onSwipeLeft={() => onUnfavourite(item)}
            leftLabel=""
            rightLabel="💔 Remove"
          >
            <FoodCard
              item={item}
              sortBy={sortBy}
              isFavourite
              onClick={() => handleItemClick(item)}
            />
          </SwipeableCard>
        ))}
      </div>
      <FoodDetailModal item={selectedItem} sortBy={sortBy} filters={filters} onClose={handleCloseModal} />
    </div>
  );
}

export default FavouritesList;

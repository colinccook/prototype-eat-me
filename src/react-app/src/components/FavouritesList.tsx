import { useState, useCallback } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { getItemKey } from '../itemKeys';
import { trackFoodItemView } from '../analytics';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import SwipeableCard from './SwipeableCard';

interface FavouritesListProps {
  allItems: FoodItem[];
  favouriteItems: Set<string>;
  sortBy: SortOption;
  filters: FilterOptions;
  onUnfavourite: (item: FoodItem) => void;
  onClearAll: () => void;
}

function FavouritesList({ allItems, favouriteItems, sortBy, filters, onUnfavourite, onClearAll }: FavouritesListProps) {
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
      <div className="food-list-status text-center py-12 text-gray-500">
        <p>No favourites yet. Swipe right on a food item to add it here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[0.9rem] text-gray-500">{items.length} favourite{items.length !== 1 ? 's' : ''}</span>
        <button
          className="clear-all-button bg-transparent border border-[#e53935] text-[#e53935] cursor-pointer px-3 py-[0.3rem] text-[0.85rem] font-medium rounded-md min-h-[44px] transition-[background,color] duration-200 hover:bg-[#e53935] hover:text-white active:bg-[#e53935] active:text-white"
          onClick={onClearAll}
        >
          Clear all
        </button>
      </div>
      <div className="food-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
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

import { useState, useCallback } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { buildShareUrl } from '../urlState';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import SkeletonCard from './SkeletonCard';
import './FoodList.css';
import './SkeletonCard.css';

interface FoodListProps {
  items: FoodItem[];
  sortBy: SortOption;
  filters: FilterOptions;
  isLoading: boolean;
  error: string | null;
  initialItem?: { name: string; restaurant?: string } | null;
  onClearInitialItem?: () => void;
}

function FoodList({ items, sortBy, filters, isLoading, error, initialItem, onClearInitialItem }: FoodListProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [initialItemConsumed, setInitialItemConsumed] = useState(false);

  // Handle initial item deep-link: auto-open the matching item once items are loaded.
  // Uses React's "adjusting state during rendering" pattern (per React docs) because
  // the project's react-hooks/set-state-in-effect lint rule forbids setState inside useEffect.
  if (initialItem && items.length > 0 && !selectedItem && !initialItemConsumed) {
    const match = items.find(item => {
      const nameMatch = item.name === initialItem.name;
      if (initialItem.restaurant) {
        return nameMatch && item.restaurant === initialItem.restaurant;
      }
      return nameMatch;
    });
    if (match) {
      setSelectedItem(match);
      setInitialItemConsumed(true);
    }
  }

  const handleItemClick = useCallback((item: FoodItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    if (initialItem && onClearInitialItem) {
      onClearInitialItem();
    }
  }, [initialItem, onClearInitialItem]);

  const handleShareFilters = useCallback(async () => {
    const url = buildShareUrl(filters);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for legacy browsers without Clipboard API (e.g. older WebViews)
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [filters]);

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
        <button
          className="share-button"
          onClick={handleShareFilters}
          aria-label="Share current filters"
          title="Copy link to clipboard"
        >
          <svg className="share-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
      {showToast && (
        <div className="share-toast" role="status">Link copied to clipboard</div>
      )}
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
      <FoodDetailModal item={selectedItem} sortBy={sortBy} filters={filters} onClose={handleCloseModal} />
    </div>
  );
}

export default FoodList;

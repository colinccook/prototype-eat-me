import { useState, useCallback, useEffect, useRef } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { getItemKey } from '../itemKeys';
import { shareFilters, shareItem, updateUrlWithItem, updateUrlWithFilters } from '../urlState';
import { trackFoodItemView, trackShare } from '../analytics';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import LongPressContextMenu from './LongPressContextMenu';
import SkeletonCard from './SkeletonCard';
import CookieConsentCard from './CookieConsentCard';
import DisclaimerCard from './DisclaimerCard';
import SwipeableCard from './SwipeableCard';
import './FoodList.css';
import './SkeletonCard.css';

const BATCH_SIZE = 6;

interface FoodListProps {
  items: FoodItem[];
  sortBy: SortOption;
  filters: FilterOptions;
  isLoading: boolean;
  error: string | null;
  initialItem?: { name: string; restaurant?: string } | null;
  onClearInitialItem?: () => void;
  showCookieConsent: boolean;
  onCookieAccept: () => void;
  onCookieRefuse: () => void;
  showDisclaimer: boolean;
  onDisclaimerDismiss: () => void;
  hiddenItems: Set<string>;
  favouriteItems: Set<string>;
  onHideItem: (item: FoodItem) => void;
  onFavouriteItem: (item: FoodItem) => void;
  onShowAll: () => void;
  onHideRestaurant?: (restaurant: string) => void;
  onOnlyShowRestaurant?: (restaurant: string) => void;
}

function FoodList({ items, sortBy, filters, isLoading, error, initialItem, onClearInitialItem, showCookieConsent, onCookieAccept, onCookieRefuse, showDisclaimer, onDisclaimerDismiss, hiddenItems, favouriteItems, onHideItem, onFavouriteItem, onShowAll, onHideRestaurant, onOnlyShowRestaurant }: FoodListProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [longPressItem, setLongPressItem] = useState<FoodItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [initialItemConsumed, setInitialItemConsumed] = useState(false);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    trackFoodItemView(item.name, item.restaurant ?? '');
    updateUrlWithItem(filters, item.name, item.restaurant);
  }, [filters]);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    updateUrlWithFilters(filters);
    if (initialItem && onClearInitialItem) {
      onClearInitialItem();
    }
  }, [initialItem, onClearInitialItem, filters]);

  const showCopiedToast = useCallback(() => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage('Link copied to clipboard');
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const handleShareFilters = useCallback(async () => {
    const result = await shareFilters(filters);
    trackShare('filters', result);
    if (result === 'copied') {
      showCopiedToast();
    }
  }, [filters, showCopiedToast]);

  const handleLongPress = useCallback((item: FoodItem) => {
    setLongPressItem(item);
  }, []);

  const handleLongPressShare = useCallback(async () => {
    if (!longPressItem) return;
    const result = await shareItem(longPressItem, filters);
    trackShare('item', result);
    if (result === 'copied') {
      showCopiedToast();
    }
  }, [longPressItem, filters, showCopiedToast]);

  const handleLongPressClose = useCallback(() => {
    setLongPressItem(null);
  }, []);

  const handleLongPressHideItem = useCallback(() => {
    if (longPressItem) {
      onHideItem(longPressItem);
    }
  }, [longPressItem, onHideItem]);

  const handleLongPressFavouriteItem = useCallback(() => {
    if (longPressItem) {
      onFavouriteItem(longPressItem);
    }
  }, [longPressItem, onFavouriteItem]);

  const handleHideRestaurant = useCallback((restaurant: string) => {
    setSelectedItem(null);
    setLongPressItem(null);
    if (onHideRestaurant) {
      onHideRestaurant(restaurant);
    }
  }, [onHideRestaurant]);

  const handleOnlyShowRestaurant = useCallback((restaurant: string) => {
    setSelectedItem(null);
    setLongPressItem(null);
    if (onOnlyShowRestaurant) {
      onOnlyShowRestaurant(restaurant);
    }
  }, [onOnlyShowRestaurant]);

  // Filter out hidden and favourited items
  const visibleItems = items.filter(item => {
    const key = getItemKey(item);
    return !hiddenItems.has(key) && !favouriteItems.has(key);
  });
  const hiddenCount = items.length - visibleItems.length;

  // Progressive rendering: only show items up to displayCount
  const displayedItems = visibleItems.slice(0, displayCount);
  const hasMore = displayCount < visibleItems.length;

  // Reset displayCount when the underlying item list or filter/sort state changes.
  // A stable JSON key of the full filter bag ensures any filter change (restaurant,
  // diet, calories, sort) resets progressive rendering back to the first batch.
  const resetKey = JSON.stringify(filters) + '|' + items.length;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    if (displayCount !== BATCH_SIZE) {
      setDisplayCount(BATCH_SIZE);
    }
  }

  // Callback ref for the sentinel – sets up / tears down the IntersectionObserver
  // when the sentinel element is mounted or unmounted. This avoids timing issues
  // with useRef + useEffect where the ref may not be set when the effect runs.
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // Disconnect previous observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + BATCH_SIZE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  // Clean up observer and toast timer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    };
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

  if (visibleItems.length === 0 && hiddenCount === 0) {
    return (
      <div className="food-list-status">
        <p>No items match your filters. Try adjusting your criteria.</p>
      </div>
    );
  }

  return (
    <div className="food-list">
      <div className="food-list-header">
        <span className="item-count">
          {items.length} item{items.length !== 1 ? 's' : ''} found
          {hiddenCount > 0 && (
            <>
              {' '}
              <span className="hidden-count">
                ({hiddenCount} hidden) <button className="show-all-link" onClick={onShowAll}>show all</button>
              </span>
            </>
          )}
        </span>
        <button
          className="share-button"
          onClick={handleShareFilters}
          aria-label="Share current filters"
          title="Share these results"
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
        <div className="share-toast" role="status">{toastMessage}</div>
      )}
      <div className="food-grid">
        {showCookieConsent && (
          <CookieConsentCard onAccept={onCookieAccept} onRefuse={onCookieRefuse} />
        )}
        {showDisclaimer && (
          <DisclaimerCard onDismiss={onDisclaimerDismiss} />
        )}
        {displayedItems.map((item) => (
          <SwipeableCard
            key={getItemKey(item)}
            onSwipeLeft={() => onHideItem(item)}
            onSwipeRight={() => onFavouriteItem(item)}
            onLongPress={() => handleLongPress(item)}
            onContextMenu={() => handleLongPress(item)}
            leftLabel="❤️ Favourite"
            rightLabel="🙈 Hide"
            animateOutLeft
            animateOutRight
          >
            <FoodCard 
              item={item} 
              sortBy={sortBy}
              isFavourite={false} /* Favourited items are filtered out of the search view */
              onClick={() => handleItemClick(item)}
            />
          </SwipeableCard>
        ))}
        {hasMore && (
          <div ref={sentinelCallbackRef} className="load-more-sentinel" aria-hidden="true" />
        )}
      </div>
      {longPressItem && (
        <LongPressContextMenu
          item={longPressItem}
          onShare={handleLongPressShare}
          onHideItem={handleLongPressHideItem}
          onFavouriteItem={handleLongPressFavouriteItem}
          onHideRestaurant={onHideRestaurant ? handleHideRestaurant : undefined}
          onOnlyShowRestaurant={onOnlyShowRestaurant ? handleOnlyShowRestaurant : undefined}
          onClose={handleLongPressClose}
        />
      )}
      <FoodDetailModal item={selectedItem} sortBy={sortBy} filters={filters} onClose={handleCloseModal} onHideRestaurant={handleHideRestaurant} onOnlyShowRestaurant={handleOnlyShowRestaurant} />
    </div>
  );
}

export default FoodList;

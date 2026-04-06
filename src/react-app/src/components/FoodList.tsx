import { useState, useCallback, useEffect, useRef } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { getItemKey } from '../itemKeys';
import { shareFilters, shareItem, updateUrlWithItem, updateUrlWithFilters } from '../urlState';
import { trackFoodItemView, trackShare, trackContextMenuOpen, trackFavouriteItem, trackHideItem } from '../analytics';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import LongPressContextMenu from './LongPressContextMenu';
import SkeletonCard from './SkeletonCard';
import CookieConsentCard from './CookieConsentCard';
import DisclaimerCard from './DisclaimerCard';
import SwipeableCard from './SwipeableCard';

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

  const handleLongPress = useCallback((item: FoodItem, trigger: 'long_press' | 'right_click') => {
    setLongPressItem(item);
    trackContextMenuOpen(item.name, item.restaurant ?? '', trigger);
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
      trackHideItem(longPressItem.name, longPressItem.restaurant ?? '');
      onHideItem(longPressItem);
    }
  }, [longPressItem, onHideItem]);

  const handleLongPressFavouriteItem = useCallback(() => {
    if (longPressItem) {
      trackFavouriteItem(longPressItem.name, longPressItem.restaurant ?? '');
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

  const visibleItems = items.filter(item => {
    const key = getItemKey(item);
    return !hiddenItems.has(key) && !favouriteItems.has(key);
  });
  const hiddenCount = items.length - visibleItems.length;

  const displayedItems = visibleItems.slice(0, displayCount);
  const hasMore = displayCount < visibleItems.length;

  const resetKey = JSON.stringify(filters) + '|' + items.length;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    if (displayCount !== BATCH_SIZE) {
      setDisplayCount(BATCH_SIZE);
    }
  }

  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
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
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-100 border-t-[#667eea] rounded-full animate-spin"></div>
          <div className="animate-skeleton rounded h-4 w-[100px]"></div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4" role="status" aria-label="Loading menu items">
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[#c62828] food-list-status error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (visibleItems.length === 0 && hiddenCount === 0) {
    return (
      <div className="text-center py-12 text-gray-500 food-list-status">
        <p>No items match your filters. Try adjusting your criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="item-count text-[0.9rem] text-gray-500">
          {items.length} item{items.length !== 1 ? 's' : ''} found
          {hiddenCount > 0 && (
            <>
              {' '}
              <span className="hidden-count text-gray-400 text-[0.85rem]">
                ({hiddenCount} hidden) <button className="show-all-link bg-transparent border-0 text-[#667eea] cursor-pointer p-0 text-[0.85rem] font-medium underline hover:text-[#764ba2]" onClick={onShowAll}>show all</button>
              </span>
            </>
          )}
        </span>
        <button
          className="share-button flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg bg-white text-[#667eea] cursor-pointer transition-all duration-200 hover:bg-[#f0f0ff] hover:border-[#667eea] active:scale-[0.92] active:bg-[#e8e8ff]"
          onClick={handleShareFilters}
          aria-label="Share current filters"
          title="Share these results"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
      {showToast && (
        <div className="share-toast bg-gray-800 text-white px-4 py-[0.6rem] rounded-lg text-center text-[0.85rem] mb-3 animate-toast" role="status">{toastMessage}</div>
      )}
      <div className="food-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
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
            onLongPress={() => handleLongPress(item, 'long_press')}
            onContextMenu={() => handleLongPress(item, 'right_click')}
            leftLabel="❤️ Favourite"
            rightLabel="🙈 Hide"
            animateOutLeft
            animateOutRight
          >
            <FoodCard 
              item={item} 
              sortBy={sortBy}
              isFavourite={false}
              onClick={() => handleItemClick(item)}
            />
          </SwipeableCard>
        ))}
        {hasMore && (
          <div ref={sentinelCallbackRef} className="load-more-sentinel h-px w-full col-[1/-1]" aria-hidden="true" />
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

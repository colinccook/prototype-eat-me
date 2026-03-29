import { useCallback, useEffect } from 'react';
import type { FoodItem } from '../types';
import './LongPressContextMenu.css';

interface LongPressContextMenuProps {
  item: FoodItem;
  onShare: () => void;
  onHideItem?: () => void;
  onFavouriteItem?: () => void;
  onHideRestaurant?: (restaurant: string) => void;
  onOnlyShowRestaurant?: (restaurant: string) => void;
  onClose: () => void;
}

function LongPressContextMenu({ item, onShare, onHideItem, onFavouriteItem, onHideRestaurant, onOnlyShowRestaurant, onClose }: LongPressContextMenuProps) {
  const restaurantName = item.restaurant;

  const handleShare = useCallback(() => {
    onShare();
    onClose();
  }, [onShare, onClose]);

  const handleHideItem = useCallback(() => {
    if (onHideItem) {
      onHideItem();
      onClose();
    }
  }, [onHideItem, onClose]);

  const handleFavouriteItem = useCallback(() => {
    if (onFavouriteItem) {
      onFavouriteItem();
      onClose();
    }
  }, [onFavouriteItem, onClose]);

  const handleHideRestaurant = useCallback(() => {
    if (restaurantName && onHideRestaurant) {
      onHideRestaurant(restaurantName);
      onClose();
    }
  }, [restaurantName, onHideRestaurant, onClose]);

  const handleOnlyShowRestaurant = useCallback(() => {
    if (restaurantName && onOnlyShowRestaurant) {
      onOnlyShowRestaurant(restaurantName);
      onClose();
    }
  }, [restaurantName, onOnlyShowRestaurant, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="long-press-overlay" onClick={onClose} role="presentation">
      <div
        className="long-press-menu"
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="long-press-menu-header">
          <span className="long-press-menu-title">{item.name}</span>
        </div>

        <button
          className="context-menu-item"
          onClick={handleShare}
          role="menuitem"
        >
          <svg className="context-menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>

        {onFavouriteItem && (
          <button
            className="context-menu-item"
            onClick={handleFavouriteItem}
            role="menuitem"
          >
            <svg className="context-menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Favourite
          </button>
        )}

        {onHideItem && (
          <button
            className="context-menu-item"
            onClick={handleHideItem}
            role="menuitem"
          >
            <svg className="context-menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            Hide
          </button>
        )}

        {restaurantName && onHideRestaurant && (
          <button
            className="context-menu-item"
            onClick={handleHideRestaurant}
            role="menuitem"
          >
            <svg className="context-menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            Hide all {restaurantName}
          </button>
        )}

        {restaurantName && onOnlyShowRestaurant && (
          <button
            className="context-menu-item"
            onClick={handleOnlyShowRestaurant}
            role="menuitem"
          >
            <svg className="context-menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Only show {restaurantName}
          </button>
        )}
      </div>
    </div>
  );
}

export default LongPressContextMenu;

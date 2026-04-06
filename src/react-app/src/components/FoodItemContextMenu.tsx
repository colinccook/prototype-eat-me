import { useState, useCallback, useRef, useEffect } from 'react';

interface FoodItemContextMenuProps {
  restaurantName?: string;
  onShare: () => void;
  onHideRestaurant?: (restaurant: string) => void;
  onOnlyShowRestaurant?: (restaurant: string) => void;
}

function FoodItemContextMenu({ restaurantName, onShare, onHideRestaurant, onOnlyShowRestaurant }: FoodItemContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    onShare();
    setIsOpen(false);
  }, [onShare]);

  const handleHideRestaurant = useCallback(() => {
    if (restaurantName && onHideRestaurant) {
      onHideRestaurant(restaurantName);
      setIsOpen(false);
    }
  }, [restaurantName, onHideRestaurant]);

  const handleOnlyShowRestaurant = useCallback(() => {
    if (restaurantName && onOnlyShowRestaurant) {
      onOnlyShowRestaurant(restaurantName);
      setIsOpen(false);
    }
  }, [restaurantName, onOnlyShowRestaurant]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        className="context-menu-trigger flex items-center justify-center w-8 h-8 border-0 rounded-full bg-gray-100 text-gray-500 cursor-pointer transition-[background,color] duration-200 hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300"
        onClick={toggleMenu}
        aria-label="More actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="More actions"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>

      {isOpen && (
        <div className="context-menu absolute top-full right-0 z-10 min-w-[220px] mt-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden animate-context-menu" role="menu">
          <button
            className="context-menu-item flex items-center gap-3 w-full px-4 py-[0.85rem] border-0 bg-transparent text-[0.9rem] font-medium text-gray-800 cursor-pointer text-left min-h-[44px] hover:bg-[#f5f5ff] active:bg-[#e8e8ff]"
            onClick={handleShare}
            role="menuitem"
          >
            <svg className="shrink-0 text-[#667eea]" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>

          {restaurantName && onHideRestaurant && (
            <button
              className="context-menu-item flex items-center gap-3 w-full px-4 py-[0.85rem] border-0 bg-transparent text-[0.9rem] font-medium text-gray-800 cursor-pointer text-left min-h-[44px] hover:bg-[#f5f5ff] active:bg-[#e8e8ff] border-t border-gray-100"
              onClick={handleHideRestaurant}
              role="menuitem"
            >
              <svg className="shrink-0 text-[#667eea]" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              Hide all {restaurantName}
            </button>
          )}

          {restaurantName && onOnlyShowRestaurant && (
            <button
              className="context-menu-item flex items-center gap-3 w-full px-4 py-[0.85rem] border-0 bg-transparent text-[0.9rem] font-medium text-gray-800 cursor-pointer text-left min-h-[44px] hover:bg-[#f5f5ff] active:bg-[#e8e8ff] border-t border-gray-100"
              onClick={handleOnlyShowRestaurant}
              role="menuitem"
            >
              <svg className="shrink-0 text-[#667eea]" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Only show {restaurantName}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FoodItemContextMenu;

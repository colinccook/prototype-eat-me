export type AppTab = 'search' | 'favourites';

interface BottomAppBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favouriteCount: number;
}

function BottomAppBar({ activeTab, onTabChange, favouriteCount }: BottomAppBarProps) {
  const tabBase = 'bottom-app-bar__tab flex-1 flex flex-col items-center justify-center gap-[0.2rem] py-2 min-h-[48px] border-0 bg-transparent cursor-pointer text-[0.7rem] font-medium relative transition-colors duration-200 [-webkit-tap-highlight-color:transparent] active:bg-[rgba(102,126,234,0.08)]';
  const tabActive = 'text-[#667eea]';
  const tabInactive = 'text-gray-400';

  return (
    <nav
      className="bottom-app-bar fixed bottom-0 left-0 right-0 flex bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] z-[100]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-label="Main navigation"
    >
      <button
        className={`${tabBase} ${activeTab === 'search' ? tabActive : tabInactive}`}
        onClick={() => onTabChange('search')}
        aria-current={activeTab === 'search' ? 'page' : undefined}
      >
        <svg
          className={`w-[22px] h-[22px]${activeTab === 'search' ? ' [stroke-width:2.5]' : ''}`}
          viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="tracking-[0.3px]">Search</span>
      </button>

      <button
        className={`${tabBase} ${activeTab === 'favourites' ? tabActive : tabInactive}`}
        onClick={() => onTabChange('favourites')}
        aria-current={activeTab === 'favourites' ? 'page' : undefined}
      >
        <svg
          className={`w-[22px] h-[22px]${activeTab === 'favourites' ? ' [stroke-width:2.5]' : ''}`}
          viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <span className="tracking-[0.3px]">Favourites</span>
        {favouriteCount > 0 && (
          <span className="bottom-app-bar__badge absolute top-0.5 right-[calc(50%-20px)] min-w-[16px] h-4 px-1 rounded-lg bg-[#667eea] text-white text-[0.6rem] font-bold flex items-center justify-center">{favouriteCount}</span>
        )}
      </button>
    </nav>
  );
}

export default BottomAppBar;

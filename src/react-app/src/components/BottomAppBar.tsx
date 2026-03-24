import './BottomAppBar.css';

export type AppTab = 'search' | 'favourites';

interface BottomAppBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favouriteCount: number;
}

function BottomAppBar({ activeTab, onTabChange, favouriteCount }: BottomAppBarProps) {
  return (
    <nav className="bottom-app-bar" aria-label="Main navigation">
      <button
        className={`bottom-app-bar__tab ${activeTab === 'search' ? 'bottom-app-bar__tab--active' : ''}`}
        onClick={() => onTabChange('search')}
        aria-current={activeTab === 'search' ? 'page' : undefined}
      >
        <svg className="bottom-app-bar__icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="bottom-app-bar__label">Search</span>
      </button>

      <button
        className={`bottom-app-bar__tab ${activeTab === 'favourites' ? 'bottom-app-bar__tab--active' : ''}`}
        onClick={() => onTabChange('favourites')}
        aria-current={activeTab === 'favourites' ? 'page' : undefined}
      >
        <svg className="bottom-app-bar__icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <span className="bottom-app-bar__label">Favourites</span>
        {favouriteCount > 0 && (
          <span className="bottom-app-bar__badge">{favouriteCount}</span>
        )}
      </button>
    </nav>
  );
}

export default BottomAppBar;

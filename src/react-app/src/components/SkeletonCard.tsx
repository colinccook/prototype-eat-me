import './SkeletonCard.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card-header">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-tag"></div>
      </div>
      
      <div className="skeleton-badges">
        <div className="skeleton-badge"></div>
      </div>

      <div className="skeleton-nutrition">
        <div className="skeleton-nutrition-item">
          <div className="skeleton-text skeleton-value"></div>
          <div className="skeleton-text skeleton-label"></div>
        </div>
        <div className="skeleton-nutrition-item">
          <div className="skeleton-text skeleton-value"></div>
          <div className="skeleton-text skeleton-label"></div>
        </div>
        <div className="skeleton-nutrition-item">
          <div className="skeleton-text skeleton-value"></div>
          <div className="skeleton-text skeleton-label"></div>
        </div>
        <div className="skeleton-nutrition-item">
          <div className="skeleton-text skeleton-value"></div>
          <div className="skeleton-text skeleton-label"></div>
        </div>
      </div>

      <div className="skeleton-ingredients">
        <div className="skeleton-text skeleton-ingredients-text"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;

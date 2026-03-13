import { useEffect, useRef, useCallback } from 'react';
import type { FoodItem } from '../types';
import './FoodDetailModal.css';

interface FoodDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
}

function FoodDetailModal({ item, onClose }: FoodDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (item) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  // Handle swipe down to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const content = contentRef.current;
    // Only allow swipe-to-close when scrolled to top
    if (content && content.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    
    if (delta > 0 && contentRef.current) {
      // Dragging down - move the modal
      const translateY = Math.min(delta, 300);
      contentRef.current.style.transform = `translateY(${translateY}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (startY.current === null || currentY.current === null) {
      startY.current = null;
      currentY.current = null;
      return;
    }
    
    const delta = currentY.current - startY.current;
    
    if (contentRef.current) {
      if (delta > 100) {
        // Swiped down enough - close
        onClose();
      } else {
        // Snap back
        contentRef.current.style.transform = '';
      }
    }
    
    startY.current = null;
    currentY.current = null;
  }, [onClose]);

  if (!item) return null;

  const proteinPerCalorie = item.calories > 0 
    ? (item.macros.protein / item.calories * 100).toFixed(2) 
    : '0.00';

  // Calculate fibre to carb ratio
  const fibreToCarb = item.macros.fibre && item.macros.fibre > 0
    ? (item.macros.carbohydrates / item.macros.fibre).toFixed(1)
    : null;
  
  const getFibreRatioQuality = (ratio: number): { label: string; className: string } => {
    if (ratio < 5) return { label: 'Fantastic', className: 'fantastic' };
    if (ratio < 10) return { label: 'Okay', className: 'okay' };
    return { label: 'Avoid', className: 'avoid' };
  };
  
  const fibreRatioQuality = fibreToCarb ? getFibreRatioQuality(parseFloat(fibreToCarb)) : null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          ref={contentRef}
          className="modal-sheet"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="modal-drag-handle">
            <div className="drag-indicator"></div>
          </div>

          {/* Close button */}
          <button 
            className="modal-close-button" 
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>

          {/* Scrollable content */}
          <div className="modal-scroll-content">
            {/* Header */}
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">{item.name}</h2>
              {item.restaurant && (
                <span className="modal-restaurant">{item.restaurant}</span>
              )}
            </div>

            {/* Dietary badges */}
            {(item.vegetarian || item.vegan) && (
              <div className="modal-badges">
                {item.vegetarian && <span className="badge vegetarian">Vegetarian</span>}
                {item.vegan && <span className="badge vegan">Vegan</span>}
              </div>
            )}

            {/* Main nutrition - Calories */}
            <div className="modal-calories-section">
              <div className="calories-display">
                <span className="calories-value">{item.calories}</span>
                <span className="calories-label">calories</span>
              </div>
            </div>

            {/* Macros grid */}
            <div className="modal-section">
              <h3 className="section-title">Macronutrients</h3>
              <div className="macros-grid">
                <div className="macro-item">
                  <span className="macro-value">{item.macros.protein}g</span>
                  <span className="macro-label">Protein</span>
                </div>
                <div className="macro-item">
                  <span className="macro-value">{item.macros.carbohydrates}g</span>
                  <span className="macro-label">Carbs</span>
                </div>
                <div className="macro-item">
                  <span className="macro-value">{item.macros.fat}g</span>
                  <span className="macro-label">Fat</span>
                </div>
                {item.macros.fibre !== undefined && (
                  <div className="macro-item">
                    <span className="macro-value">{item.macros.fibre}g</span>
                    <span className="macro-label">Fibre</span>
                  </div>
                )}
                {item.macros.salt !== undefined && (
                  <div className="macro-item">
                    <span className="macro-value">{item.macros.salt}g</span>
                    <span className="macro-label">Salt</span>
                  </div>
                )}
              </div>
            </div>

            {/* Calculated stats */}
            <div className="modal-section">
              <h3 className="section-title">Nutrition Stats</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">Protein per 100 calories</span>
                  <span className="stat-value highlight">{proteinPerCalorie}g</span>
                </div>
                {fibreToCarb && fibreRatioQuality && (
                  <div className="stat-row">
                    <span className="stat-label">Carbs to fibre ratio</span>
                    <span className={`stat-value ${fibreRatioQuality.className}`}>
                      {fibreToCarb}:1 ({fibreRatioQuality.label})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="modal-section">
                <h3 className="section-title">Ingredients ({item.ingredients.length})</h3>
                <ul className="ingredients-list">
                  {item.ingredients.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDetailModal;

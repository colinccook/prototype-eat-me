import { useState, useCallback } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { shareItem } from '../urlState';
import { trackShare } from '../analytics';
import { evaluateAll } from '../perspectives';
import Tray from './Tray';
import './FoodDetailModal.css';

interface FoodDetailModalProps {
  item: FoodItem | null;
  sortBy: SortOption;
  filters: FilterOptions;
  onClose: () => void;
}

// Helper to get the primary metric display based on current sort filter
function getPrimaryMetric(item: FoodItem, sortBy: SortOption): { value: string; label: string; className?: string } {
  switch (sortBy) {
    case 'calories-asc':
    case 'calories-desc':
      return { value: String(item.calories), label: 'calories' };
    
    case 'protein-desc':
      return { value: `${item.macros.protein}g`, label: 'protein' };
    
    case 'protein-per-calorie-desc': {
      const proteinPerCalorie = item.calories > 0 
        ? (item.macros.protein / item.calories * 100).toFixed(2) 
        : '0.00';
      return { value: `${proteinPerCalorie}g`, label: 'protein per 100 calories' };
    }
    
    case 'fat-asc':
      return { value: `${item.macros.fat}g`, label: 'fat' };
    
    case 'fibre-to-carb-asc': {
      if (item.macros.fibre && item.macros.fibre > 0) {
        const fibreToCarb = (item.macros.carbohydrates / item.macros.fibre).toFixed(1);
        const ratio = parseFloat(fibreToCarb);
        let className = 'fibre-ratio-avoid';
        if (ratio < 5) className = 'fibre-ratio-fantastic';
        else if (ratio < 10) className = 'fibre-ratio-okay';
        return { value: `${fibreToCarb}:1`, label: 'carbs to fibre ratio', className };
      }
      return { value: 'N/A', label: 'carbs to fibre ratio' };
    }
    
    case 'salt-asc': {
      if (item.macros.salt !== undefined && item.macros.salt !== null) {
        return { value: `${item.macros.salt}g`, label: 'salt' };
      }
      return { value: 'N/A', label: 'salt' };
    }
    
    case 'name-asc':
    default:
      return { value: String(item.calories), label: 'calories' };
  }
}

const RATING_ICONS: Record<string, string> = {
  green: '🟢',
  amber: '🟡',
  red: '🔴',
  grey: '⚪',
};

function FoodDetailModal({ item, sortBy, filters, onClose }: FoodDetailModalProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleShareItem = useCallback(async () => {
    if (!item) return;
    const result = await shareItem(item, filters);
    trackShare('item', result);
    if (result === 'copied') {
      setToastMessage('Link copied to clipboard');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  }, [item, filters]);

  if (!item) return null;

  // Get the primary metric based on current sort filter
  const primaryMetric = getPrimaryMetric(item, sortBy);

  // Evaluate all perspectives for traffic light display
  const perspectiveResults = evaluateAll(item);

  return (
    <Tray isOpen={true} onClose={onClose}>
      {/* Header */}
      <div className="modal-header">
        <h2 id="modal-title" className="modal-title">{item.name}</h2>
        {item.restaurant && (
          <span className="modal-restaurant">{item.restaurant}</span>
        )}
        <button
          className="share-item-button"
          onClick={handleShareItem}
          aria-label="Share this item"
          title="Share this item"
        >
          <svg className="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      </div>

      {showToast && (
        <div className="share-toast" role="status">{toastMessage}</div>
      )}

      {/* Dietary badges */}
      {(item.vegetarian || item.vegan) && (
        <div className="modal-badges">
          {item.vegetarian && <span className="badge vegetarian">Vegetarian</span>}
          {item.vegan && <span className="badge vegan">Vegan</span>}
        </div>
      )}

      {/* Main nutrition - Dynamic based on filter */}
      <div className="modal-primary-section">
        <div className={`primary-display ${primaryMetric.className || ''}`}>
          <span className="primary-value">{primaryMetric.value}</span>
          <span className="primary-label">{primaryMetric.label}</span>
        </div>
      </div>

      {/* Macros grid */}
      <div className="modal-section">
        <h3 className="section-title">Macronutrients</h3>
        <div className="macros-grid">
          <div className={`macro-item ${sortBy === 'calories-asc' || sortBy === 'calories-desc' || sortBy === 'name-asc' ? 'highlighted' : ''}`}>
            <span className="macro-value">{item.calories}</span>
            <span className="macro-label">Calories</span>
          </div>
          <div className={`macro-item ${sortBy === 'protein-desc' || sortBy === 'protein-per-calorie-desc' ? 'highlighted' : ''}`}>
            <span className="macro-value">{item.macros.protein}g</span>
            <span className="macro-label">Protein</span>
          </div>
          <div className={`macro-item ${sortBy === 'fibre-to-carb-asc' ? 'highlighted' : ''}`}>
            <span className="macro-value">{item.macros.carbohydrates}g</span>
            <span className="macro-label">Carbs</span>
          </div>
          <div className={`macro-item ${sortBy === 'fat-asc' ? 'highlighted' : ''}`}>
            <span className="macro-value">{item.macros.fat}g</span>
            <span className="macro-label">Fat</span>
          </div>
          {item.macros.saturatedFat !== undefined && item.macros.saturatedFat !== null && (
            <div className="macro-item">
              <span className="macro-value">{item.macros.saturatedFat}g</span>
              <span className="macro-label">Sat Fat</span>
            </div>
          )}
          {item.macros.sugar !== undefined && item.macros.sugar !== null && (
            <div className="macro-item">
              <span className="macro-value">{item.macros.sugar}g</span>
              <span className="macro-label">Sugar</span>
            </div>
          )}
          {item.macros.fibre !== undefined && item.macros.fibre !== null && (
            <div className={`macro-item ${sortBy === 'fibre-to-carb-asc' ? 'highlighted' : ''}`}>
              <span className="macro-value">{item.macros.fibre}g</span>
              <span className="macro-label">Fibre</span>
            </div>
          )}
          {item.macros.salt !== undefined && item.macros.salt !== null && (
            <div className={`macro-item ${sortBy === 'salt-asc' ? 'highlighted' : ''}`}>
              <span className="macro-value">{item.macros.salt}g</span>
              <span className="macro-label">Salt</span>
            </div>
          )}
        </div>
      </div>

      {/* Perspectives — traffic light summary */}
      <div className="modal-section">
        <h3 className="section-title">Nutrition Insights</h3>
        <div className="perspectives-list" data-testid="perspectives-list">
          {perspectiveResults.map(({ perspective, result }) => (
            <div key={perspective.id} className={`perspective-row perspective-${result.rating}`}>
              <span className="perspective-icon" aria-hidden="true">{RATING_ICONS[result.rating]}</span>
              <div className="perspective-body">
                <div className="perspective-header">
                  <span className="perspective-name">{perspective.name}</span>
                  <span className={`perspective-value perspective-value-${result.rating}`}>
                    {result.value} — {result.label}
                  </span>
                </div>
                <p className="perspective-description">{result.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergens */}
      {item.allergens && Object.keys(item.allergens).some(key => item.allergens![key as keyof typeof item.allergens]) && (
        <div className="modal-section">
          <h3 className="section-title">Allergens</h3>
          <div className="allergens-list">
            {Object.entries(item.allergens).map(([allergen, present]) => {
              if (!present) return null;
              const displayName = allergen.charAt(0).toUpperCase() + allergen.slice(1);
              return (
                <span key={allergen} className="allergen-tag">
                  {displayName}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
    </Tray>
  );
}

export default FoodDetailModal;

import type { FoodItem } from '../types';
import Tray from './Tray';
import './FoodDetailModal.css';

interface FoodDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
}

function FoodDetailModal({ item, onClose }: FoodDetailModalProps) {
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
    <Tray isOpen={true} onClose={onClose}>
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
    </Tray>
  );
}

export default FoodDetailModal;

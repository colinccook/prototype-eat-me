import type { FoodItem, SortOption } from '../types';
import './FoodCard.css';

interface FoodCardProps {
  item: FoodItem;
  sortBy: SortOption;
}

function FoodCard({ item, sortBy }: FoodCardProps) {
  const proteinPerCalorie = item.calories > 0 
    ? (item.macros.protein / item.calories * 100).toFixed(2) 
    : '0.00';

  // Calculate fibre to carb ratio and quality indicator
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
    <div className="food-card">
      <div className="food-card-header">
        <h3 className="food-name">{item.name}</h3>
        {item.restaurant && (
          <span className="restaurant-tag">{item.restaurant}</span>
        )}
      </div>
      
      <div className="food-badges">
        {item.vegetarian && <span className="badge vegetarian">Vegetarian</span>}
        {item.vegan && <span className="badge vegan">Vegan</span>}
      </div>

      <div className="nutrition-info">
        <div className={`nutrition-item ${sortBy === 'calories-asc' || sortBy === 'calories-desc' ? 'highlighted' : ''}`}>
          <span className="nutrition-value">{item.calories}</span>
          <span className="nutrition-label">Calories</span>
        </div>
        <div className={`nutrition-item ${sortBy === 'protein-desc' ? 'highlighted' : ''}`}>
          <span className="nutrition-value">{item.macros.protein}g</span>
          <span className="nutrition-label">Protein</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-value">{item.macros.carbohydrates}g</span>
          <span className="nutrition-label">Carbs</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-value">{item.macros.fat}g</span>
          <span className="nutrition-label">Fat</span>
        </div>
      </div>

      {sortBy === 'protein-per-calorie-desc' && (
        <div className="protein-efficiency">
          <span className="efficiency-value">{proteinPerCalorie}g</span>
          <span className="efficiency-label">protein per 100 calories</span>
        </div>
      )}

      {sortBy === 'fibre-to-carb-asc' && (
        <div className="fibre-ratio">
          {fibreToCarb && fibreRatioQuality ? (
            <>
              <span className={`fibre-ratio-value ${fibreRatioQuality.className}`}>
                {fibreToCarb}:1
              </span>
              <span className={`fibre-ratio-quality ${fibreRatioQuality.className}`}>
                {fibreRatioQuality.label}
              </span>
              <span className="fibre-ratio-label">carbs to fibre ratio</span>
            </>
          ) : (
            <span className="fibre-ratio-na">No fibre data</span>
          )}
        </div>
      )}

      {sortBy === 'salt-asc' && (
        <div className="salt-info">
          {item.macros.salt !== undefined && item.macros.salt !== null ? (
            <>
              <span className="salt-value">{item.macros.salt}g</span>
              <span className="salt-label">salt per serving</span>
            </>
          ) : (
            <span className="salt-na">No salt data</span>
          )}
        </div>
      )}

      {item.ingredients && item.ingredients.length > 0 && (
        <div className="ingredients">
          <span className="ingredients-label">Ingredients:</span>
          <span className="ingredients-count">{item.ingredients.length} items</span>
        </div>
      )}
    </div>
  );
}

export default FoodCard;

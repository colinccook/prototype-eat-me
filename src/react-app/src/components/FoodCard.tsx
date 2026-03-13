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

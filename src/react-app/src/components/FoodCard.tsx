import type { FoodItem, SortOption } from '../types';

interface FoodCardProps {
  item: FoodItem;
  sortBy: SortOption;
  onClick?: () => void;
  isFavourite?: boolean;
}

function FoodCard({ item, sortBy, onClick, isFavourite }: FoodCardProps) {
  const proteinPerCalorie = item.calories > 0 
    ? (item.macros.protein / item.calories * 100).toFixed(2) 
    : '0.00';

  const fibreToCarb = item.macros.fibre && item.macros.fibre > 0
    ? (item.macros.carbohydrates / item.macros.fibre).toFixed(1)
    : null;
  
  const getFibreRatioQuality = (ratio: number): { label: string; className: string } => {
    if (ratio < 5) return { label: 'Fantastic', className: 'fantastic' };
    if (ratio < 10) return { label: 'Okay', className: 'okay' };
    return { label: 'Avoid', className: 'avoid' };
  };
  
  const fibreRatioQuality = fibreToCarb ? getFibreRatioQuality(parseFloat(fibreToCarb)) : null;

  const fibreValueColor = fibreRatioQuality?.className === 'fantastic' ? 'text-[#2e7d32]'
    : fibreRatioQuality?.className === 'okay' ? 'text-[#f57c00]'
    : 'text-[#c62828]';

  const fibreQualityBg = fibreRatioQuality?.className === 'fantastic' ? 'bg-[#e8f5e9] text-[#2e7d32]'
    : fibreRatioQuality?.className === 'okay' ? 'bg-[#fff3e0] text-[#f57c00]'
    : 'bg-[#ffebee] text-[#c62828]';

  return (
    <div 
      className={`food-card bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-200${isFavourite ? ' border-l-[3px] border-l-pink-600' : ''}${onClick ? ' cursor-pointer select-none [-webkit-tap-highlight-color:transparent] active:shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus:outline-2 focus:outline-[#667eea] focus:outline-offset-2 food-card-hover' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      aria-label={onClick ? `View details for ${item.name}` : undefined}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="food-name m-0 text-[1.1rem] font-semibold text-gray-900 leading-[1.3]">
          {isFavourite && <span className="text-[0.85rem]" aria-label="Favourited">❤️ </span>}
          {item.name}
        </h3>
        {item.restaurant && (
          <span className="restaurant-tag text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded whitespace-nowrap">{item.restaurant}</span>
        )}
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        {item.vegetarian && <span className="badge vegetarian text-[0.7rem] font-semibold px-2 py-1 rounded uppercase tracking-[0.5px] bg-[#e8f5e9] text-[#2e7d32]">Vegetarian</span>}
        {item.vegan && <span className="badge vegan text-[0.7rem] font-semibold px-2 py-1 rounded uppercase tracking-[0.5px] bg-[#e0f2f1] text-[#00695c]">Vegan</span>}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className={`nutrition-item flex flex-col items-center p-2 rounded-lg${sortBy === 'calories-asc' || sortBy === 'calories-desc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)]' : ' bg-gray-50'}`}>
          <span className="nutrition-value text-base font-bold text-gray-900">{item.calories}</span>
          <span className="text-[0.65rem] text-gray-500 uppercase tracking-[0.5px]">Calories</span>
        </div>
        <div className={`nutrition-item flex flex-col items-center p-2 rounded-lg${sortBy === 'protein-desc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)]' : ' bg-gray-50'}`}>
          <span className="nutrition-value text-base font-bold text-gray-900">{item.macros.protein}g</span>
          <span className="text-[0.65rem] text-gray-500 uppercase tracking-[0.5px]">Protein</span>
        </div>
        <div className="nutrition-item flex flex-col items-center p-2 bg-gray-50 rounded-lg">
          <span className="nutrition-value text-base font-bold text-gray-900">{item.macros.carbohydrates}g</span>
          <span className="text-[0.65rem] text-gray-500 uppercase tracking-[0.5px]">Carbs</span>
        </div>
        <div className={`nutrition-item flex flex-col items-center p-2 rounded-lg${sortBy === 'fat-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)]' : ' bg-gray-50'}`}>
          <span className="nutrition-value text-base font-bold text-gray-900">{item.macros.fat}g</span>
          <span className="text-[0.65rem] text-gray-500 uppercase tracking-[0.5px]">Fat</span>
        </div>
      </div>

      {sortBy === 'protein-per-calorie-desc' && (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[1.1rem] font-bold text-[#667eea]">{proteinPerCalorie}g</span>
          <span className="text-[0.8rem] text-gray-500">protein per 100 calories</span>
        </div>
      )}

      {sortBy === 'fibre-to-carb-asc' && (
        <div className="mt-2 flex items-baseline gap-2">
          {fibreToCarb && fibreRatioQuality ? (
            <>
              <span className={`text-[1.1rem] font-bold mr-2 ${fibreValueColor}`}>
                {fibreToCarb}:1
              </span>
              <span className={`text-[0.85rem] font-semibold py-[0.15rem] px-2 rounded ${fibreQualityBg}`}>
                {fibreRatioQuality.label}
              </span>
              <span className="text-[0.7rem] text-gray-500">carbs to fibre ratio</span>
            </>
          ) : (
            <span className="text-[0.85rem] text-gray-400 italic">No fibre data</span>
          )}
        </div>
      )}

      {sortBy === 'salt-asc' && (
        <div className="salt-info mt-2 flex items-baseline gap-2">
          {item.macros.salt !== undefined && item.macros.salt !== null ? (
            <>
              <span className="salt-value text-[1.1rem] font-bold text-[#667eea]">{item.macros.salt}g</span>
              <span className="text-[0.8rem] text-gray-500">salt per serving</span>
            </>
          ) : (
            <span className="text-[0.85rem] text-gray-400 italic">No salt data</span>
          )}
        </div>
      )}

      {item.ingredients && item.ingredients.length > 0 && (
        <div className="mt-2 flex gap-2 text-[0.8rem]">
          <span className="text-gray-500">Ingredients:</span>
          <span className="text-gray-400">{item.ingredients.length} items</span>
        </div>
      )}
    </div>
  );
}

export default FoodCard;

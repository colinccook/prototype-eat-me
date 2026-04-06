import { useState, useCallback } from 'react';
import type { FoodItem, SortOption, FilterOptions } from '../types';
import { shareItem } from '../urlState';
import { trackShare } from '../analytics';
import { evaluateAll } from '../perspectives';
import Tray from './Tray';
import FoodItemContextMenu from './FoodItemContextMenu';

interface FoodDetailModalProps {
  item: FoodItem | null;
  sortBy: SortOption;
  filters: FilterOptions;
  onClose: () => void;
  onHideRestaurant?: (restaurant: string) => void;
  onOnlyShowRestaurant?: (restaurant: string) => void;
}

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

const perspectiveRowBg: Record<string, string> = {
  green: 'bg-[#e8f5e9]',
  amber: 'bg-[#fff8e1]',
  red: 'bg-[#fbe9e7]',
  grey: 'bg-gray-100',
};

const perspectiveValueColor: Record<string, string> = {
  green: 'text-[#2e7d32]',
  amber: 'text-[#f57c00]',
  red: 'text-[#c62828]',
  grey: 'text-gray-400',
};

// Determine primary section gradient from fibre ratio class
function getPrimaryBg(className?: string): string {
  if (className === 'fibre-ratio-fantastic') return 'bg-gradient-to-br from-[#43a047] to-[#2e7d32]';
  if (className === 'fibre-ratio-okay') return 'bg-gradient-to-br from-[#fb8c00] to-[#f57c00]';
  if (className === 'fibre-ratio-avoid') return 'bg-gradient-to-br from-[#e53935] to-[#c62828]';
  return 'bg-gradient-to-br from-[#667eea] to-[#764ba2]';
}

function FoodDetailModal({ item, sortBy, filters, onClose, onHideRestaurant, onOnlyShowRestaurant }: FoodDetailModalProps) {
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

  const primaryMetric = getPrimaryMetric(item, sortBy);
  const perspectiveResults = evaluateAll(item);

  return (
    <Tray
      isOpen={true}
      onClose={onClose}
      headerActions={
        <FoodItemContextMenu
          restaurantName={item.restaurant}
          onShare={handleShareItem}
          onHideRestaurant={onHideRestaurant}
          onOnlyShowRestaurant={onOnlyShowRestaurant}
        />
      }
    >
      {/* Header */}
      <div className="mb-4">
        <h2 id="modal-title" className="modal-title m-0 mb-2 text-2xl font-bold text-gray-900 leading-[1.3] pr-20">{item.name}</h2>
        {item.restaurant && (
          <span className="modal-restaurant inline-block text-[0.85rem] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white px-3 py-1 rounded-[20px] font-medium">{item.restaurant}</span>
        )}
      </div>

      {showToast && (
        <div className="share-toast bg-gray-800 text-white px-4 py-[0.6rem] rounded-lg text-center text-[0.85rem] mb-3 animate-toast" role="status">{toastMessage}</div>
      )}

      {/* Dietary badges */}
      {(item.vegetarian || item.vegan) && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {item.vegetarian && <span className="text-xs font-semibold px-3 py-[0.35rem] rounded-md uppercase tracking-[0.5px] bg-[#e8f5e9] text-[#2e7d32]">Vegetarian</span>}
          {item.vegan && <span className="text-xs font-semibold px-3 py-[0.35rem] rounded-md uppercase tracking-[0.5px] bg-[#f3e5f5] text-[#7b1fa2]">Vegan</span>}
        </div>
      )}

      {/* Main nutrition - Dynamic based on filter */}
      <div className={`modal-primary-section ${getPrimaryBg(primaryMetric.className)} rounded-2xl p-6 mb-5 text-center`}>
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold text-white leading-none">{primaryMetric.value}</span>
          <span className="text-base text-white/85 mt-1 uppercase tracking-[1px]">{primaryMetric.label}</span>
        </div>
      </div>

      {/* Macros grid */}
      <div className="mb-5">
        <h3 className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px] mb-3 mt-0">Macronutrients</h3>
        <div className="macros-grid grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center transition-all duration-200${sortBy === 'calories-asc' || sortBy === 'calories-desc' || sortBy === 'name-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
            <span className="block text-xl font-bold text-gray-900">{item.calories}</span>
            <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Calories</span>
          </div>
          <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center transition-all duration-200${sortBy === 'protein-desc' || sortBy === 'protein-per-calorie-desc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
            <span className="block text-xl font-bold text-gray-900">{item.macros.protein}g</span>
            <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Protein</span>
          </div>
          <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center transition-all duration-200${sortBy === 'fibre-to-carb-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
            <span className="block text-xl font-bold text-gray-900">{item.macros.carbohydrates}g</span>
            <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Carbs</span>
          </div>
          <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center transition-all duration-200${sortBy === 'fat-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
            <span className="block text-xl font-bold text-gray-900">{item.macros.fat}g</span>
            <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Fat</span>
          </div>
          {item.macros.saturatedFat !== undefined && item.macros.saturatedFat !== null && (
            <div className="macro-item bg-gray-50 rounded-xl p-4 text-center">
              <span className="block text-xl font-bold text-gray-900">{item.macros.saturatedFat}g</span>
              <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Sat Fat</span>
            </div>
          )}
          {item.macros.sugar !== undefined && item.macros.sugar !== null && (
            <div className="macro-item bg-gray-50 rounded-xl p-4 text-center">
              <span className="block text-xl font-bold text-gray-900">{item.macros.sugar}g</span>
              <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Sugar</span>
            </div>
          )}
          {item.macros.fibre !== undefined && item.macros.fibre !== null && (
            <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center${sortBy === 'fibre-to-carb-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
              <span className="block text-xl font-bold text-gray-900">{item.macros.fibre}g</span>
              <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Fibre</span>
            </div>
          )}
          {item.macros.salt !== undefined && item.macros.salt !== null && (
            <div className={`macro-item bg-gray-50 rounded-xl p-4 text-center${sortBy === 'salt-asc' ? ' bg-gradient-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] border-2 border-[#667eea]' : ''}`}>
              <span className="block text-xl font-bold text-gray-900">{item.macros.salt}g</span>
              <span className="macro-label block text-xs text-gray-500 mt-1 uppercase tracking-[0.5px]">Salt</span>
            </div>
          )}
        </div>
      </div>

      {/* Perspectives — traffic light summary */}
      <div className="mb-5">
        <h3 className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px] mb-3 mt-0">Nutrition Insights</h3>
        <div className="perspectives-list flex flex-col gap-2" data-testid="perspectives-list">
          {perspectiveResults.map(({ perspective, result }) => (
            <div key={perspective.id} className={`perspective-row flex items-start gap-3 px-4 py-[0.85rem] rounded-xl ${perspectiveRowBg[result.rating] ?? 'bg-gray-100'}`}>
              <span className="text-[1.15rem] shrink-0 leading-[1.4]" aria-hidden="true">{RATING_ICONS[result.rating]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 flex-wrap">
                  <span className="perspective-name font-semibold text-[0.9rem] text-gray-800">{perspective.name}</span>
                  <span className={`font-semibold text-[0.85rem] whitespace-nowrap ${perspectiveValueColor[result.rating] ?? 'text-gray-400'}`}>
                    {result.value} — {result.label}
                  </span>
                </div>
                <p className="mt-1 m-0 text-[0.8rem] text-gray-500 leading-[1.4]">{result.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergens */}
      {item.allergens && Object.keys(item.allergens).some(key => item.allergens![key as keyof typeof item.allergens]) && (
        <div className="mb-5">
          <h3 className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px] mb-3 mt-0">Allergens</h3>
          <div className="allergens-list flex flex-wrap gap-2">
            {Object.entries(item.allergens).map(([allergen, present]) => {
              if (!present) return null;
              const displayName = allergen.charAt(0).toUpperCase() + allergen.slice(1);
              return (
                <span key={allergen} className="allergen-tag inline-block bg-[#fff3e0] text-[#e65100] px-3 py-[0.4rem] rounded-lg text-[0.85rem] font-medium border border-[#ffcc80]">
                  {displayName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {item.ingredients && item.ingredients.length > 0 && (
        <div className="mb-5">
          <h3 className="text-[0.85rem] font-semibold text-gray-500 uppercase tracking-[0.5px] mb-3 mt-0">Ingredients ({item.ingredients.length})</h3>
          <ul className="m-0 p-0 list-none bg-gray-50 rounded-xl overflow-hidden">
            {item.ingredients.map((ingredient, index) => (
              <li key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0 text-[0.9rem] text-gray-800">{ingredient}</li>
            ))}
          </ul>
        </div>
      )}
    </Tray>
  );
}

export default FoodDetailModal;

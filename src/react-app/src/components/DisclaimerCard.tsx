interface DisclaimerCardProps {
  onDismiss: () => void;
}

function DisclaimerCard({ onDismiss }: DisclaimerCardProps) {
  return (
    <div className="notice-card notice-card--disclaimer bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 border-l-[#f44336]">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="notice-card__title m-0 text-[1.1rem] font-semibold text-gray-900 leading-[1.3]">⚠️ AI Disclaimer</h3>
      </div>
      <p className="notice-card__text m-0 mb-4 text-[0.9rem] text-gray-700 leading-[1.5]">
        All nutritional statistics displayed in this app have been processed
        with AI. Always check the latest nutritional information with the staff
        member serving you before making dietary decisions.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button type="button" className="notice-card__btn notice-card__btn--dismiss flex-1 min-w-[120px] min-h-[44px] px-4 py-[0.6rem] border-0 rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-80 bg-[#667eea] text-white" onClick={onDismiss}>
          Got it, dismiss
        </button>
      </div>
    </div>
  );
}

export default DisclaimerCard;

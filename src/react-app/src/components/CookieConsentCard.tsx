interface CookieConsentCardProps {
  onAccept: () => void;
  onRefuse: () => void;
}

function CookieConsentCard({ onAccept, onRefuse }: CookieConsentCardProps) {
  return (
    <div className="notice-card notice-card--consent bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 border-l-[#ff9800]">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="notice-card__title m-0 text-[1.1rem] font-semibold text-gray-900 leading-[1.3]">🍪 Cookie Preferences</h3>
      </div>
      <p className="m-0 mb-4 text-[0.9rem] text-gray-700 leading-[1.5]">
        We use cookies for analytics only, to understand how people use Eat Me
        and improve the experience. No personal data is sold or shared with
        third parties.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button type="button" className="notice-card__btn notice-card__btn--accept flex-1 min-w-[120px] min-h-[44px] px-4 py-[0.6rem] border-0 rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-80 bg-[#4caf50] text-white" onClick={onAccept}>
          Accept cookies
        </button>
        <button type="button" className="notice-card__btn notice-card__btn--refuse flex-1 min-w-[120px] min-h-[44px] px-4 py-[0.6rem] border-0 rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-80 bg-gray-200 text-gray-800" onClick={onRefuse}>
          Refuse cookies
        </button>
      </div>
    </div>
  );
}

export default CookieConsentCard;

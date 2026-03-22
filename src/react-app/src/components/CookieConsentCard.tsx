import './FoodCard.css';
import './NoticeCard.css';

interface CookieConsentCardProps {
  onAccept: () => void;
  onRefuse: () => void;
}

function CookieConsentCard({ onAccept, onRefuse }: CookieConsentCardProps) {
  return (
    <div className="food-card notice-card notice-card--consent">
      <div className="food-card-header">
        <h3 className="food-name">🍪 Cookie Preferences</h3>
      </div>
      <p className="notice-card__text">
        We use cookies for analytics only, to understand how people use Eat Me
        and improve the experience. No personal data is sold or shared with
        third parties.
      </p>
      <div className="notice-card__actions">
        <button className="notice-card__btn notice-card__btn--accept" onClick={onAccept}>
          Accept cookies
        </button>
        <button className="notice-card__btn notice-card__btn--refuse" onClick={onRefuse}>
          Refuse cookies
        </button>
      </div>
    </div>
  );
}

export default CookieConsentCard;

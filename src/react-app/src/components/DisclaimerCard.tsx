import './NoticeCard.css';

interface DisclaimerCardProps {
  onDismiss: () => void;
}

function DisclaimerCard({ onDismiss }: DisclaimerCardProps) {
  return (
    <div className="notice-card notice-card--disclaimer">
      <div className="notice-card__header">
        <h3 className="notice-card__title">⚠️ AI Disclaimer</h3>
      </div>
      <p className="notice-card__text">
        All nutritional statistics displayed in this app have been processed
        with AI. Always check the latest nutritional information with the staff
        member serving you before making dietary decisions.
      </p>
      <div className="notice-card__actions">
        <button type="button" className="notice-card__btn notice-card__btn--dismiss" onClick={onDismiss}>
          Got it, dismiss
        </button>
      </div>
    </div>
  );
}

export default DisclaimerCard;

import './Pill.css';

interface PillProps {
  label: string;
  value?: string;
  onClick: () => void;
  isActive?: boolean;
  isExpanded?: boolean;
  icon?: string;
}

function Pill({ label, value, onClick, isActive = false, isExpanded, icon }: PillProps) {
  const displayText = value ? `${label}: ${value}` : label;
  const ariaLabel = value 
    ? `${label} filter, currently set to ${value}. Click to change.` 
    : `${label} filter. Click to open options.`;
  
  return (
    <button 
      className={`pill ${isActive ? 'active' : ''}`}
      onClick={onClick}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isExpanded ?? isActive}
      aria-haspopup="dialog"
    >
      {icon && <span className="pill-icon" aria-hidden="true">{icon}</span>}
      <span className="pill-text">{displayText}</span>
      <span className="pill-chevron" aria-hidden="true">▼</span>
    </button>
  );
}

export default Pill;

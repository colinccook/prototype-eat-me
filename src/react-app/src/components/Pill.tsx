import './Pill.css';

interface PillProps {
  label: string;
  value?: string;
  onClick: () => void;
  isActive?: boolean;
  icon?: string;
}

function Pill({ label, value, onClick, isActive = false, icon }: PillProps) {
  const displayText = value ? `${label}: ${value}` : label;
  
  return (
    <button 
      className={`pill ${isActive ? 'active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="pill-icon">{icon}</span>}
      <span className="pill-text">{displayText}</span>
      <span className="pill-chevron">▼</span>
    </button>
  );
}

export default Pill;

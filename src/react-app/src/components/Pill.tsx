interface PillProps {
  label: string;
  value?: string;
  onClick: () => void;
  isActive?: boolean;
  icon?: string;
}

function Pill({ label, value, onClick, isActive = false, icon }: PillProps) {
  const displayText = value ? `${label}: ${value}` : label;
  const ariaLabel = value 
    ? `${label} filter, currently set to ${value}. Click to change.` 
    : `${label} filter. Click to open options.`;
  
  return (
    <button 
      className={`pill inline-flex items-center gap-[0.4rem] px-[0.85rem] py-2 min-h-[44px] border border-white/30 rounded-[20px] text-[0.85rem] font-medium text-white/95 cursor-pointer transition-all duration-200 backdrop-blur-sm [-webkit-tap-highlight-color:transparent] active:bg-white/35 active:border-white/50 ${isActive ? 'bg-white/30 border-white/50' : 'bg-white/15 hover:bg-white/25 hover:border-white/40'}`}
      onClick={onClick}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isActive}
      aria-haspopup="dialog"
    >
      {icon && <span className="text-[0.9rem]" aria-hidden="true">{icon}</span>}
      <span className="whitespace-nowrap">{displayText}</span>
      <span className="text-[0.6rem] opacity-70 ml-[0.1rem]" aria-hidden="true">▼</span>
    </button>
  );
}

export default Pill;

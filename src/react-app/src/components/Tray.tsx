import { useEffect, useRef, useCallback, type ReactNode } from 'react';

// Swipe gesture constants
const SWIPE_CLOSE_THRESHOLD = 100;
const MAX_DRAG_DISTANCE = 300;

interface TrayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

function Tray({ isOpen, onClose, title, headerActions, children }: TrayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.dataset.trayOpen = 'true';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      delete document.body.dataset.trayOpen;
    };
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const content = contentRef.current;
    if (content && content.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    
    if (delta > 0 && contentRef.current) {
      const translateY = Math.min(delta, MAX_DRAG_DISTANCE);
      contentRef.current.style.transform = `translateY(${translateY}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (startY.current === null || currentY.current === null) {
      startY.current = null;
      currentY.current = null;
      return;
    }
    
    const delta = currentY.current - startY.current;
    
    if (contentRef.current) {
      if (delta > SWIPE_CLOSE_THRESHOLD) {
        onClose();
      } else {
        contentRef.current.style.transform = '';
      }
    }
    
    startY.current = null;
    currentY.current = null;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="tray-overlay fixed inset-0 bg-black/50 z-[1000] flex items-end justify-center md:items-center animate-tray-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "tray-title" : undefined}
    >
      <div className="w-full max-w-[500px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div 
          ref={contentRef}
          className="bg-white rounded-t-[20px] md:rounded-[20px] relative max-h-[85vh] flex flex-col animate-tray-slide-up transition-transform duration-200 will-change-transform"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="pt-3 pb-2 cursor-grab touch-none">
            <div className="w-10 h-1 bg-gray-300 rounded mx-auto"></div>
          </div>

          {/* Close button */}
          <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
            {headerActions}
            <button 
              className="tray-close-button w-8 h-8 border-0 bg-gray-100 rounded-full text-2xl text-gray-500 cursor-pointer flex items-center justify-center hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Title */}
          {title && (
            <div className="px-6 pb-4">
              <h2 id="tray-title" className="m-0 text-[1.25rem] md:text-2xl font-bold text-gray-900 pr-10">{title}</h2>
            </div>
          )}

          {/* Scrollable content */}
          <div className="overflow-y-auto overscroll-contain px-6 pb-8 flex-1 [-webkit-overflow-scrolling:touch]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tray;

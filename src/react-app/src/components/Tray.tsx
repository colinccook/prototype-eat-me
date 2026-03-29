import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import './Tray.css';

// Swipe gesture constants
const SWIPE_CLOSE_THRESHOLD = 100; // pixels needed to trigger close
const MAX_DRAG_DISTANCE = 300; // maximum drag distance in pixels

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

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Set data attribute to indicate a tray is open (used to disable pull-to-refresh)
      document.body.dataset.trayOpen = 'true';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      delete document.body.dataset.trayOpen;
    };
  }, [isOpen, onClose]);

  // Handle swipe down to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const content = contentRef.current;
    // Only allow swipe-to-close when scrolled to top
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
      // Dragging down - move the tray
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
        // Swiped down enough - close
        onClose();
      } else {
        // Snap back
        contentRef.current.style.transform = '';
      }
    }
    
    startY.current = null;
    currentY.current = null;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="tray-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "tray-title" : undefined}
    >
      <div className="tray-container" onClick={(e) => e.stopPropagation()}>
        <div 
          ref={contentRef}
          className="tray-sheet"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="tray-drag-handle">
            <div className="tray-drag-indicator"></div>
          </div>

          {/* Close button */}
          <div className="tray-header-actions">
            {headerActions}
            <button 
              className="tray-close-button" 
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Title */}
          {title && (
            <div className="tray-header">
              <h2 id="tray-title" className="tray-title">{title}</h2>
            </div>
          )}

          {/* Scrollable content */}
          <div className="tray-scroll-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tray;

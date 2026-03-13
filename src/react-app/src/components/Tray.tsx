import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import './Tray.css';

interface TrayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function Tray({ isOpen, onClose, title, children }: TrayProps) {
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
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
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
      const translateY = Math.min(delta, 300);
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
      if (delta > 100) {
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
          <button 
            className="tray-close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

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

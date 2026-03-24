import { useRef, useCallback, type ReactNode } from 'react';
import './SwipeableCard.css';

const SWIPE_THRESHOLD = 80; // px to trigger action

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Text shown in the left indicator area (revealed when swiping right). */
  leftLabel?: string;
  /** Text shown in the right indicator area (revealed when swiping left). */
  rightLabel?: string;
  /** If true the card animates off-screen before invoking the callback. */
  animateOut?: boolean;
}

function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = '❤️ Favourite',
  rightLabel = '🙈 Hide',
  animateOut = true,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const currentX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Ignore multi-touch
    if (e.touches.length !== 1) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0;
    isHorizontalSwipe.current = null;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;

      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      // Determine swipe direction once we've moved enough
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
        }
      }

      if (!isHorizontalSwipe.current) return;

      // Block left swipe if no handler, block right if no handler
      if (dx < 0 && !onSwipeLeft) return;
      if (dx > 0 && !onSwipeRight) return;

      currentX.current = dx;
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${dx}px)`;
        cardRef.current.style.opacity = String(
          Math.max(1 - Math.abs(dx) / 400, 0.4)
        );
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  const snapBack = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '1';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (startX.current === null) return;

    const dx = currentX.current;
    const absDx = Math.abs(dx);

    if (absDx >= SWIPE_THRESHOLD) {
      const direction = dx < 0 ? 'left' : 'right';
      const handler = direction === 'left' ? onSwipeLeft : onSwipeRight;

      if (handler) {
        if (animateOut) {
          // Fly off screen
          if (cardRef.current) {
            const flyTo = direction === 'left' ? -window.innerWidth : window.innerWidth;
            cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            cardRef.current.style.transform = `translateX(${flyTo}px)`;
            cardRef.current.style.opacity = '0';
          }
          setTimeout(handler, 300);
        } else {
          handler();
        }
      } else {
        snapBack();
      }
    } else {
      snapBack();
    }

    startX.current = null;
    startY.current = null;
    currentX.current = 0;
    isHorizontalSwipe.current = null;
  }, [onSwipeLeft, onSwipeRight, animateOut, snapBack]);

  return (
    <div className="swipeable-card-wrapper">
      {/* Background indicators */}
      <div className="swipe-indicator swipe-indicator--left" aria-hidden="true">
        <span>{leftLabel}</span>
      </div>
      <div className="swipe-indicator swipe-indicator--right" aria-hidden="true">
        <span>{rightLabel}</span>
      </div>

      <div
        ref={cardRef}
        className="swipeable-card-inner"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableCard;

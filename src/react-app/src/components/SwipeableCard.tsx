import { useRef, useCallback, useEffect, type ReactNode } from 'react';
import './SwipeableCard.css';

const SWIPE_THRESHOLD = 80; // px to trigger action
const OPACITY_FADE_DISTANCE = 400; // px distance over which opacity fades
const MIN_OPACITY = 0.4;
const ANIMATION_DURATION_MS = 300;
const LONG_PRESS_DURATION_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 10; // px – movement beyond this cancels the long press

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  /** Text shown in the left indicator area (revealed when swiping right). */
  leftLabel?: string;
  /** Text shown in the right indicator area (revealed when swiping left). */
  rightLabel?: string;
  /** If true, swiping left animates the card off-screen before invoking the callback. */
  animateOutLeft?: boolean;
  /** If true, swiping right animates the card off-screen before invoking the callback. */
  animateOutRight?: boolean;
}

function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  leftLabel = '❤️ Favourite',
  rightLabel = '🙈 Hide',
  animateOutLeft = true,
  animateOutRight = false,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const currentX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const flyOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (flyOffTimer.current !== null) {
        clearTimeout(flyOffTimer.current);
      }
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Ignore multi-touch
    if (e.touches.length !== 1) return;
    // Cancel any in-flight fly-off timer from a previous swipe
    if (flyOffTimer.current !== null) {
      clearTimeout(flyOffTimer.current);
      flyOffTimer.current = null;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentX.current = 0;
    isHorizontalSwipe.current = null;
    longPressFired.current = false;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      // Promote to GPU layer only while the gesture is active to avoid
      // exhausting GPU memory when hundreds of cards are rendered at once.
      cardRef.current.style.willChange = 'transform, opacity';
    }
    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        longPressFired.current = true;
        onLongPress();
      }, LONG_PRESS_DURATION_MS);
    }
  }, [onLongPress]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Cancel long press if finger moves beyond tolerance
      if (longPressTimer.current !== null && (Math.abs(dx) > LONG_PRESS_MOVE_TOLERANCE || Math.abs(dy) > LONG_PRESS_MOVE_TOLERANCE)) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Determine swipe direction once we've moved enough
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
        }
      }

      if (!isHorizontalSwipe.current) return;

      // Prevent horizontal swipe from bubbling to app-level touch handlers
      // (e.g., pull-to-refresh in App.tsx)
      e.stopPropagation();

      // Block left swipe if no handler, block right if no handler
      if (dx < 0 && !onSwipeLeft) return;
      if (dx > 0 && !onSwipeRight) return;

      currentX.current = dx;
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${dx}px)`;
        cardRef.current.style.opacity = String(
          Math.max(1 - Math.abs(dx) / OPACITY_FADE_DISTANCE, MIN_OPACITY)
        );
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  const snapBack = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = `transform ${ANIMATION_DURATION_MS}ms ease, opacity ${ANIMATION_DURATION_MS}ms ease`;
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '1';
      // Release the GPU layer once the snap-back animation has finished.
      const el = cardRef.current;
      setTimeout(() => {
        el.style.willChange = 'auto';
      }, ANIMATION_DURATION_MS);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Cancel any pending long press timer
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touchStartX.current === null) return;

    // If long press already fired, suppress the click/swipe action
    if (longPressFired.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      currentX.current = 0;
      isHorizontalSwipe.current = null;
      snapBack();
      return;
    }

    const dx = currentX.current;
    const absDx = Math.abs(dx);

    if (absDx >= SWIPE_THRESHOLD) {
      const direction = dx < 0 ? 'left' : 'right';
      const handler = direction === 'left' ? onSwipeLeft : onSwipeRight;
      const shouldFlyOff = direction === 'left' ? animateOutLeft : animateOutRight;

      if (handler) {
        if (shouldFlyOff) {
          // Fly off screen then invoke handler
          if (cardRef.current) {
            const flyTo = direction === 'left' ? -window.innerWidth : window.innerWidth;
            cardRef.current.style.transition = `transform ${ANIMATION_DURATION_MS}ms ease, opacity ${ANIMATION_DURATION_MS}ms ease`;
            cardRef.current.style.transform = `translateX(${flyTo}px)`;
            cardRef.current.style.opacity = '0';
          }
          flyOffTimer.current = setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.style.willChange = 'auto';
            }
            handler();
          }, ANIMATION_DURATION_MS);
        } else {
          // Snap back then invoke handler immediately
          snapBack();
          handler();
        }
      } else {
        snapBack();
      }
    } else {
      snapBack();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    currentX.current = 0;
    isHorizontalSwipe.current = null;
  }, [onSwipeLeft, onSwipeRight, animateOutLeft, animateOutRight, snapBack]);

  // Handle iOS Safari cancelling the touch gesture (e.g., when it intercepts
  // a right-edge swipe for back-navigation). Without this, the card is left
  // visually displaced and its GPU layer is never released.
  const handleTouchCancel = useCallback(() => {
    // Cancel any pending long press timer
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (touchStartX.current === null) return;
    snapBack();
    touchStartX.current = null;
    touchStartY.current = null;
    currentX.current = 0;
    isHorizontalSwipe.current = null;
  }, [snapBack]);

  // Suppress the synthetic click that fires after touchend when a long press
  // was detected. Without this the child FoodCard onClick would still fire.
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (longPressFired.current) {
      e.stopPropagation();
      e.preventDefault();
      longPressFired.current = false;
    }
  }, []);

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
        onTouchCancel={handleTouchCancel}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableCard;

import { useRef, useCallback, useEffect, type ReactNode } from 'react';

const SWIPE_THRESHOLD = 80;
const OPACITY_FADE_DISTANCE = 400;
const MIN_OPACITY = 0.4;
const ANIMATION_DURATION_MS = 300;
const LONG_PRESS_DURATION_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 10;

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  animateOutLeft?: boolean;
  animateOutRight?: boolean;
  onContextMenu?: () => void;
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
  onContextMenu,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const currentX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const flyOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

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
    if (e.touches.length !== 1) return;
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
      cardRef.current.style.willChange = 'transform, opacity';
    }
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

      if (longPressTimer.current !== null && (Math.abs(dx) > LONG_PRESS_MOVE_TOLERANCE || Math.abs(dy) > LONG_PRESS_MOVE_TOLERANCE)) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
        }
      }

      if (!isHorizontalSwipe.current) return;

      e.stopPropagation();

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
      const el = cardRef.current;
      setTimeout(() => {
        el.style.willChange = 'auto';
      }, ANIMATION_DURATION_MS);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touchStartX.current === null) return;

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

  const handleTouchCancel = useCallback(() => {
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

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (longPressFired.current) {
      e.stopPropagation();
      e.preventDefault();
      longPressFired.current = false;
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (onContextMenu) {
      e.preventDefault();
      onContextMenu();
    }
  }, [onContextMenu]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background indicators */}
      <div className="absolute top-0 bottom-0 left-0 right-1/2 flex items-center pl-5 font-semibold text-[0.85rem] rounded-xl bg-[#e8f5e9] text-[#2e7d32]" aria-hidden="true">
        <span>{leftLabel}</span>
      </div>
      <div className="absolute top-0 bottom-0 right-0 left-1/2 flex items-center justify-end pr-5 font-semibold text-[0.85rem] rounded-xl bg-[#ffebee] text-[#c62828]" aria-hidden="true">
        <span>{rightLabel}</span>
      </div>

      <div
        ref={cardRef}
        className="swipeable-card-inner relative z-[1]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={handleClickCapture}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableCard;

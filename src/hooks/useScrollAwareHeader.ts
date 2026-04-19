import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface UseScrollAwareHeaderOptions {
  lockedVisible?: boolean;
  topOffset?: number;
  hideThreshold?: number;
  showThreshold?: number;
  jitterThreshold?: number;
  toggleCooldownMs?: number;
}

export function useScrollAwareHeader(options: UseScrollAwareHeaderOptions = {}) {
  const {
    lockedVisible = false,
    topOffset = 24,
    hideThreshold = 18,
    showThreshold = 28,
    jitterThreshold = 2,
    toggleCooldownMs = 180,
  } = options;
  const [headerVisible, setHeaderVisible] = useState(true);
  const headerVisibleRef = useRef(true);
  const lastOffsetYRef = useRef(0);
  const lastDirectionRef = useRef<1 | -1 | 0>(0);
  const directionalDistanceRef = useRef(0);
  const lastToggleAtRef = useRef(0);

  useEffect(() => {
    headerVisibleRef.current = headerVisible;
  }, [headerVisible]);

  useEffect(() => {
    if (lockedVisible) {
      setHeaderVisible(true);
      headerVisibleRef.current = true;
      lastDirectionRef.current = 0;
      directionalDistanceRef.current = 0;
      lastToggleAtRef.current = 0;
    }
  }, [lockedVisible]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (lockedVisible) return;

      const offsetY = Math.max(event.nativeEvent.contentOffset.y, 0);
      const deltaFromLastOffset = offsetY - lastOffsetYRef.current;
      const now = Date.now();
      lastOffsetYRef.current = offsetY;

      if (offsetY <= topOffset) {
        if (!headerVisibleRef.current) {
          setHeaderVisible(true);
          headerVisibleRef.current = true;
        }
        lastDirectionRef.current = 0;
        directionalDistanceRef.current = 0;
        lastToggleAtRef.current = now;
        return;
      }

      if (Math.abs(deltaFromLastOffset) <= jitterThreshold) {
        return;
      }

      const nextDirection: 1 | -1 = deltaFromLastOffset > 0 ? 1 : -1;

      if (lastDirectionRef.current !== nextDirection) {
        lastDirectionRef.current = nextDirection;
        directionalDistanceRef.current = Math.abs(deltaFromLastOffset);
      } else {
        directionalDistanceRef.current += Math.abs(deltaFromLastOffset);
      }

      if (now - lastToggleAtRef.current < toggleCooldownMs) {
        return;
      }

      const threshold = headerVisibleRef.current ? hideThreshold : showThreshold;

      if (directionalDistanceRef.current < threshold) {
        return;
      }

      if (nextDirection > 0 && headerVisibleRef.current) {
        setHeaderVisible(false);
        headerVisibleRef.current = false;
        directionalDistanceRef.current = 0;
        lastToggleAtRef.current = now;
      } else if (nextDirection < 0 && !headerVisibleRef.current) {
        setHeaderVisible(true);
        headerVisibleRef.current = true;
        directionalDistanceRef.current = 0;
        lastToggleAtRef.current = now;
      }
    },
    [hideThreshold, jitterThreshold, lockedVisible, showThreshold, toggleCooldownMs, topOffset],
  );

  return {
    headerVisible,
    handleScroll,
  };
}

'use client';

import { useEffect, useCallback, useRef } from 'react';

export const useInactivityLogout = (timeout: number, onIdle: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onIdle, timeout);
  }, [onIdle, timeout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'visibilitychange'];
    
    // Set up event listeners
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    
    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity, resetTimer]);
};

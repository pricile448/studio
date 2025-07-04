
'use client';

import { useEffect, useCallback, useRef } from 'react';

export const useInactivityLogout = (timeout: number, onIdle: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onIdleRef = useRef(onIdle);

  // Keep the onIdle function reference up to date without re-triggering the effect
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => onIdleRef.current(), timeout);
    }
  }, [timeout]);

  useEffect(() => {
    // Don't set up listeners if timeout is disabled
    if (timeout <= 0) {
        // Clean up timer if timeout is set to 0 while active
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        return;
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };
    
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
  }, [resetTimer, timeout]);
};

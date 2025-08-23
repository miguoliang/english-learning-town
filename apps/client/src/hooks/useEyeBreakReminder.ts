import { useState, useEffect, useCallback, useRef } from "react";

interface EyeBreakState {
  readingTime: number;
  totalTime: number;
  lastBlinkReminder: number;
  lastBreakReminder: number;
  isBreakSuggested: boolean;
  blinkCount: number;
}

interface EyeBreakConfig {
  blinkReminderInterval: number; // 20 seconds
  breakReminderInterval: number; // 20 minutes (20-20-20 rule)
  minReadingTime: number; // 30 seconds
  blinkDuration: number; // 3 seconds
}

const DEFAULT_CONFIG: EyeBreakConfig = {
  blinkReminderInterval: 20 * 1000, // 20 seconds
  breakReminderInterval: 20 * 60 * 1000, // 20 minutes
  minReadingTime: 30 * 1000, // 30 seconds
  blinkDuration: 3 * 1000, // 3 seconds
};

export const useEyeBreakReminder = (config: Partial<EyeBreakConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<EyeBreakState>({
    readingTime: 0,
    totalTime: 0,
    lastBlinkReminder: 0,
    lastBreakReminder: 0,
    isBreakSuggested: false,
    blinkCount: 0,
  });

  const [showBlinkReminder, setShowBlinkReminder] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Start tracking when dialogue is active
  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      setState((prev) => {
        const newState = {
          ...prev,
          readingTime: elapsed,
          totalTime: prev.totalTime + 1000, // Add 1 second
        };

        // Check for blink reminder
        if (
          elapsed - prev.lastBlinkReminder >=
          fullConfig.blinkReminderInterval
        ) {
          if (elapsed >= fullConfig.minReadingTime) {
            setShowBlinkReminder(true);
            newState.lastBlinkReminder = elapsed;
          }
        }

        // Check for break reminder (20-20-20 rule)
        if (
          prev.totalTime - prev.lastBreakReminder >=
          fullConfig.breakReminderInterval
        ) {
          setShowBreakReminder(true);
          newState.lastBreakReminder = prev.totalTime;
          newState.isBreakSuggested = true;
        }

        return newState;
      });
    }, 1000);
  }, [fullConfig]);

  // Stop tracking when dialogue closes
  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle blink reminder acknowledgment
  const acknowledgeBlinkReminder = useCallback(() => {
    setShowBlinkReminder(false);
    setState((prev) => ({
      ...prev,
      blinkCount: prev.blinkCount + 1,
    }));
  }, []);

  // Handle break reminder acknowledgment
  const acknowledgeBreakReminder = useCallback((taken: boolean) => {
    setShowBreakReminder(false);
    setState((prev) => ({
      ...prev,
      isBreakSuggested: false,
      lastBreakReminder: taken ? prev.totalTime : prev.lastBreakReminder,
    }));
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setState({
      readingTime: 0,
      totalTime: 0,
      lastBlinkReminder: 0,
      lastBreakReminder: 0,
      isBreakSuggested: false,
      blinkCount: 0,
    });
    setShowBlinkReminder(false);
    setShowBreakReminder(false);
  }, []);

  // Get time until next break
  const getTimeUntilNextBreak = useCallback(() => {
    const timeUntilBreak =
      fullConfig.breakReminderInterval -
      (state.totalTime - state.lastBreakReminder);
    return Math.max(0, timeUntilBreak);
  }, [
    state.totalTime,
    state.lastBreakReminder,
    fullConfig.breakReminderInterval,
  ]);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    return {
      readingTimeMinutes: Math.floor(state.readingTime / 60000),
      totalTimeMinutes: Math.floor(state.totalTime / 60000),
      blinkRemindersShown: state.blinkCount,
      nextBreakIn: Math.floor(getTimeUntilNextBreak() / 60000),
    };
  }, [state, getTimeUntilNextBreak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    showBlinkReminder,
    showBreakReminder,
    isBreakSuggested: state.isBreakSuggested,

    // Actions
    startTracking,
    stopTracking,
    acknowledgeBlinkReminder,
    acknowledgeBreakReminder,
    resetSession,

    // Data
    getSessionStats,
    getTimeUntilNextBreak,
  };
};

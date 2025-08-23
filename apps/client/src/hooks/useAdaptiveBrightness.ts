import { useState, useEffect, useCallback, useRef } from "react";

interface BrightnessState {
  currentBrightness: number; // 0-100
  targetBrightness: number;
  isAutoMode: boolean;
  userPreference: number; // 0-100
  ambientLight: number; // 0-100 (simulated)
  lastAdjustment: number;
}

interface BrightnessConfig {
  transitionDuration: number; // ms
  adjustmentThreshold: number; // minimum change to trigger adjustment
  minBrightness: number; // 20%
  maxBrightness: number; // 100%
  autoAdjustInterval: number; // 5 seconds
}

const DEFAULT_CONFIG: BrightnessConfig = {
  transitionDuration: 1000,
  adjustmentThreshold: 5,
  minBrightness: 20,
  maxBrightness: 100,
  autoAdjustInterval: 5000,
};

// Simulate ambient light detection (in real app, could use camera API)
const simulateAmbientLight = (): number => {
  const hour = new Date().getHours();

  // Simulate day/night cycle
  if (hour >= 6 && hour <= 8) return 30 + Math.random() * 20; // Dawn
  if (hour >= 9 && hour <= 17) return 70 + Math.random() * 30; // Day
  if (hour >= 18 && hour <= 20) return 40 + Math.random() * 20; // Dusk
  return 10 + Math.random() * 20; // Night
};

// Calculate optimal brightness based on ambient light and time
const calculateOptimalBrightness = (
  ambientLight: number,
  userPref: number,
): number => {
  // Base brightness on ambient light (20% ambient = 40% screen)
  const ambientBasedBrightness = Math.min(
    100,
    Math.max(20, ambientLight * 1.2),
  );

  // Blend with user preference (70% ambient-based, 30% user preference)
  const optimalBrightness = ambientBasedBrightness * 0.7 + userPref * 0.3;

  return Math.round(Math.min(100, Math.max(20, optimalBrightness)));
};

export const useAdaptiveBrightness = (
  config: Partial<BrightnessConfig> = {},
) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<BrightnessState>(() => {
    const saved = localStorage.getItem("adaptiveBrightness");
    const defaultState: BrightnessState = {
      currentBrightness: 75,
      targetBrightness: 75,
      isAutoMode: true,
      userPreference: 75,
      ambientLight: simulateAmbientLight(),
      lastAdjustment: Date.now(),
    };

    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage
  const saveState = useCallback((newState: BrightnessState) => {
    localStorage.setItem(
      "adaptiveBrightness",
      JSON.stringify({
        isAutoMode: newState.isAutoMode,
        userPreference: newState.userPreference,
        currentBrightness: newState.currentBrightness,
      }),
    );
  }, []);

  // Apply brightness to document
  const applyBrightness = useCallback(
    (brightness: number) => {
      const filterValue = brightness / 100;
      document.documentElement.style.setProperty(
        "--adaptive-brightness",
        filterValue.toString(),
      );

      // Apply CSS filter to main content
      const style =
        document.getElementById("adaptive-brightness-style") ||
        document.createElement("style");
      style.id = "adaptive-brightness-style";
      style.textContent = `
      .ecs-game-container,
      [class*="DialogueOverlay"],
      [class*="MainMenu"] {
        filter: brightness(${filterValue}) contrast(${Math.min(1.2, 0.8 + filterValue * 0.4)});
        transition: filter ${fullConfig.transitionDuration}ms ease;
      }
    `;

      if (!document.head.contains(style)) {
        document.head.appendChild(style);
      }
    },
    [fullConfig.transitionDuration],
  );

  // Smooth brightness transition
  const transitionToBrightness = useCallback(
    (targetBrightness: number) => {
      if (transitionRef.current) {
        clearInterval(transitionRef.current);
      }

      const startBrightness = state.currentBrightness;
      const difference = targetBrightness - startBrightness;
      const steps = Math.abs(difference);
      const stepSize = difference / steps;
      const stepDuration = fullConfig.transitionDuration / steps;

      let currentStep = 0;

      transitionRef.current = setInterval(() => {
        currentStep++;
        const newBrightness = Math.round(
          startBrightness + stepSize * currentStep,
        );

        setState((prev) => ({ ...prev, currentBrightness: newBrightness }));
        applyBrightness(newBrightness);

        if (currentStep >= steps) {
          clearInterval(transitionRef.current!);
          transitionRef.current = null;
        }
      }, stepDuration);
    },
    [state.currentBrightness, fullConfig.transitionDuration, applyBrightness],
  );

  // Auto-adjust brightness based on ambient light
  const autoAdjust = useCallback(() => {
    if (!state.isAutoMode) return;

    const newAmbientLight = simulateAmbientLight();
    const optimalBrightness = calculateOptimalBrightness(
      newAmbientLight,
      state.userPreference,
    );

    const brightnessDiff = Math.abs(optimalBrightness - state.targetBrightness);

    if (brightnessDiff >= fullConfig.adjustmentThreshold) {
      setState((prev) => {
        const newState = {
          ...prev,
          targetBrightness: optimalBrightness,
          ambientLight: newAmbientLight,
          lastAdjustment: Date.now(),
        };
        saveState(newState);
        return newState;
      });

      transitionToBrightness(optimalBrightness);
    }
  }, [
    state,
    fullConfig.adjustmentThreshold,
    saveState,
    transitionToBrightness,
  ]);

  // Manual brightness adjustment
  const setBrightness = useCallback(
    (brightness: number) => {
      const clampedBrightness = Math.min(
        fullConfig.maxBrightness,
        Math.max(fullConfig.minBrightness, brightness),
      );

      setState((prev) => {
        const newState = {
          ...prev,
          targetBrightness: clampedBrightness,
          userPreference: clampedBrightness,
          lastAdjustment: Date.now(),
        };
        saveState(newState);
        return newState;
      });

      transitionToBrightness(clampedBrightness);
    },
    [
      fullConfig.maxBrightness,
      fullConfig.minBrightness,
      saveState,
      transitionToBrightness,
    ],
  );

  // Toggle auto mode
  const toggleAutoMode = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, isAutoMode: !prev.isAutoMode };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Start auto-adjustment interval
  useEffect(() => {
    if (state.isAutoMode) {
      intervalRef.current = setInterval(
        autoAdjust,
        fullConfig.autoAdjustInterval,
      );

      // Perform initial auto-adjustment
      autoAdjust();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isAutoMode, autoAdjust, fullConfig.autoAdjustInterval]);

  // Apply initial brightness
  useEffect(() => {
    applyBrightness(state.currentBrightness);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (transitionRef.current) {
        clearInterval(transitionRef.current);
      }
    };
  }, []);

  return {
    // State
    brightness: state.currentBrightness,
    targetBrightness: state.targetBrightness,
    isAutoMode: state.isAutoMode,
    ambientLight: state.ambientLight,

    // Actions
    setBrightness,
    toggleAutoMode,

    // Utils
    getBrightnessLevel: () => {
      if (state.currentBrightness >= 80) return "high";
      if (state.currentBrightness >= 50) return "medium";
      return "low";
    },

    getRecommendation: () => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour <= 6) {
        return "Consider lowering brightness for night viewing";
      }
      if (hour >= 12 && hour <= 14) {
        return "Bright outdoor lighting detected - increasing brightness";
      }
      return "Brightness automatically adjusted for optimal comfort";
    },
  };
};

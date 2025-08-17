/**
 * @elt/learning-algorithms - Spaced Repetition and Adaptive Learning Algorithms
 * 
 * Core algorithms for vocabulary acquisition, difficulty adaptation, and review scheduling.
 * Pure algorithm implementations without UI dependencies.
 */

// Spaced Repetition Algorithm
export { SpacedRepetitionEngine } from './spacedRepetition';
export type { VocabularyCard, ReviewResult, LearningStage } from './spacedRepetition';

// Adaptive Difficulty Calibration  
export { 
  DifficultyCalibrationEngine,
  DifficultyLevel,
  PerformanceZone
} from './difficultyCalibration';
export type { 
  PerformanceMetrics,
  ContentDifficulty,
  AdaptationStrategy
} from './difficultyCalibration';

// Review Session Management  
export { ReviewSessionManager } from './reviewSession';
export type { ReviewSessionConfig, ReviewSession } from './reviewSession';

// Shared types and utilities
export * from './shared/types';
export { LearningValidation, ValidationError } from './shared/validation';

// Algorithm constants
export const ALGORITHM_CONSTANTS = {
  SPACED_REPETITION: {
    DEFAULT_EASE_FACTOR: 2.5,
    MIN_EASE_FACTOR: 1.3,
    MAX_EASE_FACTOR: 4.0,
    TARGET_ACCURACY: 75,
    MIN_INTERVAL: 1,
    MAX_INTERVAL: 365
  },
  DIFFICULTY_CALIBRATION: {
    TARGET_ACCURACY_RANGE: [70, 80] as const,
    ADAPTATION_SENSITIVITY: 0.15,
    MIN_ATTEMPTS_FOR_CALIBRATION: 5,
    PERFORMANCE_ZONES: {
      FRUSTRATION: { min: 0, max: 60 },
      CHALLENGE: { min: 60, max: 80 },
      COMFORT: { min: 80, max: 95 },
      MASTERY: { min: 95, max: 100 }
    }
  }
} as const;

// Algorithm utilities
export const ALGORITHM_UTILS = {
  /**
   * Calculate next review interval using SM-2 algorithm
   */
  calculateInterval: (repetitions: number, easeFactor: number, previousInterval: number): number => {
    if (repetitions === 0) return 1;
    if (repetitions === 1) return 6;
    return Math.round(previousInterval * easeFactor);
  },

  /**
   * Adjust ease factor based on review performance
   */
  adjustEaseFactor: (currentEase: number, quality: number): number => {
    const adjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    return Math.max(ALGORITHM_CONSTANTS.SPACED_REPETITION.MIN_EASE_FACTOR, 
                   Math.min(ALGORITHM_CONSTANTS.SPACED_REPETITION.MAX_EASE_FACTOR, 
                           currentEase + adjustment));
  },

  /**
   * Determine performance zone from accuracy percentage
   */
  getPerformanceZone: (accuracy: number): keyof typeof ALGORITHM_CONSTANTS.DIFFICULTY_CALIBRATION.PERFORMANCE_ZONES => {
    const zones = ALGORITHM_CONSTANTS.DIFFICULTY_CALIBRATION.PERFORMANCE_ZONES;
    if (accuracy < zones.FRUSTRATION.max) return 'FRUSTRATION';
    if (accuracy < zones.CHALLENGE.max) return 'CHALLENGE'; 
    if (accuracy < zones.COMFORT.max) return 'COMFORT';
    return 'MASTERY';
  }
} as const;
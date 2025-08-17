/**
 * Learning Module - Main Export
 * Unified access to all learning systems with feature-based organization
 */

// Learning Algorithms
export * from './algorithms';

// Learning Analytics
export * from './analytics';

// Learning Assessment
export * from './assessment';

// Shared Utilities and Types
export * from './shared';

// Re-export key types for convenience
export type {
  SpacedRepetition,
  Analytics,
  Assessment,
  Calibration,
  Motivation,
  CEFRLevel,
  LanguageSkill,
  IELTSBand,
  LearningEntity
} from './shared/types';

// Main learning module constants
export const LEARNING_MODULE_INFO = {
  VERSION: '3.0.0',
  ARCHITECTURE: 'Feature-Based ECS',
  FEATURES: [
    'Spaced Repetition Algorithms',
    'Adaptive Difficulty Calibration', 
    'Learning Analytics Engine',
    'CEFR-IELTS Curriculum Alignment',
    'Content Quality Assessment',
    'Goal Setting & Achievement System',
    'Motivation & Gamification'
  ],
  LAST_UPDATED: '2025-01-17'
} as const;
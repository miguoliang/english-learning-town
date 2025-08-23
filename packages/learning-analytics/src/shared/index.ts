/**
 * Shared Learning Utilities Module
 * Common validation, types, and utilities used across learning features
 */

// Validation utilities
export * from "./validation";

// Type definitions
export * from "./types";

// Shared constants
export const LEARNING_CONSTANTS = {
  // Common validation limits
  VALIDATION: {
    MAX_WORD_LENGTH: 200,
    MAX_DEFINITION_LENGTH: 2000,
    MAX_CONTEXT_LENGTH: 1000,
    MAX_EXAMPLES: 20,
    MAX_EXAMPLE_LENGTH: 500,
    MIN_SAMPLE_SIZE: 10,
  },

  // Error message templates
  ERROR_MESSAGES: {
    VALIDATION: {
      REQUIRED_FIELD: "This field is required",
      INVALID_TYPE: "Invalid data type provided",
      EXCEEDS_LENGTH: "Content exceeds maximum length limit",
      INSUFFICIENT_DATA: "Insufficient data for analysis",
      INVALID_RANGE: "Value is outside acceptable range",
    },
    LEARNING: {
      CARD_NOT_FOUND: "Vocabulary card not found",
      SESSION_EXPIRED: "Learning session has expired",
      INVALID_PROGRESS: "Invalid progress data",
      GOAL_NOT_ACHIEVABLE: "Goal target is not achievable",
    },
  },

  // Common regex patterns
  PATTERNS: {
    WORD: /^[a-zA-Z\s\-']+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    LANGUAGE_CODE: /^[a-z]{2}(-[A-Z]{2})?$/,
  },

  // Time constants
  TIME: {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    WEEKS_PER_MONTH: 4.33,
    MONTHS_PER_YEAR: 12,
  },
} as const;

// Shared utility functions
export const LEARNING_UTILS = {
  /**
   * Generate unique ID for learning entities
   */
  generateId: (prefix: string = "learning"): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  },

  /**
   * Format time duration in human-readable format
   */
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(
      milliseconds / LEARNING_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
    );
    const minutes = Math.floor(
      seconds / LEARNING_CONSTANTS.TIME.SECONDS_PER_MINUTE,
    );
    const hours = Math.floor(
      minutes / LEARNING_CONSTANTS.TIME.MINUTES_PER_HOUR,
    );

    if (hours > 0) {
      return `${hours}h ${minutes % LEARNING_CONSTANTS.TIME.MINUTES_PER_HOUR}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % LEARNING_CONSTANTS.TIME.SECONDS_PER_MINUTE}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Calculate percentage with safe division
   */
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 10) / 10; // Round to 1 decimal
  },

  /**
   * Normalize text for consistent processing
   */
  normalizeText: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[^\w\s\-']/g, ""); // Remove special characters except hyphens and apostrophes
  },

  /**
   * Validate learning entity base properties
   */
  validateLearningEntity: (entity: any): boolean => {
    return !!(
      entity &&
      typeof entity === "object" &&
      entity.id &&
      typeof entity.id === "string" &&
      entity.createdAt instanceof Date &&
      entity.updatedAt instanceof Date
    );
  },

  /**
   * Calculate learning velocity (progress per unit time)
   */
  calculateVelocity: (progress: number[], timePoints: Date[]): number => {
    if (progress.length !== timePoints.length || progress.length < 2) {
      return 0;
    }

    const firstPoint = { progress: progress[0], time: timePoints[0].getTime() };
    const lastPoint = {
      progress: progress[progress.length - 1],
      time: timePoints[timePoints.length - 1].getTime(),
    };

    const progressDelta = lastPoint.progress - firstPoint.progress;
    const timeDelta =
      (lastPoint.time - firstPoint.time) / (1000 * 60 * 60 * 24); // Convert to days

    return timeDelta > 0 ? progressDelta / timeDelta : 0;
  },

  /**
   * Deep clone object for immutable operations
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map((item) => LEARNING_UTILS.deepClone(item)) as unknown as T;

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = LEARNING_UTILS.deepClone(obj[key]);
      }
    }
    return cloned;
  },
} as const;

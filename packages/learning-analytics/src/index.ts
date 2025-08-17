/**
 * @elt/learning-analytics - Learning Progress and Analytics Engine
 * 
 * Progress tracking, goal setting, achievements, and motivation systems
 * for educational applications.
 */

// Learning Analytics Engine
export * from './analytics';

// Goal Setting and Tracking
export * from './goalSetting';

// Achievement System
export * from './achievements';

// Motivation System
export * from './motivationSystem';

// Shared types and utilities - export types only to avoid conflicts
export type * from './shared/types';
export { LearningValidation, ValidationError } from './shared/validation';

// Analytics constants
export const ANALYTICS_CONSTANTS = {
  METRICS: {
    SESSION_THRESHOLDS: {
      MIN_SESSION_LENGTH: 5, // minutes
      OPTIMAL_SESSION_LENGTH: 15, // minutes
      MAX_SESSION_LENGTH: 60 // minutes
    },
    CONSISTENCY_THRESHOLDS: {
      EXCELLENT: 90,
      GOOD: 70,
      NEEDS_IMPROVEMENT: 50,
      POOR: 30
    },
    IMPROVEMENT_RATES: {
      EXCELLENT: 10, // % per week
      GOOD: 5,
      MODERATE: 2,
      SLOW: 1
    }
  },
  GOALS: {
    TYPES: {
      DAILY_PRACTICE: 'Complete daily practice session',
      VOCABULARY_TARGET: 'Learn new vocabulary words',
      ACCURACY_IMPROVEMENT: 'Improve overall accuracy',
      STREAK_MAINTENANCE: 'Maintain learning streak',
      SKILL_MASTERY: 'Master specific language skill',
      IELTS_PREPARATION: 'Prepare for IELTS exam'
    },
    DEFAULT_TARGETS: {
      DAILY_MINUTES: 20,
      WEEKLY_VOCABULARY: 50,
      MONTHLY_ACCURACY: 85,
      STREAK_DAYS: 30
    }
  },
  ACHIEVEMENTS: {
    XP_VALUES: {
      LESSON_COMPLETION: 10,
      PERFECT_SESSION: 25,
      DAILY_STREAK: 5,
      WEEKLY_GOAL: 50,
      VOCABULARY_MASTERY: 15,
      SKILL_IMPROVEMENT: 30
    },
    RARITY_MULTIPLIERS: {
      COMMON: 1.0,
      UNCOMMON: 1.2,
      RARE: 1.5,
      EPIC: 2.0,
      LEGENDARY: 3.0
    }
  }
} as const;

// Analytics utilities
export const ANALYTICS_UTILS = {
  /**
   * Calculate learning consistency score
   */
  calculateConsistencyScore: (sessions: Array<{ date: Date, completed: boolean }>): number => {
    if (sessions.length === 0) return 0;
    
    const completedSessions = sessions.filter(s => s.completed).length;
    const consistency = (completedSessions / sessions.length) * 100;
    
    // Bonus for recent activity
    const recentSessions = sessions.filter(s => 
      s.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const recentBonus = recentSessions.length > 0 ? 
      (recentSessions.filter(s => s.completed).length / recentSessions.length) * 10 : 0;
    
    return Math.min(100, consistency + recentBonus);
  },

  /**
   * Generate personalized learning insights
   */
  generateInsights: (metrics: any): Array<{type: string, message: string, priority: 'HIGH' | 'MEDIUM' | 'LOW'}> => {
    const insights = [];
    
    if (metrics.overallAccuracy < 70) {
      insights.push({
        type: 'ACCURACY_CONCERN',
        message: 'Your accuracy is below target. Consider reviewing fundamentals.',
        priority: 'HIGH' as const
      });
    }
    
    if (metrics.streakDays >= 7) {
      insights.push({
        type: 'STREAK_CELEBRATION',
        message: `Amazing! You've maintained a ${metrics.streakDays}-day learning streak!`,
        priority: 'MEDIUM' as const
      });
    }
    
    if (metrics.improvementRate > ANALYTICS_CONSTANTS.METRICS.IMPROVEMENT_RATES.GOOD) {
      insights.push({
        type: 'RAPID_IMPROVEMENT',
        message: 'You\'re improving rapidly! Keep up the excellent work.',
        priority: 'MEDIUM' as const
      });
    }
    
    return insights;
  },

  /**
   * Calculate XP from activity
   */
  calculateXP: (activity: string, performance: number, rarity: keyof typeof ANALYTICS_CONSTANTS.ACHIEVEMENTS.RARITY_MULTIPLIERS = 'COMMON'): number => {
    const baseXP = ANALYTICS_CONSTANTS.ACHIEVEMENTS.XP_VALUES[activity as keyof typeof ANALYTICS_CONSTANTS.ACHIEVEMENTS.XP_VALUES] || 0;
    const multiplier = ANALYTICS_CONSTANTS.ACHIEVEMENTS.RARITY_MULTIPLIERS[rarity];
    const performanceBonus = Math.max(0, (performance - 70) / 30); // Bonus for >70% performance
    
    return Math.round(baseXP * multiplier * (1 + performanceBonus));
  },

  /**
   * Estimate time to goal completion
   */
  estimateGoalCompletion: (currentProgress: number, targetValue: number, dailyRate: number): Date => {
    const remaining = targetValue - currentProgress;
    const daysToComplete = Math.ceil(remaining / Math.max(dailyRate, 0.1));
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);
    
    return completionDate;
  }
} as const;
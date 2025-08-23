/**
 * Learning Goal Setting and Tracking System
 * Provides personalized goal management with progress tracking
 */

import type { SpacedRepetition } from "./shared/types";

// For backward compatibility during transition
type VocabularyCard = SpacedRepetition.VocabularyCard;
type ReviewSession = SpacedRepetition.ReviewSession;
import type { LearningAnalytics } from "./analytics";
import { LearningValidation, ValidationError } from "./shared/validation";

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  target: number;
  currentProgress: number;
  timeframe: GoalTimeframe;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
  completedAt: Date | undefined;
  priority: GoalPriority;

  // Target metrics
  targetMetric: GoalMetric;

  // Motivation elements
  motivation: string;
  reward: string | undefined;

  // Progress tracking
  milestones: GoalMilestone[];
  progressHistory: ProgressEntry[];
}

export const GoalCategory = {
  VOCABULARY: "VOCABULARY", // Learn new words
  ACCURACY: "ACCURACY", // Improve accuracy rates
  CONSISTENCY: "CONSISTENCY", // Daily practice habits
  SPEED: "SPEED", // Response time improvement
  MASTERY: "MASTERY", // Deep understanding
  REVIEW: "REVIEW", // Review frequency
  TIME: "TIME", // Study time goals
} as const;

export type GoalCategory = (typeof GoalCategory)[keyof typeof GoalCategory];

export const GoalType = {
  ACHIEVEMENT: "ACHIEVEMENT", // Reach a specific target
  HABIT: "HABIT", // Build consistent behavior
  IMPROVEMENT: "IMPROVEMENT", // Improve existing metric
  MAINTENANCE: "MAINTENANCE", // Maintain current performance
} as const;

export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const GoalTimeframe = {
  DAILY: "DAILY", // 1 day goals
  WEEKLY: "WEEKLY", // 7 day goals
  MONTHLY: "MONTHLY", // 30 day goals
  QUARTERLY: "QUARTERLY", // 90 day goals
  CUSTOM: "CUSTOM", // User-defined timeframe
} as const;

export type GoalTimeframe = (typeof GoalTimeframe)[keyof typeof GoalTimeframe];

export const GoalPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type GoalPriority = (typeof GoalPriority)[keyof typeof GoalPriority];

export const GoalMetric = {
  WORDS_LEARNED: "WORDS_LEARNED", // Number of new words
  REVIEW_COUNT: "REVIEW_COUNT", // Cards reviewed
  ACCURACY_PERCENTAGE: "ACCURACY_PERCENTAGE", // Accuracy rate
  STUDY_MINUTES: "STUDY_MINUTES", // Time spent studying
  STREAK_DAYS: "STREAK_DAYS", // Consecutive study days
  MASTERY_PERCENTAGE: "MASTERY_PERCENTAGE", // Average mastery level
  SESSION_COUNT: "SESSION_COUNT", // Number of sessions
  SPEED_IMPROVEMENT: "SPEED_IMPROVEMENT", // Response time improvement
} as const;

export type GoalMetric = (typeof GoalMetric)[keyof typeof GoalMetric];

export interface GoalMilestone {
  id: string;
  description: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt: Date | undefined;
  reward: string | undefined;
}

export interface ProgressEntry {
  date: Date;
  value: number;
  notes: string | undefined;
}

export interface GoalRecommendation {
  goalTemplate: Partial<LearningGoal>;
  reason: string;
  priority: GoalPriority;
  estimatedDifficulty: "Easy" | "Medium" | "Hard";
  estimatedTimeToComplete: number; // days
}

export interface GoalProgress {
  goal: LearningGoal;
  progressPercentage: number;
  isOnTrack: boolean;
  daysRemaining: number;
  projectedCompletion: Date | null;
  recentTrend: "Improving" | "Declining" | "Stable";
}

export class LearningGoalEngine {
  /**
   * Generate personalized goal recommendations based on learning analytics
   */
  static generateRecommendations(
    analytics: LearningAnalytics,
    existingGoals: LearningGoal[] = [],
  ): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];

    // Check if user needs vocabulary goals
    if (analytics.totalWordsLearned < 50) {
      recommendations.push({
        goalTemplate: {
          title: "Build Core Vocabulary",
          description: "Learn 25 essential words to build your foundation",
          category: GoalCategory.VOCABULARY,
          type: GoalType.ACHIEVEMENT,
          target: 25,
          timeframe: GoalTimeframe.MONTHLY,
          targetMetric: GoalMetric.WORDS_LEARNED,
          motivation:
            "A strong vocabulary foundation will boost your confidence!",
          priority: GoalPriority.HIGH,
        },
        reason:
          "Building a strong vocabulary foundation is essential for language learning",
        priority: GoalPriority.HIGH,
        estimatedDifficulty: "Medium",
        estimatedTimeToComplete: 30,
      });
    }

    // Check accuracy improvement needs
    if (analytics.overallAccuracy < 75) {
      recommendations.push({
        goalTemplate: {
          title: "Improve Accuracy",
          description: "Reach 80% accuracy in vocabulary reviews",
          category: GoalCategory.ACCURACY,
          type: GoalType.IMPROVEMENT,
          target: 80,
          timeframe: GoalTimeframe.WEEKLY,
          targetMetric: GoalMetric.ACCURACY_PERCENTAGE,
          motivation: "Higher accuracy means better understanding!",
          priority: GoalPriority.MEDIUM,
        },
        reason: "Current accuracy is below optimal learning threshold",
        priority: GoalPriority.MEDIUM,
        estimatedDifficulty: "Medium",
        estimatedTimeToComplete: 14,
      });
    }

    // Check for consistency goals
    if (analytics.dailyStreak < 7) {
      recommendations.push({
        goalTemplate: {
          title: "Build Study Habit",
          description: "Study for 7 days in a row",
          category: GoalCategory.CONSISTENCY,
          type: GoalType.HABIT,
          target: 7,
          timeframe: GoalTimeframe.WEEKLY,
          targetMetric: GoalMetric.STREAK_DAYS,
          motivation: "Consistency is key to language learning success!",
          priority: GoalPriority.HIGH,
        },
        reason: "Regular practice is essential for retention and progress",
        priority: GoalPriority.HIGH,
        estimatedDifficulty: "Easy",
        estimatedTimeToComplete: 7,
      });
    }

    // Advanced goals for experienced learners
    if (analytics.totalWordsLearned > 100) {
      recommendations.push({
        goalTemplate: {
          title: "Speed Master",
          description: "Answer questions in under 3 seconds on average",
          category: GoalCategory.SPEED,
          type: GoalType.IMPROVEMENT,
          target: 3,
          timeframe: GoalTimeframe.WEEKLY,
          targetMetric: GoalMetric.SPEED_IMPROVEMENT,
          motivation: "Quick recall shows true mastery!",
          priority: GoalPriority.LOW,
        },
        reason: "Advanced learners benefit from speed challenges",
        priority: GoalPriority.LOW,
        estimatedDifficulty: "Hard",
        estimatedTimeToComplete: 21,
      });
    }

    // Filter out goals that already exist
    const existingCategories = existingGoals
      .filter((goal) => goal.isActive)
      .map((goal) => goal.category);

    return recommendations.filter(
      (rec) => !existingCategories.includes(rec.goalTemplate.category!),
    );
  }

  /**
   * Create a learning goal from a template with input validation
   * @param template - Partial goal template with basic goal parameters
   * @param customizations - Optional customizations to apply to the goal
   * @throws {ValidationError} When template parameters are invalid
   * @returns A complete learning goal object
   */
  static createGoal(
    template: Partial<LearningGoal>,
    customizations?: Partial<LearningGoal>,
  ): LearningGoal {
    try {
      LearningValidation.validateGoalCreation(template);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(
          `Goal creation failed: ${error.message}`,
          error.field,
          error.value,
        );
      }
      throw error;
    }
    const now = new Date();
    const endDate = this.calculateEndDate(
      now,
      template.timeframe || GoalTimeframe.WEEKLY,
    );

    const goal: LearningGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title || "Custom Goal",
      description: template.description || "Achieve your learning objective",
      category: template.category || GoalCategory.VOCABULARY,
      type: template.type || GoalType.ACHIEVEMENT,
      target: template.target || 10,
      currentProgress: 0,
      timeframe: template.timeframe || GoalTimeframe.WEEKLY,
      startDate: now,
      endDate,
      isActive: true,
      isCompleted: false,
      completedAt: undefined,
      priority: template.priority || GoalPriority.MEDIUM,
      targetMetric: template.targetMetric || GoalMetric.WORDS_LEARNED,
      motivation: template.motivation || "Keep pushing towards your goal!",
      reward: template.reward || undefined,
      milestones: this.generateMilestones(template.target || 10),
      progressHistory: [],
      ...customizations,
    };

    return goal;
  }

  /**
   * Update goal progress based on current learning data
   */
  static updateGoalProgress(
    goals: LearningGoal[],
    vocabularyCards: VocabularyCard[],
    reviewSessions: ReviewSession[],
  ): LearningGoal[] {
    return goals.map((goal) => {
      if (!goal.isActive || goal.isCompleted) {
        return goal;
      }

      const currentProgress = Math.max(
        0,
        this.calculateGoalProgress(goal, vocabularyCards, reviewSessions),
      );
      const wasCompleted = goal.isCompleted;
      const isNowCompleted = currentProgress >= goal.target;

      // Update milestones
      const updatedMilestones = goal.milestones.map((milestone) => ({
        ...milestone,
        isCompleted: currentProgress >= milestone.targetValue,
        completedAt:
          currentProgress >= milestone.targetValue && !milestone.isCompleted
            ? new Date()
            : milestone.completedAt,
      }));

      // Add progress entry if changed
      const progressHistory = [...goal.progressHistory];
      const lastEntry = progressHistory[progressHistory.length - 1];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        !lastEntry ||
        lastEntry.value !== currentProgress ||
        lastEntry.date.toDateString() !== today.toDateString()
      ) {
        progressHistory.push({
          date: new Date(),
          value: currentProgress,
          notes: undefined,
        });
      }

      return {
        ...goal,
        currentProgress,
        isCompleted: isNowCompleted,
        completedAt:
          !wasCompleted && isNowCompleted ? new Date() : goal.completedAt,
        milestones: updatedMilestones,
        progressHistory,
      };
    });
  }

  /**
   * Get goal progress analytics
   */
  static getGoalProgress(goals: LearningGoal[]): GoalProgress[] {
    return goals.map((goal) => {
      const progressPercentage = (goal.currentProgress / goal.target) * 100;
      const now = new Date();
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      // Calculate if on track
      const totalDays = Math.ceil(
        (goal.endDate.getTime() - goal.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const daysPassed = totalDays - daysRemaining;
      const expectedProgress =
        totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
      const isOnTrack = progressPercentage >= expectedProgress * 0.8; // 80% of expected

      // Project completion date
      let projectedCompletion: Date | null = null;
      if (goal.progressHistory.length >= 2) {
        const recentEntries = goal.progressHistory.slice(-7); // Last 7 entries
        const progressRate = this.calculateProgressRate(recentEntries);
        if (progressRate > 0) {
          const remainingProgress = goal.target - goal.currentProgress;
          const daysToComplete = Math.ceil(remainingProgress / progressRate);
          projectedCompletion = new Date(
            now.getTime() + daysToComplete * 24 * 60 * 60 * 1000,
          );
        }
      }

      // Calculate trend
      const recentTrend = this.calculateProgressTrend(goal.progressHistory);

      return {
        goal,
        progressPercentage: Math.max(0, Math.min(progressPercentage, 100)),
        isOnTrack,
        daysRemaining,
        projectedCompletion,
        recentTrend,
      };
    });
  }

  /**
   * Get active goals by category
   */
  static getGoalsByCategory(
    goals: LearningGoal[],
    category: GoalCategory,
  ): LearningGoal[] {
    return goals.filter((goal) => goal.category === category && goal.isActive);
  }

  /**
   * Get completed goals
   */
  static getCompletedGoals(goals: LearningGoal[]): LearningGoal[] {
    return goals.filter((goal) => goal.isCompleted);
  }

  /**
   * Calculate goal statistics
   */
  static calculateStatistics(goals: LearningGoal[]): {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    onTrack: number;
    completionRate: number;
    averageTimeToComplete: number;
  } {
    const active = goals.filter((g) => g.isActive && !g.isCompleted);
    const completed = goals.filter((g) => g.isCompleted);
    const now = new Date();
    const overdue = active.filter((g) => g.endDate < now);

    const goalProgress = this.getGoalProgress(goals);
    const onTrack = goalProgress.filter(
      (gp) => gp.isOnTrack && !gp.goal.isCompleted,
    ).length;

    const completionRate =
      goals.length > 0 ? (completed.length / goals.length) * 100 : 0;

    const completedWithDurations = completed.filter((g) => g.completedAt);
    const averageTimeToComplete =
      completedWithDurations.length > 0
        ? completedWithDurations.reduce((sum, goal) => {
            const duration =
              goal.completedAt!.getTime() - goal.startDate.getTime();
            return sum + duration / (1000 * 60 * 60 * 24);
          }, 0) / completedWithDurations.length
        : 0;

    return {
      total: goals.length,
      active: active.length,
      completed: completed.length,
      overdue: overdue.length,
      onTrack,
      completionRate: Math.round(completionRate),
      averageTimeToComplete: Math.round(averageTimeToComplete),
    };
  }

  // Private helper methods

  private static calculateEndDate(
    startDate: Date,
    timeframe: GoalTimeframe,
  ): Date {
    const endDate = new Date(startDate);

    switch (timeframe) {
      case GoalTimeframe.DAILY:
        endDate.setDate(endDate.getDate() + 1);
        break;
      case GoalTimeframe.WEEKLY:
        endDate.setDate(endDate.getDate() + 7);
        break;
      case GoalTimeframe.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case GoalTimeframe.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      default:
        endDate.setDate(endDate.getDate() + 7);
    }

    return endDate;
  }

  private static generateMilestones(target: number): GoalMilestone[] {
    const milestones: GoalMilestone[] = [];
    const milestoneCount = Math.min(4, Math.max(2, Math.floor(target / 5)));

    for (let i = 1; i <= milestoneCount; i++) {
      const targetValue = Math.round((target / milestoneCount) * i);
      milestones.push({
        id: `milestone_${i}`,
        description: `Reach ${targetValue} progress`,
        targetValue,
        isCompleted: false,
        completedAt: undefined,
        reward: undefined,
      });
    }

    return milestones;
  }

  private static calculateGoalProgress(
    goal: LearningGoal,
    vocabularyCards: VocabularyCard[],
    reviewSessions: ReviewSession[],
  ): number {
    const startTime = goal.startDate.getTime();

    switch (goal.targetMetric) {
      case GoalMetric.WORDS_LEARNED:
        return vocabularyCards.filter(
          (card) =>
            card.totalReviews > 0 &&
            new Date(card.nextReviewDate).getTime() >= startTime,
        ).length;

      case GoalMetric.REVIEW_COUNT:
        return reviewSessions
          .filter((session) => session.startTime >= goal.startDate)
          .reduce((sum, session) => sum + session.cardsReviewed, 0);

      case GoalMetric.ACCURACY_PERCENTAGE:
        const relevantSessions = reviewSessions.filter(
          (s) => s.startTime >= goal.startDate,
        );
        if (relevantSessions.length === 0) return 0;
        const totalCards = relevantSessions.reduce(
          (sum, s) => sum + s.cardsReviewed,
          0,
        );
        const totalCorrect = relevantSessions.reduce(
          (sum, s) => sum + s.cardsCorrect,
          0,
        );
        return totalCards > 0
          ? Math.round((totalCorrect / totalCards) * 100)
          : 0;

      case GoalMetric.STUDY_MINUTES:
        return Math.round(
          reviewSessions
            .filter((session) => session.startTime >= goal.startDate)
            .reduce((sum, session) => sum + session.totalTime / 60000, 0),
        );

      case GoalMetric.STREAK_DAYS:
        return this.calculateStreakFromDate(reviewSessions, goal.startDate);

      case GoalMetric.SESSION_COUNT:
        return reviewSessions.filter(
          (session) => session.startTime >= goal.startDate,
        ).length;

      case GoalMetric.MASTERY_PERCENTAGE:
        const relevantCards = vocabularyCards.filter(
          (card) => card.totalReviews > 0,
        );
        return relevantCards.length > 0
          ? Math.round(
              relevantCards.reduce((sum, card) => sum + card.mastery, 0) /
                relevantCards.length,
            )
          : 0;

      default:
        return 0;
    }
  }

  private static calculateStreakFromDate(
    sessions: ReviewSession[],
    startDate: Date,
  ): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Only count from start date forward
    while (currentDate >= startDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasSessionThisDay = sessions.some(
        (session) =>
          session.startTime >= dayStart && session.startTime <= dayEnd,
      );

      if (hasSessionThisDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateProgressRate(entries: ProgressEntry[]): number {
    if (entries.length < 2) return 0;

    const sortedEntries = entries.sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const first = sortedEntries[0];
    const last = sortedEntries[sortedEntries.length - 1];

    const timeDiff = last.date.getTime() - first.date.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff === 0) return 0;

    const progressDiff = last.value - first.value;
    return progressDiff / daysDiff;
  }

  private static calculateProgressTrend(
    entries: ProgressEntry[],
  ): "Improving" | "Declining" | "Stable" {
    if (entries.length < 3) return "Stable";

    const recentEntries = entries.slice(-5); // Last 5 entries
    const progressRate = this.calculateProgressRate(recentEntries);

    if (progressRate > 0.1) return "Improving";
    if (progressRate < -0.1) return "Declining";
    return "Stable";
  }
}

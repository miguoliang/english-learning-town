/**
 * Achievement System for Educational Progress
 * Tracks learning milestones and motivational rewards
 */

import type { SpacedRepetition } from "./shared/types";

// For backward compatibility during transition
type VocabularyCard = SpacedRepetition.VocabularyCard;
type ReviewSession = SpacedRepetition.ReviewSession;

export interface EducationalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt: Date | undefined;

  // Achievement requirements
  requirement: AchievementRequirement;

  // Progress tracking
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  isSecret: boolean; // Hidden until requirements are met
}

export const AchievementCategory = {
  VOCABULARY: "VOCABULARY", // Learning new words
  ACCURACY: "ACCURACY", // High accuracy rates
  CONSISTENCY: "CONSISTENCY", // Daily streaks and habits
  SPEED: "SPEED", // Fast response times
  MASTERY: "MASTERY", // Deep understanding
  EXPLORATION: "EXPLORATION", // Trying new features
  SOCIAL: "SOCIAL", // Community engagement
  MILESTONE: "MILESTONE", // Major accomplishments
} as const;

export type AchievementCategory =
  (typeof AchievementCategory)[keyof typeof AchievementCategory];

export const AchievementRarity = {
  COMMON: "COMMON", // Easy to achieve, frequent rewards
  UNCOMMON: "UNCOMMON", // Moderate effort required
  RARE: "RARE", // Significant accomplishment
  EPIC: "EPIC", // Major milestone
  LEGENDARY: "LEGENDARY", // Exceptional achievement
} as const;

export type AchievementRarity =
  (typeof AchievementRarity)[keyof typeof AchievementRarity];

export interface AchievementRequirement {
  type: RequirementType;
  value: number;
  timeframe?: "daily" | "weekly" | "monthly" | "alltime";
  additionalCriteria?: Record<string, any>;
}

export const RequirementType = {
  WORDS_LEARNED: "WORDS_LEARNED", // Total vocabulary learned
  STREAK_DAYS: "STREAK_DAYS", // Consecutive study days
  ACCURACY_RATE: "ACCURACY_RATE", // Percentage accuracy
  FAST_ANSWERS: "FAST_ANSWERS", // Answers under time threshold
  PERFECT_SESSIONS: "PERFECT_SESSIONS", // 100% accuracy sessions
  STUDY_TIME: "STUDY_TIME", // Total minutes studied
  REVIEW_COUNT: "REVIEW_COUNT", // Cards reviewed
  MASTERY_LEVEL: "MASTERY_LEVEL", // Average mastery percentage
  SESSIONS_COMPLETED: "SESSIONS_COMPLETED", // Total sessions finished
  DIFFICULTY_COMPLETED: "DIFFICULTY_COMPLETED", // Specific difficulty level
} as const;

export type RequirementType =
  (typeof RequirementType)[keyof typeof RequirementType];

export class AchievementEngine {
  /**
   * Default achievement definitions for educational progress
   */
  static getDefaultAchievements(): EducationalAchievement[] {
    return [
      // Vocabulary Achievements
      {
        id: "first_word",
        title: "First Steps",
        description: "Learn your first vocabulary word",
        icon: "🌱",
        category: AchievementCategory.VOCABULARY,
        rarity: AchievementRarity.COMMON,
        xpReward: 50,
        requirement: { type: RequirementType.WORDS_LEARNED, value: 1 },
        currentProgress: 0,
        targetProgress: 1,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "vocabulary_collector",
        title: "Word Collector",
        description: "Learn 25 vocabulary words",
        icon: "📚",
        category: AchievementCategory.VOCABULARY,
        rarity: AchievementRarity.UNCOMMON,
        xpReward: 200,
        requirement: { type: RequirementType.WORDS_LEARNED, value: 25 },
        currentProgress: 0,
        targetProgress: 25,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "vocabulary_master",
        title: "Vocabulary Master",
        description: "Learn 100 vocabulary words",
        icon: "🎓",
        category: AchievementCategory.VOCABULARY,
        rarity: AchievementRarity.RARE,
        xpReward: 500,
        requirement: { type: RequirementType.WORDS_LEARNED, value: 100 },
        currentProgress: 0,
        targetProgress: 100,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "word_wizard",
        title: "Word Wizard",
        description: "Learn 500 vocabulary words",
        icon: "🧙‍♂️",
        category: AchievementCategory.VOCABULARY,
        rarity: AchievementRarity.LEGENDARY,
        xpReward: 2000,
        requirement: { type: RequirementType.WORDS_LEARNED, value: 500 },
        currentProgress: 0,
        targetProgress: 500,
        isUnlocked: false,
        isSecret: true,
        unlockedAt: undefined,
      },

      // Streak Achievements
      {
        id: "daily_learner",
        title: "Daily Learner",
        description: "Study for 3 days in a row",
        icon: "🔥",
        category: AchievementCategory.CONSISTENCY,
        rarity: AchievementRarity.COMMON,
        xpReward: 100,
        requirement: { type: RequirementType.STREAK_DAYS, value: 3 },
        currentProgress: 0,
        targetProgress: 3,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "week_warrior",
        title: "Week Warrior",
        description: "Study for 7 days in a row",
        icon: "⚔️",
        category: AchievementCategory.CONSISTENCY,
        rarity: AchievementRarity.UNCOMMON,
        xpReward: 300,
        requirement: { type: RequirementType.STREAK_DAYS, value: 7 },
        currentProgress: 0,
        targetProgress: 7,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "month_master",
        title: "Month Master",
        description: "Study for 30 days in a row",
        icon: "👑",
        category: AchievementCategory.CONSISTENCY,
        rarity: AchievementRarity.EPIC,
        xpReward: 1000,
        requirement: { type: RequirementType.STREAK_DAYS, value: 30 },
        currentProgress: 0,
        targetProgress: 30,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      // Accuracy Achievements
      {
        id: "sharpshooter",
        title: "Sharpshooter",
        description: "Achieve 90% accuracy in a session",
        icon: "🎯",
        category: AchievementCategory.ACCURACY,
        rarity: AchievementRarity.UNCOMMON,
        xpReward: 150,
        requirement: { type: RequirementType.ACCURACY_RATE, value: 90 },
        currentProgress: 0,
        targetProgress: 90,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "perfectionist",
        title: "Perfectionist",
        description: "Complete 5 perfect sessions (100% accuracy)",
        icon: "💯",
        category: AchievementCategory.ACCURACY,
        rarity: AchievementRarity.RARE,
        xpReward: 400,
        requirement: { type: RequirementType.PERFECT_SESSIONS, value: 5 },
        currentProgress: 0,
        targetProgress: 5,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      // Speed Achievements
      {
        id: "quick_thinker",
        title: "Quick Thinker",
        description: "Answer 50 questions in under 3 seconds each",
        icon: "⚡",
        category: AchievementCategory.SPEED,
        rarity: AchievementRarity.UNCOMMON,
        xpReward: 200,
        requirement: {
          type: RequirementType.FAST_ANSWERS,
          value: 50,
          additionalCriteria: { maxTime: 3000 },
        },
        currentProgress: 0,
        targetProgress: 50,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      // Mastery Achievements
      {
        id: "knowledge_keeper",
        title: "Knowledge Keeper",
        description: "Achieve 80% average mastery across all words",
        icon: "🧠",
        category: AchievementCategory.MASTERY,
        rarity: AchievementRarity.EPIC,
        xpReward: 750,
        requirement: { type: RequirementType.MASTERY_LEVEL, value: 80 },
        currentProgress: 0,
        targetProgress: 80,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      // Milestone Achievements
      {
        id: "session_starter",
        title: "Session Starter",
        description: "Complete your first learning session",
        icon: "🚀",
        category: AchievementCategory.MILESTONE,
        rarity: AchievementRarity.COMMON,
        xpReward: 75,
        requirement: { type: RequirementType.SESSIONS_COMPLETED, value: 1 },
        currentProgress: 0,
        targetProgress: 1,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },

      {
        id: "century_scholar",
        title: "Century Scholar",
        description: "Complete 100 learning sessions",
        icon: "📖",
        category: AchievementCategory.MILESTONE,
        rarity: AchievementRarity.EPIC,
        xpReward: 1200,
        requirement: { type: RequirementType.SESSIONS_COMPLETED, value: 100 },
        currentProgress: 0,
        targetProgress: 100,
        isUnlocked: false,
        isSecret: false,
        unlockedAt: undefined,
      },
    ];
  }

  /**
   * Calculate progress for all achievements based on current data
   */
  static calculateProgress(
    achievements: EducationalAchievement[],
    vocabularyCards: VocabularyCard[],
    reviewSessions: ReviewSession[],
  ): EducationalAchievement[] {
    return achievements.map((achievement) => {
      const progress = this.calculateAchievementProgress(
        achievement,
        vocabularyCards,
        reviewSessions,
      );

      const wasUnlocked = achievement.isUnlocked;
      const isNowUnlocked = progress >= achievement.targetProgress;

      return {
        ...achievement,
        currentProgress: progress,
        isUnlocked: isNowUnlocked,
        unlockedAt:
          !wasUnlocked && isNowUnlocked ? new Date() : achievement.unlockedAt,
      };
    });
  }

  /**
   * Calculate progress for a specific achievement
   */
  private static calculateAchievementProgress(
    achievement: EducationalAchievement,
    vocabularyCards: VocabularyCard[],
    reviewSessions: ReviewSession[],
  ): number {
    const { requirement } = achievement;

    switch (requirement.type) {
      case RequirementType.WORDS_LEARNED:
        return vocabularyCards.filter((card) => card.totalReviews > 0).length;

      case RequirementType.STREAK_DAYS:
        return this.calculateCurrentStreak(reviewSessions);

      case RequirementType.ACCURACY_RATE:
        const overallAccuracy = this.calculateOverallAccuracy(reviewSessions);
        return Math.round(overallAccuracy);

      case RequirementType.FAST_ANSWERS:
        const maxTime = requirement.additionalCriteria?.maxTime || 3000;
        return this.countFastAnswers(vocabularyCards, maxTime);

      case RequirementType.PERFECT_SESSIONS:
        return reviewSessions.filter(
          (session) =>
            session.cardsReviewed > 0 &&
            session.cardsCorrect === session.cardsReviewed,
        ).length;

      case RequirementType.STUDY_TIME:
        return Math.round(
          reviewSessions.reduce(
            (total, session) => total + session.totalTime / 60000,
            0,
          ),
        );

      case RequirementType.REVIEW_COUNT:
        return reviewSessions.reduce(
          (total, session) => total + session.cardsReviewed,
          0,
        );

      case RequirementType.MASTERY_LEVEL:
        const avgMastery =
          vocabularyCards.length > 0
            ? vocabularyCards.reduce((sum, card) => sum + card.mastery, 0) /
              vocabularyCards.length
            : 0;
        return Math.round(avgMastery);

      case RequirementType.SESSIONS_COMPLETED:
        return reviewSessions.length;

      default:
        return 0;
    }
  }

  /**
   * Get newly unlocked achievements
   */
  static getNewlyUnlocked(
    oldAchievements: EducationalAchievement[],
    newAchievements: EducationalAchievement[],
  ): EducationalAchievement[] {
    return newAchievements.filter((newAch) => {
      const oldAch = oldAchievements.find((old) => old.id === newAch.id);
      return newAch.isUnlocked && (!oldAch || !oldAch.isUnlocked);
    });
  }

  /**
   * Get achievements by category
   */
  static getByCategory(
    achievements: EducationalAchievement[],
    category: AchievementCategory,
  ): EducationalAchievement[] {
    return achievements.filter(
      (achievement) => achievement.category === category,
    );
  }

  /**
   * Get achievements by rarity
   */
  static getByRarity(
    achievements: EducationalAchievement[],
    rarity: AchievementRarity,
  ): EducationalAchievement[] {
    return achievements.filter((achievement) => achievement.rarity === rarity);
  }

  /**
   * Get next achievements to unlock (closest to completion)
   */
  static getNextToUnlock(
    achievements: EducationalAchievement[],
    count: number = 3,
  ): EducationalAchievement[] {
    return achievements
      .filter((achievement) => !achievement.isUnlocked)
      .sort((a, b) => {
        const aProgress = a.currentProgress / a.targetProgress;
        const bProgress = b.currentProgress / b.targetProgress;
        return bProgress - aProgress;
      })
      .slice(0, count);
  }

  /**
   * Calculate total XP earned from achievements
   */
  static calculateTotalXP(achievements: EducationalAchievement[]): number {
    return achievements
      .filter((achievement) => achievement.isUnlocked)
      .reduce((total, achievement) => total + achievement.xpReward, 0);
  }

  /**
   * Get achievement statistics
   */
  static getStatistics(achievements: EducationalAchievement[]): {
    total: number;
    unlocked: number;
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
    totalXP: number;
    categories: Record<string, { total: number; unlocked: number }>;
  } {
    const unlocked = achievements.filter((a) => a.isUnlocked);

    const rarityCount = (rarity: AchievementRarity) =>
      achievements.filter((a) => a.rarity === rarity).length;

    const categories: Record<string, { total: number; unlocked: number }> = {};
    Object.values(AchievementCategory).forEach((category) => {
      const categoryAchievements = achievements.filter(
        (a) => a.category === category,
      );
      categories[category] = {
        total: categoryAchievements.length,
        unlocked: categoryAchievements.filter((a) => a.isUnlocked).length,
      };
    });

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      common: rarityCount(AchievementRarity.COMMON),
      uncommon: rarityCount(AchievementRarity.UNCOMMON),
      rare: rarityCount(AchievementRarity.RARE),
      epic: rarityCount(AchievementRarity.EPIC),
      legendary: rarityCount(AchievementRarity.LEGENDARY),
      totalXP: this.calculateTotalXP(achievements),
      categories,
    };
  }

  // Helper methods
  private static calculateCurrentStreak(sessions: ReviewSession[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
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

  private static calculateOverallAccuracy(sessions: ReviewSession[]): number {
    if (sessions.length === 0) return 0;

    const totalCards = sessions.reduce(
      (sum, session) => sum + session.cardsReviewed,
      0,
    );
    const totalCorrect = sessions.reduce(
      (sum, session) => sum + session.cardsCorrect,
      0,
    );

    return totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0;
  }

  private static countFastAnswers(
    cards: VocabularyCard[],
    maxTime: number,
  ): number {
    return cards.reduce((count, card) => {
      return (
        count + (card.averageResponseTime <= maxTime ? card.totalReviews : 0)
      );
    }, 0);
  }
}

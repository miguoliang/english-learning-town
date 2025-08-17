/**
 * Motivation and Reward System
 * Gamifies the learning experience with dynamic rewards and motivation techniques
 */

import type { EducationalAchievement } from './achievements';
import type { LearningGoal } from './goalSetting';
import type { LearningAnalytics } from './analytics';
import { LearningValidation, ValidationError } from '../shared/validation';

export interface MotivationProfile {
  id: string;
  userId: string;
  
  // Motivation preferences
  preferredRewardTypes: RewardType[];
  motivationStyle: MotivationStyle;
  encouragementLevel: EncouragementLevel;
  
  // Current status
  currentStreak: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  
  // Engagement metrics
  engagementScore: number;
  lastActiveDate: Date;
  averageSessionLength: number;
  weeklyGoalProgress: number;
  
  // Reward preferences
  favoriteRewards: string[];
  unlockedRewards: string[];
  pendingRewards: Reward[];
}

export const MotivationStyle = {
  ACHIEVER: 'ACHIEVER',           // Driven by accomplishments and mastery
  SOCIALIZER: 'SOCIALIZER',       // Motivated by community and sharing
  EXPLORER: 'EXPLORER',           // Enjoys discovery and variety
  COMPETITOR: 'COMPETITOR',       // Thrives on competition and ranking
  COMPLETIONIST: 'COMPLETIONIST'  // Wants to finish everything
} as const;

export type MotivationStyle = typeof MotivationStyle[keyof typeof MotivationStyle];

export const EncouragementLevel = {
  MINIMAL: 'MINIMAL',     // Just the facts
  MODERATE: 'MODERATE',   // Balanced encouragement
  HIGH: 'HIGH',           // Lots of positive reinforcement
  MAXIMUM: 'MAXIMUM'      // Constant celebration
} as const;

export type EncouragementLevel = typeof EncouragementLevel[keyof typeof EncouragementLevel];

export const RewardType = {
  XP_BONUS: 'XP_BONUS',           // Extra experience points
  BADGE: 'BADGE',                 // Digital badges/achievements
  AVATAR_ITEM: 'AVATAR_ITEM',     // Cosmetic items for avatar
  THEME_UNLOCK: 'THEME_UNLOCK',   // New visual themes
  FEATURE_UNLOCK: 'FEATURE_UNLOCK', // Access to new features
  TITLE: 'TITLE',                 // Special titles/ranks
  CERTIFICATE: 'CERTIFICATE',     // Learning certificates
  STREAK_REWARD: 'STREAK_REWARD', // Streak-based rewards
  MILESTONE_REWARD: 'MILESTONE_REWARD' // Major milestone rewards
} as const;

export type RewardType = typeof RewardType[keyof typeof RewardType];

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  icon: string;
  xpValue: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  conditions: RewardCondition[];
  
  // Reward content
  content?: {
    imageUrl?: string;
    certificateTemplate?: string;
    themeData?: any;
    avatarItem?: any;
  };
}

export const RewardRarity = {
  COMMON: 'COMMON',       // Frequent rewards
  UNCOMMON: 'UNCOMMON',   // Weekly rewards
  RARE: 'RARE',          // Monthly rewards
  EPIC: 'EPIC',          // Major milestones
  LEGENDARY: 'LEGENDARY'  // Exceptional achievements
} as const;

export type RewardRarity = typeof RewardRarity[keyof typeof RewardRarity];

export interface RewardCondition {
  type: ConditionType;
  value: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'alltime';
  metadata?: Record<string, any>;
}

export const ConditionType = {
  WORDS_LEARNED: 'WORDS_LEARNED',
  STREAK_ACHIEVED: 'STREAK_ACHIEVED',
  ACCURACY_MAINTAINED: 'ACCURACY_MAINTAINED',
  GOALS_COMPLETED: 'GOALS_COMPLETED',
  ACHIEVEMENTS_UNLOCKED: 'ACHIEVEMENTS_UNLOCKED',
  STUDY_TIME: 'STUDY_TIME',
  PERFECT_SESSIONS: 'PERFECT_SESSIONS',
  CONSECUTIVE_DAYS: 'CONSECUTIVE_DAYS'
} as const;

export type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export interface MotivationalMessage {
  id: string;
  type: MessageType;
  title: string;
  message: string;
  emoji: string;
  motivationStyle: MotivationStyle[];
  encouragementLevel: EncouragementLevel[];
  context: MessageContext;
  priority: MessagePriority;
}

export const MessageType = {
  ENCOURAGEMENT: 'ENCOURAGEMENT',     // General encouragement
  CELEBRATION: 'CELEBRATION',         // Achievement celebration
  MILESTONE: 'MILESTONE',             // Progress milestone
  STREAK: 'STREAK',                   // Streak-related
  COMEBACK: 'COMEBACK',               // Return after absence
  CHALLENGE: 'CHALLENGE',             // Gentle challenge
  TIP: 'TIP',                         // Learning tip
  REMINDER: 'REMINDER'                // Gentle reminder
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageContext = {
  SESSION_START: 'SESSION_START',
  SESSION_END: 'SESSION_END',
  ACHIEVEMENT_UNLOCK: 'ACHIEVEMENT_UNLOCK',
  GOAL_PROGRESS: 'GOAL_PROGRESS',
  STREAK_MILESTONE: 'STREAK_MILESTONE',
  RETURN_AFTER_BREAK: 'RETURN_AFTER_BREAK',
  DIFFICULTY_INCREASE: 'DIFFICULTY_INCREASE',
  ACCURACY_IMPROVEMENT: 'ACCURACY_IMPROVEMENT'
} as const;

export type MessageContext = typeof MessageContext[keyof typeof MessageContext];

export const MessagePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

export type MessagePriority = typeof MessagePriority[keyof typeof MessagePriority];

export interface StreakBonus {
  day: number;
  xpMultiplier: number;
  specialReward?: Reward;
  message: string;
}

export class MotivationEngine {
  
  /**
   * Create a motivation profile for a new user
   */
  static createProfile(userId: string, preferences?: Partial<MotivationProfile>): MotivationProfile {
    return {
      id: `profile_${userId}_${Date.now()}`,
      userId,
      preferredRewardTypes: preferences?.preferredRewardTypes || [
        RewardType.XP_BONUS,
        RewardType.BADGE,
        RewardType.STREAK_REWARD
      ],
      motivationStyle: preferences?.motivationStyle || MotivationStyle.ACHIEVER,
      encouragementLevel: preferences?.encouragementLevel || EncouragementLevel.MODERATE,
      currentStreak: 0,
      totalXP: 0,
      level: 1,
      xpToNextLevel: 100,
      engagementScore: 50,
      lastActiveDate: new Date(),
      averageSessionLength: 0,
      weeklyGoalProgress: 0,
      favoriteRewards: [],
      unlockedRewards: [],
      pendingRewards: []
    };
  }
  
  /**
   * Calculate level progression based on XP
   */
  static calculateLevel(totalXP: number): { level: number; xpToNextLevel: number } {
    // Progressive XP requirements: 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250...
    let level = 1;
    let xpRequired = 0;
    let nextLevelXP = 100;
    
    while (totalXP >= nextLevelXP) {
      xpRequired = nextLevelXP;
      level++;
      // Each level requires 50 more XP than the previous level's increment
      const increment = 100 + (level - 2) * 50;
      nextLevelXP = xpRequired + increment;
    }
    
    return {
      level,
      xpToNextLevel: nextLevelXP - totalXP
    };
  }
  
  /**
   * Get default reward catalog
   */
  static getDefaultRewards(): Reward[] {
    return [
      // Streak Rewards
      {
        id: 'streak_3_badge',
        title: 'Three Day Streak',
        description: 'Studied for 3 consecutive days',
        type: RewardType.BADGE,
        rarity: RewardRarity.COMMON,
        icon: '🔥',
        xpValue: 50,
        isUnlocked: false,
        conditions: [{ type: ConditionType.STREAK_ACHIEVED, value: 3 }]
      },
      
      {
        id: 'streak_7_theme',
        title: 'Ocean Theme',
        description: 'Unlock the calming ocean theme',
        type: RewardType.THEME_UNLOCK,
        rarity: RewardRarity.UNCOMMON,
        icon: '🌊',
        xpValue: 100,
        isUnlocked: false,
        conditions: [{ type: ConditionType.STREAK_ACHIEVED, value: 7 }],
        content: { themeData: { name: 'ocean', colors: ['#0077be', '#00b4d8'] } }
      },
      
      {
        id: 'streak_30_certificate',
        title: 'Consistency Master',
        description: 'Certificate for 30-day learning streak',
        type: RewardType.CERTIFICATE,
        rarity: RewardRarity.EPIC,
        icon: '📜',
        xpValue: 500,
        isUnlocked: false,
        conditions: [{ type: ConditionType.STREAK_ACHIEVED, value: 30 }]
      },
      
      // Learning Milestones
      {
        id: 'words_25_badge',
        title: 'Vocabulary Builder',
        description: 'Learned 25 new words',
        type: RewardType.BADGE,
        rarity: RewardRarity.COMMON,
        icon: '📚',
        xpValue: 75,
        isUnlocked: false,
        conditions: [{ type: ConditionType.WORDS_LEARNED, value: 25 }]
      },
      
      {
        id: 'words_100_title',
        title: 'Word Collector',
        description: 'Special title for learning 100 words',
        type: RewardType.TITLE,
        rarity: RewardRarity.RARE,
        icon: '🎓',
        xpValue: 200,
        isUnlocked: false,
        conditions: [{ type: ConditionType.WORDS_LEARNED, value: 100 }]
      },
      
      {
        id: 'words_500_avatar',
        title: 'Scholar Outfit',
        description: 'Exclusive scholar avatar outfit',
        type: RewardType.AVATAR_ITEM,
        rarity: RewardRarity.LEGENDARY,
        icon: '👨‍🎓',
        xpValue: 1000,
        isUnlocked: false,
        conditions: [{ type: ConditionType.WORDS_LEARNED, value: 500 }]
      },
      
      // Accuracy Rewards
      {
        id: 'accuracy_90_badge',
        title: 'Precision Learner',
        description: 'Maintained 90% accuracy',
        type: RewardType.BADGE,
        rarity: RewardRarity.UNCOMMON,
        icon: '🎯',
        xpValue: 125,
        isUnlocked: false,
        conditions: [{ type: ConditionType.ACCURACY_MAINTAINED, value: 90 }]
      },
      
      {
        id: 'perfect_sessions_5',
        title: 'Perfectionist',
        description: 'Completed 5 perfect sessions',
        type: RewardType.XP_BONUS,
        rarity: RewardRarity.RARE,
        icon: '💯',
        xpValue: 300,
        isUnlocked: false,
        conditions: [{ type: ConditionType.PERFECT_SESSIONS, value: 5 }]
      }
    ];
  }
  
  /**
   * Update motivation profile based on recent activity with input validation
   * @param profile - The motivation profile to update
   * @param analytics - Learning analytics data
   * @param _achievements - Educational achievements (unused)
   * @param goals - Learning goals array
   * @throws {ValidationError} When input parameters are invalid
   * @returns Updated motivation profile
   */
  static updateProfile(
    profile: MotivationProfile,
    analytics: LearningAnalytics,
    _achievements: EducationalAchievement[],
    goals: LearningGoal[]
  ): MotivationProfile {
    try {
      LearningValidation.validateMotivationProfile(profile);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Profile update failed: ${error.message}`, error.field, error.value);
      }
      throw error;
    }
    const { level, xpToNextLevel } = this.calculateLevel(profile.totalXP);
    
    // Calculate engagement score based on multiple factors
    const engagementScore = this.calculateEngagementScore(analytics, profile);
    
    // Update weekly goal progress
    const weeklyGoalProgress = this.calculateWeeklyGoalProgress(goals);
    
    return {
      ...profile,
      currentStreak: analytics.dailyStreak,
      level,
      xpToNextLevel,
      engagementScore,
      lastActiveDate: new Date(),
      averageSessionLength: analytics.averageSessionLength,
      weeklyGoalProgress
    };
  }
  
  /**
   * Check for newly unlocked rewards
   */
  static checkRewardUnlocks(
    profile: MotivationProfile,
    analytics: LearningAnalytics,
    achievements: EducationalAchievement[],
    rewards: Reward[] = this.getDefaultRewards()
  ): { profile: MotivationProfile; newRewards: Reward[] } {
    const newRewards: Reward[] = [];
    rewards.map(reward => {
      if (reward.isUnlocked || profile.unlockedRewards.includes(reward.id)) {
        return reward;
      }
      
      const isUnlocked = this.checkRewardConditions(reward, analytics, achievements);
      
      if (isUnlocked) {
        newRewards.push(reward);
        return { ...reward, isUnlocked: true, unlockedAt: new Date() };
      }
      
      return reward;
    });
    
    const updatedProfile = {
      ...profile,
      unlockedRewards: [...profile.unlockedRewards, ...newRewards.map(r => r.id)],
      totalXP: profile.totalXP + newRewards.reduce((sum, r) => sum + r.xpValue, 0)
    };
    
    return { profile: updatedProfile, newRewards };
  }
  
  /**
   * Generate motivational messages based on context
   */
  static generateMotivationalMessage(
    profile: MotivationProfile,
    context: MessageContext,
    analytics?: LearningAnalytics
  ): MotivationalMessage | null {
    const messages = this.getMotivationalMessages();
    
    const relevantMessages = messages.filter(msg => 
      msg.context === context &&
      msg.motivationStyle.includes(profile.motivationStyle) &&
      msg.encouragementLevel.includes(profile.encouragementLevel)
    );
    
    if (relevantMessages.length === 0) return null;
    
    // Select message based on context and recent performance
    const message = this.selectBestMessage(relevantMessages, profile, analytics);
    
    return message;
  }
  
  /**
   * Calculate streak bonuses
   */
  static getStreakBonuses(): StreakBonus[] {
    return [
      { day: 3, xpMultiplier: 1.1, message: "Three days strong! 🔥" },
      { day: 7, xpMultiplier: 1.25, message: "One week of dedication! ⭐" },
      { day: 14, xpMultiplier: 1.5, message: "Two weeks of consistency! 🌟" },
      { day: 21, xpMultiplier: 1.75, message: "Three weeks of excellence! 💫" },
      { day: 30, xpMultiplier: 2.0, message: "One month of mastery! 🏆" },
      { day: 60, xpMultiplier: 2.5, message: "Two months of triumph! 👑" },
      { day: 100, xpMultiplier: 3.0, message: "One hundred days of dedication! 🎉" }
    ];
  }
  
  /**
   * Get current streak bonus
   */
  static getCurrentStreakBonus(streak: number): StreakBonus | null {
    const bonuses = this.getStreakBonuses();
    return bonuses
      .filter(bonus => streak >= bonus.day)
      .sort((a, b) => b.day - a.day)[0] || null;
  }
  
  /**
   * Calculate daily XP with bonuses
   */
  static calculateDailyXP(
    baseXP: number,
    streak: number,
    perfectSessions: number = 0,
    achievements: number = 0
  ): { totalXP: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {
      base: baseXP
    };
    
    let totalXP = baseXP;
    
    // Streak bonus
    const streakBonus = this.getCurrentStreakBonus(streak);
    if (streakBonus) {
      const bonus = Math.round(baseXP * (streakBonus.xpMultiplier - 1));
      breakdown.streak = bonus;
      totalXP += bonus;
    }
    
    // Perfect session bonus
    if (perfectSessions > 0) {
      const bonus = perfectSessions * 25;
      breakdown.perfectSessions = bonus;
      totalXP += bonus;
    }
    
    // Achievement bonus
    if (achievements > 0) {
      const bonus = achievements * 50;
      breakdown.achievements = bonus;
      totalXP += bonus;
    }
    
    return { totalXP, breakdown };
  }
  
  // Private helper methods
  
  private static calculateEngagementScore(
    analytics: LearningAnalytics,
    profile: MotivationProfile
  ): number {
    let score = 50; // Base score
    
    // Streak contribution (0-25 points)
    score += Math.min(analytics.dailyStreak * 2, 25);
    
    // Accuracy contribution (0-20 points)
    score += Math.round(analytics.overallAccuracy * 0.2);
    
    // Consistency contribution (0-15 points)
    const weeklyGoalAchievement = analytics.weeklyProgress / 100;
    score += Math.round(weeklyGoalAchievement * 15);
    
    // Recent activity contribution (-10 to +10 points)
    const daysSinceLastActive = Math.floor(
      (Date.now() - profile.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastActive === 0) score += 10;
    else if (daysSinceLastActive === 1) score += 5;
    else if (daysSinceLastActive > 7) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private static calculateWeeklyGoalProgress(goals: LearningGoal[]): number {
    const weeklyGoals = goals.filter(goal => 
      goal.timeframe === 'WEEKLY' && goal.isActive && !goal.isCompleted
    );
    
    if (weeklyGoals.length === 0) return 100;
    
    const totalProgress = weeklyGoals.reduce((sum, goal) => 
      sum + (goal.currentProgress / goal.target) * 100, 0
    );
    
    return Math.round(totalProgress / weeklyGoals.length);
  }
  
  private static checkRewardConditions(
    reward: Reward,
    analytics: LearningAnalytics,
    achievements: EducationalAchievement[]
  ): boolean {
    return reward.conditions.every(condition => {
      switch (condition.type) {
        case ConditionType.WORDS_LEARNED:
          return analytics.totalWordsLearned >= condition.value;
        case ConditionType.STREAK_ACHIEVED:
          return analytics.dailyStreak >= condition.value;
        case ConditionType.ACCURACY_MAINTAINED:
          return analytics.overallAccuracy >= condition.value;
        case ConditionType.ACHIEVEMENTS_UNLOCKED:
          return achievements.filter(a => a.isUnlocked).length >= condition.value;
        case ConditionType.PERFECT_SESSIONS:
          // This would need to be tracked in analytics
          return true; // Placeholder
        default:
          return false;
      }
    });
  }
  
  private static getMotivationalMessages(): MotivationalMessage[] {
    return [
      {
        id: 'session_start_achiever',
        type: MessageType.ENCOURAGEMENT,
        title: 'Ready to Excel!',
        message: "Time to build on your progress and reach new heights!",
        emoji: '🚀',
        motivationStyle: [MotivationStyle.ACHIEVER],
        encouragementLevel: [EncouragementLevel.MODERATE, EncouragementLevel.HIGH],
        context: MessageContext.SESSION_START,
        priority: MessagePriority.MEDIUM
      },
      
      {
        id: 'streak_milestone_celebration',
        type: MessageType.CELEBRATION,
        title: 'Streak Milestone!',
        message: "Your consistency is paying off! Keep this momentum going!",
        emoji: '🔥',
        motivationStyle: [MotivationStyle.ACHIEVER, MotivationStyle.COMPLETIONIST],
        encouragementLevel: [EncouragementLevel.HIGH, EncouragementLevel.MAXIMUM],
        context: MessageContext.STREAK_MILESTONE,
        priority: MessagePriority.HIGH
      },
      
      {
        id: 'comeback_welcome',
        type: MessageType.COMEBACK,
        title: 'Welcome Back!',
        message: "Ready to jump back into learning? Every step counts!",
        emoji: '👋',
        motivationStyle: [MotivationStyle.ACHIEVER, MotivationStyle.EXPLORER],
        encouragementLevel: [EncouragementLevel.MODERATE, EncouragementLevel.HIGH],
        context: MessageContext.RETURN_AFTER_BREAK,
        priority: MessagePriority.HIGH
      }
    ];
  }
  
  private static selectBestMessage(
    messages: MotivationalMessage[],
    _profile: MotivationProfile,
    _analytics?: LearningAnalytics
  ): MotivationalMessage {
    // Simple selection for now - could be enhanced with ML
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
/**
 * Learning Analytics System
 * Tracks learning progress, identifies patterns, and provides insights
 */

import type { VocabularyCard, ReviewSession } from './spacedRepetition';
import { LearningValidation, ValidationError } from './validation';

export interface LearningAnalytics {
  // Overall progress
  totalWordsLearned: number;
  activeCards: number;
  masteredCards: number;
  averageMastery: number;
  overallAccuracy: number;
  
  // Time-based metrics
  dailyStreak: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
  totalStudyTime: number; // minutes
  averageSessionLength: number; // minutes
  
  // Learning patterns
  bestTimeOfDay: string;
  mostDifficultWords: VocabularyCard[];
  strongestCategories: string[];
  weakestCategories: string[];
  learningVelocity: number; // words per week
  
  // Predictions
  readinessLevel: number; // 0-100% ready for new challenges
  suggestedDailyGoal: number;
  estimatedTimeToMastery: number; // days
  
  // Achievements
  weeklyAchievements: Achievement[];
  streakMilestones: number[];
  improvementAreas: string[];
}

export interface LearningInsight {
  type: InsightType;
  title: string;
  description: string;
  actionable: string;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

export const InsightType = {
  PROGRESS: 'PROGRESS',           // Progress updates
  RECOMMENDATION: 'RECOMMENDATION', // Learning recommendations
  WARNING: 'WARNING',             // Potential issues
  CELEBRATION: 'CELEBRATION',      // Achievements
  TIP: 'TIP'                     // Learning tips
} as const;

export type InsightType = typeof InsightType[keyof typeof InsightType];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'vocabulary' | 'streak' | 'accuracy' | 'time' | 'milestone';
}

export class LearningAnalyticsEngine {
  
  /**
   * Generate comprehensive learning analytics with input validation
   * @param cards - Array of vocabulary cards to analyze
   * @param sessions - Array of review sessions to analyze
   * @throws {ValidationError} When input parameters are invalid
   * @returns Comprehensive learning analytics data
   */
  static generateAnalytics(
    cards: VocabularyCard[], 
    sessions: ReviewSession[]
  ): LearningAnalytics {
    try {
      LearningValidation.validateAnalyticsInput(cards, sessions);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Analytics generation failed: ${error.message}`, error.field, error.value);
      }
      throw error;
    }
    const totalWordsLearned = cards.filter(c => c.totalReviews > 0).length;
    const activeCards = cards.filter(c => c.learningStage !== 'MASTERED' && c.learningStage !== 'NEW').length;
    const masteredCards = cards.filter(c => c.learningStage === 'MASTERED').length;
    
    const avgMastery = cards.length > 0 ? 
      cards.reduce((sum, card) => sum + card.mastery, 0) / cards.length : 0;
    
    const totalCorrect = cards.reduce((sum, card) => sum + card.correctReviews, 0);
    const totalReviews = cards.reduce((sum, card) => sum + card.totalReviews, 0);
    const overallAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    
    const dailyStreak = this.calculateDailyStreak(sessions);
    const weeklyProgress = this.calculateWeeklyProgress(sessions);
    const monthlyGoal = this.calculateMonthlyGoal(cards.length);
    const monthlyProgress = this.calculateMonthlyProgress(sessions);
    
    const totalStudyTime = sessions.reduce((sum, session) => sum + (session.totalTime / 60000), 0);
    const avgSessionLength = sessions.length > 0 ? totalStudyTime / sessions.length : 0;
    
    const bestTimeOfDay = this.analyzeBestTimeOfDay(sessions);
    const mostDifficultWords = this.findMostDifficultWords(cards);
    const { strongest, weakest } = this.analyzeCategoryStrengths(cards);
    const learningVelocity = this.calculateLearningVelocity(cards);
    
    const readinessLevel = this.calculateReadinessLevel(cards, sessions);
    const suggestedDailyGoal = this.suggestDailyGoal(cards, sessions);
    const estimatedTimeToMastery = this.estimateTimeToMastery(cards);
    
    const weeklyAchievements = this.getWeeklyAchievements(cards, sessions);
    const streakMilestones = this.getStreakMilestones(dailyStreak);
    const improvementAreas = this.identifyImprovementAreas(cards, sessions);
    
    return {
      totalWordsLearned,
      activeCards,
      masteredCards,
      averageMastery: Math.round(avgMastery),
      overallAccuracy: Math.round(overallAccuracy),
      
      dailyStreak,
      weeklyProgress: Math.round(weeklyProgress),
      monthlyGoal,
      monthlyProgress: Math.round(monthlyProgress),
      totalStudyTime: Math.round(totalStudyTime),
      averageSessionLength: Math.round(avgSessionLength),
      
      bestTimeOfDay,
      mostDifficultWords,
      strongestCategories: strongest,
      weakestCategories: weakest,
      learningVelocity,
      
      readinessLevel: Math.round(readinessLevel),
      suggestedDailyGoal,
      estimatedTimeToMastery,
      
      weeklyAchievements,
      streakMilestones,
      improvementAreas
    };
  }

  /**
   * Generate personalized learning insights
   */
  static generateInsights(analytics: LearningAnalytics): LearningInsight[] {
    const insights: LearningInsight[] = [];
    
    // Progress insights
    if (analytics.weeklyProgress >= 100) {
      insights.push({
        type: InsightType.CELEBRATION,
        title: '🎉 Weekly Goal Achieved!',
        description: `You've completed your weekly learning goal with ${analytics.weeklyProgress}% progress!`,
        actionable: 'Consider increasing your daily goal for next week.',
        priority: 'medium'
      });
    } else if (analytics.weeklyProgress < 50) {
      insights.push({
        type: InsightType.RECOMMENDATION,
        title: '📈 Boost Your Progress',
        description: `You're at ${analytics.weeklyProgress}% of your weekly goal.`,
        actionable: `Try studying for ${analytics.suggestedDailyGoal} minutes daily.`,
        priority: 'high'
      });
    }
    
    // Streak insights
    if (analytics.dailyStreak >= 7) {
      insights.push({
        type: InsightType.CELEBRATION,
        title: '🔥 Amazing Streak!',
        description: `${analytics.dailyStreak} days of consistent learning!`,
        actionable: 'Keep it up to unlock the next streak milestone.',
        priority: 'low'
      });
    } else if (analytics.dailyStreak === 0) {
      insights.push({
        type: InsightType.TIP,
        title: '⚡ Start Your Streak',
        description: 'Daily practice is key to language learning success.',
        actionable: 'Complete today\'s review to start your streak!',
        priority: 'high'
      });
    }
    
    // Accuracy insights
    if (analytics.overallAccuracy < 70) {
      insights.push({
        type: InsightType.RECOMMENDATION,
        title: '🎯 Improve Accuracy',
        description: `Current accuracy: ${analytics.overallAccuracy}%`,
        actionable: 'Focus on reviewing difficult words more frequently.',
        priority: 'high'
      });
    } else if (analytics.overallAccuracy >= 90) {
      insights.push({
        type: InsightType.CELEBRATION,
        title: '🌟 Excellent Accuracy!',
        description: `Outstanding ${analytics.overallAccuracy}% accuracy rate!`,
        actionable: 'You\'re ready to learn more challenging vocabulary.',
        priority: 'low'
      });
    }
    
    // Category insights
    if (analytics.weakestCategories.length > 0) {
      insights.push({
        type: InsightType.TIP,
        title: '📚 Focus Areas',
        description: `Consider extra practice with: ${analytics.weakestCategories.join(', ')}`,
        actionable: 'Create custom review sessions for these topics.',
        priority: 'medium'
      });
    }
    
    // Time management insights
    if (analytics.averageSessionLength < 5) {
      insights.push({
        type: InsightType.TIP,
        title: '⏰ Extend Study Time',
        description: `Your sessions average ${analytics.averageSessionLength} minutes.`,
        actionable: 'Try 10-15 minute sessions for better retention.',
        priority: 'medium'
      });
    }
    
    // Readiness insights
    if (analytics.readinessLevel >= 80) {
      insights.push({
        type: InsightType.RECOMMENDATION,
        title: '🚀 Ready for More!',
        description: `You're ${analytics.readinessLevel}% ready for new challenges.`,
        actionable: 'Add more new words to your daily learning.',
        priority: 'medium'
      });
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate daily streak from sessions
   */
  private static calculateDailyStreak(sessions: ReviewSession[]): number {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check each day backwards until we find a gap
    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSessionThisDay = sessions.some(session => 
        session.startTime >= dayStart && session.startTime <= dayEnd
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

  /**
   * Calculate weekly progress percentage
   */
  private static calculateWeeklyProgress(sessions: ReviewSession[]): number {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekSessions = sessions.filter(session => session.startTime >= weekStart);
    const totalCards = weekSessions.reduce((sum, session) => sum + session.cardsReviewed, 0);
    
    const weeklyGoal = 70; // 10 cards per day
    return Math.min(100, (totalCards / weeklyGoal) * 100);
  }

  /**
   * Calculate appropriate monthly goal
   */
  private static calculateMonthlyGoal(totalCards: number): number {
    if (totalCards < 50) return 100; // Beginner goal
    if (totalCards < 200) return 200; // Intermediate goal
    return 300; // Advanced goal
  }

  /**
   * Calculate monthly progress
   */
  private static calculateMonthlyProgress(sessions: ReviewSession[]): number {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthSessions = sessions.filter(session => session.startTime >= monthStart);
    const totalCards = monthSessions.reduce((sum, session) => sum + session.cardsReviewed, 0);
    
    const monthlyGoal = 300;
    return Math.min(100, (totalCards / monthlyGoal) * 100);
  }

  /**
   * Analyze best time of day for learning
   */
  private static analyzeBestTimeOfDay(sessions: ReviewSession[]): string {
    if (sessions.length === 0) return 'Not enough data';
    
    const timeSlots = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-18
      evening: 0    // 18-24
    };
    
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });
    
    const best = Object.entries(timeSlots).reduce((a, b) => 
      timeSlots[a[0] as keyof typeof timeSlots] > timeSlots[b[0] as keyof typeof timeSlots] ? a : b
    )[0];
    
    return best.charAt(0).toUpperCase() + best.slice(1);
  }

  /**
   * Find most difficult words
   */
  private static findMostDifficultWords(cards: VocabularyCard[]): VocabularyCard[] {
    return cards
      .filter(card => card.totalReviews >= 3) // Only cards with enough data
      .sort((a, b) => {
        const aSuccess = a.totalReviews > 0 ? a.correctReviews / a.totalReviews : 0;
        const bSuccess = b.totalReviews > 0 ? b.correctReviews / b.totalReviews : 0;
        return aSuccess - bSuccess;
      })
      .slice(0, 5);
  }

  /**
   * Analyze category strengths and weaknesses
   */
  private static analyzeCategoryStrengths(cards: VocabularyCard[]): { 
    strongest: string[], 
    weakest: string[] 
  } {
    const categoryStats: Record<string, { total: number, mastery: number }> = {};
    
    cards.forEach(card => {
      card.tags.forEach(tag => {
        if (!categoryStats[tag]) {
          categoryStats[tag] = { total: 0, mastery: 0 };
        }
        categoryStats[tag].total++;
        categoryStats[tag].mastery += card.mastery;
      });
    });
    
    const categories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        averageMastery: stats.total > 0 ? stats.mastery / stats.total : 0,
        cardCount: stats.total
      }))
      .filter(cat => cat.cardCount >= 3) // Only categories with enough cards
      .sort((a, b) => b.averageMastery - a.averageMastery);
    
    const strongest = categories.slice(0, 3).map(c => c.category);
    const weakest = categories.slice(-3).reverse().map(c => c.category);
    
    return { strongest, weakest };
  }

  /**
   * Calculate learning velocity (words learned per week)
   */
  private static calculateLearningVelocity(cards: VocabularyCard[]): number {
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    
    const recentCards = cards.filter(card => 
      card.lastReviewDate && card.lastReviewDate >= fourWeeksAgo
    );
    
    return Math.round(recentCards.length / 4); // per week
  }

  /**
   * Calculate readiness level for new challenges
   */
  private static calculateReadinessLevel(cards: VocabularyCard[], sessions: ReviewSession[]): number {
    if (cards.length === 0) return 100;
    
    const avgMastery = cards.reduce((sum, card) => sum + card.mastery, 0) / cards.length;
    const recentAccuracy = this.getRecentAccuracy(sessions);
    const consistencyScore = this.getConsistencyScore(sessions);
    
    return (avgMastery * 0.4 + recentAccuracy * 0.4 + consistencyScore * 0.2);
  }

  /**
   * Suggest daily goal based on performance
   */
  private static suggestDailyGoal(_cards: VocabularyCard[], sessions: ReviewSession[]): number {
    const recentAvg = sessions.slice(-7).reduce((sum, s) => sum + s.cardsReviewed, 0) / 7;
    
    if (recentAvg === 0) return 10; // Beginner
    if (recentAvg < 5) return Math.ceil(recentAvg + 2);
    if (recentAvg < 15) return Math.ceil(recentAvg + 3);
    return Math.min(25, Math.ceil(recentAvg + 5)); // Cap at 25
  }

  /**
   * Estimate time to mastery for current vocabulary
   */
  private static estimateTimeToMastery(cards: VocabularyCard[]): number {
    const unmastered = cards.filter(card => card.learningStage !== 'MASTERED');
    if (unmastered.length === 0) return 0;
    
    const avgProgress = unmastered.reduce((sum, card) => sum + card.mastery, 0) / unmastered.length;
    const progressNeeded = 100 - avgProgress;
    
    // Assume 2% progress per review, 1 review every 3 days on average
    const reviewsNeeded = progressNeeded / 2;
    const daysNeeded = reviewsNeeded * 3;
    
    return Math.round(daysNeeded);
  }

  /**
   * Get recent accuracy from last 10 sessions
   */
  private static getRecentAccuracy(sessions: ReviewSession[]): number {
    const recentSessions = sessions.slice(-10);
    if (recentSessions.length === 0) return 0;
    
    const totalCards = recentSessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const totalCorrect = recentSessions.reduce((sum, s) => sum + s.cardsCorrect, 0);
    
    return totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0;
  }

  /**
   * Calculate consistency score based on session frequency
   */
  private static getConsistencyScore(sessions: ReviewSession[]): number {
    if (sessions.length === 0) return 0;
    
    const last14Days = sessions.filter(session => {
      const fourteenDaysAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));
      return session.startTime >= fourteenDaysAgo;
    });
    
    const uniqueDays = new Set(
      last14Days.map(session => session.startTime.toDateString())
    ).size;
    
    return (uniqueDays / 14) * 100; // Percentage of days studied
  }

  /**
   * Get weekly achievements
   */
  private static getWeeklyAchievements(_cards: VocabularyCard[], sessions: ReviewSession[]): Achievement[] {
    const achievements: Achievement[] = [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    // Check for weekly milestones
    const weekSessions = sessions.filter(s => s.startTime >= weekStart);
    const weekCards = weekSessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
    
    if (weekCards >= 50) {
      achievements.push({
        id: 'week_50_cards',
        title: 'Weekly Warrior',
        description: 'Reviewed 50+ cards this week',
        icon: '⚔️',
        unlockedAt: new Date(),
        type: 'vocabulary'
      });
    }
    
    return achievements;
  }

  /**
   * Get streak milestones
   */
  private static getStreakMilestones(streak: number): number[] {
    const milestones = [3, 7, 14, 30, 50, 100];
    return milestones.filter(milestone => streak >= milestone);
  }

  /**
   * Identify improvement areas
   */
  private static identifyImprovementAreas(cards: VocabularyCard[], sessions: ReviewSession[]): string[] {
    const areas: string[] = [];
    
    const recentAccuracy = this.getRecentAccuracy(sessions);
    if (recentAccuracy < 75) {
      areas.push('Review accuracy');
    }
    
    const avgSessionLength = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.totalTime, 0) / sessions.length / 60000 : 0;
    if (avgSessionLength < 8) {
      areas.push('Session duration');
    }
    
    const masteredPercent = cards.length > 0 ? 
      (cards.filter(c => c.learningStage === 'MASTERED').length / cards.length) * 100 : 0;
    if (masteredPercent < 30) {
      areas.push('Vocabulary mastery');
    }
    
    const consistency = this.getConsistencyScore(sessions);
    if (consistency < 60) {
      areas.push('Daily consistency');
    }
    
    return areas;
  }
}
/**
 * Spaced Repetition Algorithm for Vocabulary Learning
 * Based on the SM-2 algorithm with adaptations for gamified learning
 */

import { LearningValidation, ValidationError } from './shared/validation';

export interface VocabularyCard {
  id: string;
  word: string;
  definition: string;
  examples: string[];
  context: string | undefined; // Where the word was learned (e.g., "teacher dialogue")
  difficulty: number; // 1-5 scale
  
  // Spaced repetition data
  easeFactor: number; // 2.5 default, modified based on performance
  repetitions: number; // Number of successful repetitions
  interval: number; // Days until next review
  nextReviewDate: Date;
  lastReviewDate?: Date;
  
  // Learning analytics
  totalReviews: number;
  correctReviews: number;
  streakCount: number;
  averageResponseTime: number; // milliseconds
  learningStage: LearningStage;
  
  // Gamification
  mastery: number; // 0-100 percentage
  isBookmarked: boolean;
  tags: string[]; // categories like "food", "emotions", "formal"
}

export const LearningStage = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  REVIEW: 'REVIEW',
  MASTERED: 'MASTERED',
  RELEARNING: 'RELEARNING'
} as const;

export type LearningStage = typeof LearningStage[keyof typeof LearningStage];

export const ReviewResult = {
  FORGOT: 'FORGOT',
  HARD: 'HARD',
  GOOD: 'GOOD',
  EASY: 'EASY'
} as const;

export type ReviewResult = typeof ReviewResult[keyof typeof ReviewResult];

export interface ReviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  totalTime: number; // milliseconds
  averageTime: number; // milliseconds per card
  sessionType: 'daily' | 'review' | 'mastery' | 'custom';
}

export class SpacedRepetitionEngine {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly MAX_EASE_FACTOR = 4.0;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  
  /**
   * Create a new vocabulary card with input validation
   * @param word - The vocabulary word (1-100 characters)
   * @param definition - The word definition (1-500 characters)
   * @param context - Optional context where word was learned (max 200 characters)
   * @param examples - Optional usage examples (max 10 items, 200 chars each)
   * @throws {ValidationError} When input parameters are invalid
   */
  static createCard = (
    word: string, 
    definition: string, 
    context?: string,
    examples: string[] = []
  ): VocabularyCard => {
    try {
      LearningValidation.validateCardCreation(word, definition, context, examples);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Card creation failed: ${error.message}`, error.field, error.value);
      }
      throw error;
    }
    
    const now = Date.now();
    return {
      id: `card_${word}_${now}`,
      word,
      definition,
      examples,
      context,
      difficulty: 3,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      repetitions: 0,
      interval: 1,
      nextReviewDate: new Date(now + 24 * 60 * 60 * 1000),
      totalReviews: 0,
      correctReviews: 0,
      streakCount: 0,
      averageResponseTime: 0,
      learningStage: LearningStage.NEW,
      
      // Gamification
      mastery: 0,
      isBookmarked: false,
      tags: []
    };
  }

  /**
   * Process a review result and update the card accordingly
   * Based on the SM-2 spaced repetition algorithm with input validation
   * @param card - The vocabulary card being reviewed
   * @param result - The review result (FORGOT, HARD, GOOD, EASY)
   * @param responseTime - Response time in milliseconds (0-300000)
   * @throws {ValidationError} When input parameters are invalid
   * @returns Updated card with new scheduling data
   */
  static reviewCard(card: VocabularyCard, result: ReviewResult, responseTime: number): VocabularyCard {
    try {
      LearningValidation.validateReviewResult(card, result, responseTime);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Card review failed: ${error.message}`, error.field, error.value);
      }
      throw error;
    }
    const updatedCard = { ...card };
    
    // Update analytics
    updatedCard.totalReviews++;
    updatedCard.lastReviewDate = new Date();
    
    // Update average response time
    const totalTime = updatedCard.averageResponseTime * (updatedCard.totalReviews - 1) + responseTime;
    updatedCard.averageResponseTime = totalTime / updatedCard.totalReviews;
    
    // Process result
    if (result === ReviewResult.FORGOT) {
      updatedCard.repetitions = 0;
      updatedCard.interval = 1;
      updatedCard.easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        updatedCard.easeFactor - 0.2
      );
      updatedCard.streakCount = 0;
      updatedCard.learningStage = LearningStage.RELEARNING;
      updatedCard.mastery = 0; // Reset mastery on forgotten cards
    } else {
      updatedCard.correctReviews++;
      updatedCard.streakCount++;
      
      if (result === ReviewResult.HARD) {
        updatedCard.easeFactor = Math.max(
          this.MIN_EASE_FACTOR,
          updatedCard.easeFactor - 0.15
        );
      } else if (result === ReviewResult.EASY) {
        updatedCard.easeFactor = Math.min(
          this.MAX_EASE_FACTOR,
          updatedCard.easeFactor + 0.15
        );
      }
      
      // Calculate next interval based on SM-2 algorithm
      if (updatedCard.repetitions === 0) {
        updatedCard.interval = 1;
      } else if (updatedCard.repetitions === 1) {
        updatedCard.interval = 6;
      } else {
        updatedCard.interval = Math.round(
          updatedCard.interval * updatedCard.easeFactor
        );
      }
      
      updatedCard.repetitions++;
      
      // Update learning stage
      if (updatedCard.repetitions >= 8 && updatedCard.streakCount >= 5) {
        updatedCard.learningStage = LearningStage.MASTERED;
      } else if (updatedCard.repetitions >= 3) {
        updatedCard.learningStage = LearningStage.REVIEW;
      } else {
        updatedCard.learningStage = LearningStage.LEARNING;
      }
    }
    
    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + updatedCard.interval);
    updatedCard.nextReviewDate = nextReview;
    
    // Calculate mastery percentage (only if not already reset for forgotten cards)
    if (result !== ReviewResult.FORGOT) {
      updatedCard.mastery = this.calculateMastery(updatedCard);
    }
    
    return updatedCard;
  }

  /**
   * Get cards that are due for review
   */
  static getDueCards(cards: VocabularyCard[], maxCards: number = 20): VocabularyCard[] {
    const now = new Date();
    
    return cards
      .filter(card => card.nextReviewDate <= now)
      .sort((a, b) => {
        // Prioritize by learning stage, then by due date
        const stagePriority = this.getLearningStageePriority(a.learningStage) - 
                             this.getLearningStageePriority(b.learningStage);
        if (stagePriority !== 0) return stagePriority;
        
        return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
      })
      .slice(0, maxCards);
  }

  /**
   * Get new cards to learn
   */
  static getNewCards(cards: VocabularyCard[], maxNewCards: number = 5): VocabularyCard[] {
    return cards
      .filter(card => card.learningStage === LearningStage.NEW)
      .sort((a, b) => a.difficulty - b.difficulty) // Start with easier words
      .slice(0, maxNewCards);
  }

  /**
   * Calculate mastery percentage for a card
   */
  private static calculateMastery(card: VocabularyCard): number {
    if (card.totalReviews === 0) return 0;
    
    const successRate = card.correctReviews / card.totalReviews;
    const repetitionBonus = Math.min(card.repetitions * 10, 50);
    const streakBonus = Math.min(card.streakCount * 5, 30);
    const stageBonus = this.getLearningStageBonus(card.learningStage);
    
    return Math.min(100, Math.round(
      successRate * 50 + repetitionBonus + streakBonus + stageBonus
    ));
  }

  /**
   * Get priority value for learning stage (lower = higher priority)
   */
  private static getLearningStageePriority(stage: LearningStage): number {
    switch (stage) {
      case LearningStage.RELEARNING: return 1;
      case LearningStage.LEARNING: return 2;
      case LearningStage.NEW: return 3;
      case LearningStage.REVIEW: return 4;
      case LearningStage.MASTERED: return 5;
      default: return 6;
    }
  }

  /**
   * Get mastery bonus for learning stage
   */
  private static getLearningStageBonus(stage: LearningStage): number {
    switch (stage) {
      case LearningStage.NEW: return 0;
      case LearningStage.LEARNING: return 5;
      case LearningStage.REVIEW: return 10;
      case LearningStage.MASTERED: return 20;
      case LearningStage.RELEARNING: return 0;
      default: return 0;
    }
  }

  /**
   * Generate daily review statistics
   */
  static getDailyStats(cards: VocabularyCard[]): {
    totalCards: number;
    dueForReview: number;
    newCards: number;
    masteredCards: number;
    averageMastery: number;
    weeklyGoal: number;
    weeklyProgress: number;
  } {
    const now = new Date();
    const dueToday = cards.filter(card => card.nextReviewDate <= now).length;
    const newCards = cards.filter(card => card.learningStage === LearningStage.NEW).length;
    const masteredCards = cards.filter(card => card.learningStage === LearningStage.MASTERED).length;
    
    const totalMastery = cards.reduce((sum, card) => sum + card.mastery, 0);
    const averageMastery = cards.length > 0 ? totalMastery / cards.length : 0;
    
    // Weekly goal: review 70 cards, learn 10 new words
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklyReviews = cards.filter(card => 
      card.lastReviewDate && card.lastReviewDate >= weekStart
    ).length;
    
    const weeklyGoal = 70;
    const weeklyProgress = Math.min(100, (weeklyReviews / weeklyGoal) * 100);
    
    return {
      totalCards: cards.length,
      dueForReview: dueToday,
      newCards,
      masteredCards,
      averageMastery: Math.round(averageMastery),
      weeklyGoal,
      weeklyProgress: Math.round(weeklyProgress)
    };
  }
}
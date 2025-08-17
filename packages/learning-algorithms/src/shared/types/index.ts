/**
 * Domain-Specific Type System for Learning Features
 * Organized by feature area with clear hierarchies and namespaces
 */

// Base learning entity interface
export interface LearningEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common enums and constants
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const IELTS_BANDS = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0] as const;
export const LANGUAGE_SKILLS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR', 'PRONUNCIATION'] as const;

export type CEFRLevel = typeof CEFR_LEVELS[number];
export type IELTSBand = typeof IELTS_BANDS[number];
export type LanguageSkill = typeof LANGUAGE_SKILLS[number];

/**
 * Spaced Repetition Learning Domain
 */
export namespace SpacedRepetition {
  export const REVIEW_RESULTS = ['FORGOT', 'HARD', 'GOOD', 'EASY'] as const;
  export const LEARNING_STAGES = ['NEW', 'LEARNING', 'REVIEW', 'MASTERED', 'RELEARNING'] as const;
  
  export type ReviewResult = typeof REVIEW_RESULTS[number];
  export type LearningStage = typeof LEARNING_STAGES[number];
  
  export interface VocabularyCard extends LearningEntity {
    word: string;
    definition: string;
    examples: string[];
    context: string | undefined;
    difficulty: number;
    
    // Spaced repetition data
    easeFactor: number;
    repetitions: number;
    interval: number;
    nextReviewDate: Date;
    lastReviewDate?: Date;
    
    // Learning analytics
    totalReviews: number;
    correctReviews: number;
    streakCount: number;
    averageResponseTime: number;
    learningStage: LearningStage;
    
    // Gamification
    mastery: number;
    isBookmarked: boolean;
    tags: string[];
  }
  
  export interface ReviewSession extends LearningEntity {
    startTime: Date;
    endTime?: Date;
    cardsReviewed: number;
    cardsCorrect: number;
    totalTime: number;
    averageTime: number;
    sessionType: 'daily' | 'review' | 'mastery' | 'custom';
  }
  
  export interface CardReviewData {
    cardId: string;
    result: ReviewResult;
    responseTime: number;
    timestamp: Date;
  }
}

/**
 * Learning Analytics Domain
 */
export namespace Analytics {
  export const METRIC_TYPES = ['ACCURACY', 'SPEED', 'RETENTION', 'ENGAGEMENT', 'PROGRESS'] as const;
  export const INSIGHT_CATEGORIES = ['PERFORMANCE', 'LEARNING_PATTERN', 'RECOMMENDATION', 'ACHIEVEMENT'] as const;
  
  export type MetricType = typeof METRIC_TYPES[number];
  export type InsightCategory = typeof INSIGHT_CATEGORIES[number];
  
  export interface LearningMetrics {
    userId: string;
    timeframe: {
      start: Date;
      end: Date;
    };
    
    // Performance metrics
    totalSessions: number;
    totalTimeSpent: number; // minutes
    averageSessionLength: number; // minutes
    consistencyScore: number; // 0-100
    
    // Skill metrics
    skillBreakdown: Record<LanguageSkill, SkillMetrics>;
    overallAccuracy: number;
    improvementRate: number; // weekly percentage
    
    // Progress metrics
    currentCEFRLevel: CEFRLevel;
    vocabularySize: number;
    masteredConcepts: string[];
    weakAreas: LanguageSkill[];
    
    // Engagement metrics
    streakDays: number;
    completionRate: number;
    retentionRate: number;
  }
  
  export interface SkillMetrics {
    skill: LanguageSkill;
    accuracy: number;
    totalAttempts: number;
    improvementTrend: number; // -1 to 1
    lastPracticed: Date;
    proficiencyLevel: number; // 0-100
  }
  
  export interface LearningInsight {
    id: string;
    category: InsightCategory;
    type: MetricType;
    title: string;
    description: string;
    actionable: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    data: Record<string, any>;
    generatedAt: Date;
  }
  
  export interface GoalProgress {
    goalId: string;
    targetValue: number;
    currentValue: number;
    progressPercentage: number;
    isOnTrack: boolean;
    estimatedCompletion: Date;
    milestones: Milestone[];
  }
  
  export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    achieved: boolean;
    achievedAt?: Date;
  }
}

/**
 * Content Assessment Domain
 */
export namespace Assessment {
  export const QUALITY_DIMENSIONS = [
    'EDUCATIONAL_EFFECTIVENESS',
    'ENGAGEMENT', 
    'DIFFICULTY_APPROPRIATENESS',
    'IELTS_RELEVANCE',
    'LEARNING_PROGRESSION',
    'ACCESSIBILITY'
  ] as const;
  
  export const CONTENT_TYPES = ['DIALOGUE', 'EXERCISE', 'LESSON', 'ASSESSMENT', 'VOCABULARY', 'GRAMMAR'] as const;
  export const IELTS_TASK_TYPES = [
    'FORM_COMPLETION', 'NOTE_COMPLETION', 'MULTIPLE_CHOICE', 'MATCHING',
    'TRUE_FALSE_NOT_GIVEN', 'YES_NO_NOT_GIVEN', 'SUMMARY_COMPLETION', 'HEADING_MATCHING',
    'TASK_1_GRAPH', 'TASK_1_MAP', 'TASK_1_PROCESS', 'TASK_2_ESSAY',
    'PART_1_INTRODUCTION', 'PART_2_LONG_TURN', 'PART_3_DISCUSSION'
  ] as const;
  
  export type QualityDimension = typeof QUALITY_DIMENSIONS[number];
  export type ContentType = typeof CONTENT_TYPES[number];
  export type IELTSTaskType = typeof IELTS_TASK_TYPES[number];
  
  export interface ContentQualityMetrics extends LearningEntity {
    contentId: string;
    contentType: ContentType;
    
    // Overall quality score (0-100)
    overallQuality: number;
    
    // Dimension scores (0-100 each)
    dimensionScores: Record<QualityDimension, number>;
    
    // Performance metrics
    completionRate: number;
    averageAccuracy: number;
    averageTimeSpent: number;
    retentionRate: number;
    
    // Learner feedback
    satisfactionScore: number;
    difficultyRating: number;
    relevanceRating: number;
    
    // Learning outcomes
    vocabularyLearned: number;
    skillsImproved: LanguageSkill[];
    cefrProgress: number;
    
    // Quality indicators
    issues: QualityIssue[];
    recommendations: string[];
    sampleSize: number;
  }
  
  export interface QualityIssue {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: QualityDimension;
    description: string;
    impact: string;
    suggestedFix: string;
    affectedLearners: number;
  }
  
  export interface CurriculumStandard {
    cefrLevel: CEFRLevel;
    ieltsEquivalent: IELTSBand[];
    skillFocus: LanguageSkill[];
    vocabularyRange: number;
    grammarComplexity: number;
    taskTypes: IELTSTaskType[];
    learningObjectives: string[];
    assessmentCriteria: AssessmentCriterion[];
  }
  
  export interface AssessmentCriterion {
    skill: LanguageSkill;
    descriptor: string;
    proficiencyMarkers: string[];
    commonErrors: string[];
    improvementStrategies: string[];
  }
}

/**
 * Difficulty Calibration Domain  
 */
export namespace Calibration {
  export const DIFFICULTY_LEVELS = ['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD'] as const;
  export const PERFORMANCE_ZONES = ['FRUSTRATION', 'CHALLENGE', 'COMFORT', 'MASTERY'] as const;
  
  export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
  export type PerformanceZone = typeof PERFORMANCE_ZONES[number];
  
  export interface PerformanceMetrics {
    totalAttempts: number;
    correctAnswers: number;
    averageResponseTime: number;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    recentAccuracy: number;
    skillBreakdown: Record<LanguageSkill, number>;
    improvementRate: number;
    confidenceScore: number;
  }
  
  export interface ContentDifficulty {
    vocabularyComplexity: number;
    grammarComplexity: number;
    comprehensionLevel: number;
    taskComplexity: number;
    overallDifficulty: number;
    targetCEFRLevel: CEFRLevel;
    estimatedSuccessRate: number;
    adaptationReason: string;
  }
  
  export interface AdaptationStrategy {
    direction: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
    magnitude: number;
    focusAreas: LanguageSkill[];
    recommendedTaskTypes: Assessment.IELTSTaskType[];
    nextReviewTime: number;
    rationale: string;
  }
  
  export interface LearnerAttempt {
    learnerId: string;
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    completed: boolean;
    accuracy: number;
    responseTime: number;
    skillsAssessed: LanguageSkill[];
    cefrLevel: CEFRLevel;
    struggledWith: string[];
    masteredConcepts: string[];
  }
}

/**
 * Motivation and Achievement Domain
 */
export namespace Motivation {
  export const MOTIVATION_STYLES = ['ACHIEVER', 'SOCIALIZER', 'EXPLORER', 'COMPETITOR', 'COMPLETIONIST'] as const;
  export const ENCOURAGEMENT_LEVELS = ['MINIMAL', 'MODERATE', 'HIGH', 'MAXIMUM'] as const;
  export const ACHIEVEMENT_TYPES = ['MILESTONE', 'STREAK', 'MASTERY', 'SOCIAL', 'SPECIAL'] as const;
  
  export type MotivationStyle = typeof MOTIVATION_STYLES[number];
  export type EncouragementLevel = typeof ENCOURAGEMENT_LEVELS[number];
  export type AchievementType = typeof ACHIEVEMENT_TYPES[number];
  
  export interface MotivationProfile extends LearningEntity {
    userId: string;
    motivationStyle: MotivationStyle;
    encouragementLevel: EncouragementLevel;
    currentStreak: number;
    totalXP: number;
    level: number;
    engagementScore: number;
    lastActiveDate: Date;
    preferredRewardTypes: string[];
  }
  
  export interface Achievement extends LearningEntity {
    title: string;
    description: string;
    type: AchievementType;
    criteria: AchievementCriteria;
    rewards: AchievementReward[];
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    unlockedBy: string[];
    isHidden: boolean;
  }
  
  export interface AchievementCriteria {
    metricType: Analytics.MetricType;
    threshold: number;
    timeframe?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
    conditions: Record<string, any>;
  }
  
  export interface AchievementReward {
    type: 'XP' | 'BADGE' | 'TITLE' | 'FEATURE_UNLOCK' | 'COSMETIC';
    value: number | string;
    description: string;
  }
  
  export interface UserAchievement {
    achievementId: string;
    userId: string;
    unlockedAt: Date;
    progress: number;
    isCompleted: boolean;
    notificationSent: boolean;
  }
}

// Re-export commonly used types at top level
// Types already exported above within namespaces

// Re-export namespace types for easy access
export type VocabularyCard = SpacedRepetition.VocabularyCard;
export type ReviewResult = SpacedRepetition.ReviewResult;
export type LearningMetrics = Analytics.LearningMetrics;
export type ContentQualityMetrics = Assessment.ContentQualityMetrics;
export type PerformanceMetrics = Calibration.PerformanceMetrics;
export type Achievement = Motivation.Achievement;
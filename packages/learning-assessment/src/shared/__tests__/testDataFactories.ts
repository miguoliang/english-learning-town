/**
 * Test Data Factories for Learning Systems
 * Provides reusable mock data creation utilities for consistent testing
 */

import type {
  SpacedRepetition,
  Analytics,
  Assessment,
  Calibration,
  Motivation,
  CEFRLevel,
} from "../types";

/**
 * Spaced Repetition Test Factories
 */
export const SpacedRepetitionFactories = {
  /**
   * Create a mock vocabulary card with sensible defaults
   */
  createVocabularyCard: (
    overrides: Partial<SpacedRepetition.VocabularyCard> = {},
  ): SpacedRepetition.VocabularyCard => ({
    id: "test-card-" + Math.random().toString(36).substr(2, 9),
    word: "serendipity",
    definition: "A pleasant surprise; a fortunate discovery",
    examples: [
      "Finding that book was pure serendipity.",
      "Their serendipitous encounter changed everything.",
    ],
    context: "teacher dialogue",
    difficulty: 3,
    easeFactor: 2.5,
    repetitions: 0,
    interval: 1,
    nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    lastReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    streakCount: 0,
    averageResponseTime: 0,
    learningStage: "NEW",
    mastery: 0,
    isBookmarked: false,
    tags: ["advanced", "nouns"],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create a mock review session
   */
  createReviewSession: (
    overrides: Partial<SpacedRepetition.ReviewSession> = {},
  ): SpacedRepetition.ReviewSession => ({
    id: "session-" + Math.random().toString(36).substr(2, 9),
    startTime: new Date(),
    endTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes later
    cardsReviewed: 10,
    cardsCorrect: 8,
    totalTime: 15 * 60 * 1000, // 15 minutes in milliseconds
    averageTime: 90 * 1000, // 90 seconds per card
    sessionType: "daily",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create multiple vocabulary cards for testing
   */
  createVocabularyCards: (
    count: number,
    baseOverrides: Partial<SpacedRepetition.VocabularyCard> = {},
  ): SpacedRepetition.VocabularyCard[] => {
    return Array.from({ length: count }, (_, i) =>
      SpacedRepetitionFactories.createVocabularyCard({
        ...baseOverrides,
        id: `test-card-${i + 1}`,
        word: `word${i + 1}`,
        definition: `Definition for word ${i + 1}`,
        difficulty: (i % 5) + 1, // Vary difficulty 1-5
        mastery: Math.floor(Math.random() * 100),
      }),
    );
  },
};

/**
 * Analytics Test Factories
 */
export const AnalyticsFactories = {
  /**
   * Create mock learning metrics
   */
  createLearningMetrics: (
    overrides: Partial<Analytics.LearningMetrics> = {},
  ): Analytics.LearningMetrics => ({
    userId: "test-user-" + Math.random().toString(36).substr(2, 9),
    timeframe: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date(),
    },
    totalSessions: 15,
    totalTimeSpent: 300, // 5 hours
    averageSessionLength: 20, // 20 minutes
    consistencyScore: 85,
    skillBreakdown: {
      LISTENING: {
        skill: "LISTENING",
        accuracy: 78,
        totalAttempts: 50,
        improvementTrend: 0.2,
        lastPracticed: new Date(),
        proficiencyLevel: 75,
      },
      READING: {
        skill: "READING",
        accuracy: 82,
        totalAttempts: 60,
        improvementTrend: 0.1,
        lastPracticed: new Date(),
        proficiencyLevel: 80,
      },
      WRITING: {
        skill: "WRITING",
        accuracy: 70,
        totalAttempts: 30,
        improvementTrend: 0.3,
        lastPracticed: new Date(),
        proficiencyLevel: 65,
      },
      SPEAKING: {
        skill: "SPEAKING",
        accuracy: 75,
        totalAttempts: 25,
        improvementTrend: 0.15,
        lastPracticed: new Date(),
        proficiencyLevel: 70,
      },
      VOCABULARY: {
        skill: "VOCABULARY",
        accuracy: 88,
        totalAttempts: 100,
        improvementTrend: 0.05,
        lastPracticed: new Date(),
        proficiencyLevel: 85,
      },
      GRAMMAR: {
        skill: "GRAMMAR",
        accuracy: 80,
        totalAttempts: 80,
        improvementTrend: 0.1,
        lastPracticed: new Date(),
        proficiencyLevel: 78,
      },
      PRONUNCIATION: {
        skill: "PRONUNCIATION",
        accuracy: 65,
        totalAttempts: 20,
        improvementTrend: 0.25,
        lastPracticed: new Date(),
        proficiencyLevel: 60,
      },
    },
    overallAccuracy: 78,
    improvementRate: 12, // 12% weekly improvement
    currentCEFRLevel: "B2",
    vocabularySize: 6500,
    masteredConcepts: [
      "present_perfect",
      "conditional_sentences",
      "academic_vocabulary",
    ],
    weakAreas: ["WRITING", "PRONUNCIATION"],
    streakDays: 12,
    completionRate: 85,
    retentionRate: 78,
    ...overrides,
  }),

  /**
   * Create mock learning insight
   */
  createLearningInsight: (
    overrides: Partial<Analytics.LearningInsight> = {},
  ): Analytics.LearningInsight => ({
    id: "insight-" + Math.random().toString(36).substr(2, 9),
    category: "PERFORMANCE",
    type: "ACCURACY",
    title: "Writing Skills Need Attention",
    description:
      "Your writing accuracy (70%) is below your overall average. Consider focusing on writing practice.",
    actionable: true,
    priority: "MEDIUM",
    data: {
      currentAccuracy: 70,
      targetAccuracy: 80,
      sessionsNeeded: 5,
    },
    generatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create mock goal progress
   */
  createGoalProgress: (
    overrides: Partial<Analytics.GoalProgress> = {},
  ): Analytics.GoalProgress => ({
    goalId: "goal-" + Math.random().toString(36).substr(2, 9),
    targetValue: 100,
    currentValue: 65,
    progressPercentage: 65,
    isOnTrack: true,
    estimatedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    milestones: [
      {
        id: "milestone-1",
        title: "Quarter Progress",
        description: "Reach 25% of goal",
        targetValue: 25,
        achieved: true,
        achievedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: "milestone-2",
        title: "Half Progress",
        description: "Reach 50% of goal",
        targetValue: 50,
        achieved: true,
        achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "milestone-3",
        title: "Three Quarters",
        description: "Reach 75% of goal",
        targetValue: 75,
        achieved: false,
      },
    ],
    ...overrides,
  }),
};

/**
 * Assessment Test Factories
 */
export const AssessmentFactories = {
  /**
   * Create mock content usage data
   */
  createContentUsageData: () => ({
    contentId: "content-" + Math.random().toString(36).substr(2, 9),
    learnerAttempts: Array.from({ length: 15 }, (_, i) =>
      CalibrationFactories.createLearnerAttempt({
        learnerId: `learner-${i + 1}`,
        completed: i < 12, // 80% completion rate
        accuracy: 70 + Math.random() * 20, // 70-90% accuracy
      }),
    ),
    vocabularyInteractions: Array.from({ length: 25 }, (_, i) => ({
      learnerId: `learner-${(i % 15) + 1}`,
      word: `word_${i + 1}`,
      definition: `Definition for word ${i + 1}`,
      wasHighlighted: true,
      wasLearned: i % 3 !== 0, // 67% learning rate
      contextOfUse: "dialogue_context",
      difficultyPerceived: 2 + Math.random() * 2,
      timestamp: new Date(),
    })),
    feedbackSubmissions: Array.from({ length: 12 }, (_, i) => ({
      learnerId: `learner-${i + 1}`,
      overall: 3.5 + Math.random() * 1.5,
      difficulty: 2.5 + Math.random() * 1.5,
      relevance: 3 + Math.random() * 1.5,
      engagement: 3.5 + Math.random() * 1,
      timestamp: new Date(),
    })),
    completionData: Array.from({ length: 15 }, (_, i) => ({
      learnerId: `learner-${i + 1}`,
      timeSpent: 8 + Math.random() * 6,
      completed: i < 12,
      dropoffPoint: i >= 12 ? "section_2" : undefined,
      retestPerformance: i % 5 === 0 ? 75 + Math.random() * 20 : undefined,
      timestamp: new Date(),
    })),
  }),

  /**
   * Create mock curriculum standard
   */
  createCurriculumStandard: (
    cefrLevel: CEFRLevel = "B2",
    overrides: Partial<Assessment.CurriculumStandard> = {},
  ): Assessment.CurriculumStandard => ({
    cefrLevel,
    ieltsEquivalent: cefrLevel === "B2" ? [5.5, 6.0, 6.5] : [7.0, 7.5, 8.0],
    skillFocus: ["WRITING", "SPEAKING", "READING", "VOCABULARY"],
    vocabularyRange: cefrLevel === "B2" ? 8000 : 12000,
    grammarComplexity: cefrLevel === "B2" ? 8 : 9,
    taskTypes: ["TASK_2_ESSAY", "PART_3_DISCUSSION", "TRUE_FALSE_NOT_GIVEN"],
    learningObjectives: [
      `Master ${cefrLevel} level vocabulary and grammar`,
      "Achieve IELTS Band 6+ proficiency",
      "Develop academic English skills",
    ],
    assessmentCriteria: [
      {
        skill: "WRITING",
        descriptor: "Clear, well-structured academic writing",
        proficiencyMarkers: [
          "Uses complex sentences",
          "Appropriate register",
          "Clear argumentation",
        ],
        commonErrors: [
          "Limited vocabulary range",
          "Simple sentence structures",
        ],
        improvementStrategies: [
          "Practice essay writing",
          "Expand academic vocabulary",
        ],
      },
    ],
    ...overrides,
  }),
};

/**
 * Calibration Test Factories
 */
export const CalibrationFactories = {
  /**
   * Create mock performance metrics
   */
  createPerformanceMetrics: (
    overrides: Partial<Calibration.PerformanceMetrics> = {},
  ): Calibration.PerformanceMetrics => ({
    totalAttempts: 20,
    correctAnswers: 15,
    averageResponseTime: 3000,
    consecutiveCorrect: 3,
    consecutiveIncorrect: 0,
    recentAccuracy: 75,
    skillBreakdown: {
      LISTENING: 80,
      READING: 75,
      WRITING: 65,
      SPEAKING: 70,
      VOCABULARY: 85,
      GRAMMAR: 78,
      PRONUNCIATION: 60,
    },
    improvementRate: 8,
    confidenceScore: 75,
    ...overrides,
  }),

  /**
   * Create mock learner attempt
   */
  createLearnerAttempt: (
    overrides: Partial<Calibration.LearnerAttempt> = {},
  ): Calibration.LearnerAttempt => ({
    learnerId: "learner-" + Math.random().toString(36).substr(2, 9),
    sessionId: "session-" + Math.random().toString(36).substr(2, 9),
    startTime: new Date(),
    endTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes later
    completed: true,
    accuracy: 75,
    responseTime: 3000,
    skillsAssessed: ["VOCABULARY", "READING"],
    cefrLevel: "B2",
    struggledWith: [],
    masteredConcepts: ["present_perfect", "vocabulary_set_1"],
    ...overrides,
  }),

  /**
   * Create mock content difficulty
   */
  createContentDifficulty: (
    overrides: Partial<Calibration.ContentDifficulty> = {},
  ): Calibration.ContentDifficulty => ({
    vocabularyComplexity: 6,
    grammarComplexity: 6,
    comprehensionLevel: 6,
    taskComplexity: 6,
    overallDifficulty: 6,
    targetCEFRLevel: "B2",
    estimatedSuccessRate: 75,
    adaptationReason: "Initial calibration for B2 level",
    ...overrides,
  }),
};

/**
 * Motivation Test Factories
 */
export const MotivationFactories = {
  /**
   * Create mock motivation profile
   */
  createMotivationProfile: (
    overrides: Partial<Motivation.MotivationProfile> = {},
  ): Motivation.MotivationProfile => ({
    id: "profile-" + Math.random().toString(36).substr(2, 9),
    userId: "user-" + Math.random().toString(36).substr(2, 9),
    motivationStyle: "ACHIEVER",
    encouragementLevel: "MODERATE",
    currentStreak: 7,
    totalXP: 1250,
    level: 8,
    engagementScore: 85,
    lastActiveDate: new Date(),
    preferredRewardTypes: ["XP", "BADGE", "ACHIEVEMENT"],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create mock achievement
   */
  createAchievement: (
    overrides: Partial<Motivation.Achievement> = {},
  ): Motivation.Achievement => ({
    id: "achievement-" + Math.random().toString(36).substr(2, 9),
    title: "Vocabulary Master",
    description: "Learn 100 new vocabulary words",
    type: "MILESTONE",
    criteria: {
      metricType: "PROGRESS",
      threshold: 100,
      timeframe: "MONTHLY",
      conditions: { skill: "VOCABULARY" },
    },
    rewards: [
      { type: "XP", value: 500, description: "Bonus experience points" },
      {
        type: "BADGE",
        value: "vocabulary_master",
        description: "Vocabulary Master badge",
      },
    ],
    rarity: "UNCOMMON",
    unlockedBy: [],
    isHidden: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

/**
 * Utility functions for test data creation
 */
export const TestDataUtils = {
  /**
   * Create random date within range
   */
  randomDateInRange: (start: Date, end: Date): Date => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  },

  /**
   * Create array of dates for time series data
   */
  createDateSeries: (startDate: Date, days: number): Date[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  },

  /**
   * Generate realistic accuracy progression
   */
  generateAccuracyProgression: (
    startAccuracy: number,
    sessions: number,
    improvementRate: number,
  ): number[] => {
    const progression = [startAccuracy];
    for (let i = 1; i < sessions; i++) {
      const improvement = (Math.random() - 0.4) * improvementRate; // Some randomness
      const newAccuracy = Math.max(
        0,
        Math.min(100, progression[i - 1] + improvement),
      );
      progression.push(newAccuracy);
    }
    return progression;
  },

  /**
   * Create realistic response time data with learning curve
   */
  generateResponseTimes: (
    sessions: number,
    baseTime: number = 5000,
  ): number[] => {
    return Array.from({ length: sessions }, (_, i) => {
      const learningCurve = Math.exp(-i * 0.1); // Exponential improvement
      const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
      return Math.round(baseTime * learningCurve * randomVariation);
    });
  },
};

// Export all factories for easy access
export const TestFactories = {
  SpacedRepetition: SpacedRepetitionFactories,
  Analytics: AnalyticsFactories,
  Assessment: AssessmentFactories,
  Calibration: CalibrationFactories,
  Motivation: MotivationFactories,
  Utils: TestDataUtils,
};

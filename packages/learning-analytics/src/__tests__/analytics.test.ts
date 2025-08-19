/**
 * Comprehensive tests for Learning Analytics Engine
 * Tests analytics generation, insights creation, and statistical calculations
 */

import { LearningAnalyticsEngine } from '../analytics';
import type { Analytics, SpacedRepetition } from '../shared/types';
import { TestFactories } from '../shared/__tests__/testDataFactories';

describe('LearningAnalyticsEngine', () => {
  const sampleCards: SpacedRepetition.VocabularyCard[] = [
    TestFactories.SpacedRepetition.createVocabularyCard({
      id: 'card-1',
      word: 'serendipity',
      definition: 'A pleasant surprise',
      context: 'Example context',
      examples: ['Example 1'],
      tags: ['advanced', 'nouns'],
      learningStage: 'MASTERED',
      correctReviews: 10,
      totalReviews: 12,
      mastery: 95
    }),
    TestFactories.SpacedRepetition.createVocabularyCard({
      id: 'card-2',
      word: 'ephemeral',
      definition: 'Lasting for a short time',
      context: 'Another context',
      examples: ['Example 2'],
      tags: ['intermediate', 'adjectives'],
      learningStage: 'LEARNING',
      correctReviews: 5,
      totalReviews: 8,
      mastery: 65
    }),
    TestFactories.SpacedRepetition.createVocabularyCard({
      id: 'card-3',
      word: 'ubiquitous',
      definition: 'Present everywhere',
      context: 'Third context',
      examples: [],
      tags: ['advanced', 'adjectives'],
      learningStage: 'NEW',
      correctReviews: 0,
      totalReviews: 0,
      mastery: 0
    })
  ];

  const sampleSessions: SpacedRepetition.ReviewSession[] = [
    {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min session
      cardsReviewed: 10,
      cardsCorrect: 8,
      totalTime: 15 * 60 * 1000, // 15 minutes
      averageResponseTime: 3000,
      sessionType: 'DAILY_REVIEW',
      questions: []
    },
    {
      id: 'session-2',
      userId: 'user-1',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // 20 min session
      cardsReviewed: 12,
      cardsCorrect: 10,
      totalTime: 20 * 60 * 1000, // 20 minutes
      averageResponseTime: 2500,
      sessionType: 'DAILY_REVIEW',
      questions: []
    },
    {
      id: 'session-3',
      userId: 'user-1',
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), // 10 min session
      cardsReviewed: 8,
      cardsCorrect: 6,
      totalTime: 10 * 60 * 1000, // 10 minutes
      averageResponseTime: 4000,
      sessionType: 'CUSTOM_REVIEW',
      questions: []
    }
  ];

  describe('Analytics Generation', () => {
    let analytics: LearningAnalytics;

    beforeEach(() => {
      analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
    });

    it('should generate analytics with correct basic metrics', () => {
      expect(analytics.totalWordsLearned).toBe(2); // Only cards with reviews > 0
      expect(analytics.activeCards).toBe(1); // Cards in LEARNING stage
      expect(analytics.masteredCards).toBe(1); // Cards in MASTERED stage
      expect(analytics.averageMastery).toBe(53); // Average of 95, 65, 0
      expect(analytics.overallAccuracy).toBe(75); // 15 correct out of 20 total
    });

    it('should calculate time-based metrics correctly', () => {
      expect(analytics.dailyStreak).toBeGreaterThanOrEqual(0);
      expect(analytics.weeklyProgress).toBeGreaterThanOrEqual(0);
      expect(analytics.totalStudyTime).toBe(45); // 15 + 20 + 10 minutes
      expect(analytics.averageSessionLength).toBe(15); // 45/3 sessions
    });

    it('should identify learning patterns', () => {
      expect(analytics.bestTimeOfDay).toBeDefined();
      expect(analytics.mostDifficultWords).toBeDefined();
      expect(analytics.strongestCategories).toBeDefined();
      expect(analytics.weakestCategories).toBeDefined();
      expect(analytics.learningVelocity).toBeGreaterThanOrEqual(0);
    });

    it('should provide predictions and recommendations', () => {
      expect(analytics.readinessLevel).toBeGreaterThanOrEqual(0);
      expect(analytics.readinessLevel).toBeLessThanOrEqual(100);
      expect(analytics.suggestedDailyGoal).toBeGreaterThan(0);
      expect(analytics.estimatedTimeToMastery).toBeGreaterThanOrEqual(0);
    });

    it('should include achievements and milestones', () => {
      expect(Array.isArray(analytics.weeklyAchievements)).toBe(true);
      expect(Array.isArray(analytics.streakMilestones)).toBe(true);
      expect(Array.isArray(analytics.improvementAreas)).toBe(true);
    });

    it('should throw ValidationError for invalid cards input', () => {
      expect(() => {
        LearningAnalyticsEngine.generateAnalytics(null as any, sampleSessions);
      }).toThrow('Analytics generation failed: Cards must be an array');
    });

    it('should throw ValidationError for invalid sessions input', () => {
      expect(() => {
        LearningAnalyticsEngine.generateAnalytics(sampleCards, null as any);
      }).toThrow('Analytics generation failed: Sessions must be an array');
    });

    it('should handle empty arrays gracefully', () => {
      const emptyAnalytics = LearningAnalyticsEngine.generateAnalytics([], []);
      
      expect(emptyAnalytics.totalWordsLearned).toBe(0);
      expect(emptyAnalytics.activeCards).toBe(0);
      expect(emptyAnalytics.masteredCards).toBe(0);
      expect(emptyAnalytics.averageMastery).toBe(0);
      expect(emptyAnalytics.overallAccuracy).toBe(0);
      expect(emptyAnalytics.totalStudyTime).toBe(0);
      expect(emptyAnalytics.averageSessionLength).toBe(0);
    });
  });

  describe('Insights Generation', () => {
    let analytics: LearningAnalytics;
    let insights: any[];

    beforeEach(() => {
      analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      insights = LearningAnalyticsEngine.generateInsights(analytics);
    });

    it('should generate insights array', () => {
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should create insights with correct structure', () => {
      insights.forEach(insight => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('description');
        expect(insight).toHaveProperty('actionable');
        expect(insight).toHaveProperty('priority');
        
        expect(['low', 'medium', 'high']).toContain(insight.priority);
        expect(['CELEBRATION', 'RECOMMENDATION', 'TIP', 'WARNING']).toContain(insight.type);
      });
    });

    it('should prioritize insights correctly', () => {
      const priorities = insights.map(i => i.priority);
      const priorityOrder = ['high', 'medium', 'low'];
      
      for (let i = 0; i < priorities.length - 1; i++) {
        const currentPriorityIndex = priorityOrder.indexOf(priorities[i]);
        const nextPriorityIndex = priorityOrder.indexOf(priorities[i + 1]);
        expect(currentPriorityIndex).toBeLessThanOrEqual(nextPriorityIndex);
      }
    });

    it('should generate celebration insights for high performance', () => {
      const highPerformanceAnalytics = {
        ...analytics,
        weeklyProgress: 120,
        dailyStreak: 15,
        overallAccuracy: 95
      };
      
      const celebrationInsights = LearningAnalyticsEngine.generateInsights(highPerformanceAnalytics);
      const celebrations = celebrationInsights.filter(i => i.type === 'CELEBRATION');
      
      expect(celebrations.length).toBeGreaterThan(0);
    });

    it('should generate recommendation insights for improvement areas', () => {
      const lowPerformanceAnalytics = {
        ...analytics,
        weeklyProgress: 30,
        overallAccuracy: 60,
        dailyStreak: 0
      };
      
      const improvementInsights = LearningAnalyticsEngine.generateInsights(lowPerformanceAnalytics);
      const recommendations = improvementInsights.filter(i => i.type === 'RECOMMENDATION');
      
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should generate tip insights for learning optimization', () => {
      const analyticsWithAreas = {
        ...analytics,
        weakestCategories: ['grammar', 'vocabulary'],
        averageSessionLength: 3
      };
      
      const tipInsights = LearningAnalyticsEngine.generateInsights(analyticsWithAreas);
      const tips = tipInsights.filter(i => i.type === 'TIP');
      
      expect(tips.length).toBeGreaterThan(0);
    });
  });

  describe('Statistical Calculations', () => {
    it('should calculate daily streak correctly', () => {
      // Test with consecutive daily sessions
      const consecutiveSessions = [
        { ...sampleSessions[0], startTime: new Date() }, // Today
        { ...sampleSessions[1], startTime: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Yesterday
        { ...sampleSessions[2], startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // 2 days ago
      ];
      
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, consecutiveSessions);
      expect(analytics.dailyStreak).toBeGreaterThanOrEqual(3);
    });

    it('should calculate weekly progress correctly', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      // Weekly progress should be based on cards reviewed this week
      expect(analytics.weeklyProgress).toBeGreaterThanOrEqual(0);
      expect(analytics.weeklyProgress).toBeLessThanOrEqual(100);
    });

    it('should find most difficult words accurately', () => {
      const cardsWithDifficulty = [
        { ...sampleCards[0], correctReviews: 2, totalReviews: 10 }, // 20% accuracy
        { ...sampleCards[1], correctReviews: 8, totalReviews: 10 }, // 80% accuracy
        { ...sampleCards[2], correctReviews: 9, totalReviews: 10 }  // 90% accuracy
      ];
      
      const analytics = LearningAnalyticsEngine.generateAnalytics(cardsWithDifficulty, sampleSessions);
      
      expect(analytics.mostDifficultWords.length).toBeGreaterThan(0);
      expect(analytics.mostDifficultWords[0].id).toBe('card-1'); // Should be the hardest
    });

    it('should analyze category strengths correctly', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      expect(Array.isArray(analytics.strongestCategories)).toBe(true);
      expect(Array.isArray(analytics.weakestCategories)).toBe(true);
    });

    it('should calculate learning velocity', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      expect(typeof analytics.learningVelocity).toBe('number');
      expect(analytics.learningVelocity).toBeGreaterThanOrEqual(0);
    });

    it('should calculate readiness level based on multiple factors', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      expect(analytics.readinessLevel).toBeGreaterThanOrEqual(0);
      expect(analytics.readinessLevel).toBeLessThanOrEqual(100);
    });

    it('should suggest appropriate daily goals', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      expect(analytics.suggestedDailyGoal).toBeGreaterThan(0);
      expect(analytics.suggestedDailyGoal).toBeLessThanOrEqual(25); // Reasonable maximum
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle cards with no reviews', () => {
      const newCards = [
        { ...sampleCards[2], totalReviews: 0, correctReviews: 0 }
      ];
      
      const analytics = LearningAnalyticsEngine.generateAnalytics(newCards, []);
      
      expect(analytics.totalWordsLearned).toBe(0);
      expect(analytics.overallAccuracy).toBe(0);
      expect(analytics.averageMastery).toBe(0);
    });

    it('should handle sessions with zero duration', () => {
      const zeroDurationSessions = [
        { ...sampleSessions[0], totalTime: 0 }
      ];
      
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, zeroDurationSessions);
      
      expect(analytics.averageSessionLength).toBe(0);
    });

    it('should handle extreme mastery values', () => {
      const extremeCards = [
        { ...sampleCards[0], mastery: 150 }, // Over 100%
        { ...sampleCards[1], mastery: -10 }  // Negative
      ];
      
      expect(() => {
        LearningAnalyticsEngine.generateAnalytics(extremeCards, sampleSessions);
      }).not.toThrow();
    });

    it('should handle future session dates', () => {
      const futureSessions = [
        { ...sampleSessions[0], startTime: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      ];
      
      expect(() => {
        LearningAnalyticsEngine.generateAnalytics(sampleCards, futureSessions);
      }).not.toThrow();
    });

    it('should handle cards with invalid tags', () => {
      const invalidTagCards = [
        { ...sampleCards[0], tags: null as any },
        { ...sampleCards[1], tags: ['valid-tag'] }
      ];
      
      expect(() => {
        LearningAnalyticsEngine.generateAnalytics(invalidTagCards, sampleSessions);
      }).not.toThrow();
    });
  });

  describe('Performance and Consistency', () => {
    it('should generate consistent results for same input', () => {
      const analytics1 = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      const analytics2 = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      expect(analytics1.totalWordsLearned).toBe(analytics2.totalWordsLearned);
      expect(analytics1.overallAccuracy).toBe(analytics2.overallAccuracy);
      expect(analytics1.averageMastery).toBe(analytics2.averageMastery);
    });

    it('should handle large datasets efficiently', () => {
      // Generate large dataset
      const largeCards = Array(1000).fill(null).map((_, i) => ({
        ...sampleCards[0],
        id: `card-${i}`,
        word: `word-${i}`
      }));
      
      const largeSessions = Array(500).fill(null).map((_, i) => ({
        ...sampleSessions[0],
        id: `session-${i}`,
        startTime: new Date(Date.now() - i * 60 * 60 * 1000)
      }));
      
      const startTime = performance.now();
      const analytics = LearningAnalyticsEngine.generateAnalytics(largeCards, largeSessions);
      const endTime = performance.now();
      
      expect(analytics).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should maintain data integrity', () => {
      const analytics = LearningAnalyticsEngine.generateAnalytics(sampleCards, sampleSessions);
      
      // Verify relationships between metrics
      expect(analytics.activeCards + analytics.masteredCards).toBeLessThanOrEqual(analytics.totalWordsLearned + 1);
      expect(analytics.overallAccuracy).toBeLessThanOrEqual(100);
      expect(analytics.averageMastery).toBeLessThanOrEqual(100);
    });
  });
});
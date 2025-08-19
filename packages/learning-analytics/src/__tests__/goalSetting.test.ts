/**
 * Comprehensive tests for Learning Goal Setting Engine
 * Tests goal creation, progress tracking, and recommendations
 */

import { 
  LearningGoalEngine, 
  GoalCategory, 
  GoalType, 
  GoalTimeframe, 
  GoalPriority, 
  GoalMetric 
} from '../goalSetting';
import type { SpacedRepetition } from '../../shared/types';
import type { LearningGoal, LearningAnalytics, VocabularyCard, ReviewSession } from '../goalSetting';

describe('LearningGoalEngine', () => {
  const sampleAnalytics: LearningAnalytics = {
    totalWordsLearned: 75,
    activeCards: 20,
    masteredCards: 15,
    averageMastery: 65,
    overallAccuracy: 80,
    dailyStreak: 5,
    weeklyProgress: 70,
    monthlyGoal: 200,
    monthlyProgress: 85,
    totalStudyTime: 300,
    averageSessionLength: 15,
    bestTimeOfDay: 'Morning',
    mostDifficultWords: [],
    strongestCategories: ['nouns'],
    weakestCategories: ['verbs'],
    learningVelocity: 10,
    readinessLevel: 85,
    suggestedDailyGoal: 12,
    estimatedTimeToMastery: 30,
    weeklyAchievements: [],
    streakMilestones: [3],
    improvementAreas: []
  };

  const sampleCards: VocabularyCard[] = [
    {
      id: 'card-1',
      word: 'serendipity',
      definition: 'A pleasant surprise',
      context: 'Example context',
      examples: ['Example 1'],
      tags: ['advanced', 'nouns'],
      learningStage: 'MASTERED',
      masteryLevel: 0,
      nextReviewDate: new Date(),
      reviewInterval: 30,
      easinessFactor: 2.5,
      correctReviews: 10,
      totalReviews: 12,
      mastery: 95,
      lastReviewDate: new Date()
    },
    {
      id: 'card-2',
      word: 'ephemeral',
      definition: 'Lasting for a short time',
      context: 'Another context',
      examples: ['Example 2'],
      tags: ['intermediate', 'adjectives'],
      learningStage: 'LEARNING',
      masteryLevel: 0,
      nextReviewDate: new Date(),
      reviewInterval: 3,
      easinessFactor: 2.3,
      correctReviews: 5,
      totalReviews: 8,
      mastery: 65,
      lastReviewDate: new Date()
    }
  ];

  const sampleSessions: ReviewSession[] = [
    {
      id: 'session-1',
      userId: 'user-1',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      cardsReviewed: 10,
      cardsCorrect: 8,
      totalTime: 15 * 60 * 1000,
      averageResponseTime: 3000,
      sessionType: 'DAILY_REVIEW',
      questions: []
    },
    {
      id: 'session-2',
      userId: 'user-1',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      cardsReviewed: 12,
      cardsCorrect: 10,
      totalTime: 20 * 60 * 1000,
      averageResponseTime: 2500,
      sessionType: 'DAILY_REVIEW',
      questions: []
    }
  ];

  describe('Goal Recommendations', () => {
    it('should generate vocabulary recommendations for beginners', () => {
      const beginnerAnalytics = { ...sampleAnalytics, totalWordsLearned: 25 };
      const recommendations = LearningGoalEngine.generateRecommendations(beginnerAnalytics);
      
      const vocabRecommendation = recommendations.find(r => 
        r.goalTemplate.category === GoalCategory.VOCABULARY
      );
      
      expect(vocabRecommendation).toBeDefined();
      expect(vocabRecommendation?.goalTemplate.title).toContain('Core Vocabulary');
      expect(vocabRecommendation?.priority).toBe(GoalPriority.HIGH);
    });

    it('should generate accuracy improvement recommendations', () => {
      const lowAccuracyAnalytics = { ...sampleAnalytics, overallAccuracy: 65 };
      const recommendations = LearningGoalEngine.generateRecommendations(lowAccuracyAnalytics);
      
      const accuracyRecommendation = recommendations.find(r => 
        r.goalTemplate.category === GoalCategory.ACCURACY
      );
      
      expect(accuracyRecommendation).toBeDefined();
      expect(accuracyRecommendation?.goalTemplate.target).toBe(80);
      expect(accuracyRecommendation?.goalTemplate.targetMetric).toBe(GoalMetric.ACCURACY_PERCENTAGE);
    });

    it('should generate consistency recommendations for low streak', () => {
      const lowStreakAnalytics = { ...sampleAnalytics, dailyStreak: 2 };
      const recommendations = LearningGoalEngine.generateRecommendations(lowStreakAnalytics);
      
      const consistencyRecommendation = recommendations.find(r => 
        r.goalTemplate.category === GoalCategory.CONSISTENCY
      );
      
      expect(consistencyRecommendation).toBeDefined();
      expect(consistencyRecommendation?.goalTemplate.type).toBe(GoalType.HABIT);
      expect(consistencyRecommendation?.goalTemplate.target).toBe(7);
    });

    it('should generate advanced goals for experienced learners', () => {
      const advancedAnalytics = { ...sampleAnalytics, totalWordsLearned: 150 };
      const recommendations = LearningGoalEngine.generateRecommendations(advancedAnalytics);
      
      const speedRecommendation = recommendations.find(r => 
        r.goalTemplate.category === GoalCategory.SPEED
      );
      
      expect(speedRecommendation).toBeDefined();
      expect(speedRecommendation?.estimatedDifficulty).toBe('Hard');
    });

    it('should filter out existing goal categories', () => {
      const existingGoals: LearningGoal[] = [
        {
          id: 'goal-1',
          title: 'Existing Vocabulary Goal',
          description: 'Learn words',
          category: GoalCategory.VOCABULARY,
          type: GoalType.ACHIEVEMENT,
          target: 50,
          currentProgress: 25,
          timeframe: GoalTimeframe.MONTHLY,
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          isCompleted: false,
          completedAt: undefined,
          priority: GoalPriority.HIGH,
          targetMetric: GoalMetric.WORDS_LEARNED,
          motivation: 'Keep learning!',
          reward: undefined,
          milestones: [],
          progressHistory: []
        }
      ];
      
      const recommendations = LearningGoalEngine.generateRecommendations(
        { ...sampleAnalytics, totalWordsLearned: 25 }, 
        existingGoals
      );
      
      const vocabRecommendation = recommendations.find(r => 
        r.goalTemplate.category === GoalCategory.VOCABULARY
      );
      
      expect(vocabRecommendation).toBeUndefined();
    });

    it('should include estimation metadata in recommendations', () => {
      const recommendations = LearningGoalEngine.generateRecommendations(sampleAnalytics);
      
      recommendations.forEach(recommendation => {
        expect(recommendation).toHaveProperty('reason');
        expect(recommendation).toHaveProperty('estimatedDifficulty');
        expect(recommendation).toHaveProperty('estimatedTimeToComplete');
        expect(['Easy', 'Medium', 'Hard']).toContain(recommendation.estimatedDifficulty);
        expect(recommendation.estimatedTimeToComplete).toBeGreaterThan(0);
      });
    });
  });

  describe('Goal Creation', () => {
    const validTemplate = {
      title: 'Learn 25 Words',
      description: 'Learn 25 new vocabulary words',
      category: GoalCategory.VOCABULARY,
      type: GoalType.ACHIEVEMENT,
      target: 25,
      timeframe: GoalTimeframe.MONTHLY,
      targetMetric: GoalMetric.WORDS_LEARNED,
      priority: GoalPriority.HIGH
    };

    it('should create goal with valid template', () => {
      const goal = LearningGoalEngine.createGoal(validTemplate);
      
      expect(goal.id).toBeDefined();
      expect(goal.title).toBe('Learn 25 Words');
      expect(goal.target).toBe(25);
      expect(goal.currentProgress).toBe(0);
      expect(goal.isActive).toBe(true);
      expect(goal.isCompleted).toBe(false);
      expect(goal.milestones.length).toBeGreaterThan(0);
      expect(goal.progressHistory).toEqual([]);
    });

    it('should apply customizations when provided', () => {
      const customizations = {
        currentProgress: 10,
        motivation: 'Custom motivation!'
      };
      
      const goal = LearningGoalEngine.createGoal(validTemplate, customizations);
      
      expect(goal.currentProgress).toBe(10);
      expect(goal.motivation).toBe('Custom motivation!');
    });

    it('should set default values for missing properties', () => {
      const minimalTemplate = {
        title: 'Minimal Goal'
      };
      
      const goal = LearningGoalEngine.createGoal(minimalTemplate);
      
      expect(goal.category).toBe(GoalCategory.VOCABULARY);
      expect(goal.type).toBe(GoalType.ACHIEVEMENT);
      expect(goal.target).toBe(10);
      expect(goal.timeframe).toBe(GoalTimeframe.WEEKLY);
      expect(goal.priority).toBe(GoalPriority.MEDIUM);
    });

    it('should calculate end date based on timeframe', () => {
      const weeklyGoal = LearningGoalEngine.createGoal({
        ...validTemplate,
        timeframe: GoalTimeframe.WEEKLY
      });
      
      const monthlyGoal = LearningGoalEngine.createGoal({
        ...validTemplate,
        timeframe: GoalTimeframe.MONTHLY
      });
      
      expect(monthlyGoal.endDate.getTime()).toBeGreaterThan(weeklyGoal.endDate.getTime());
    });

    it('should generate appropriate milestones based on target', () => {
      const smallTargetGoal = LearningGoalEngine.createGoal({
        ...validTemplate,
        target: 10
      });
      
      const largeTargetGoal = LearningGoalEngine.createGoal({
        ...validTemplate,
        target: 100
      });
      
      expect(smallTargetGoal.milestones.length).toBeGreaterThanOrEqual(2);
      expect(largeTargetGoal.milestones.length).toBeGreaterThan(smallTargetGoal.milestones.length);
      expect(largeTargetGoal.milestones.length).toBeLessThanOrEqual(4);
    });

    it('should throw ValidationError for invalid template', () => {
      expect(() => {
        LearningGoalEngine.createGoal({ title: '' });
      }).toThrow('Goal creation failed: Goal title must be between 1 and 200 characters');
    });
  });

  describe('Goal Progress Updates', () => {
    let sampleGoals: LearningGoal[];

    beforeEach(() => {
      // Create goals with start dates 3 days ago to include historical sessions
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      sampleGoals = [
        LearningGoalEngine.createGoal({
          title: 'Learn 10 Words',
          category: GoalCategory.VOCABULARY,
          type: GoalType.ACHIEVEMENT,
          target: 10,
          targetMetric: GoalMetric.WORDS_LEARNED,
          timeframe: GoalTimeframe.WEEKLY
        }, { startDate }),
        LearningGoalEngine.createGoal({
          title: 'Review 50 Cards',
          category: GoalCategory.REVIEW,
          type: GoalType.ACHIEVEMENT,
          target: 50,
          targetMetric: GoalMetric.REVIEW_COUNT,
          timeframe: GoalTimeframe.WEEKLY
        }, { startDate }),
        LearningGoalEngine.createGoal({
          title: 'Maintain 85% Accuracy',
          category: GoalCategory.ACCURACY,
          type: GoalType.MAINTENANCE,
          target: 85,
          targetMetric: GoalMetric.ACCURACY_PERCENTAGE,
          timeframe: GoalTimeframe.WEEKLY
        }, { startDate })
      ];
    });

    it('should update vocabulary learning goals correctly', () => {
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        sampleGoals,
        sampleCards,
        sampleSessions
      );
      
      const vocabGoal = updatedGoals.find(g => g.category === GoalCategory.VOCABULARY);
      expect(vocabGoal?.currentProgress).toBeGreaterThanOrEqual(0);
    });

    it('should update review count goals correctly', () => {
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        sampleGoals,
        sampleCards,
        sampleSessions
      );
      
      const reviewGoal = updatedGoals.find(g => g.targetMetric === GoalMetric.REVIEW_COUNT);
      expect(reviewGoal?.currentProgress).toBe(22); // 10 + 12 from sample sessions
    });

    it('should update accuracy goals correctly', () => {
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        sampleGoals,
        sampleCards,
        sampleSessions
      );
      
      const accuracyGoal = updatedGoals.find(g => g.targetMetric === GoalMetric.ACCURACY_PERCENTAGE);
      expect(accuracyGoal?.currentProgress).toBeGreaterThanOrEqual(0);
      expect(accuracyGoal?.currentProgress).toBeLessThanOrEqual(100);
    });

    it('should mark goals as completed when target is reached', () => {
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const lowTargetGoal = LearningGoalEngine.createGoal({
        title: 'Review 5 Cards',
        target: 5,
        targetMetric: GoalMetric.REVIEW_COUNT,
        timeframe: GoalTimeframe.WEEKLY
      }, { startDate });
      
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        [lowTargetGoal],
        sampleCards,
        sampleSessions
      );
      
      expect(updatedGoals[0].isCompleted).toBe(true);
      expect(updatedGoals[0].completedAt).toBeDefined();
    });

    it('should update milestone completion', () => {
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const goal = LearningGoalEngine.createGoal({
        title: 'Review 20 Cards',
        target: 20,
        targetMetric: GoalMetric.REVIEW_COUNT,
        timeframe: GoalTimeframe.WEEKLY
      }, { startDate });
      
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        [goal],
        sampleCards,
        sampleSessions
      );
      
      const updatedGoal = updatedGoals[0];
      const completedMilestones = updatedGoal.milestones.filter(m => m.isCompleted);
      expect(completedMilestones.length).toBeGreaterThan(0);
    });

    it('should add progress history entries', () => {
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        sampleGoals,
        sampleCards,
        sampleSessions
      );
      
      updatedGoals.forEach(goal => {
        expect(goal.progressHistory.length).toBeGreaterThan(0);
        const latestEntry = goal.progressHistory[goal.progressHistory.length - 1];
        expect(latestEntry.date).toBeInstanceOf(Date);
        expect(latestEntry.value).toBeDefined();
      });
    });

    it('should not update inactive or completed goals', () => {
      const inactiveGoal = { ...sampleGoals[0], isActive: false };
      const completedGoal = { ...sampleGoals[1], isCompleted: true };
      
      const updatedGoals = LearningGoalEngine.updateGoalProgress(
        [inactiveGoal, completedGoal],
        sampleCards,
        sampleSessions
      );
      
      expect(updatedGoals[0]).toEqual(inactiveGoal);
      expect(updatedGoals[1]).toEqual(completedGoal);
    });
  });

  describe('Goal Progress Analytics', () => {
    let sampleGoals: LearningGoal[];

    beforeEach(() => {
      sampleGoals = [
        {
          ...LearningGoalEngine.createGoal({
            title: 'Weekly Goal',
            target: 100,
            timeframe: GoalTimeframe.WEEKLY
          }),
          currentProgress: 60,
          progressHistory: [
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 20, notes: undefined },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 40, notes: undefined },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 60, notes: undefined }
          ]
        }
      ];
    });

    it('should calculate progress percentage correctly', () => {
      const goalProgress = LearningGoalEngine.getGoalProgress(sampleGoals);
      
      expect(goalProgress[0].progressPercentage).toBe(60);
    });

    it('should determine if goals are on track', () => {
      const goalProgress = LearningGoalEngine.getGoalProgress(sampleGoals);
      
      expect(typeof goalProgress[0].isOnTrack).toBe('boolean');
    });

    it('should calculate days remaining', () => {
      const goalProgress = LearningGoalEngine.getGoalProgress(sampleGoals);
      
      expect(goalProgress[0].daysRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should project completion date based on progress rate', () => {
      const goalProgress = LearningGoalEngine.getGoalProgress(sampleGoals);
      
      if (goalProgress[0].projectedCompletion) {
        expect(goalProgress[0].projectedCompletion).toBeInstanceOf(Date);
      }
    });

    it('should calculate progress trend', () => {
      const goalProgress = LearningGoalEngine.getGoalProgress(sampleGoals);
      
      expect(['Improving', 'Declining', 'Stable']).toContain(goalProgress[0].recentTrend);
    });
  });

  describe('Goal Filtering and Queries', () => {
    let mixedGoals: LearningGoal[];

    beforeEach(() => {
      mixedGoals = [
        LearningGoalEngine.createGoal({
          title: 'Vocab Goal',
          category: GoalCategory.VOCABULARY,
          timeframe: GoalTimeframe.WEEKLY
        }),
        {
          ...LearningGoalEngine.createGoal({
            title: 'Accuracy Goal',
            category: GoalCategory.ACCURACY,
            timeframe: GoalTimeframe.MONTHLY
          }),
          isCompleted: true,
          completedAt: new Date()
        },
        {
          ...LearningGoalEngine.createGoal({
            title: 'Consistency Goal',
            category: GoalCategory.CONSISTENCY,
            timeframe: GoalTimeframe.DAILY
          }),
          isActive: false
        }
      ];
    });

    it('should filter goals by category', () => {
      const vocabGoals = LearningGoalEngine.getGoalsByCategory(mixedGoals, GoalCategory.VOCABULARY);
      
      expect(vocabGoals.length).toBe(1);
      expect(vocabGoals[0].category).toBe(GoalCategory.VOCABULARY);
    });

    it('should filter only active goals by category', () => {
      const consistencyGoals = LearningGoalEngine.getGoalsByCategory(mixedGoals, GoalCategory.CONSISTENCY);
      
      expect(consistencyGoals.length).toBe(0); // Should exclude inactive goal
    });

    it('should get completed goals', () => {
      const completedGoals = LearningGoalEngine.getCompletedGoals(mixedGoals);
      
      expect(completedGoals.length).toBe(1);
      expect(completedGoals[0].isCompleted).toBe(true);
    });
  });

  describe('Goal Statistics', () => {
    let sampleGoals: LearningGoal[];

    beforeEach(() => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

      sampleGoals = [
        { // Active, on track
          ...LearningGoalEngine.createGoal({ title: 'Goal 1', target: 100 }),
          currentProgress: 50,
          endDate: futureDate
        },
        { // Completed
          ...LearningGoalEngine.createGoal({ title: 'Goal 2', target: 50 }),
          currentProgress: 50,
          isCompleted: true,
          completedAt: new Date(),
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          endDate: futureDate
        },
        { // Overdue
          ...LearningGoalEngine.createGoal({ title: 'Goal 3', target: 100 }),
          currentProgress: 30,
          endDate: pastDate
        },
        { // Inactive
          ...LearningGoalEngine.createGoal({ title: 'Goal 4', target: 100 }),
          isActive: false
        }
      ];
    });

    it('should calculate total statistics correctly', () => {
      const stats = LearningGoalEngine.calculateStatistics(sampleGoals);
      
      expect(stats.total).toBe(4);
      expect(stats.active).toBe(2); // Goals 1 and 3 (active and not completed)
      expect(stats.completed).toBe(1); // Goal 2
      expect(stats.overdue).toBe(1); // Goal 3
    });

    it('should calculate completion rate correctly', () => {
      const stats = LearningGoalEngine.calculateStatistics(sampleGoals);
      
      expect(stats.completionRate).toBe(25); // 1 out of 4 goals completed
    });

    it('should calculate average time to complete', () => {
      const stats = LearningGoalEngine.calculateStatistics(sampleGoals);
      
      expect(stats.averageTimeToComplete).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty goal array', () => {
      const stats = LearningGoalEngine.calculateStatistics([]);
      
      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.averageTimeToComplete).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle goals with invalid dates', () => {
      const invalidGoal = {
        ...LearningGoalEngine.createGoal({ title: 'Test Goal' }),
        endDate: new Date('invalid-date')
      };
      
      expect(() => {
        LearningGoalEngine.getGoalProgress([invalidGoal]);
      }).not.toThrow();
    });

    it('should handle goals with negative progress', () => {
      const negativeProgressGoal = {
        ...LearningGoalEngine.createGoal({ title: 'Test Goal', target: 100 }),
        currentProgress: -10
      };
      
      const goalProgress = LearningGoalEngine.getGoalProgress([negativeProgressGoal]);
      expect(goalProgress[0].progressPercentage).toBe(0); // Should be clamped to 0
    });

    it('should handle goals with progress exceeding target', () => {
      const exceededGoal = {
        ...LearningGoalEngine.createGoal({ title: 'Test Goal', target: 100 }),
        currentProgress: 150
      };
      
      const goalProgress = LearningGoalEngine.getGoalProgress([exceededGoal]);
      expect(goalProgress[0].progressPercentage).toBe(100); // Should be capped at 100
    });

    it('should handle empty progress history', () => {
      const goal = LearningGoalEngine.createGoal({ title: 'Test Goal' });
      
      const goalProgress = LearningGoalEngine.getGoalProgress([goal]);
      expect(goalProgress[0].recentTrend).toBe('Stable');
      expect(goalProgress[0].projectedCompletion).toBeNull();
    });

    it('should handle very short timeframes', () => {
      const shortGoal = LearningGoalEngine.createGoal({
        title: 'Daily Goal',
        timeframe: GoalTimeframe.DAILY,
        target: 5
      });
      
      expect(shortGoal.endDate.getTime()).toBeGreaterThan(shortGoal.startDate.getTime());
    });

    it('should handle zero target goals', () => {
      expect(() => {
        LearningGoalEngine.createGoal({ title: 'Zero Goal', target: 0 });
      }).toThrow('Goal creation failed: Goal target must be a positive number');
    });
  });
});
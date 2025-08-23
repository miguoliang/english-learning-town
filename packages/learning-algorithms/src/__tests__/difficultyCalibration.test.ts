/**
 * Comprehensive tests for Adaptive Difficulty Calibration System
 * Tests performance assessment, adaptation strategies, and difficulty adjustments
 */

import {
  DifficultyCalibrationEngine,
  DifficultyLevel,
  PerformanceZone,
  PerformanceMetrics,
  ContentDifficulty,
  AdaptationStrategy,
} from "../difficultyCalibration";
import type { CEFRLevel, LanguageSkill } from "../shared/types";

describe("DifficultyCalibrationEngine", () => {
  const samplePerformanceMetrics: PerformanceMetrics = {
    totalAttempts: 20,
    correctAnswers: 15,
    averageResponseTime: 3000,
    consecutiveCorrect: 3,
    consecutiveIncorrect: 0,
    recentAccuracy: 75,
    skillBreakdown: {
      LISTENING: 80,
      READING: 70,
      WRITING: 65,
      SPEAKING: 75,
      VOCABULARY: 85,
      GRAMMAR: 70,
      PRONUNCIATION: 60,
    },
    improvementRate: 5,
    confidenceScore: 78,
  };

  const sampleContentDifficulty: ContentDifficulty = {
    vocabularyComplexity: 6,
    grammarComplexity: 6,
    comprehensionLevel: 6,
    taskComplexity: 6,
    overallDifficulty: 6,
    targetCEFRLevel: "B2",
    estimatedSuccessRate: 75,
    adaptationReason: "Initial calibration",
  };

  describe("Performance Zone Assessment", () => {
    it("should identify frustration zone for low performance", () => {
      const metrics = { ...samplePerformanceMetrics, recentAccuracy: 45 };
      const zone = DifficultyCalibrationEngine.assessPerformanceZone(metrics);
      expect(zone).toBe(PerformanceZone.FRUSTRATION);
    });

    it("should identify challenge zone for optimal performance", () => {
      const metrics = { ...samplePerformanceMetrics, recentAccuracy: 72 };
      const zone = DifficultyCalibrationEngine.assessPerformanceZone(metrics);
      expect(zone).toBe(PerformanceZone.CHALLENGE);
    });

    it("should identify comfort zone for good performance", () => {
      const metrics = { ...samplePerformanceMetrics, recentAccuracy: 88 };
      const zone = DifficultyCalibrationEngine.assessPerformanceZone(metrics);
      expect(zone).toBe(PerformanceZone.COMFORT);
    });

    it("should identify mastery zone for high performance", () => {
      const metrics = { ...samplePerformanceMetrics, recentAccuracy: 97 };
      const zone = DifficultyCalibrationEngine.assessPerformanceZone(metrics);
      expect(zone).toBe(PerformanceZone.MASTERY);
    });

    it("should throw error for invalid performance metrics", () => {
      expect(() => {
        DifficultyCalibrationEngine.assessPerformanceZone(null as any);
      }).toThrow("Performance metrics must be an object");
    });
  });

  describe("Performance Metrics Calculation", () => {
    const sampleAttempts = [
      {
        correct: true,
        responseTime: 2000,
        skill: "VOCABULARY",
        timestamp: new Date(),
      },
      {
        correct: false,
        responseTime: 4000,
        skill: "GRAMMAR",
        timestamp: new Date(),
      },
      {
        correct: true,
        responseTime: 3000,
        skill: "READING",
        timestamp: new Date(),
      },
      {
        correct: true,
        responseTime: 2500,
        skill: "VOCABULARY",
        timestamp: new Date(),
      },
      {
        correct: false,
        responseTime: 5000,
        skill: "WRITING",
        timestamp: new Date(),
      },
    ];

    it("should calculate basic performance metrics correctly", () => {
      const metrics =
        DifficultyCalibrationEngine.calculatePerformanceMetrics(sampleAttempts);

      expect(metrics.totalAttempts).toBe(5);
      expect(metrics.correctAnswers).toBe(3);
      expect(metrics.recentAccuracy).toBe(60); // 3/5 = 60%
      expect(metrics.averageResponseTime).toBe(3300); // (2000+4000+3000+2500+5000)/5
    });

    it("should calculate skill breakdown correctly", () => {
      const metrics =
        DifficultyCalibrationEngine.calculatePerformanceMetrics(sampleAttempts);

      expect(metrics.skillBreakdown.VOCABULARY).toBe(100); // 2/2 correct
      expect(metrics.skillBreakdown.GRAMMAR).toBe(0); // 0/1 correct
      expect(metrics.skillBreakdown.READING).toBe(100); // 1/1 correct
      expect(metrics.skillBreakdown.WRITING).toBe(0); // 0/1 correct
    });

    it("should handle empty attempts array", () => {
      const metrics = DifficultyCalibrationEngine.calculatePerformanceMetrics(
        [],
      );

      expect(metrics.totalAttempts).toBe(0);
      expect(metrics.correctAnswers).toBe(0);
      expect(metrics.recentAccuracy).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });

    it("should calculate improvement rate over time", () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const timedAttempts = [
        // Previous week (2 weeks ago)
        {
          correct: false,
          responseTime: 3000,
          skill: "VOCABULARY",
          timestamp: twoWeeksAgo,
        },
        {
          correct: false,
          responseTime: 3000,
          skill: "VOCABULARY",
          timestamp: twoWeeksAgo,
        },
        // Recent week
        {
          correct: true,
          responseTime: 2000,
          skill: "VOCABULARY",
          timestamp: new Date(),
        },
        {
          correct: true,
          responseTime: 2000,
          skill: "VOCABULARY",
          timestamp: new Date(),
        },
      ];

      const metrics =
        DifficultyCalibrationEngine.calculatePerformanceMetrics(timedAttempts);
      expect(metrics.improvementRate).toBe(100); // 0% to 100% = +100%
    });

    it("should validate attempts array input", () => {
      expect(() => {
        DifficultyCalibrationEngine.calculatePerformanceMetrics(null as any);
      }).toThrow("Attempts must be an array");
    });
  });

  describe("Adaptation Strategy Generation", () => {
    it("should recommend difficulty decrease for frustration zone", () => {
      const frustrationMetrics = {
        ...samplePerformanceMetrics,
        recentAccuracy: 45,
      };
      const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
        frustrationMetrics,
        "B2",
      );

      expect(strategy.direction).toBe("DECREASE");
      expect(strategy.magnitude).toBeGreaterThan(1.0);
      expect(strategy.nextReviewTime).toBe(2); // Quick adjustment
      expect(strategy.rationale).toContain("below 60%");
    });

    it("should recommend difficulty increase for mastery zone", () => {
      const masteryMetrics = {
        ...samplePerformanceMetrics,
        recentAccuracy: 97,
      };
      const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
        masteryMetrics,
        "B2",
      );

      expect(strategy.direction).toBe("INCREASE");
      expect(strategy.magnitude).toBeGreaterThan(1.0);
      expect(strategy.rationale).toContain("High performance");
    });

    it("should maintain difficulty for optimal challenge zone", () => {
      const challengeMetrics = {
        ...samplePerformanceMetrics,
        recentAccuracy: 72,
      };
      const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
        challengeMetrics,
        "B2",
      );

      expect(strategy.direction).toBe("MAINTAIN");
      expect(strategy.magnitude).toBe(1.0);
      expect(strategy.nextReviewTime).toBe(24); // Longer intervals for stable performance
      expect(strategy.rationale).toContain("Optimal challenge zone");
    });

    it("should identify focus areas from skill breakdown", () => {
      const weakWritingMetrics = {
        ...samplePerformanceMetrics,
        skillBreakdown: {
          ...samplePerformanceMetrics.skillBreakdown,
          WRITING: 55, // Below 70% threshold
          SPEAKING: 65, // Below 70% threshold
        },
      };

      const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
        weakWritingMetrics,
        "B2",
      );

      expect(strategy.focusAreas).toContain("WRITING");
      expect(strategy.focusAreas).toContain("SPEAKING");
    });

    it("should recommend appropriate task types for focus areas", () => {
      const writingFocusMetrics = {
        ...samplePerformanceMetrics,
        skillBreakdown: {
          ...samplePerformanceMetrics.skillBreakdown,
          WRITING: 60,
        },
      };

      const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
        writingFocusMetrics,
        "B2",
      );

      expect(strategy.recommendedTaskTypes).toContain("TASK_2_ESSAY");
    });
  });

  describe("Difficulty Adaptation Application", () => {
    it("should increase difficulty when strategy direction is INCREASE", () => {
      const increaseStrategy: AdaptationStrategy = {
        direction: "INCREASE",
        magnitude: 1.2,
        focusAreas: [],
        recommendedTaskTypes: [],
        nextReviewTime: 6,
        rationale: "Performance too high",
      };

      const adapted = DifficultyCalibrationEngine.applyDifficultyAdaptation(
        sampleContentDifficulty,
        increaseStrategy,
      );

      expect(adapted.vocabularyComplexity).toBeGreaterThan(
        sampleContentDifficulty.vocabularyComplexity,
      );
      expect(adapted.grammarComplexity).toBeGreaterThan(
        sampleContentDifficulty.grammarComplexity,
      );
      expect(adapted.overallDifficulty).toBeGreaterThan(
        sampleContentDifficulty.overallDifficulty,
      );
      expect(adapted.adaptationReason).toBe(increaseStrategy.rationale);
    });

    it("should decrease difficulty when strategy direction is DECREASE", () => {
      const decreaseStrategy: AdaptationStrategy = {
        direction: "DECREASE",
        magnitude: 1.5,
        focusAreas: [],
        recommendedTaskTypes: [],
        nextReviewTime: 2,
        rationale: "Performance too low",
      };

      const adapted = DifficultyCalibrationEngine.applyDifficultyAdaptation(
        sampleContentDifficulty,
        decreaseStrategy,
      );

      expect(adapted.vocabularyComplexity).toBeLessThan(
        sampleContentDifficulty.vocabularyComplexity,
      );
      expect(adapted.grammarComplexity).toBeLessThan(
        sampleContentDifficulty.grammarComplexity,
      );
      expect(adapted.overallDifficulty).toBeLessThan(
        sampleContentDifficulty.overallDifficulty,
      );
    });

    it("should maintain difficulty when strategy direction is MAINTAIN", () => {
      const maintainStrategy: AdaptationStrategy = {
        direction: "MAINTAIN",
        magnitude: 1.0,
        focusAreas: [],
        recommendedTaskTypes: [],
        nextReviewTime: 24,
        rationale: "Optimal performance",
      };

      const adapted = DifficultyCalibrationEngine.applyDifficultyAdaptation(
        sampleContentDifficulty,
        maintainStrategy,
      );

      expect(adapted.vocabularyComplexity).toBe(
        sampleContentDifficulty.vocabularyComplexity,
      );
      expect(adapted.grammarComplexity).toBe(
        sampleContentDifficulty.grammarComplexity,
      );
      expect(adapted.overallDifficulty).toBe(
        sampleContentDifficulty.overallDifficulty,
      );
    });

    it("should respect difficulty bounds (1-10)", () => {
      const extremeIncrease: AdaptationStrategy = {
        direction: "INCREASE",
        magnitude: 10.0, // Extreme increase
        focusAreas: [],
        recommendedTaskTypes: [],
        nextReviewTime: 6,
        rationale: "Extreme test",
      };

      const highDifficulty: ContentDifficulty = {
        ...sampleContentDifficulty,
        vocabularyComplexity: 9,
        grammarComplexity: 9,
        comprehensionLevel: 9,
        taskComplexity: 9,
      };

      const adapted = DifficultyCalibrationEngine.applyDifficultyAdaptation(
        highDifficulty,
        extremeIncrease,
      );

      expect(adapted.vocabularyComplexity).toBeLessThanOrEqual(10);
      expect(adapted.grammarComplexity).toBeLessThanOrEqual(10);
      expect(adapted.comprehensionLevel).toBeLessThanOrEqual(10);
      expect(adapted.taskComplexity).toBeLessThanOrEqual(10);
    });

    it("should update estimated success rate appropriately", () => {
      const increaseStrategy: AdaptationStrategy = {
        direction: "INCREASE",
        magnitude: 1.5,
        focusAreas: [],
        recommendedTaskTypes: [],
        nextReviewTime: 6,
        rationale: "Increase challenge",
      };

      const adapted = DifficultyCalibrationEngine.applyDifficultyAdaptation(
        sampleContentDifficulty,
        increaseStrategy,
      );

      // Higher difficulty should lead to lower estimated success rate
      expect(adapted.estimatedSuccessRate).toBeLessThan(
        sampleContentDifficulty.estimatedSuccessRate,
      );
    });
  });

  describe("Initial Difficulty Creation", () => {
    it("should create appropriate difficulty for B2 level", () => {
      const difficulty =
        DifficultyCalibrationEngine.createInitialDifficulty("B2");

      expect(difficulty.targetCEFRLevel).toBe("B2");
      expect(difficulty.overallDifficulty).toBe(7); // B2 base difficulty
      expect(difficulty.estimatedSuccessRate).toBe(75);
      expect(difficulty.adaptationReason).toContain(
        "Initial difficulty calibration",
      );
    });

    it("should adjust difficulty for strong skills", () => {
      const difficulty = DifficultyCalibrationEngine.createInitialDifficulty(
        "B1",
        ["VOCABULARY", "GRAMMAR"],
      );

      expect(difficulty.vocabularyComplexity).toBe(6); // 5 + 1 for strength
      expect(difficulty.grammarComplexity).toBe(6); // 5 + 1 for strength
    });

    it("should adjust difficulty for weak skills", () => {
      const difficulty = DifficultyCalibrationEngine.createInitialDifficulty(
        "B1",
        [],
        ["WRITING", "SPEAKING"],
      );

      expect(difficulty.taskComplexity).toBe(4); // 5 - 1 for weakness
    });

    it("should respect bounds for extreme adjustments", () => {
      const difficulty = DifficultyCalibrationEngine.createInitialDifficulty(
        "A1",
        [],
        ["VOCABULARY", "GRAMMAR", "WRITING", "READING"],
      );

      expect(difficulty.vocabularyComplexity).toBeGreaterThanOrEqual(1);
      expect(difficulty.grammarComplexity).toBeGreaterThanOrEqual(1);
      expect(difficulty.comprehensionLevel).toBeGreaterThanOrEqual(1);
      expect(difficulty.taskComplexity).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Difficulty Level Classification", () => {
    it("should classify difficulty levels correctly", () => {
      expect(DifficultyCalibrationEngine.getDifficultyLevel(1.5)).toBe(
        DifficultyLevel.VERY_EASY,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(3.5)).toBe(
        DifficultyLevel.EASY,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(5.5)).toBe(
        DifficultyLevel.MEDIUM,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(7.5)).toBe(
        DifficultyLevel.HARD,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(9.5)).toBe(
        DifficultyLevel.VERY_HARD,
      );
    });

    it("should handle boundary cases", () => {
      expect(DifficultyCalibrationEngine.getDifficultyLevel(2.0)).toBe(
        DifficultyLevel.VERY_EASY,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(4.0)).toBe(
        DifficultyLevel.EASY,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(6.0)).toBe(
        DifficultyLevel.MEDIUM,
      );
      expect(DifficultyCalibrationEngine.getDifficultyLevel(8.0)).toBe(
        DifficultyLevel.HARD,
      );
    });
  });

  describe("Input Validation", () => {
    it("should validate performance metrics object structure", () => {
      expect(() => {
        DifficultyCalibrationEngine.assessPerformanceZone({
          totalAttempts: -5,
          correctAnswers: 3,
          recentAccuracy: 75,
        } as any);
      }).toThrow("Total attempts must be a non-negative number");
    });

    it("should validate correct answers vs total attempts", () => {
      expect(() => {
        DifficultyCalibrationEngine.assessPerformanceZone({
          totalAttempts: 5,
          correctAnswers: 10, // More than total
          recentAccuracy: 75,
        } as any);
      }).toThrow("Correct answers cannot exceed total attempts");
    });

    it("should validate recent accuracy range", () => {
      expect(() => {
        DifficultyCalibrationEngine.assessPerformanceZone({
          totalAttempts: 10,
          correctAnswers: 5,
          recentAccuracy: 150, // Invalid percentage
        } as any);
      }).toThrow("Recent accuracy must be between 0 and 100");
    });

    it("should validate required fields presence", () => {
      expect(() => {
        DifficultyCalibrationEngine.assessPerformanceZone({
          totalAttempts: 10,
          // Missing other required fields
        } as any);
      }).toThrow("Performance metrics missing required field");
    });
  });

  describe("Edge Cases and Performance", () => {
    it("should handle zero attempts gracefully", () => {
      const zeroMetrics: PerformanceMetrics = {
        totalAttempts: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        recentAccuracy: 0,
        skillBreakdown: {
          LISTENING: 0,
          READING: 0,
          WRITING: 0,
          SPEAKING: 0,
          VOCABULARY: 0,
          GRAMMAR: 0,
          PRONUNCIATION: 0,
        },
        improvementRate: 0,
        confidenceScore: 0,
      };

      const zone =
        DifficultyCalibrationEngine.assessPerformanceZone(zeroMetrics);
      expect(zone).toBe(PerformanceZone.FRUSTRATION);
    });

    it("should handle perfect performance", () => {
      const perfectMetrics = {
        ...samplePerformanceMetrics,
        recentAccuracy: 100,
      };
      const zone =
        DifficultyCalibrationEngine.assessPerformanceZone(perfectMetrics);
      expect(zone).toBe(PerformanceZone.MASTERY);
    });

    it("should maintain performance with repeated adaptations", () => {
      let currentDifficulty = sampleContentDifficulty;
      let metrics = samplePerformanceMetrics;

      // Simulate 5 adaptation cycles
      for (let i = 0; i < 5; i++) {
        const strategy = DifficultyCalibrationEngine.generateAdaptationStrategy(
          metrics,
          "B2",
        );
        currentDifficulty =
          DifficultyCalibrationEngine.applyDifficultyAdaptation(
            currentDifficulty,
            strategy,
          );
      }

      // Should still be within reasonable bounds
      expect(currentDifficulty.overallDifficulty).toBeGreaterThan(1);
      expect(currentDifficulty.overallDifficulty).toBeLessThan(10);
    });
  });
});

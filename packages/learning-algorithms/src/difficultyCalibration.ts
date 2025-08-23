/**
 * Adaptive Content Difficulty Calibration System
 * Dynamically adjusts content difficulty based on learner performance
 * Optimized for IELTS Band 6+ preparation with personalized learning paths
 */

import type { CEFRLevel, LanguageSkill, Assessment } from "./shared/types";

// For backward compatibility during transition
type IELTSTaskType = Assessment.IELTSTaskType;
import { ValidationError } from "./shared/validation";

export const DifficultyLevel = {
  VERY_EASY: "VERY_EASY", // 1-2: Basic foundation
  EASY: "EASY", // 3-4: Comfortable practice
  MEDIUM: "MEDIUM", // 5-6: Appropriate challenge
  HARD: "HARD", // 7-8: Stretch learning
  VERY_HARD: "VERY_HARD", // 9-10: Advanced challenge
} as const;

export type DifficultyLevel =
  (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const PerformanceZone = {
  FRUSTRATION: "FRUSTRATION", // <60% accuracy, too hard
  CHALLENGE: "CHALLENGE", // 60-80% accuracy, optimal learning
  COMFORT: "COMFORT", // 80-95% accuracy, reinforcement
  MASTERY: "MASTERY", // >95% accuracy, too easy
} as const;

export type PerformanceZone =
  (typeof PerformanceZone)[keyof typeof PerformanceZone];

export interface PerformanceMetrics {
  totalAttempts: number;
  correctAnswers: number;
  averageResponseTime: number; // milliseconds
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  recentAccuracy: number; // Last 10 attempts accuracy
  skillBreakdown: Record<LanguageSkill, number>; // Accuracy per skill
  improvementRate: number; // Weekly progress rate
  confidenceScore: number; // 0-100 based on response patterns
}

export interface ContentDifficulty {
  vocabularyComplexity: number; // 1-10 scale
  grammarComplexity: number; // 1-10 scale
  comprehensionLevel: number; // 1-10 scale
  taskComplexity: number; // 1-10 scale
  overallDifficulty: number; // Weighted average
  targetCEFRLevel: CEFRLevel;
  estimatedSuccessRate: number; // Predicted accuracy 0-100
  adaptationReason: string; // Why this difficulty was chosen
}

export interface AdaptationStrategy {
  direction: "INCREASE" | "DECREASE" | "MAINTAIN";
  magnitude: number; // 0.1-2.0 scale adjustment factor
  focusAreas: LanguageSkill[]; // Skills needing attention
  recommendedTaskTypes: IELTSTaskType[];
  nextReviewTime: number; // Hours until next adaptation
  rationale: string; // Human-readable explanation
}

export class DifficultyCalibrationEngine {
  /**
   * Assess current performance zone based on recent results
   */
  static assessPerformanceZone(metrics: PerformanceMetrics): PerformanceZone {
    this.validatePerformanceMetrics(metrics);

    const accuracy = metrics.recentAccuracy;

    if (accuracy < 60) return PerformanceZone.FRUSTRATION;
    if (accuracy < 80) return PerformanceZone.CHALLENGE;
    if (accuracy < 95) return PerformanceZone.COMFORT;
    return PerformanceZone.MASTERY;
  }

  /**
   * Calculate comprehensive performance metrics from raw data
   */
  static calculatePerformanceMetrics(
    attempts: {
      correct: boolean;
      responseTime: number;
      skill: LanguageSkill;
      timestamp: Date;
    }[],
    currentStreak: { correct: number; incorrect: number } = {
      correct: 0,
      incorrect: 0,
    },
  ): PerformanceMetrics {
    if (!Array.isArray(attempts)) {
      throw new ValidationError(
        "Attempts must be an array",
        "attempts",
        attempts,
      );
    }

    const totalAttempts = attempts.length;
    const correctAnswers = attempts.filter((a) => a.correct).length;
    const averageResponseTime =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.responseTime, 0) / totalAttempts
        : 0;

    // Recent performance (last 10 attempts)
    const recentAttempts = attempts.slice(-10);
    const recentCorrect = recentAttempts.filter((a) => a.correct).length;
    const recentAccuracy =
      recentAttempts.length > 0
        ? (recentCorrect / recentAttempts.length) * 100
        : 0;

    // Skill breakdown
    const skillBreakdown: Record<LanguageSkill, number> = {
      LISTENING: 0,
      READING: 0,
      WRITING: 0,
      SPEAKING: 0,
      VOCABULARY: 0,
      GRAMMAR: 0,
      PRONUNCIATION: 0,
    };

    Object.keys(skillBreakdown).forEach((skill) => {
      const skillAttempts = attempts.filter((a) => a.skill === skill);
      if (skillAttempts.length > 0) {
        const skillCorrect = skillAttempts.filter((a) => a.correct).length;
        skillBreakdown[skill as LanguageSkill] =
          (skillCorrect / skillAttempts.length) * 100;
      }
    });

    // Improvement rate (weekly progress)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWeekAttempts = attempts.filter(
      (a) => a.timestamp >= oneWeekAgo,
    );
    const previousWeekAttempts = attempts.filter(
      (a) =>
        a.timestamp < oneWeekAgo &&
        a.timestamp >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
    );

    const recentWeekAccuracy =
      recentWeekAttempts.length > 0
        ? (recentWeekAttempts.filter((a) => a.correct).length /
            recentWeekAttempts.length) *
          100
        : 0;
    const previousWeekAccuracy =
      previousWeekAttempts.length > 0
        ? (previousWeekAttempts.filter((a) => a.correct).length /
            previousWeekAttempts.length) *
          100
        : 0;

    const improvementRate = recentWeekAccuracy - previousWeekAccuracy;

    // Confidence score based on consistency
    const responseTimeVariance = this.calculateVariance(
      attempts.map((a) => a.responseTime),
    );
    const accuracyConsistency = this.calculateConsistency(
      recentAttempts.map((a) => a.correct),
    );
    const confidenceScore = Math.min(
      100,
      Math.max(
        0,
        (accuracyConsistency * 0.7 + (1 - responseTimeVariance / 10000) * 0.3) *
          100,
      ),
    );

    return {
      totalAttempts,
      correctAnswers,
      averageResponseTime,
      consecutiveCorrect: currentStreak.correct,
      consecutiveIncorrect: currentStreak.incorrect,
      recentAccuracy,
      skillBreakdown,
      improvementRate,
      confidenceScore,
    };
  }

  /**
   * Generate adaptive difficulty adjustment strategy
   */
  static generateAdaptationStrategy(
    performanceMetrics: PerformanceMetrics,
    targetCEFRLevel: CEFRLevel,
  ): AdaptationStrategy {
    this.validatePerformanceMetrics(performanceMetrics);

    const performanceZone = this.assessPerformanceZone(performanceMetrics);
    const accuracy = performanceMetrics.recentAccuracy;

    // Determine adaptation direction and magnitude
    let direction: "INCREASE" | "DECREASE" | "MAINTAIN";
    let magnitude: number;
    let nextReviewTime: number;
    let rationale: string;

    if (performanceZone === PerformanceZone.FRUSTRATION) {
      direction = "DECREASE";
      magnitude = 1.5 + (60 - accuracy) / 100; // More reduction for lower accuracy
      nextReviewTime = 2; // Quick adjustment
      rationale = `Performance below 60% (${accuracy.toFixed(1)}%) - reducing difficulty to prevent frustration`;
    } else if (performanceZone === PerformanceZone.MASTERY) {
      direction = "INCREASE";
      magnitude = 1.2 + (accuracy - 95) / 100; // Gradual increase for mastery
      nextReviewTime = 6; // Allow time for adjustment
      rationale = `High performance (${accuracy.toFixed(1)}%) - increasing challenge for continued growth`;
    } else if (performanceZone === PerformanceZone.COMFORT) {
      if (accuracy > 88 && performanceMetrics.consecutiveCorrect > 5) {
        direction = "INCREASE";
        magnitude = 1.1;
        nextReviewTime = 8;
        rationale = `Consistent high performance - gradually increasing difficulty`;
      } else {
        direction = "MAINTAIN";
        magnitude = 1.0;
        nextReviewTime = 12;
        rationale = `Good performance in comfort zone - maintaining current difficulty`;
      }
    } else {
      // CHALLENGE zone - optimal
      direction = "MAINTAIN";
      magnitude = 1.0;
      nextReviewTime = 24;
      rationale = `Optimal challenge zone (${accuracy.toFixed(1)}%) - maintaining difficulty for effective learning`;
    }

    // Identify focus areas based on skill breakdown
    const focusAreas: LanguageSkill[] = [];
    Object.entries(performanceMetrics.skillBreakdown).forEach(
      ([skill, accuracy]) => {
        if (accuracy < 70 && accuracy > 0) {
          // Needs improvement but has some data
          focusAreas.push(skill as LanguageSkill);
        }
      },
    );

    // Recommend task types based on target CEFR level and focus areas
    const recommendedTaskTypes = this.getRecommendedTaskTypes(
      targetCEFRLevel,
      focusAreas,
    );

    return {
      direction,
      magnitude,
      focusAreas,
      recommendedTaskTypes,
      nextReviewTime,
      rationale,
    };
  }

  /**
   * Apply difficulty adaptation to content
   */
  static applyDifficultyAdaptation(
    currentDifficulty: ContentDifficulty,
    strategy: AdaptationStrategy,
  ): ContentDifficulty {
    const adjustmentFactor =
      strategy.direction === "INCREASE"
        ? strategy.magnitude
        : strategy.direction === "DECREASE"
          ? 1 / strategy.magnitude
          : 1.0;

    // Apply gradual adjustment with bounds checking
    const newVocabComplexity = Math.max(
      1,
      Math.min(10, currentDifficulty.vocabularyComplexity * adjustmentFactor),
    );
    const newGrammarComplexity = Math.max(
      1,
      Math.min(10, currentDifficulty.grammarComplexity * adjustmentFactor),
    );
    const newComprehensionLevel = Math.max(
      1,
      Math.min(10, currentDifficulty.comprehensionLevel * adjustmentFactor),
    );
    const newTaskComplexity = Math.max(
      1,
      Math.min(10, currentDifficulty.taskComplexity * adjustmentFactor),
    );

    // Calculate weighted average (writing and speaking emphasized for IELTS)
    const weights = {
      vocabulary: 0.25,
      grammar: 0.25,
      comprehension: 0.25,
      task: 0.25,
    };

    const overallDifficulty =
      newVocabComplexity * weights.vocabulary +
      newGrammarComplexity * weights.grammar +
      newComprehensionLevel * weights.comprehension +
      newTaskComplexity * weights.task;

    // Estimate success rate based on difficulty and performance history
    const estimatedSuccessRate = Math.max(
      20,
      Math.min(
        95,
        100 - (overallDifficulty - 5) * 8, // Rough inverse relationship
      ),
    );

    return {
      vocabularyComplexity: Math.round(newVocabComplexity * 10) / 10,
      grammarComplexity: Math.round(newGrammarComplexity * 10) / 10,
      comprehensionLevel: Math.round(newComprehensionLevel * 10) / 10,
      taskComplexity: Math.round(newTaskComplexity * 10) / 10,
      overallDifficulty: Math.round(overallDifficulty * 10) / 10,
      targetCEFRLevel: currentDifficulty.targetCEFRLevel,
      estimatedSuccessRate: Math.round(estimatedSuccessRate),
      adaptationReason: strategy.rationale,
    };
  }

  /**
   * Create initial difficulty setting for new learners
   */
  static createInitialDifficulty(
    cefrLevel: CEFRLevel,
    strongSkills: LanguageSkill[] = [],
    weakSkills: LanguageSkill[] = [],
  ): ContentDifficulty {
    // Base difficulty mapping for CEFR levels
    const baseDifficulties: Record<CEFRLevel, number> = {
      A1: 2,
      A2: 3,
      B1: 5,
      B2: 7,
      C1: 8,
      C2: 9,
    };

    const baseDifficulty = baseDifficulties[cefrLevel];

    // Adjust for individual strengths and weaknesses
    let vocabularyComplexity = baseDifficulty;
    let grammarComplexity = baseDifficulty;
    let comprehensionLevel = baseDifficulty;
    let taskComplexity = baseDifficulty;

    // Boost difficulty for strong skills
    if (strongSkills.includes("VOCABULARY")) vocabularyComplexity += 1;
    if (strongSkills.includes("GRAMMAR")) grammarComplexity += 1;
    if (
      strongSkills.includes("READING") ||
      strongSkills.includes("LISTENING")
    ) {
      comprehensionLevel += 1;
    }
    if (strongSkills.includes("WRITING") || strongSkills.includes("SPEAKING")) {
      taskComplexity += 1;
    }

    // Reduce difficulty for weak skills
    if (weakSkills.includes("VOCABULARY")) vocabularyComplexity -= 1;
    if (weakSkills.includes("GRAMMAR")) grammarComplexity -= 1;
    if (weakSkills.includes("READING") || weakSkills.includes("LISTENING")) {
      comprehensionLevel -= 1;
    }
    if (weakSkills.includes("WRITING") || weakSkills.includes("SPEAKING")) {
      taskComplexity -= 1;
    }

    // Ensure bounds
    vocabularyComplexity = Math.max(1, Math.min(10, vocabularyComplexity));
    grammarComplexity = Math.max(1, Math.min(10, grammarComplexity));
    comprehensionLevel = Math.max(1, Math.min(10, comprehensionLevel));
    taskComplexity = Math.max(1, Math.min(10, taskComplexity));

    const overallDifficulty =
      (vocabularyComplexity +
        grammarComplexity +
        comprehensionLevel +
        taskComplexity) /
      4;

    return {
      vocabularyComplexity,
      grammarComplexity,
      comprehensionLevel,
      taskComplexity,
      overallDifficulty: Math.round(overallDifficulty * 10) / 10,
      targetCEFRLevel: cefrLevel,
      estimatedSuccessRate: 75, // Target success rate for new learners
      adaptationReason: `Initial difficulty calibration for ${cefrLevel} level`,
    };
  }

  /**
   * Get difficulty level classification
   */
  static getDifficultyLevel(overallDifficulty: number): DifficultyLevel {
    if (overallDifficulty <= 2) return DifficultyLevel.VERY_EASY;
    if (overallDifficulty <= 4) return DifficultyLevel.EASY;
    if (overallDifficulty <= 6) return DifficultyLevel.MEDIUM;
    if (overallDifficulty <= 8) return DifficultyLevel.HARD;
    return DifficultyLevel.VERY_HARD;
  }

  /**
   * Validate performance metrics input
   */
  private static validatePerformanceMetrics(metrics: PerformanceMetrics): void {
    if (!metrics || typeof metrics !== "object") {
      throw new ValidationError(
        "Performance metrics must be an object",
        "metrics",
        metrics,
      );
    }

    const requiredFields = [
      "totalAttempts",
      "correctAnswers",
      "recentAccuracy",
    ];
    for (const field of requiredFields) {
      if (!(field in metrics)) {
        throw new ValidationError(
          `Performance metrics missing required field: ${field}`,
          field,
          undefined,
        );
      }
    }

    if (
      typeof metrics.totalAttempts !== "number" ||
      metrics.totalAttempts < 0
    ) {
      throw new ValidationError(
        "Total attempts must be a non-negative number",
        "totalAttempts",
        metrics.totalAttempts,
      );
    }

    if (
      typeof metrics.correctAnswers !== "number" ||
      metrics.correctAnswers < 0
    ) {
      throw new ValidationError(
        "Correct answers must be a non-negative number",
        "correctAnswers",
        metrics.correctAnswers,
      );
    }

    if (metrics.correctAnswers > metrics.totalAttempts) {
      throw new ValidationError(
        "Correct answers cannot exceed total attempts",
        "correctAnswers",
        metrics.correctAnswers,
      );
    }

    if (
      typeof metrics.recentAccuracy !== "number" ||
      metrics.recentAccuracy < 0 ||
      metrics.recentAccuracy > 100
    ) {
      throw new ValidationError(
        "Recent accuracy must be between 0 and 100",
        "recentAccuracy",
        metrics.recentAccuracy,
      );
    }
  }

  /**
   * Get recommended task types based on CEFR level and focus areas
   */
  private static getRecommendedTaskTypes(
    cefrLevel: CEFRLevel,
    focusAreas: LanguageSkill[],
  ): IELTSTaskType[] {
    // Import would be circular, so we define locally
    const IELTSTaskType = {
      TASK_2_ESSAY: "TASK_2_ESSAY",
      PART_3_DISCUSSION: "PART_3_DISCUSSION",
      TRUE_FALSE_NOT_GIVEN: "TRUE_FALSE_NOT_GIVEN",
      SUMMARY_COMPLETION: "SUMMARY_COMPLETION",
      PART_1_INTRODUCTION: "PART_1_INTRODUCTION",
      MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
    } as const;

    const recommendations: IELTSTaskType[] = [];

    // Core IELTS tasks for Band 6+ preparation
    if (cefrLevel === "B2" || cefrLevel === "C1") {
      recommendations.push(IELTSTaskType.TASK_2_ESSAY);
      recommendations.push(IELTSTaskType.PART_3_DISCUSSION);
    }

    // Focus area specific recommendations
    if (focusAreas.includes("WRITING")) {
      recommendations.push(IELTSTaskType.TASK_2_ESSAY);
    }
    if (focusAreas.includes("SPEAKING")) {
      recommendations.push(IELTSTaskType.PART_3_DISCUSSION);
    }
    if (focusAreas.includes("READING")) {
      recommendations.push(IELTSTaskType.TRUE_FALSE_NOT_GIVEN);
      recommendations.push(IELTSTaskType.SUMMARY_COMPLETION);
    }

    // Fallback for beginners
    if (recommendations.length === 0) {
      recommendations.push(IELTSTaskType.PART_1_INTRODUCTION);
      recommendations.push(IELTSTaskType.MULTIPLE_CHOICE);
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Calculate variance for response time consistency
   */
  private static calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Calculate consistency score for boolean results
   */
  private static calculateConsistency(results: boolean[]): number {
    if (results.length === 0) return 0;

    // Calculate how consistent the performance is (less alternating = more consistent)
    let transitions = 0;
    for (let i = 1; i < results.length; i++) {
      if (results[i] !== results[i - 1]) transitions++;
    }

    // Convert to 0-1 score (fewer transitions = higher consistency)
    const maxTransitions = results.length - 1;
    return maxTransitions > 0 ? 1 - transitions / maxTransitions : 1;
  }
}

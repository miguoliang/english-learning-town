/**
 * Comprehensive tests for Content Quality Metrics System
 * Tests quality assessment, metrics calculation, and recommendation generation
 */

import {
  ContentQualityEngine,
  ContentType,
  QualityDimension,
  ContentUsageData,
  LearnerAttempt,
  VocabularyInteraction,
  FeedbackSubmission,
  CompletionData,
} from "../contentQualityMetrics";
import { CEFRLevel, LanguageSkill } from "../curriculumAlignment";

describe("ContentQualityEngine", () => {
  const createSampleUsageData = (
    overrides: Partial<ContentUsageData> = {},
  ): ContentUsageData => {
    const defaultAttempts: LearnerAttempt[] = Array.from(
      { length: 15 },
      (_, i) => ({
        learnerId: `learner_${i}`,
        sessionId: `session_${i}`,
        startTime: new Date(),
        endTime: new Date(),
        completed: i < 12, // 80% completion rate
        accuracy: 70 + Math.random() * 20, // 70-90% accuracy
        responseTime: 3000 + Math.random() * 2000, // 3-5 seconds
        skillsAssessed: [LanguageSkill.VOCABULARY, LanguageSkill.READING],
        cefrLevel: i < 5 ? CEFRLevel.B1 : CEFRLevel.B2,
        struggledWith: i % 3 === 0 ? ["complex_grammar"] : [],
        masteredConcepts:
          i % 2 === 0
            ? ["present_perfect", "vocabulary_set_1"]
            : ["basic_grammar"],
      }),
    );

    const defaultVocabulary: VocabularyInteraction[] = Array.from(
      { length: 25 },
      (_, i) => ({
        learnerId: `learner_${i % 15}`,
        word: `word_${i}`,
        definition: `Definition for word ${i}`,
        wasHighlighted: true,
        wasLearned: i % 3 !== 0, // 67% learning rate
        contextOfUse: "dialogue_context",
        difficultyPerceived: 2 + Math.random() * 2, // 2-4 scale
        timestamp: new Date(),
      }),
    );

    const defaultFeedback: FeedbackSubmission[] = Array.from(
      { length: 12 },
      (_, i) => ({
        learnerId: `learner_${i}`,
        overall: 3.5 + Math.random() * 1.5, // 3.5-5 stars
        difficulty: 2.5 + Math.random() * 1.5, // 2.5-4 difficulty
        relevance: 3 + Math.random() * 1.5, // 3-4.5 relevance
        engagement: 3.5 + Math.random() * 1, // 3.5-4.5 engagement
        textFeedback: i % 4 === 0 ? "Great content!" : undefined,
        timestamp: new Date(),
      }),
    );

    const defaultCompletions: CompletionData[] = Array.from(
      { length: 15 },
      (_, i) => ({
        learnerId: `learner_${i}`,
        timeSpent: 8 + Math.random() * 6, // 8-14 minutes
        completed: i < 12,
        dropoffPoint: i >= 12 ? "section_2" : undefined,
        retestPerformance: i % 5 === 0 ? 75 + Math.random() * 20 : undefined,
        timestamp: new Date(),
      }),
    );

    return {
      contentId: "test_content_1",
      learnerAttempts: defaultAttempts,
      vocabularyInteractions: defaultVocabulary,
      feedbackSubmissions: defaultFeedback,
      completionData: defaultCompletions,
      ...overrides,
    };
  };

  describe("Quality Metrics Calculation", () => {
    it("should calculate comprehensive quality metrics for good content", () => {
      const usageData = createSampleUsageData();
      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content_1",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.contentId).toBe("test_content_1");
      expect(metrics.contentType).toBe(ContentType.LESSON);
      expect(metrics.overallQuality).toBeGreaterThan(60);
      expect(metrics.overallQuality).toBeLessThanOrEqual(100);

      // Dimension scores should be reasonable
      expect(metrics.educationalEffectiveness).toBeGreaterThan(50);
      expect(metrics.engagement).toBeGreaterThan(50);
      expect(metrics.difficultyAppropriateness).toBeGreaterThan(50);
      expect(metrics.ieltsRelevance).toBeGreaterThan(60);
      expect(metrics.learningProgression).toBeGreaterThan(50);
      expect(metrics.accessibility).toBeGreaterThan(40);

      expect(metrics.sampleSize).toBe(15);
      expect(metrics.lastUpdated).toBeInstanceOf(Date);
    });

    it("should calculate performance metrics correctly", () => {
      const usageData = createSampleUsageData();
      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content_1",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.completionRate).toBe(80); // 12/15 completed
      expect(metrics.averageAccuracy).toBeGreaterThan(70);
      expect(metrics.averageAccuracy).toBeLessThanOrEqual(90);
      expect(metrics.averageTimeSpent).toBeGreaterThan(8);
      expect(metrics.averageTimeSpent).toBeLessThan(14);
      expect(metrics.vocabularyLearned).toBeGreaterThan(15); // ~67% of 25 vocabulary items
    });

    it("should calculate learner feedback metrics correctly", () => {
      const usageData = createSampleUsageData();
      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content_1",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.satisfactionScore).toBeGreaterThan(3.5);
      expect(metrics.satisfactionScore).toBeLessThanOrEqual(5);
      expect(metrics.difficultyRating).toBeGreaterThan(2.5);
      expect(metrics.difficultyRating).toBeLessThan(4.5);
      expect(metrics.relevanceRating).toBeGreaterThan(3);
      expect(metrics.relevanceRating).toBeLessThan(5);
    });

    it("should identify skills improved correctly", () => {
      const usageData = createSampleUsageData();
      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content_1",
        ContentType.LESSON,
        usageData,
      );

      // Should include VOCABULARY and READING since they're assessed and have good accuracy
      expect(metrics.skillsImproved).toContain(LanguageSkill.VOCABULARY);
      expect(metrics.skillsImproved).toContain(LanguageSkill.READING);
    });

    it("should calculate CEFR progress appropriately", () => {
      const usageData = createSampleUsageData();
      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content_1",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.cefrProgress).toBeGreaterThan(0);
      expect(metrics.cefrProgress).toBeLessThanOrEqual(1);
    });
  });

  describe("Content Type Impact on IELTS Relevance", () => {
    it("should score ASSESSMENT content highest for IELTS relevance", () => {
      const usageData = createSampleUsageData();
      const assessmentMetrics = ContentQualityEngine.calculateQualityMetrics(
        "test_assessment",
        ContentType.ASSESSMENT,
        usageData,
      );

      const lessonMetrics = ContentQualityEngine.calculateQualityMetrics(
        "test_lesson",
        ContentType.LESSON,
        usageData,
      );

      expect(assessmentMetrics.ieltsRelevance).toBeGreaterThan(
        lessonMetrics.ieltsRelevance,
      );
      expect(assessmentMetrics.ieltsRelevance).toBeGreaterThan(90);
    });

    it("should adjust IELTS relevance based on learner feedback", () => {
      const highRelevanceFeedback: FeedbackSubmission[] = Array.from(
        { length: 10 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          overall: 4,
          difficulty: 3,
          relevance: 5, // High relevance rating
          engagement: 4,
          timestamp: new Date(),
        }),
      );

      const usageData = createSampleUsageData({
        feedbackSubmissions: highRelevanceFeedback,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "test_content",
        ContentType.DIALOGUE, // Base 70% relevance
        usageData,
      );

      expect(metrics.ieltsRelevance).toBeGreaterThan(70); // Should be boosted by feedback
    });
  });

  describe("Quality Issue Detection", () => {
    it("should identify critical issues for poor performing content", () => {
      const poorAttempts: LearnerAttempt[] = Array.from(
        { length: 15 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: i < 5, // 33% completion rate (poor)
          accuracy: 30 + Math.random() * 20, // 30-50% accuracy (poor)
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel: CEFRLevel.B1,
          struggledWith: ["everything"],
          masteredConcepts: [], // No mastery
        }),
      );

      const poorUsageData = createSampleUsageData({
        learnerAttempts: poorAttempts,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "poor_content",
        ContentType.LESSON,
        poorUsageData,
      );

      expect(metrics.overallQuality).toBeLessThan(55); // Allow some variance due to IELTS relevance base score
      expect(metrics.issues.length).toBeGreaterThan(0);

      const criticalIssues = metrics.issues.filter(
        (i) => i.severity === "CRITICAL",
      );
      expect(criticalIssues.length).toBeGreaterThan(0);

      expect(metrics.recommendations.length).toBeGreaterThan(0);
      expect(metrics.recommendations.some((r) => r.includes("URGENT"))).toBe(
        true,
      );
    });

    it("should identify low accuracy issues", () => {
      const lowAccuracyAttempts: LearnerAttempt[] = Array.from(
        { length: 15 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          accuracy: 45, // Consistently low accuracy
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel: CEFRLevel.B1,
          struggledWith: ["difficult_words"],
          masteredConcepts: [],
        }),
      );

      const usageData = createSampleUsageData({
        learnerAttempts: lowAccuracyAttempts,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "difficult_content",
        ContentType.LESSON,
        usageData,
      );

      const accuracyIssues = metrics.issues.filter(
        (i) => i.category === QualityDimension.DIFFICULTY_APPROPRIATENESS,
      );
      expect(accuracyIssues.length).toBeGreaterThan(0);
      expect(
        metrics.recommendations.some((r) => r.includes("reducing difficulty")),
      ).toBe(true);
    });

    it("should identify engagement issues for low completion rates", () => {
      const lowCompletionAttempts: LearnerAttempt[] = Array.from(
        { length: 15 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: i < 8, // 53% completion rate
          accuracy: 75,
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel: CEFRLevel.B1,
          struggledWith: [],
          masteredConcepts: ["basic_vocab"],
        }),
      );

      const usageData = createSampleUsageData({
        learnerAttempts: lowCompletionAttempts,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "boring_content",
        ContentType.LESSON,
        usageData,
      );

      const engagementIssues = metrics.issues.filter(
        (i) => i.category === QualityDimension.ENGAGEMENT,
      );
      expect(engagementIssues.length).toBeGreaterThan(0);
      expect(
        metrics.recommendations.some((r) => r.includes("dropout points")),
      ).toBe(true);
    });
  });

  describe("Recommendation Generation", () => {
    it("should provide specific recommendations for high accuracy content", () => {
      const highAccuracyAttempts: LearnerAttempt[] = Array.from(
        { length: 15 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          accuracy: 95, // Very high accuracy
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel: CEFRLevel.B1,
          struggledWith: [],
          masteredConcepts: ["easy_vocab"],
        }),
      );

      const usageData = createSampleUsageData({
        learnerAttempts: highAccuracyAttempts,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "easy_content",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.recommendations.some((r) => r.includes("too easy"))).toBe(
        true,
      );
      expect(
        metrics.recommendations.some((r) => r.includes("increasing challenge")),
      ).toBe(true);
    });

    it("should recommend vocabulary improvements for low vocabulary learning", () => {
      const lowVocabInteractions: VocabularyInteraction[] = Array.from(
        { length: 10 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          word: `word_${i}`,
          definition: `Definition ${i}`,
          wasHighlighted: true,
          wasLearned: false, // No vocabulary learned
          contextOfUse: "dialogue",
          difficultyPerceived: 3,
          timestamp: new Date(),
        }),
      );

      const usageData = createSampleUsageData({
        vocabularyInteractions: lowVocabInteractions,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "vocab_poor_content",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.vocabularyLearned).toBe(0);
      expect(
        metrics.recommendations.some((r) => r.includes("vocabulary learning")),
      ).toBe(true);
    });

    it("should recommend IELTS alignment for low relevance feedback", () => {
      const lowRelevanceFeedback: FeedbackSubmission[] = Array.from(
        { length: 10 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          overall: 3,
          difficulty: 3,
          relevance: 2, // Low relevance rating
          engagement: 3,
          timestamp: new Date(),
        }),
      );

      const usageData = createSampleUsageData({
        feedbackSubmissions: lowRelevanceFeedback,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "irrelevant_content",
        ContentType.DIALOGUE,
        usageData,
      );

      expect(metrics.recommendations.some((r) => r.includes("IELTS"))).toBe(
        true,
      );
    });

    it("should provide positive feedback for high-quality content", () => {
      const excellentUsageData = createSampleUsageData({
        learnerAttempts: Array.from({ length: 15 }, (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: true, // 100% completion
          accuracy: 75 + Math.random() * 10, // 75-85% accuracy (optimal)
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY, LanguageSkill.READING],
          cefrLevel: CEFRLevel.B2,
          struggledWith: [],
          masteredConcepts: ["advanced_vocab", "reading_comprehension"],
        })),
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "excellent_content",
        ContentType.ASSESSMENT,
        excellentUsageData,
      );

      expect(metrics.overallQuality).toBeGreaterThan(75);
      expect(
        metrics.recommendations.some((r) => r.includes("meets standards")),
      ).toBe(true);
    });
  });

  describe("Input Validation", () => {
    it("should validate minimum sample size", () => {
      const smallUsageData = createSampleUsageData({
        learnerAttempts: Array.from({ length: 5 }, (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          accuracy: 75,
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel: CEFRLevel.B1,
          struggledWith: [],
          masteredConcepts: [],
        })),
      });

      expect(() => {
        ContentQualityEngine.calculateQualityMetrics(
          "small_sample",
          ContentType.LESSON,
          smallUsageData,
        );
      }).toThrow("Insufficient data for quality assessment");
    });

    it("should validate usage data structure", () => {
      expect(() => {
        ContentQualityEngine.calculateQualityMetrics(
          "invalid",
          ContentType.LESSON,
          null as any,
        );
      }).toThrow("Usage data must be an object");
    });

    it("should validate array properties", () => {
      expect(() => {
        ContentQualityEngine.calculateQualityMetrics(
          "invalid_arrays",
          ContentType.LESSON,
          {
            contentId: "test",
            learnerAttempts: "not an array",
            vocabularyInteractions: [],
            feedbackSubmissions: [],
            completionData: [],
          } as any,
        );
      }).toThrow("Learner attempts must be an array");
    });
  });

  describe("Edge Cases and Robustness", () => {
    it("should handle empty feedback arrays gracefully", () => {
      const usageData = createSampleUsageData({
        feedbackSubmissions: [],
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "no_feedback",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.satisfactionScore).toBe(3); // Default neutral
      expect(metrics.difficultyRating).toBe(3); // Default neutral
      expect(metrics.relevanceRating).toBe(3); // Default neutral
    });

    it("should handle zero retention test data", () => {
      const usageData = createSampleUsageData({
        completionData: Array.from({ length: 15 }, (_, i) => ({
          learnerId: `learner_${i}`,
          timeSpent: 10,
          completed: true,
          retestPerformance: undefined, // No retention tests
          timestamp: new Date(),
        })),
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "no_retention",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.retentionRate).toBe(0);
    });

    it("should handle mixed CEFR levels appropriately", () => {
      const mixedLevelAttempts: LearnerAttempt[] = Array.from(
        { length: 15 },
        (_, i) => ({
          learnerId: `learner_${i}`,
          sessionId: `session_${i}`,
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          accuracy: 75,
          responseTime: 3000,
          skillsAssessed: [LanguageSkill.VOCABULARY],
          cefrLevel:
            i % 3 === 0
              ? CEFRLevel.B1
              : i % 3 === 1
                ? CEFRLevel.B2
                : CEFRLevel.C1,
          struggledWith: [],
          masteredConcepts: ["vocab_set_1"],
        }),
      );

      const usageData = createSampleUsageData({
        learnerAttempts: mixedLevelAttempts,
      });

      const metrics = ContentQualityEngine.calculateQualityMetrics(
        "mixed_levels",
        ContentType.LESSON,
        usageData,
      );

      expect(metrics.accessibility).toBeGreaterThan(50); // Should handle mixed levels well
    });
  });
});

/**
 * Comprehensive tests for Learning Validation System
 * Tests input validation for all learning system components
 */

import { LearningValidation, ValidationError } from "../validation";
import type { SpacedRepetition, Analytics, Motivation } from "../types";

describe("LearningValidation", () => {
  describe("Card Creation Validation", () => {
    it("should pass validation for valid card parameters", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "serendipity",
          "A pleasant surprise",
          "Finding that book was pure serendipity.",
          ["The meeting was serendipity."],
        );
      }).not.toThrow();
    });

    it("should throw ValidationError for empty word", () => {
      expect(() => {
        LearningValidation.validateCardCreation("", "definition");
      }).toThrow(ValidationError);
      expect(() => {
        LearningValidation.validateCardCreation("", "definition");
      }).toThrow("Word must be a non-empty string");
    });

    it("should throw ValidationError for non-string word", () => {
      expect(() => {
        LearningValidation.validateCardCreation(123 as any, "definition");
      }).toThrow("Word must be a non-empty string");
    });

    it("should throw ValidationError for word that is too long", () => {
      const longWord = "a".repeat(201);
      expect(() => {
        LearningValidation.validateCardCreation(longWord, "definition");
      }).toThrow("Word must be between 1 and 200 characters");
    });

    it("should throw ValidationError for empty definition", () => {
      expect(() => {
        LearningValidation.validateCardCreation("word", "");
      }).toThrow("Definition must be a non-empty string");
    });

    it("should throw ValidationError for definition that is too long", () => {
      const longDefinition = "a".repeat(2001);
      expect(() => {
        LearningValidation.validateCardCreation("word", longDefinition);
      }).toThrow("Definition must be between 1 and 2000 characters");
    });

    it("should throw ValidationError for context that is too long", () => {
      const longContext = "a".repeat(1001);
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          longContext,
        );
      }).toThrow("Context must be between 1 and 1000 characters");
    });

    it("should allow undefined context", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
        );
      }).not.toThrow();
    });

    it("should throw ValidationError for empty context string", () => {
      expect(() => {
        LearningValidation.validateCardCreation("word", "definition", "");
      }).toThrow("Context must be between 1 and 1000 characters");
    });

    it("should throw ValidationError for too many examples", () => {
      const tooManyExamples = Array(21).fill("example");
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
          tooManyExamples,
        );
      }).toThrow("Cannot have more than 20 examples");
    });

    it("should throw ValidationError for non-array examples", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
          "not-array" as any,
        );
      }).toThrow("Examples must be an array");
    });

    it("should throw ValidationError for non-string examples", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
          [123] as any,
        );
      }).toThrow("All examples must be non-empty strings");
    });

    it("should throw ValidationError for empty example strings", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
          ["valid", ""],
        );
      }).toThrow("All examples must be non-empty strings");
    });

    it("should throw ValidationError for example that is too long", () => {
      const longExample = "a".repeat(501);
      expect(() => {
        LearningValidation.validateCardCreation(
          "word",
          "definition",
          undefined,
          [longExample],
        );
      }).toThrow("Each example must be between 1 and 500 characters");
    });
  });

  describe("Card Review Validation", () => {
    const validCard = {
      id: "card-1",
      word: "test",
      definition: "test definition",
      context: "test context",
      examples: ["example"],
      tags: ["tag"],
      learningStage: "NEW",
      masteryLevel: 0,
      nextReviewDate: new Date(),
      reviewInterval: 0,
      easinessFactor: 2.5,
      correctReviews: 0,
      totalReviews: 0,
      mastery: 0,
      lastReviewDate: new Date(),
    };

    it("should pass validation for valid card and result", () => {
      expect(() => {
        LearningValidation.validateCardReview(validCard, "EASY");
      }).not.toThrow();
    });

    it("should throw ValidationError for null card", () => {
      expect(() => {
        LearningValidation.validateCardReview(null as any, "EASY");
      }).toThrow("Card must be a valid object");
    });

    it("should throw ValidationError for undefined card", () => {
      expect(() => {
        LearningValidation.validateCardReview(undefined as any, "EASY");
      }).toThrow("Card must be a valid object");
    });

    it("should throw ValidationError for invalid review result", () => {
      expect(() => {
        LearningValidation.validateCardReview(validCard, "INVALID" as any);
      }).toThrow("Review result must be one of: EASY, GOOD, HARD, WRONG");
    });

    it("should throw ValidationError for missing required card properties", () => {
      const invalidCard = { ...validCard };
      delete (invalidCard as any).id;

      expect(() => {
        LearningValidation.validateCardReview(invalidCard as any, "EASY");
      }).toThrow("Card must have all required properties");
    });

    it("should validate all required card properties", () => {
      const requiredProps = [
        "id",
        "word",
        "definition",
        "learningStage",
        "mastery",
        "easinessFactor",
        "totalReviews",
        "correctReviews",
      ];

      requiredProps.forEach((prop) => {
        const invalidCard = { ...validCard };
        delete (invalidCard as any)[prop];

        expect(() => {
          LearningValidation.validateCardReview(invalidCard as any, "EASY");
        }).toThrow("Card must have all required properties");
      });
    });
  });

  describe("Analytics Input Validation", () => {
    const validCards = [
      {
        id: "card-1",
        word: "test",
        definition: "test definition",
        context: "test context",
        examples: ["example"],
        tags: ["tag"],
        learningStage: "NEW",
        masteryLevel: 0,
        nextReviewDate: new Date(),
        reviewInterval: 0,
        easinessFactor: 2.5,
        correctReviews: 0,
        totalReviews: 0,
        mastery: 0,
        lastReviewDate: new Date(),
      },
    ];

    const validSessions = [
      {
        id: "session-1",
        userId: "user-1",
        startTime: new Date(),
        endTime: new Date(),
        cardsReviewed: 5,
        cardsCorrect: 4,
        totalTime: 300000,
        averageResponseTime: 3000,
        sessionType: "DAILY_REVIEW" as const,
        questions: [],
      },
    ];

    it("should pass validation for valid cards and sessions", () => {
      expect(() => {
        LearningValidation.validateAnalyticsInput(validCards, validSessions);
      }).not.toThrow();
    });

    it("should throw ValidationError for non-array cards", () => {
      expect(() => {
        LearningValidation.validateAnalyticsInput(
          "not-array" as any,
          validSessions,
        );
      }).toThrow("Cards must be an array");
    });

    it("should throw ValidationError for non-array sessions", () => {
      expect(() => {
        LearningValidation.validateAnalyticsInput(
          validCards,
          "not-array" as any,
        );
      }).toThrow("Sessions must be an array");
    });

    it("should allow empty arrays", () => {
      expect(() => {
        LearningValidation.validateAnalyticsInput([], []);
      }).not.toThrow();
    });

    it("should throw ValidationError for invalid card in array", () => {
      const invalidCards = [{ ...validCards[0], id: null }];
      expect(() => {
        LearningValidation.validateAnalyticsInput(
          invalidCards as any,
          validSessions,
        );
      }).toThrow("All cards must have valid id, word, and definition");
    });

    it("should throw ValidationError for invalid session in array", () => {
      const invalidSessions = [{ ...validSessions[0], id: null }];
      expect(() => {
        LearningValidation.validateAnalyticsInput(
          validCards,
          invalidSessions as any,
        );
      }).toThrow(
        "All sessions must have valid id, startTime, and cardsReviewed",
      );
    });
  });

  describe("Goal Creation Validation", () => {
    const validGoalTemplate = {
      title: "Learn 25 Words",
      description: "Learn 25 new vocabulary words",
      category: "VOCABULARY",
      type: "ACHIEVEMENT",
      target: 25,
      timeframe: "MONTHLY",
      targetMetric: "WORDS_LEARNED",
      priority: "HIGH",
    };

    it("should pass validation for valid goal template", () => {
      expect(() => {
        LearningValidation.validateGoalCreation(validGoalTemplate);
      }).not.toThrow();
    });

    it("should throw ValidationError for missing title", () => {
      const template = { ...validGoalTemplate };
      delete (template as any).title;

      expect(() => {
        LearningValidation.validateGoalCreation(template);
      }).toThrow("Goal must have a title");
    });

    it("should throw ValidationError for empty title", () => {
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          title: "",
        });
      }).toThrow("Goal title must be between 1 and 200 characters");
    });

    it("should throw ValidationError for title that is too long", () => {
      const longTitle = "a".repeat(201);
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          title: longTitle,
        });
      }).toThrow("Goal title must be between 1 and 200 characters");
    });

    it("should throw ValidationError for missing target", () => {
      const template = { ...validGoalTemplate };
      delete (template as any).target;

      expect(() => {
        LearningValidation.validateGoalCreation(template);
      }).toThrow("Goal must have a target");
    });

    it("should throw ValidationError for invalid target type", () => {
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          target: "not-number" as any,
        });
      }).toThrow("Goal target must be a positive number");
    });

    it("should throw ValidationError for negative target", () => {
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          target: -5,
        });
      }).toThrow("Goal target must be a positive number");
    });

    it("should throw ValidationError for zero target", () => {
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          target: 0,
        });
      }).toThrow("Goal target must be a positive number");
    });

    it("should throw ValidationError for target that is too large", () => {
      expect(() => {
        LearningValidation.validateGoalCreation({
          ...validGoalTemplate,
          target: 10001,
        });
      }).toThrow("Goal target must be between 1 and 10000");
    });

    it("should validate optional fields when present", () => {
      const templateWithOptional = {
        ...validGoalTemplate,
        description: "a".repeat(2001), // Too long
      };

      expect(() => {
        LearningValidation.validateGoalCreation(templateWithOptional);
      }).toThrow("Goal description must be between 1 and 2000 characters");
    });
  });

  describe("Motivation Profile Validation", () => {
    const validProfile = {
      id: "profile-1",
      userId: "user-1",
      preferredRewardTypes: ["XP_BONUS", "BADGE"],
      motivationStyle: "ACHIEVER",
      encouragementLevel: "MODERATE",
      currentStreak: 5,
      totalXP: 1000,
      level: 3,
      xpToNextLevel: 250,
      engagementScore: 75,
      lastActiveDate: new Date(),
      averageSessionLength: 15,
      weeklyGoalProgress: 80,
      favoriteRewards: ["streak_reward"],
      unlockedRewards: ["badge_1"],
      pendingRewards: [],
    };

    it("should pass validation for valid motivation profile", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile(validProfile);
      }).not.toThrow();
    });

    it("should throw ValidationError for missing id", () => {
      const profile = { ...validProfile };
      delete (profile as any).id;

      expect(() => {
        LearningValidation.validateMotivationProfile(profile as any);
      }).toThrow("Profile must have an id");
    });

    it("should throw ValidationError for missing userId", () => {
      const profile = { ...validProfile };
      delete (profile as any).userId;

      expect(() => {
        LearningValidation.validateMotivationProfile(profile as any);
      }).toThrow("Profile must have a userId");
    });

    it("should throw ValidationError for invalid motivationStyle", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          motivationStyle: "INVALID" as any,
        });
      }).toThrow("Profile must have a valid motivationStyle");
    });

    it("should throw ValidationError for invalid encouragementLevel", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          encouragementLevel: "INVALID" as any,
        });
      }).toThrow("Profile must have a valid encouragementLevel");
    });

    it("should throw ValidationError for negative currentStreak", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          currentStreak: -1,
        });
      }).toThrow("Profile currentStreak must be a non-negative number");
    });

    it("should throw ValidationError for negative totalXP", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          totalXP: -100,
        });
      }).toThrow("Profile totalXP must be a non-negative number");
    });

    it("should throw ValidationError for invalid level", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          level: 0,
        });
      }).toThrow("Profile level must be a positive number");
    });

    it("should throw ValidationError for invalid engagementScore", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          engagementScore: 150,
        });
      }).toThrow("Profile engagementScore must be between 0 and 100");
    });

    it("should throw ValidationError for invalid lastActiveDate", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          lastActiveDate: "not-date" as any,
        });
      }).toThrow("Profile lastActiveDate must be a valid Date");
    });

    it("should throw ValidationError for non-array preferredRewardTypes", () => {
      expect(() => {
        LearningValidation.validateMotivationProfile({
          ...validProfile,
          preferredRewardTypes: "not-array" as any,
        });
      }).toThrow("Profile preferredRewardTypes must be an array");
    });
  });

  describe("ValidationError Class", () => {
    it("should create ValidationError with message only", () => {
      const error = new ValidationError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.name).toBe("ValidationError");
      expect(error.field).toBeUndefined();
      expect(error.value).toBeUndefined();
    });

    it("should create ValidationError with field and value", () => {
      const error = new ValidationError("Test error", "testField", "testValue");

      expect(error.message).toBe("Test error");
      expect(error.field).toBe("testField");
      expect(error.value).toBe("testValue");
    });

    it("should be instance of Error", () => {
      const error = new ValidationError("Test error");

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null input gracefully", () => {
      expect(() => {
        LearningValidation.validateCardCreation(null as any, "definition");
      }).toThrow(ValidationError);
    });

    it("should handle undefined input gracefully", () => {
      expect(() => {
        LearningValidation.validateCardCreation(undefined as any, "definition");
      }).toThrow(ValidationError);
    });

    it("should handle object input for string fields", () => {
      expect(() => {
        LearningValidation.validateCardCreation({} as any, "definition");
      }).toThrow(ValidationError);
    });

    it("should handle array input for string fields", () => {
      expect(() => {
        LearningValidation.validateCardCreation([] as any, "definition");
      }).toThrow(ValidationError);
    });

    it("should handle numeric string input", () => {
      expect(() => {
        LearningValidation.validateCardCreation("123", "456");
      }).not.toThrow();
    });

    it("should handle special characters in strings", () => {
      expect(() => {
        LearningValidation.validateCardCreation(
          "café",
          "A restaurant serving coffee ☕",
          "I went to the café.",
          ["The café was crowded."],
        );
      }).not.toThrow();
    });

    it("should handle very long valid inputs at boundaries", () => {
      const maxWord = "a".repeat(200);
      const maxDefinition = "a".repeat(2000);
      const maxContext = "a".repeat(1000);
      const maxExamples = Array(20).fill("a".repeat(500));

      expect(() => {
        LearningValidation.validateCardCreation(
          maxWord,
          maxDefinition,
          maxContext,
          maxExamples,
        );
      }).not.toThrow();
    });
  });
});

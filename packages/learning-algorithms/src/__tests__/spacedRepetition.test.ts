/**
 * Comprehensive tests for Spaced Repetition Engine
 * Tests learning algorithms, card progression, and mastery calculations
 */

import { SpacedRepetitionEngine } from "../spacedRepetition";
import type { SpacedRepetition } from "../shared/types";
import { TestFactories } from "../shared/__tests__/testDataFactories";

describe("SpacedRepetitionEngine", () => {
  const sampleCard: SpacedRepetition.VocabularyCard =
    TestFactories.SpacedRepetition.createVocabularyCard({
      id: "test-card-1",
      word: "serendipity",
      definition: "A pleasant surprise; a fortunate discovery",
      context: "Finding that book was pure serendipity.",
      examples: [
        "The meeting was serendipity - exactly what I needed.",
        "Their serendipitous encounter changed everything.",
      ],
      tags: ["advanced", "nouns"],
      difficulty: 3,
    });

  describe("Card Creation", () => {
    it("should create a new vocabulary card with correct defaults", () => {
      const card = SpacedRepetitionEngine.createCard(
        "ephemeral",
        "Lasting for a very short time",
        "The beauty of the sunset was ephemeral.",
        ["Art is ephemeral but powerful."],
      );

      expect(card.word).toBe("ephemeral");
      expect(card.definition).toBe("Lasting for a very short time");
      expect(card.context).toBe("The beauty of the sunset was ephemeral.");
      expect(card.examples).toHaveLength(1);
      expect(card.learningStage).toBe("NEW");
      expect(card.mastery).toBe(0);
      expect(card.easeFactor).toBe(2.5);
      expect(card.totalReviews).toBe(0);
      expect(card.correctReviews).toBe(0);
      expect(card.difficulty).toBe(3);
    });

    it("should handle card creation with minimal parameters", () => {
      const card = SpacedRepetitionEngine.createCard("test", "definition");

      expect(card.word).toBe("test");
      expect(card.definition).toBe("definition");
      expect(card.context).toBeUndefined();
      expect(card.examples).toEqual([]);
      expect(card.tags).toEqual([]);
    });

    it("should throw ValidationError for empty word", () => {
      expect(() => {
        SpacedRepetitionEngine.createCard("", "definition");
      }).toThrow("Card creation failed: Word must be a non-empty string");
    });

    it("should throw ValidationError for empty definition", () => {
      expect(() => {
        SpacedRepetitionEngine.createCard("word", "");
      }).toThrow("Card creation failed: Definition must be a non-empty string");
    });

    it("should throw ValidationError for invalid word type", () => {
      expect(() => {
        SpacedRepetitionEngine.createCard(123 as any, "definition");
      }).toThrow("Card creation failed: Word must be a non-empty string");
    });

    it("should throw ValidationError for excessively long word", () => {
      const longWord = "a".repeat(201);
      expect(() => {
        SpacedRepetitionEngine.createCard(longWord, "definition");
      }).toThrow(
        "Card creation failed: Word must be between 1 and 200 characters",
      );
    });

    it("should throw ValidationError for excessively long definition", () => {
      const longDefinition = "a".repeat(2001);
      expect(() => {
        SpacedRepetitionEngine.createCard("word", longDefinition);
      }).toThrow(
        "Card creation failed: Definition must be between 1 and 2000 characters",
      );
    });

    it("should throw ValidationError for too many examples", () => {
      const tooManyExamples = Array(21).fill("example sentence");
      expect(() => {
        SpacedRepetitionEngine.createCard(
          "word",
          "definition",
          undefined,
          tooManyExamples,
        );
      }).toThrow("Card creation failed: Cannot have more than 20 examples");
    });
  });

  describe("Card Review and Progression", () => {
    it("should update card correctly for EASY review", () => {
      const card = { ...sampleCard };
      const updatedCard = SpacedRepetitionEngine.reviewCard(card, "EASY", 2000);

      expect(updatedCard.correctReviews).toBe(1);
      expect(updatedCard.totalReviews).toBe(1);
      expect(updatedCard.mastery).toBeGreaterThan(0);
      expect(updatedCard.easeFactor).toBeGreaterThan(2.5);
      expect(updatedCard.interval).toBeGreaterThan(0);
      expect(updatedCard.nextReviewDate.getTime()).toBeGreaterThan(Date.now());
    });

    it("should update card correctly for HARD review", () => {
      const card = { ...sampleCard };
      const updatedCard = SpacedRepetitionEngine.reviewCard(card, "HARD", 4000);

      expect(updatedCard.correctReviews).toBe(1);
      expect(updatedCard.totalReviews).toBe(1);
      expect(updatedCard.mastery).toBeGreaterThan(0);
      expect(updatedCard.easeFactor).toBeLessThan(2.5);
      expect(updatedCard.interval).toBeGreaterThan(0);
    });

    it("should update card correctly for FORGOT review", () => {
      const card = { ...sampleCard };
      const updatedCard = SpacedRepetitionEngine.reviewCard(
        card,
        "FORGOT",
        6000,
      );

      expect(updatedCard.learningStage).toBe("RELEARNING");
      expect(updatedCard.correctReviews).toBe(0);
      expect(updatedCard.totalReviews).toBe(1);
      expect(updatedCard.mastery).toBe(0);
      expect(updatedCard.easeFactor).toBeLessThan(2.5);
      expect(updatedCard.interval).toBe(1);
      expect(updatedCard.streakCount).toBe(0);
    });

    it("should progress to MASTERED stage after multiple correct reviews", () => {
      let card = { ...sampleCard };

      // Simulate multiple successful reviews
      for (let i = 0; i < 8; i++) {
        card = SpacedRepetitionEngine.reviewCard(card, "EASY", 2000);
      }

      expect(card.learningStage).toBe("MASTERED");
      expect(card.mastery).toBeGreaterThanOrEqual(95);
      expect(card.correctReviews).toBe(8);
      expect(card.totalReviews).toBe(8);
    });

    it("should reset progress correctly when review is forgotten", () => {
      let card = { ...sampleCard };

      // Build up some progress
      card = SpacedRepetitionEngine.reviewCard(card, "EASY", 2000);
      card = SpacedRepetitionEngine.reviewCard(card, "EASY", 2000);
      expect(card.mastery).toBeGreaterThan(20);

      // Wrong answer should reset progress
      card = SpacedRepetitionEngine.reviewCard(card, "FORGOT", 6000);
      expect(card.mastery).toBe(0);
      expect(card.learningStage).toBe("RELEARNING");
    });

    it("should throw ValidationError for invalid card input", () => {
      expect(() => {
        SpacedRepetitionEngine.reviewCard(null as any, "EASY", 2000);
      }).toThrow("Card review failed: Card must be an object");
    });

    it("should throw ValidationError for invalid review result", () => {
      expect(() => {
        SpacedRepetitionEngine.reviewCard(sampleCard, "INVALID" as any, 2000);
      }).toThrow(
        "Card review failed: Review result must be one of: FORGOT, HARD, GOOD, EASY",
      );
    });

    it("should handle edge case of maximum ease factor", () => {
      const card = { ...sampleCard, easeFactor: 3.8 };
      const updatedCard = SpacedRepetitionEngine.reviewCard(card, "EASY", 2000);

      expect(updatedCard.easeFactor).toBeLessThanOrEqual(4.0);
    });

    it("should handle edge case of minimum ease factor", () => {
      const card = { ...sampleCard, easeFactor: 1.4 };
      const updatedCard = SpacedRepetitionEngine.reviewCard(
        card,
        "FORGOT",
        6000,
      );

      expect(updatedCard.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("Due Card Filtering", () => {
    it("should correctly identify due cards", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const cards: VocabularyCard[] = [
        { ...sampleCard, id: "due-1", nextReviewDate: pastDate },
        { ...sampleCard, id: "due-2", nextReviewDate: new Date() },
        { ...sampleCard, id: "not-due", nextReviewDate: futureDate },
      ];

      const dueCards = SpacedRepetitionEngine.getDueCards(cards);

      expect(dueCards).toHaveLength(2);
      expect(dueCards.map((c) => c.id)).toContain("due-1");
      expect(dueCards.map((c) => c.id)).toContain("due-2");
      expect(dueCards.map((c) => c.id)).not.toContain("not-due");
    });

    it("should return empty array when no cards are due", () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cards: VocabularyCard[] = [
        { ...sampleCard, id: "not-due-1", nextReviewDate: futureDate },
        { ...sampleCard, id: "not-due-2", nextReviewDate: futureDate },
      ];

      const dueCards = SpacedRepetitionEngine.getDueCards(cards);
      expect(dueCards).toHaveLength(0);
    });

    it("should filter new cards correctly", () => {
      const cards: VocabularyCard[] = [
        { ...sampleCard, id: "new-1", learningStage: "NEW" },
        { ...sampleCard, id: "learning-1", learningStage: "LEARNING" },
        { ...sampleCard, id: "new-2", learningStage: "NEW" },
        { ...sampleCard, id: "mastered-1", learningStage: "MASTERED" },
      ];

      const newCards = SpacedRepetitionEngine.getNewCards(cards);

      expect(newCards).toHaveLength(2);
      expect(newCards.map((c) => c.id)).toContain("new-1");
      expect(newCards.map((c) => c.id)).toContain("new-2");
    });
  });

  describe("Daily Statistics", () => {
    it("should calculate daily statistics correctly", () => {
      const cards = [
        {
          ...sampleCard,
          id: "due-1",
          nextReviewDate: new Date(Date.now() - 1000),
          learningStage: "REVIEW",
        },
        { ...sampleCard, id: "new-1", learningStage: "NEW" },
        { ...sampleCard, id: "mastered-1", learningStage: "MASTERED" },
      ];

      const stats = SpacedRepetitionEngine.getDailyStats(cards);

      expect(stats.dueForReview).toBe(1);
      expect(stats.newCards).toBe(1);
      expect(stats.totalCards).toBe(3);
      expect(stats.masteredCards).toBe(1);
    });
  });

  describe("Performance Edge Cases", () => {
    it("should handle empty card arrays", () => {
      expect(SpacedRepetitionEngine.getDueCards([])).toEqual([]);
      expect(SpacedRepetitionEngine.getNewCards([])).toEqual([]);
    });

    it("should handle cards with invalid dates gracefully", () => {
      const invalidCard = {
        ...sampleCard,
        nextReviewDate: new Date("invalid-date"),
      };

      // Should not throw error and should handle gracefully
      expect(() => {
        SpacedRepetitionEngine.getDueCards([invalidCard]);
      }).not.toThrow();
    });

    it("should maintain consistency in repeated operations", () => {
      let card = { ...sampleCard };

      // Review the same card multiple times with same result
      for (let i = 0; i < 5; i++) {
        card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      }

      expect(card.totalReviews).toBe(5);
      expect(card.correctReviews).toBe(5);
      expect(card.mastery).toBeGreaterThan(50);
    });
  });

  describe("Learning Stage Transitions", () => {
    it("should transition through all learning stages correctly", () => {
      let card = { ...sampleCard };

      // Start as NEW
      expect(card.learningStage).toBe("NEW");

      // First correct review -> LEARNING
      card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      expect(card.learningStage).toBe("LEARNING");

      // Continue reviewing correctly -> REVIEW
      for (let i = 0; i < 3; i++) {
        card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      }
      expect(card.learningStage).toBe("REVIEW");

      // Continue until mastered
      while (card.learningStage !== "MASTERED") {
        card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      }
      expect(card.learningStage).toBe("MASTERED");
    });

    it("should handle relearning stage correctly", () => {
      let card = { ...sampleCard };

      // Progress to REVIEW stage
      for (let i = 0; i < 5; i++) {
        card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      }
      expect(card.learningStage).toBe("REVIEW");

      // Wrong answer should move to RELEARNING
      card = SpacedRepetitionEngine.reviewCard(card, "FORGOT", 6000);
      expect(card.learningStage).toBe("RELEARNING");

      // Correct answers should progress back through stages
      card = SpacedRepetitionEngine.reviewCard(card, "GOOD", 3000);
      expect(card.learningStage).toBe("LEARNING");
    });
  });
});

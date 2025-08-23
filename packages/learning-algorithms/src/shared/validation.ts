/**
 * Validation utilities for learning systems
 * Provides comprehensive input validation with descriptive error messages
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class LearningValidation {
  /**
   * Validate vocabulary card creation parameters
   */
  static validateCardCreation(
    word: string,
    definition: string,
    context?: string,
    examples?: string[],
  ): void {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      throw new ValidationError(
        "Word must be a non-empty string",
        "word",
        word,
      );
    }

    if (word.trim().length > 200) {
      throw new ValidationError(
        "Word must be between 1 and 200 characters",
        "word",
        word,
      );
    }

    if (
      !definition ||
      typeof definition !== "string" ||
      definition.trim().length === 0
    ) {
      throw new ValidationError(
        "Definition must be a non-empty string",
        "definition",
        definition,
      );
    }

    if (definition.trim().length > 2000) {
      throw new ValidationError(
        "Definition must be between 1 and 2000 characters",
        "definition",
        definition,
      );
    }

    if (context !== undefined) {
      if (typeof context !== "string") {
        throw new ValidationError(
          "Context must be a string",
          "context",
          context,
        );
      }
      if (context.trim().length === 0) {
        throw new ValidationError(
          "Context must be between 1 and 1000 characters",
          "context",
          context,
        );
      }
      if (context.length > 1000) {
        throw new ValidationError(
          "Context must be between 1 and 1000 characters",
          "context",
          context,
        );
      }
    }

    if (examples !== undefined) {
      if (!Array.isArray(examples)) {
        throw new ValidationError(
          "Examples must be an array",
          "examples",
          examples,
        );
      }
      if (examples.length > 20) {
        throw new ValidationError(
          "Cannot have more than 20 examples",
          "examples",
          examples,
        );
      }
      examples.forEach((example) => {
        if (typeof example !== "string") {
          throw new ValidationError(
            "All examples must be non-empty strings",
            "examples",
            example,
          );
        }
        if (example.trim().length === 0) {
          throw new ValidationError(
            "All examples must be non-empty strings",
            "examples",
            example,
          );
        }
        if (example.length > 500) {
          throw new ValidationError(
            "Each example must be between 1 and 500 characters",
            "examples",
            example,
          );
        }
      });
    }
  }

  /**
   * Validate vocabulary card object for review
   */
  static validateCardReview(card: any, reviewResult: string): void {
    if (!card || typeof card !== "object") {
      throw new ValidationError("Card must be a valid object", "card", card);
    }

    // Required fields for our VocabularyCard interface
    const requiredFields = [
      "id",
      "word",
      "definition",
      "learningStage",
      "mastery",
      "easinessFactor",
      "totalReviews",
      "correctReviews",
    ];
    for (const field of requiredFields) {
      if (!(field in card)) {
        throw new ValidationError(
          "Card must have all required properties",
          field,
          undefined,
        );
      }
    }

    // Validate review result
    const validResults = ["EASY", "GOOD", "HARD", "WRONG"];
    if (!validResults.includes(reviewResult)) {
      throw new ValidationError(
        "Review result must be one of: EASY, GOOD, HARD, WRONG",
        "reviewResult",
        reviewResult,
      );
    }
  }

  /**
   * Validate review result parameters (used by SpacedRepetitionEngine)
   */
  static validateReviewResult(
    card: any,
    result: string,
    responseTime: number,
  ): void {
    if (!card || typeof card !== "object") {
      throw new ValidationError("Card must be an object", "card", card);
    }

    // Required fields for our VocabularyCard interface
    const requiredFields = [
      "id",
      "word",
      "definition",
      "difficulty",
      "easeFactor",
      "repetitions",
      "interval",
      "totalReviews",
      "correctReviews",
      "streakCount",
      "averageResponseTime",
      "learningStage",
      "mastery",
    ];
    for (const field of requiredFields) {
      if (!(field in card)) {
        throw new ValidationError(
          `Card is missing required field: ${field}`,
          field,
          undefined,
        );
      }
    }

    // Validate review result
    const validResults = ["FORGOT", "HARD", "GOOD", "EASY"];
    if (!validResults.includes(result)) {
      throw new ValidationError(
        "Review result must be one of: FORGOT, HARD, GOOD, EASY",
        "result",
        result,
      );
    }

    // Validate response time
    if (typeof responseTime !== "number" || responseTime < 0) {
      throw new ValidationError(
        "Response time must be a non-negative number",
        "responseTime",
        responseTime,
      );
    }
  }

  /**
   * Validate analytics input arrays
   */
  static validateAnalyticsInput(cards: any[], sessions: any[]): void {
    if (!Array.isArray(cards)) {
      throw new ValidationError("Cards must be an array", "cards", cards);
    }

    if (!Array.isArray(sessions)) {
      throw new ValidationError(
        "Sessions must be an array",
        "sessions",
        sessions,
      );
    }

    // Validate each card has basic required properties
    cards.forEach((card, index) => {
      if (!card || typeof card !== "object") {
        throw new ValidationError(
          `Invalid card at index ${index}: Card must be an object`,
          `vocabularyCards[${index}]`,
          card,
        );
      }

      if (!card.id || !card.word || !card.definition) {
        throw new ValidationError(
          "All cards must have valid id, word, and definition",
          `vocabularyCards[${index}]`,
          card,
        );
      }
    });

    // Validate each session has basic required properties
    sessions.forEach((session, index) => {
      if (!session || typeof session !== "object") {
        throw new ValidationError(
          `Invalid session at index ${index}: Session must be an object`,
          `reviewSessions[${index}]`,
          session,
        );
      }

      if (
        !session.id ||
        !session.startTime ||
        typeof session.cardsReviewed !== "number"
      ) {
        throw new ValidationError(
          "All sessions must have valid id, startTime, and cardsReviewed",
          `reviewSessions[${index}]`,
          session,
        );
      }
    });
  }

  /**
   * Validate goal creation template
   */
  static validateGoalCreation(template: any): void {
    if (!template || typeof template !== "object") {
      throw new ValidationError(
        "Goal template must be an object",
        "template",
        template,
      );
    }

    if (template.title === undefined || template.title === null) {
      throw new ValidationError(
        "Goal must have a title",
        "title",
        template.title,
      );
    }

    if (
      typeof template.title !== "string" ||
      template.title.trim().length === 0
    ) {
      throw new ValidationError(
        "Goal title must be between 1 and 200 characters",
        "title",
        template.title,
      );
    }

    if (template.title.length > 200) {
      throw new ValidationError(
        "Goal title must be between 1 and 200 characters",
        "title",
        template.title,
      );
    }

    if (template.target === undefined) {
      throw new ValidationError(
        "Goal must have a target",
        "target",
        template.target,
      );
    }

    if (template.target !== undefined) {
      if (
        typeof template.target !== "number" ||
        template.target <= 0 ||
        !Number.isInteger(template.target)
      ) {
        throw new ValidationError(
          "Goal target must be a positive number",
          "target",
          template.target,
        );
      }

      if (template.target > 10000) {
        throw new ValidationError(
          "Goal target must be between 1 and 10000",
          "target",
          template.target,
        );
      }
    }

    if (template.description !== undefined) {
      if (typeof template.description !== "string") {
        throw new ValidationError(
          "Goal description must be a string",
          "description",
          template.description,
        );
      }

      if (template.description.trim().length === 0) {
        throw new ValidationError(
          "Goal description must be between 1 and 2000 characters",
          "description",
          template.description,
        );
      }

      if (template.description.length > 2000) {
        throw new ValidationError(
          "Goal description must be between 1 and 2000 characters",
          "description",
          template.description,
        );
      }
    }
  }

  /**
   * Validate motivation profile
   */
  static validateMotivationProfile(profile: any): void {
    if (!profile || typeof profile !== "object") {
      throw new ValidationError(
        "Profile must be an object",
        "profile",
        profile,
      );
    }

    // Required fields
    const requiredFields = [
      "id",
      "userId",
      "motivationStyle",
      "encouragementLevel",
      "currentStreak",
      "totalXP",
      "level",
      "engagementScore",
      "lastActiveDate",
    ];
    for (const field of requiredFields) {
      if (!(field in profile)) {
        const article = field.startsWith("userId") ? "a" : "an";
        throw new ValidationError(
          `Profile must have ${article} ${field}`,
          field,
          undefined,
        );
      }
    }

    // Validate specific fields
    if (typeof profile.id !== "string" || profile.id.trim().length === 0) {
      throw new ValidationError("Profile must have an id", "id", profile.id);
    }

    if (
      typeof profile.userId !== "string" ||
      profile.userId.trim().length === 0
    ) {
      throw new ValidationError(
        "Profile must have a userId",
        "userId",
        profile.userId,
      );
    }

    // Validate motivation style
    const validMotivationStyles = [
      "ACHIEVER",
      "SOCIALIZER",
      "EXPLORER",
      "COMPETITOR",
      "COMPLETIONIST",
    ];
    if (!validMotivationStyles.includes(profile.motivationStyle)) {
      throw new ValidationError(
        "Profile must have a valid motivationStyle",
        "motivationStyle",
        profile.motivationStyle,
      );
    }

    // Validate encouragement level
    const validEncouragementLevels = ["MINIMAL", "MODERATE", "HIGH", "MAXIMUM"];
    if (!validEncouragementLevels.includes(profile.encouragementLevel)) {
      throw new ValidationError(
        "Profile must have a valid encouragementLevel",
        "encouragementLevel",
        profile.encouragementLevel,
      );
    }

    // Validate numeric fields
    if (
      typeof profile.currentStreak !== "number" ||
      profile.currentStreak < 0
    ) {
      throw new ValidationError(
        "Profile currentStreak must be a non-negative number",
        "currentStreak",
        profile.currentStreak,
      );
    }

    if (typeof profile.totalXP !== "number" || profile.totalXP < 0) {
      throw new ValidationError(
        "Profile totalXP must be a non-negative number",
        "totalXP",
        profile.totalXP,
      );
    }

    if (
      typeof profile.level !== "number" ||
      profile.level < 1 ||
      !Number.isInteger(profile.level)
    ) {
      throw new ValidationError(
        "Profile level must be a positive number",
        "level",
        profile.level,
      );
    }

    if (
      typeof profile.engagementScore !== "number" ||
      profile.engagementScore < 0 ||
      profile.engagementScore > 100
    ) {
      throw new ValidationError(
        "Profile engagementScore must be between 0 and 100",
        "engagementScore",
        profile.engagementScore,
      );
    }

    // Validate date
    if (
      !(profile.lastActiveDate instanceof Date) ||
      isNaN(profile.lastActiveDate.getTime())
    ) {
      throw new ValidationError(
        "Profile lastActiveDate must be a valid Date",
        "lastActiveDate",
        profile.lastActiveDate,
      );
    }

    // Validate arrays
    if (
      profile.preferredRewardTypes !== undefined &&
      !Array.isArray(profile.preferredRewardTypes)
    ) {
      throw new ValidationError(
        "Profile preferredRewardTypes must be an array",
        "preferredRewardTypes",
        profile.preferredRewardTypes,
      );
    }
  }
}

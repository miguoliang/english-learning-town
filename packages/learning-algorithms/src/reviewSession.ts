/**
 * Vocabulary Review Session Management
 * Handles review sessions, progress tracking, and session analytics
 */

import type { SpacedRepetition } from "./shared/types";

// For backward compatibility during transition
type VocabularyCard = SpacedRepetition.VocabularyCard;
type LearningStage = SpacedRepetition.LearningStage;
type ReviewResult = SpacedRepetition.ReviewResult;

// Constants for enum-like behavior
const REVIEW_RESULTS = {
  FORGOT: "FORGOT" as const,
  HARD: "HARD" as const,
  GOOD: "GOOD" as const,
  EASY: "EASY" as const,
};

export interface ReviewSessionConfig {
  maxCards: number;
  maxNewCards: number;
  includeReviews: boolean;
  includeNew: boolean;
  targetDuration: number; // minutes
  focusAreas: LearningStage[];
  difficulty: "easy" | "medium" | "hard";
}

export interface SessionQuestion {
  cardId: string;
  word: string;
  questionType: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[] | undefined; // for multiple choice
  hint: string | undefined;
  startTime: number;
  endTime?: number;
  userAnswer?: string;
  result?: ReviewResult;
  responseTime?: number;
}

export const QuestionType = {
  DEFINITION: "DEFINITION", // Given word, choose definition
  WORD_CHOICE: "WORD_CHOICE", // Given definition, choose word
  FILL_BLANK: "FILL_BLANK", // Fill in the blank sentence
  TRANSLATION: "TRANSLATION", // Translate to/from native language
  AUDIO: "AUDIO", // Listen and identify word
  CONTEXT: "CONTEXT", // Choose word that fits context
  SPELLING: "SPELLING", // Type the correct spelling
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export class ReviewSessionManager {
  private currentSession: ReviewSession | null = null;
  private sessionQuestions: SessionQuestion[] = [];
  private currentQuestionIndex = 0;

  /**
   * Start a new review session
   */
  startSession(
    cards: VocabularyCard[],
    config: ReviewSessionConfig = this.getDefaultConfig(),
  ): ReviewSession {
    const sessionCards = this.selectSessionCards(cards, config);

    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      cardsReviewed: 0,
      cardsCorrect: 0,
      totalTime: 0,
      averageTime: 0,
      sessionType: "daily",
    };

    this.sessionQuestions = this.generateQuestions(sessionCards, config);
    this.currentQuestionIndex = 0;

    return this.currentSession;
  }

  /**
   * Get the current question
   */
  getCurrentQuestion(): SessionQuestion | null {
    if (
      !this.sessionQuestions ||
      this.currentQuestionIndex >= this.sessionQuestions.length
    ) {
      return null;
    }

    const question = this.sessionQuestions[this.currentQuestionIndex];
    if (!question.startTime) {
      question.startTime = Date.now();
    }

    return question;
  }

  /**
   * Submit an answer for the current question
   */
  submitAnswer(answer: string): {
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
    nextQuestion?: SessionQuestion;
  } {
    const question = this.getCurrentQuestion();
    if (!question || !this.currentSession) {
      throw new Error("No active question or session");
    }

    question.endTime = Date.now();
    question.userAnswer = answer;
    question.responseTime = question.endTime - question.startTime;

    const correct = this.evaluateAnswer(question, answer);
    question.result = this.calculateResult(correct, question.responseTime!);

    // Update session stats
    this.currentSession.cardsReviewed++;
    if (correct) {
      this.currentSession.cardsCorrect++;
    }

    // Move to next question
    this.currentQuestionIndex++;

    const nextQuestion = this.getCurrentQuestion();

    const explanation = this.getExplanation(question);
    return {
      correct,
      correctAnswer: question.correctAnswer,
      ...(explanation !== undefined && { explanation }),
      ...(nextQuestion !== null && { nextQuestion }),
    };
  }

  /**
   * Complete the current session
   */
  completeSession(): ReviewSession {
    if (!this.currentSession) {
      throw new Error("No active session");
    }

    this.currentSession.endTime = new Date();
    this.currentSession.totalTime =
      this.currentSession.endTime.getTime() -
      this.currentSession.startTime.getTime();

    if (this.currentSession.cardsReviewed > 0) {
      this.currentSession.averageTime =
        this.currentSession.totalTime / this.currentSession.cardsReviewed;
    }

    const completedSession = this.currentSession;

    // Reset session state
    this.currentSession = null;
    this.sessionQuestions = [];
    this.currentQuestionIndex = 0;

    return completedSession;
  }

  /**
   * Get session progress
   */
  getProgress(): {
    current: number;
    total: number;
    percentage: number;
    correct: number;
    accuracy: number;
  } {
    if (!this.currentSession) {
      return { current: 0, total: 0, percentage: 0, correct: 0, accuracy: 0 };
    }

    const current = this.currentQuestionIndex;
    const total = this.sessionQuestions.length;
    const correct = this.currentSession.cardsCorrect;

    return {
      current,
      total,
      percentage: total > 0 ? (current / total) * 100 : 0,
      correct,
      accuracy:
        this.currentSession.cardsReviewed > 0
          ? (correct / this.currentSession.cardsReviewed) * 100
          : 0,
    };
  }

  /**
   * Select cards for the session based on config
   */
  private selectSessionCards(
    cards: VocabularyCard[],
    config: ReviewSessionConfig,
  ): VocabularyCard[] {
    const sessionCards: VocabularyCard[] = [];

    // Add due review cards
    if (config.includeReviews) {
      const dueCards = cards
        .filter((card) => card.nextReviewDate <= new Date())
        .filter(
          (card) =>
            config.focusAreas.length === 0 ||
            config.focusAreas.includes(card.learningStage),
        )
        .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
        .slice(0, config.maxCards);

      sessionCards.push(...dueCards);
    }

    // Add new cards
    if (config.includeNew && sessionCards.length < config.maxCards) {
      const newCards = cards
        .filter((card) => card.learningStage === "NEW")
        .sort((a, b) => a.difficulty - b.difficulty)
        .slice(
          0,
          Math.min(config.maxNewCards, config.maxCards - sessionCards.length),
        );

      sessionCards.push(...newCards);
    }

    return sessionCards;
  }

  /**
   * Generate questions from selected cards
   */
  private generateQuestions(
    cards: VocabularyCard[],
    config: ReviewSessionConfig,
  ): SessionQuestion[] {
    return cards.map((card) => {
      const questionType = this.selectQuestionType(card, config);
      const { question, correctAnswer, options, hint } = this.createQuestion(
        card,
        questionType,
      );

      return {
        cardId: card.id,
        word: card.word,
        questionType,
        question,
        correctAnswer,
        options: options || undefined,
        hint: hint || undefined,
        startTime: 0,
      };
    });
  }

  /**
   * Select appropriate question type for a card
   */
  private selectQuestionType(
    card: VocabularyCard,
    _config: ReviewSessionConfig,
  ): QuestionType {
    const availableTypes: QuestionType[] = [];

    // Always include basic types
    availableTypes.push(QuestionType.DEFINITION, QuestionType.WORD_CHOICE);

    // Add context questions if examples exist
    if (card.examples && card.examples.length > 0) {
      availableTypes.push(QuestionType.FILL_BLANK, QuestionType.CONTEXT);
    }

    // Add spelling for learning stage cards
    if (card.learningStage === "LEARNING" || card.learningStage === "NEW") {
      availableTypes.push(QuestionType.SPELLING);
    }

    // Random selection based on difficulty
    const typeIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[typeIndex];
  }

  /**
   * Create a question based on card and type
   */
  private createQuestion(
    card: VocabularyCard,
    type: QuestionType,
  ): {
    question: string;
    correctAnswer: string;
    options: string[] | undefined;
    hint: string | undefined;
  } {
    switch (type) {
      case QuestionType.DEFINITION:
        return {
          question: `What does "${card.word}" mean?`,
          correctAnswer: card.definition,
          options: this.generateDefinitionOptions(card),
          hint: card.context
            ? `You learned this word: ${card.context}`
            : undefined,
        };

      case QuestionType.WORD_CHOICE:
        return {
          question: `Which word means: ${card.definition}`,
          correctAnswer: card.word,
          options: this.generateWordOptions(card),
          hint:
            card.examples.length > 0
              ? `Example: ${card.examples[0]}`
              : undefined,
        };

      case QuestionType.FILL_BLANK:
        if (card.examples.length > 0) {
          const example =
            card.examples[Math.floor(Math.random() * card.examples.length)];
          const blankExample = example.replace(
            new RegExp(card.word, "gi"),
            "____",
          );
          return {
            question: `Fill in the blank: ${blankExample}`,
            correctAnswer: card.word,
            options: undefined,
            hint: `Definition: ${card.definition}`,
          };
        }
        // Fallback to definition
        return this.createQuestion(card, QuestionType.DEFINITION);

      case QuestionType.SPELLING:
        return {
          question: `Spell the word that means: ${card.definition}`,
          correctAnswer: card.word.toLowerCase(),
          options: undefined,
          hint: `It starts with "${card.word.charAt(0)}" and has ${card.word.length} letters`,
        };

      default:
        return this.createQuestion(card, QuestionType.DEFINITION);
    }
  }

  /**
   * Generate multiple choice options for definitions
   */
  private generateDefinitionOptions(
    card: VocabularyCard,
  ): string[] | undefined {
    // This would ideally pull from a database of definitions
    // For now, return the correct answer as one option
    return [card.definition];
  }

  /**
   * Generate multiple choice options for words
   */
  private generateWordOptions(card: VocabularyCard): string[] | undefined {
    // This would ideally pull from similar words
    // For now, return the correct answer as one option
    return [card.word];
  }

  /**
   * Evaluate if an answer is correct
   */
  private evaluateAnswer(question: SessionQuestion, answer: string): boolean {
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrect = question.correctAnswer.toLowerCase().trim();

    if (question.questionType === QuestionType.SPELLING) {
      return normalizedAnswer === normalizedCorrect;
    }

    // For multiple choice, exact match
    if (question.options && question.options.length > 1) {
      return normalizedAnswer === normalizedCorrect;
    }

    // For open-ended, more flexible matching
    return (
      normalizedAnswer.includes(normalizedCorrect) ||
      normalizedCorrect.includes(normalizedAnswer)
    );
  }

  /**
   * Calculate review result based on correctness and response time
   */
  private calculateResult(
    correct: boolean,
    responseTime: number,
  ): ReviewResult {
    if (!correct) {
      return REVIEW_RESULTS.FORGOT;
    }

    // Fast response (< 3 seconds) = Easy
    if (responseTime < 3000) {
      return REVIEW_RESULTS.EASY;
    }

    // Medium response (3-8 seconds) = Good
    if (responseTime < 8000) {
      return REVIEW_RESULTS.GOOD;
    }

    // Slow response (> 8 seconds) = Hard
    return REVIEW_RESULTS.HARD;
  }

  /**
   * Get explanation for a question result
   */
  private getExplanation(question: SessionQuestion): string | undefined {
    if (question.result === REVIEW_RESULTS.FORGOT) {
      return `The correct answer is "${question.correctAnswer}". Don't worry, you'll see this word again soon!`;
    }

    if (question.hint) {
      return question.hint;
    }

    return undefined;
  }

  /**
   * Get default session configuration
   */
  private getDefaultConfig(): ReviewSessionConfig {
    return {
      maxCards: 20,
      maxNewCards: 5,
      includeReviews: true,
      includeNew: true,
      targetDuration: 15, // 15 minutes
      focusAreas: [],
      difficulty: "medium",
    };
  }
}

export interface ReviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  totalTime: number;
  averageTime: number;
  sessionType: "daily" | "review" | "mastery" | "custom";
}

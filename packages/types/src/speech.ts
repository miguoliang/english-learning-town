/**
 * @fileoverview Speech recognition types - Speech challenges, recognition results, and configuration
 * @module @english-learning-town/types/speech
 * @version 1.0.0
 *
 * @description
 * Type definitions for speech recognition functionality including speech challenges,
 * recognition results, alternatives, and configuration options.
 *
 * @example
 * ```typescript
 * import { SpeechChallenge, SpeechRecognitionResult } from '@english-learning-town/types';
 *
 * const challenge: SpeechChallenge = {
 *   id: 'pronounce-hello',
 *   type: SpeechChallengeType.WORD_PRONUNCIATION,
 *   targetText: 'Hello',
 *   successThreshold: 80
 * };
 * ```
 */

/**
 * @interface SpeechChallenge
 * @description Speech challenge for pronunciation practice
 * @example
 * ```typescript
 * const challenge: SpeechChallenge = {
 *   id: 'hello-pronunciation',
 *   type: SpeechChallengeType.WORD_PRONUNCIATION,
 *   targetText: 'Hello',
 *   hints: ['Say it with a smile!', 'Stress the first syllable'],
 *   maxAttempts: 3,
 *   successThreshold: 80
 * };
 * ```
 */
export interface SpeechChallenge {
  /** Unique challenge identifier */
  id: string;
  /** Type of speech challenge */
  type: SpeechChallengeType;
  /** Text that the player should say */
  targetText: string;
  /** Optional phonetic transcription for guidance */
  phonetics?: string;
  /** Helpful hints for pronunciation */
  hints: string[];
  /** Maximum number of attempts allowed */
  maxAttempts: number;
  /** Optional time limit in seconds */
  timeLimit?: number;
  /** Confidence score threshold for success (0-100) */
  successThreshold: number;
}

/**
 * @enum {string} SpeechChallengeType
 * @description Types of speech challenges available
 * @example
 * ```typescript
 * const challengeType = SpeechChallengeType.WORD_PRONUNCIATION;
 * ```
 */
export enum SpeechChallengeType {
  /** Practice pronouncing a single word */
  WORD_PRONUNCIATION = 'word_pronunciation',
  /** Repeat a phrase exactly as spoken */
  PHRASE_REPETITION = 'phrase_repetition',
  /** Respond freely to a question or prompt */
  FREE_RESPONSE = 'free_response',
  /** Read a passage aloud */
  READING_ALOUD = 'reading_aloud',
}

/**
 * @interface SpeechRecognitionResult
 * @description Result from speech recognition processing
 * @example
 * ```typescript
 * const result: SpeechRecognitionResult = {
 *   transcript: 'Hello there',
 *   confidence: 0.95,
 *   timestamp: new Date(),
 *   duration: 1200
 * };
 * ```
 */
export interface SpeechRecognitionResult {
  /** The recognized text transcript */
  transcript: string;
  /** Confidence level of the recognition (0-1) */
  confidence: number;
  /** Alternative recognition results */
  alternatives?: SpeechAlternative[];
  /** When the recognition was completed */
  timestamp: Date;
  /** Duration of the recognized speech in milliseconds */
  duration: number;
}

/**
 * @interface SpeechAlternative
 * @description Alternative recognition result with lower confidence
 * @example
 * ```typescript
 * const alternative: SpeechAlternative = {
 *   transcript: 'Helo there',
 *   confidence: 0.75
 * };
 * ```
 */
export interface SpeechAlternative {
  /** Alternative recognized text */
  transcript: string;
  /** Confidence level of this alternative (0-1) */
  confidence: number;
}

/**
 * @interface SpeechRecognitionConfig
 * @description Configuration for speech recognition service
 * @example
 * ```typescript
 * const config: SpeechRecognitionConfig = {
 *   language: 'en-US',
 *   continuous: false,
 *   interimResults: true,
 *   maxAlternatives: 3
 * };
 * ```
 */
export interface SpeechRecognitionConfig {
  /** Language code for recognition (e.g., 'en-US') */
  language: string;
  /** Whether to continue recognition after results */
  continuous: boolean;
  /** Whether to return interim (partial) results */
  interimResults: boolean;
  /** Maximum number of alternative results to return */
  maxAlternatives: number;
  /** Optional grammar hints for better recognition */
  grammars?: string[];
}

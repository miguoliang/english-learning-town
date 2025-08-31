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

// ============================================
// SPEECH RECOGNITION TYPES
// ============================================

export interface SpeechChallenge {
  id: string;
  type: SpeechChallengeType;
  targetText: string;
  phonetics?: string;
  hints: string[];
  maxAttempts: number;
  timeLimit?: number; // seconds
  successThreshold: number; // 0-100 confidence score
}

export enum SpeechChallengeType {
  WORD_PRONUNCIATION = 'word_pronunciation',
  PHRASE_REPETITION = 'phrase_repetition',
  FREE_RESPONSE = 'free_response',
  READING_ALOUD = 'reading_aloud',
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: SpeechAlternative[];
  timestamp: Date;
  duration: number;
}

export interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
}

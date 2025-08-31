/**
 * @fileoverview Game state types - Game state management, settings, and events
 * @module @english-learning-town/types/game-state
 * @version 1.0.0
 *
 * @description
 * Type definitions for game state management including game settings,
 * time tracking, debug states, and game events.
 *
 * @example
 * ```typescript
 * import { GameState, GameSettings, GameEvent } from '@english-learning-town/types';
 *
 * const gameSettings: GameSettings = {
 *   masterVolume: 0.8,
 *   musicVolume: 0.7,
 *   graphics: { quality: 'high' }
 * };
 * ```
 */

import type { SpeechRecognitionConfig } from './speech';

// ============================================
// GAME STATE MANAGEMENT TYPES
// ============================================

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentDialogue: string | null;
  currentLocation: string;
  gameTime: GameTime;
  settings: GameSettings;
  debug: DebugState;
}

export interface GameTime {
  totalPlayTime: number; // milliseconds
  sessionStartTime: Date;
  lastSaveTime: Date;
}

export interface GameSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  voiceVolume: number; // 0-1
  speechRecognition: SpeechRecognitionConfig;
  graphics: GraphicsSettings;
  accessibility: AccessibilitySettings;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  fullscreen: boolean;
  vsync: boolean;
  particleEffects: boolean;
}

export interface AccessibilitySettings {
  subtitles: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
}

export interface DebugState {
  showFPS: boolean;
  showCollisionBoxes: boolean;
  showDialogueDebug: boolean;
  godMode: boolean;
  unlockAllLocations: boolean;
}

// ============================================
// EVENT SYSTEM TYPES
// ============================================

export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: Date;
  data: Record<string, any>;
}

export enum GameEventType {
  PLAYER_MOVED = 'player_moved',
  DIALOGUE_STARTED = 'dialogue_started',
  DIALOGUE_ENDED = 'dialogue_ended',
  QUEST_STARTED = 'quest_started',
  QUEST_COMPLETED = 'quest_completed',
  ITEM_COLLECTED = 'item_collected',
  SPEECH_RECOGNITION_SUCCESS = 'speech_recognition_success',
  SPEECH_RECOGNITION_FAILED = 'speech_recognition_failed',
  LEVEL_UP = 'level_up',
  LOCATION_CHANGED = 'location_changed',
}

export interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  currentTask: string;
  error: string | null;
}

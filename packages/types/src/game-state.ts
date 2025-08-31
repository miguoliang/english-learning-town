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

/**
 * @interface GameState
 * @description Overall state of the game session
 * @example
 * ```typescript
 * const gameState: GameState = {
 *   isPlaying: true,
 *   isPaused: false,
 *   currentDialogue: null,
 *   currentLocation: 'classroom-1',
 *   gameTime: { totalPlayTime: 120000, sessionStartTime: new Date() }
 * };
 * ```
 */
export interface GameState {
  /** Whether the game is currently active */
  isPlaying: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
  /** ID of currently active dialogue, if any */
  currentDialogue: string | null;
  /** ID of the player's current location */
  currentLocation: string;
  /** Time tracking information */
  gameTime: GameTime;
  /** Game settings and preferences */
  settings: GameSettings;
  /** Debug mode settings */
  debug: DebugState;
}

/**
 * @interface GameTime
 * @description Time tracking for the game session
 * @example
 * ```typescript
 * const gameTime: GameTime = {
 *   totalPlayTime: 3600000, // 1 hour
 *   sessionStartTime: new Date(),
 *   lastSaveTime: new Date()
 * };
 * ```
 */
export interface GameTime {
  /** Total play time across all sessions in milliseconds */
  totalPlayTime: number;
  /** When the current session started */
  sessionStartTime: Date;
  /** When the game was last saved */
  lastSaveTime: Date;
}

/**
 * @interface GameSettings
 * @description Game configuration and user preferences
 * @example
 * ```typescript
 * const settings: GameSettings = {
 *   masterVolume: 0.8,
 *   musicVolume: 0.6,
 *   graphics: { quality: 'medium', fullscreen: false },
 *   accessibility: { subtitles: true, highContrast: false }
 * };
 * ```
 */
export interface GameSettings {
  /** Master volume level (0-1) */
  masterVolume: number;
  /** Background music volume (0-1) */
  musicVolume: number;
  /** Sound effects volume (0-1) */
  sfxVolume: number;
  /** Voice/speech volume (0-1) */
  voiceVolume: number;
  /** Speech recognition configuration */
  speechRecognition: SpeechRecognitionConfig;
  /** Graphics and rendering settings */
  graphics: GraphicsSettings;
  /** Accessibility options */
  accessibility: AccessibilitySettings;
}

/**
 * @interface GraphicsSettings
 * @description Graphics and rendering configuration
 * @example
 * ```typescript
 * const graphics: GraphicsSettings = {
 *   quality: 'high',
 *   fullscreen: true,
 *   vsync: true,
 *   particleEffects: true
 * };
 * ```
 */
export interface GraphicsSettings {
  /** Rendering quality level */
  quality: 'low' | 'medium' | 'high';
  /** Whether to run in fullscreen mode */
  fullscreen: boolean;
  /** Whether to enable vertical sync */
  vsync: boolean;
  /** Whether to show particle effects */
  particleEffects: boolean;
}

/**
 * @interface AccessibilitySettings
 * @description Accessibility options for inclusive gameplay
 * @example
 * ```typescript
 * const accessibility: AccessibilitySettings = {
 *   subtitles: true,
 *   highContrast: false,
 *   largeText: true,
 *   reducedMotion: false,
 *   colorBlindSupport: true
 * };
 * ```
 */
export interface AccessibilitySettings {
  /** Whether to show subtitles for audio */
  subtitles: boolean;
  /** Whether to use high contrast colors */
  highContrast: boolean;
  /** Whether to use larger text size */
  largeText: boolean;
  /** Whether to reduce motion and animations */
  reducedMotion: boolean;
  /** Whether to enable colorblind-friendly colors */
  colorBlindSupport: boolean;
}

/**
 * @interface DebugState
 * @description Debug mode settings for development
 * @example
 * ```typescript
 * const debug: DebugState = {
 *   showFPS: true,
 *   showCollisionBoxes: false,
 *   godMode: false,
 *   unlockAllLocations: false
 * };
 * ```
 */
export interface DebugState {
  /** Whether to display FPS counter */
  showFPS: boolean;
  /** Whether to show collision detection boxes */
  showCollisionBoxes: boolean;
  /** Whether to show dialogue debug information */
  showDialogueDebug: boolean;
  /** Whether god mode (invincibility) is enabled */
  godMode: boolean;
  /** Whether all locations are unlocked for testing */
  unlockAllLocations: boolean;
}

// ============================================
// EVENT SYSTEM TYPES
// ============================================

/**
 * @interface GameEvent
 * @description Event that occurs during gameplay
 * @example
 * ```typescript
 * const event: GameEvent = {
 *   id: 'quest-completed-123',
 *   type: GameEventType.QUEST_COMPLETED,
 *   timestamp: new Date(),
 *   data: { questId: 'intro-quest', xpGained: 100 }
 * };
 * ```
 */
export interface GameEvent {
  /** Unique event identifier */
  id: string;
  /** Type of event that occurred */
  type: GameEventType;
  /** When the event occurred */
  timestamp: Date;
  /** Additional event-specific data */
  data: Record<string, any>;
}

/**
 * @enum {string} GameEventType
 * @description Types of events that can occur during gameplay
 * @example
 * ```typescript
 * const eventType = GameEventType.QUEST_COMPLETED;
 * ```
 */
export enum GameEventType {
  /** Player character moved to a new position */
  PLAYER_MOVED = 'player_moved',
  /** A dialogue conversation was initiated */
  DIALOGUE_STARTED = 'dialogue_started',
  /** A dialogue conversation ended */
  DIALOGUE_ENDED = 'dialogue_ended',
  /** A new quest was started */
  QUEST_STARTED = 'quest_started',
  /** A quest was completed successfully */
  QUEST_COMPLETED = 'quest_completed',
  /** An item was collected by the player */
  ITEM_COLLECTED = 'item_collected',
  /** Speech recognition succeeded for a challenge */
  SPEECH_RECOGNITION_SUCCESS = 'speech_recognition_success',
  /** Speech recognition failed for a challenge */
  SPEECH_RECOGNITION_FAILED = 'speech_recognition_failed',
  /** Player gained a level */
  LEVEL_UP = 'level_up',
  /** Player moved to a different location */
  LOCATION_CHANGED = 'location_changed',
}

/**
 * @interface LoadingState
 * @description State information for loading operations
 * @example
 * ```typescript
 * const loadingState: LoadingState = {
 *   isLoading: true,
 *   progress: 75,
 *   currentTask: 'Loading game assets...',
 *   error: null
 * };
 * ```
 */
export interface LoadingState {
  /** Whether a loading operation is in progress */
  isLoading: boolean;
  /** Loading progress percentage (0-100) */
  progress: number;
  /** Description of the current loading task */
  currentTask: string;
  /** Error message if loading failed, null if no error */
  error: string | null;
}

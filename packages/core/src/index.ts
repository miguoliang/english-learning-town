/**
 * Core game engine and systems for English Learning Town
 * Provides the foundational architecture for the game
 */

// Event system
export { EventBus, eventBus, CoreEvents, GameEvents } from './EventBus';
export type { EventHandler, CoreGameEvent, GameEventType } from './EventBus';

// Game system architecture
export {
  GameSystem,
  SystemManager,
  systemManager,
  SystemType,
} from './GameSystem';
export type { SystemConfig } from './GameSystem';

// Game engine
export { GameEngine, gameEngine, GameState } from './GameEngine';
export type { GameEngineConfig, GameEngineStats } from './GameEngine';

// Error recovery system
export {
  ErrorRecoveryManager,
  errorRecoveryManager,
  withErrorRecovery,
  withRecovery,
  ErrorSeverity,
} from './ErrorRecovery';
export type { ErrorContext, RecoveryStrategy } from './ErrorRecovery';

// Re-export logger utilities for convenience
export {
  LoggerFactory,
  LogLevel,
  LoggerUtils,
} from '@english-learning-town/logger';
export type {
  Logger,
  LogEntry,
  LoggerConfig,
} from '@english-learning-town/logger';

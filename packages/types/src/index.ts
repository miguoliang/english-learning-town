/**
 * @fileoverview Shared domain types for English Learning Town game
 * @module @english-learning-town/types
 * @version 1.0.0
 *
 * @description
 * This package contains shared TypeScript type definitions that represent
 * the game's business logic and domain concepts. These types are used across
 * multiple packages (client, store, speech, etc.) without coupling them to
 * the core ECS framework implementation.
 *
 * @example
 * ```typescript
 * import { Player, Position, createPlayerId } from '@english-learning-town/types';
 *
 * const player: Player = {
 *   id: createPlayerId('player-1'),
 *   position: { x: 100, y: 200 },
 *   // ... other properties
 * };
 * ```
 *
 * @exports Domain Types - Player, Character, Quest, Dialogue, Item, Location
 * @exports Utility Types - Position, Size, API responses, Loading states
 * @exports Speech Types - Recognition, challenges, voice profiles
 * @exports Game State - Settings, preferences, save data
 *
 * @see {@link @english-learning-town/core/types} For ECS framework-specific types
 */

export type {
  // Geometric types
  Position,
  Size,
  Bounds,
  Vector2D,
  Rectangle,
  Circle,

  // Branded identifier types
  PlayerId,
  CharacterId,
  DialogueId,
  QuestId,
  ItemId,
  LocationId,
  SystemId,

  // Utility types
  Nullable,
  Optional,
  DeepPartial,
} from './foundation';

export {
  // Utility functions for creating branded types
  createPlayerId,
  createCharacterId,
  createDialogueId,
  createQuestId,
  createItemId,
  createLocationId,
  createSystemId,
} from './foundation';

export type {
  Player,
  PlayerStats,
  PlayerPreferences,
  Achievement,
} from './player';

export { AchievementCategory, QuestDifficulty, ItemRarity } from './player';

export type {
  // Character types
  Character,
  MovementPattern,
  VoiceProfile,
  CharacterPersonality,

  // Quest types
  Quest,
  QuestObjective,
  QuestReward,

  // Location types
  Location,
  LocationConnection,

  // Item types
  Item,
  ItemEffect,
} from './game-content';

export {
  // Character enums
  MovementType,

  // Quest enums
  QuestCategory,
  ObjectiveType,
  RewardType,

  // Item enums
  ItemType,
  EffectType,
} from './game-content';

export type {
  Dialogue,
  DialogueNode,
  DialogueOption,
  DialogueCondition,
  DialogueAction,
  DialogueMetadata,
} from './dialogue';

export { ConditionType, ComparisonOperator, ActionType } from './dialogue';

export type {
  SpeechChallenge,
  SpeechRecognitionResult,
  SpeechAlternative,
  SpeechRecognitionConfig,
} from './speech';

export { SpeechChallengeType } from './speech';

export type {
  GameState,
  GameTime,
  GameSettings,
  GraphicsSettings,
  AccessibilitySettings,
  DebugState,
  GameEvent,
  LoadingState,
} from './game-state';

export { GameEventType } from './game-state';

export type { ApiResponse, GameEngine, GameSystem } from './api';

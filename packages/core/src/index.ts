/**
 * Pure ECS (Entity-Component-System) engine for English Learning Town
 * Clean, modern architecture following strict ECS patterns
 * Optimized with advanced TypeScript features to reduce code size
 * No legacy support - entities are IDs, components are data, systems are logic
 */

// ECS Core Components
export { Entity, EntityManager, entityManager } from './Entity';
export type { EntityId } from './Entity';

export {
  BaseComponent,
  ComponentRegistry,
  ComponentStorage,
  componentRegistry,
  componentStorage,
} from './Component';
export type {
  Component,
  ComponentType,
  ComponentConstructor,
} from './Component';

// Advanced TypeScript Utilities for Code Size Reduction
export type {
  ComponentMap,
  ComponentTypeTuple,
  BaseSystemConfig,
  ResolvedSystemConfig,
  EntityQuery,
  SystemStateType,
  CachedQuery,
  QueryCache,
  ComponentPredicate,
  SystemBuilder,
  EventPayloadMap,
  TypedEventEmitter,
  SystemMetadata,
  ComponentMetadata,
} from './types/UtilityTypes';

// TypeScript Decorators for Boilerplate Reduction
export {
  System,
  RequiresComponents,
  OptionalComponents,
  SystemMethod,
  UpdateFrequency,
  CachedQuery as CachedQueryDecorator,
  Measure,
  ValidateComponentTypes,
  ECSSystem,
  CoreSystem,
  GameplaySystem,
  UISystem,
  AudioSystem,
  NetworkSystem,
  DebugSystem,
  getSystemConfig,
  getRequiredComponents,
  getOptionalComponents,
  getSystemMetadata,
} from './decorators/SystemDecorators';

// Type Guards for Runtime Type Safety Optimization
export {
  ComponentTypeGuards,
  EntityTypeGuards,
  SystemTypeGuards,
  isComponent,
  isValidEntityId,
  isValidComponentType,
  isDefined,
  isNotNull,
  isPresent,
  entityHasComponents,
} from './utils/TypeGuards';

// ECS World Management
export { World, world } from './World';

// ECS System architecture
export {
  GameSystem,
  SystemManager,
  systemManager,
  SystemType,
} from './GameSystem';
export type { SystemConfig } from './GameSystem';

// Game engine (simplified for lifecycle management)
export { GameEngine, gameEngine, GameState } from './GameEngine';
export type { GameEngineConfig, GameEngineStats } from './GameEngine';

// Event system (core events only)
export { EventBus, eventBus, CoreEvents } from './EventBus';
export type { EventHandler, CoreGameEvent } from './EventBus';

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

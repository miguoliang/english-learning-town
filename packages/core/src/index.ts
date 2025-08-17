/**
 * @elt/core - Entity Component System Core Engine
 * 
 * A pure, reusable ECS implementation for educational games and beyond.
 * Provides the fundamental building blocks for entity-component-system architecture.
 */

// Core ECS classes (from modular structure)
export {
  World,
  ComponentManager,
  type Entity,
  type EntityId,
  type Component,
  type System
} from './core';

// Event system
export {
  ecsEventBus,
  createECSEventBus,
  ECSEventTypes,
  type ECSEvents,
  type Emitter
} from './events';

// Component definitions (from modular structure)
export type {
  // Spatial components
  PositionComponent,
  SizeComponent,
  VelocityComponent,
  CollisionComponent,
  
  // Visual components
  RenderableComponent,
  AnimationComponent,
  MovementAnimationComponent,
  
  // Interactive components
  InteractiveComponent,
  InputComponent,
  
  // Game-specific components
  PlayerComponent,
  NPCComponent,
  BuildingComponent,
  FurnitureComponent,
  DecorationComponent,
  
  // Enhanced components
  HealthComponent,
  StatsComponent,
  InventoryComponent,
  AIComponent,
  StateComponent,
  AudioComponent,
  AudioListenerComponent,
  PhysicsComponent,
  ForceComponent,
  TimerComponent,
  TagComponent,
  QuestGiverComponent,
  QuestObjectiveComponent,
  LearningComponent,
  ProgressComponent
} from './components';

// Component factory functions (from modular structure)
export {
  // Spatial component factories
  createPositionComponent,
  createSizeComponent,
  createVelocityComponent,
  createCollisionComponent,
  
  // Visual component factories
  createRenderableComponent,
  createAnimationComponent,
  createMovementAnimationComponent,
  
  // Interactive component factories
  createInteractiveComponent,
  createInputComponent,
  
  // Game component factories
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent,
  createFurnitureComponent,
  createDecorationComponent,
  
  // Enhanced component factories
  createHealthComponent,
  createStatsComponent,
  createInventoryComponent,
  createAIComponent,
  createStateComponent,
  createAudioComponent,
  createAudioListenerComponent,
  createPhysicsComponent,
  createForceComponent,
  createTimerComponent,
  createTagComponent
} from './components';

// Advanced systems
export {
  AISystem,
  AudioSystem,
  PhysicsSystem,
  TimerSystem,
  HealthSystem,
  StateMachineSystem
} from './systems';

// Utilities and optimizations
export {
  EntityPool,
  ComponentCache,
  QueryManager,
  EntityArchetypes,
  SpatialIndex,
  MathUtils,
  ComponentUtils
} from './utils';

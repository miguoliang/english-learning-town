/**
 * ECS (Entity Component System) - Main exports
 *
 * This module provides a complete ECS architecture using bitECS for managing
 * game entities, components, and systems in a data-oriented way.
 */

// World management
export { createECSWorld, getECSWorld, resetECSWorld } from './World';

// Components
export { DepthComponent, DepthDefaults } from './components/DepthComponent';
export { BoundsComponent, BoundsDefaults } from './components/BoundsComponent';
export { PositionComponent, PositionDefaults } from './components/PositionComponent';
export { SpriteComponent, SpriteDefaults, SpriteType } from './components/SpriteComponent';
export {
  BuildingComponent,
  BuildingDefaults,
  BuildingType,
  BuildingNames,
  BuildingSceneKeys,
} from './components/BuildingComponent';
export {
  DoorComponent,
  DoorDefaults,
  DoorLayerRegistry,
  DoorCollisionRegistry,
} from './components/DoorComponent';
export {
  InteractableComponent,
  InteractableDefaults,
  InteractionType,
  InteractablePromptRegistry,
} from './components/InteractableComponent';

// Systems
export { depthSortingSystem } from './systems/DepthSortingSystem';
export { DoorInteractionSystem } from './systems/DoorInteractionSystem';
export { BuildingSystem } from './systems/BuildingSystem';

// Utilities
export { EntityFactory } from './EntityFactory';
export { SpriteRegistry } from './SpriteRegistry';


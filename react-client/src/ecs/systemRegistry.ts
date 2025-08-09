/**
 * System Registry - Centralized system management and configuration
 * Eliminates hardcoded system names and provides proper dependency injection
 */

import {
  CollisionSystem,
  MovementSystem,
  InputStateSystem,
  InteractionZoneSystem,
  GridMovementSystem,
  PlayerInteractionSystem,
  MouseInputSystem,
  InteractionSystem,
  RenderSystem,
  AnimationSystem,
  MovementAnimationSystem
} from './systems';

// System configuration constants
export const SYSTEM_NAMES = {
  COLLISION: 'CollisionSystem',
  MOVEMENT: 'MovementSystem',
  INPUT_STATE: 'InputStateSystem',
  INTERACTION_ZONE: 'InteractionZoneSystem',
  GRID_MOVEMENT: 'GridMovementSystem',
  PLAYER_INTERACTION: 'PlayerInteractionSystem',
  MOUSE_INPUT: 'MouseInputSystem',
  INTERACTION: 'InteractionSystem',
  RENDER: 'RenderSystem',
  ANIMATION: 'AnimationSystem',
  MOVEMENT_ANIMATION: 'MovementAnimationSystem'
} as const;

// Event-driven systems that don't need regular updates
export const EVENT_DRIVEN_SYSTEMS = [
  SYSTEM_NAMES.RENDER
] as const;

// System factory with proper dependency injection
export class SystemFactory {
  static createSystems() {
    // Create base systems first
    const collisionSystem = new CollisionSystem();
    const inputStateSystem = new InputStateSystem();
    const interactionZoneSystem = new InteractionZoneSystem();
    
    return {
      collision: collisionSystem,
      movement: new MovementSystem(collisionSystem), // Inject collision dependency
      inputState: inputStateSystem,
      interactionZone: interactionZoneSystem,
      gridMovement: new GridMovementSystem(collisionSystem, inputStateSystem), // Inject collision and input dependencies
      playerInteraction: new PlayerInteractionSystem(inputStateSystem, interactionZoneSystem), // Inject input and zone dependencies
      mouseInput: new MouseInputSystem(),
      interaction: new InteractionSystem(),
      render: new RenderSystem(),
      animation: new AnimationSystem(),
      movementAnimation: new MovementAnimationSystem()
    };
  }

  static isEventDrivenSystem(systemName: string): boolean {
    return EVENT_DRIVEN_SYSTEMS.includes(systemName as any);
  }
}

// Type for system registry
export type SystemRegistry = ReturnType<typeof SystemFactory.createSystems>;

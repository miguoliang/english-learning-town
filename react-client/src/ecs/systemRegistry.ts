/**
 * System Registry - Centralized system management and configuration
 * Eliminates hardcoded system names and provides proper dependency injection
 */

import {
  CollisionSystem,
  MovementSystem,
  KeyboardInputSystem,
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
  KEYBOARD_INPUT: 'KeyboardInputSystem',
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
    // Create systems with dependencies
    const collisionSystem = new CollisionSystem();
    
    return {
      collision: collisionSystem,
      movement: new MovementSystem(collisionSystem), // Inject collision dependency
      keyboardInput: new KeyboardInputSystem(),
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

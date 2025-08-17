/**
 * ECS Event System using mitt
 * Type-safe event definitions for the Entity Component System
 */

import mitt, { type Emitter } from 'mitt';

// Define all ECS event types for type safety
export type ECSEvents = {
  // Entity lifecycle events
  'entity:added': { entityId: string };
  'entity:removed': { entityId: string };
  'entity:moved': { 
    entityId: string; 
    oldPosition: { x: number; y: number }; 
    newPosition: { x: number; y: number } 
  };

  // Component lifecycle events
  'component:added': { entityId: string; componentType: string };
  'component:removed': { entityId: string; componentType: string };

  // Scene events
  'scene:loaded': { scenePath: string; entityCount: number };

  // Rendering events  
  'render:frame-ready': { 
    entities: Array<{
      id: string;
      position: { x: number; y: number; type: 'position' };
      size: { width: number; height: number; type: 'size' };
      renderable: { 
        type: 'renderable';
        renderType: 'emoji' | 'sprite' | 'shape' | 'custom';
        icon?: string;
        sprite?: string;
        backgroundColor?: string;
        zIndex?: number;
        visible?: boolean;
      };
    }>;
    reason: string;
  };

  // Input events
  'input:canvas-click': { x: number; y: number };
  'input:entity-click': { entityId: string };
  'input:key-pressed': { key: string };
  'input:key-released': { key: string };
  'input:key-down': { key: string };
  'input:key-up': { key: string };

  // Player events
  'player:move-to': { targetX: number; targetY: number };
  'player:interaction': { initiatorId: string; targetEntityId: string };

  // Collision events
  'entity:collision': { entityId: string; blockedPosition: { x: number; y: number } };

  // Animation events
  'animation:started': { entityId: string; animationType: string };
  'animation:completed': { entityId: string; animationName: string };
  'movement-animation:started': { entityId: string; direction: string };
  'movement-animation:stopped': { entityId: string };

  // Interaction events
  'interaction:out-of-range': { initiatorId: string; targetId: string; distance: number; maxRange: number };
  'interaction:completed': { initiatorId: string; targetId: string; type: string };

  // Dialogue events
  'dialogue:start': { 
    initiatorId: string; 
    targetId: string; 
    dialogueId: string; 
  };

  // Scene transition events
  'scene:transition': { 
    from: string;
    to: string;
    entrance?: {
      id: string;
      position: { x: number; y: number };
      direction: 'north' | 'south' | 'east' | 'west';
      targetScene: string;
    };
    targetPosition?: { x: number; y: number } 
  };

  // Learning events
  'learning:start': { 
    initiatorId: string; 
    targetId: string; 
    activityId: string; 
  };

  // Quest events
  'quest:interact': { 
    initiatorId: string; 
    targetId: string; 
    questId: string; 
  };

  // Health and combat events
  'entity:death': { entityId: string };
  'entity:damage': { entityId: string; amount: number; newHealth: number };
  'entity:heal': { entityId: string; amount: number; newHealth: number };

  // State machine events
  'state:changed': { entityId: string; oldState: string; newState: string };

  // Audio events
  'audio:started': { entityId: string; soundId: string };
  'audio:stopped': { entityId: string; soundId: string };
  'audio:completed': { entityId: string; soundId: string };

  // Physics events
  'physics:collision': { entity1: string; entity2: string; force: number };
  'physics:force-applied': { entityId: string; forceX: number; forceY: number };

  // AI events
  'ai:target-acquired': { entityId: string; targetId: string };
  'ai:target-lost': { entityId: string; targetId: string };
  'ai:state-changed': { entityId: string; oldState: string; newState: string };

  // Timer events
  'timer:completed': { entityId: string };
  'timer:started': { entityId: string };
  'timer:stopped': { entityId: string };
};

// Create and export the event bus instance
export const ecsEventBus: Emitter<ECSEvents> = mitt<ECSEvents>();

// Export mitt types for compatibility
export type { Emitter } from 'mitt';

/**
 * Utility function to create a scoped event bus for testing
 */
export function createECSEventBus(): Emitter<ECSEvents> {
  return mitt<ECSEvents>();
}

/**
 * Helper to get strongly typed event names
 */
export const ECSEventTypes = {
  ENTITY_ADDED: 'entity:added' as const,
  ENTITY_REMOVED: 'entity:removed' as const,
  ENTITY_MOVED: 'entity:moved' as const,
  COMPONENT_ADDED: 'component:added' as const,
  COMPONENT_REMOVED: 'component:removed' as const,
  SCENE_LOADED: 'scene:loaded' as const,
  RENDER_FRAME_READY: 'render:frame-ready' as const,
  INPUT_CANVAS_CLICK: 'input:canvas-click' as const,
  INPUT_ENTITY_CLICK: 'input:entity-click' as const,
  INPUT_KEY_PRESSED: 'input:key-pressed' as const,
  INPUT_KEY_RELEASED: 'input:key-released' as const,
  INPUT_KEY_DOWN: 'input:key-down' as const,
  INPUT_KEY_UP: 'input:key-up' as const,
  PLAYER_MOVE_TO: 'player:move-to' as const,
  PLAYER_INTERACTION: 'player:interaction' as const,
  ENTITY_COLLISION: 'entity:collision' as const,
  ANIMATION_STARTED: 'animation:started' as const,
  ANIMATION_COMPLETED: 'animation:completed' as const,
} as const;

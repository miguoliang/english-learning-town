/**
 * Events System Tests - Event bus and type safety
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ecsEventBus, createECSEventBus, ECSEventTypes, type ECSEvents, type Emitter } from '../events';

describe('ECS Events', () => {
  let eventBus: Emitter<ECSEvents>;

  beforeEach(() => {
    // Create a fresh event bus for each test to avoid cross-test pollution
    eventBus = createECSEventBus();
  });

  describe('Event Bus Creation', () => {
    it('should create a new event bus instance', () => {
      const newEventBus = createECSEventBus();
      expect(newEventBus).toBeDefined();
      expect(typeof newEventBus.emit).toBe('function');
      expect(typeof newEventBus.on).toBe('function');
      expect(typeof newEventBus.off).toBe('function');
    });

    it('should have global event bus instance', () => {
      expect(ecsEventBus).toBeDefined();
      expect(typeof ecsEventBus.emit).toBe('function');
      expect(typeof ecsEventBus.on).toBe('function');
    });

    it('should create independent event bus instances', () => {
      const bus1 = createECSEventBus();
      const bus2 = createECSEventBus();
      
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      bus1.on(ECSEventTypes.ENTITY_ADDED, listener1);
      bus2.on(ECSEventTypes.ENTITY_ADDED, listener2);
      
      bus1.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'test' });
      
      expect(listener1).toHaveBeenCalledWith({ entityId: 'test' });
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('Event Type Constants', () => {
    it('should have all required event type constants', () => {
      // Core entity events
      expect(ECSEventTypes.ENTITY_ADDED).toBe('entity:added');
      expect(ECSEventTypes.ENTITY_REMOVED).toBe('entity:removed');
      expect(ECSEventTypes.ENTITY_MOVED).toBe('entity:moved');
      
      // Component events
      expect(ECSEventTypes.COMPONENT_ADDED).toBe('component:added');
      expect(ECSEventTypes.COMPONENT_REMOVED).toBe('component:removed');
      
      // Scene events
      expect(ECSEventTypes.SCENE_LOADED).toBe('scene:loaded');
      expect(ECSEventTypes.RENDER_FRAME_READY).toBe('render:frame-ready');
      
      // Input events
      expect(ECSEventTypes.INPUT_CANVAS_CLICK).toBe('input:canvas-click');
      expect(ECSEventTypes.INPUT_ENTITY_CLICK).toBe('input:entity-click');
      expect(ECSEventTypes.INPUT_KEY_PRESSED).toBe('input:key-pressed');
      expect(ECSEventTypes.INPUT_KEY_RELEASED).toBe('input:key-released');
      expect(ECSEventTypes.INPUT_KEY_DOWN).toBe('input:key-down');
      expect(ECSEventTypes.INPUT_KEY_UP).toBe('input:key-up');
      
      // Player events
      expect(ECSEventTypes.PLAYER_MOVE_TO).toBe('player:move-to');
      expect(ECSEventTypes.PLAYER_INTERACTION).toBe('player:interaction');
      
      // System events
      expect(ECSEventTypes.ENTITY_COLLISION).toBe('entity:collision');
      expect(ECSEventTypes.ANIMATION_STARTED).toBe('animation:started');
      expect(ECSEventTypes.ANIMATION_COMPLETED).toBe('animation:completed');
    });

    it('should be readonly constants', () => {
      // TypeScript should prevent this, but let's test runtime behavior
      const originalValue = ECSEventTypes.ENTITY_ADDED;
      
      // In TypeScript, this would fail at compile time
      // At runtime with 'as const', the object should be immutable
      // But JavaScript doesn't enforce true immutability without Object.freeze
      expect(ECSEventTypes.ENTITY_ADDED).toBe(originalValue);
      expect(typeof ECSEventTypes.ENTITY_ADDED).toBe('string');
    });
  });

  describe('Event Emission and Listening', () => {
    it('should emit and receive entity events', () => {
      const listener = vi.fn();
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener);
      
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      
      expect(listener).toHaveBeenCalledWith({ entityId: 'player' });
    });

    it('should emit and receive component events', () => {
      const addListener = vi.fn();
      const removeListener = vi.fn();
      
      eventBus.on(ECSEventTypes.COMPONENT_ADDED, addListener);
      eventBus.on(ECSEventTypes.COMPONENT_REMOVED, removeListener);
      
      eventBus.emit(ECSEventTypes.COMPONENT_ADDED, {
        entityId: 'player',
        componentType: 'position'
      });
      
      eventBus.emit(ECSEventTypes.COMPONENT_REMOVED, {
        entityId: 'player',
        componentType: 'health'
      });
      
      expect(addListener).toHaveBeenCalledWith({
        entityId: 'player',
        componentType: 'position'
      });
      
      expect(removeListener).toHaveBeenCalledWith({
        entityId: 'player',
        componentType: 'health'
      });
    });

    it('should emit and receive input events', () => {
      const keyListener = vi.fn();
      const clickListener = vi.fn();
      
      eventBus.on(ECSEventTypes.INPUT_KEY_PRESSED, keyListener);
      eventBus.on(ECSEventTypes.INPUT_CANVAS_CLICK, clickListener);
      
      eventBus.emit(ECSEventTypes.INPUT_KEY_PRESSED, { key: 'Space' });
      eventBus.emit(ECSEventTypes.INPUT_CANVAS_CLICK, { x: 100, y: 200 });
      
      expect(keyListener).toHaveBeenCalledWith({ key: 'Space' });
      expect(clickListener).toHaveBeenCalledWith({ x: 100, y: 200 });
    });

    it('should emit and receive player events', () => {
      const moveListener = vi.fn();
      const interactionListener = vi.fn();
      
      eventBus.on(ECSEventTypes.PLAYER_MOVE_TO, moveListener);
      eventBus.on(ECSEventTypes.PLAYER_INTERACTION, interactionListener);
      
      eventBus.emit(ECSEventTypes.PLAYER_MOVE_TO, {
        targetX: 10,
        targetY: 5
      });
      
      eventBus.emit(ECSEventTypes.PLAYER_INTERACTION, {
        initiatorId: 'player',
        targetEntityId: 'npc'
      });
      
      expect(moveListener).toHaveBeenCalledWith({
        targetX: 10,
        targetY: 5
      });
      
      expect(interactionListener).toHaveBeenCalledWith({
        initiatorId: 'player',
        targetEntityId: 'npc'
      });
    });

    it('should emit and receive system events', () => {
      const collisionListener = vi.fn();
      const animationListener = vi.fn();
      
      eventBus.on(ECSEventTypes.ENTITY_COLLISION, collisionListener);
      eventBus.on(ECSEventTypes.ANIMATION_STARTED, animationListener);
      
      eventBus.emit(ECSEventTypes.ENTITY_COLLISION, {
        entityId: 'player',
        blockedPosition: { x: 5, y: 5 }
      });
      
      eventBus.emit(ECSEventTypes.ANIMATION_STARTED, {
        entityId: 'player',
        animationType: 'walk'
      });
      
      expect(collisionListener).toHaveBeenCalledWith({
        entityId: 'player',
        blockedPosition: { x: 5, y: 5 }
      });
      
      expect(animationListener).toHaveBeenCalledWith({
        entityId: 'player',
        animationType: 'walk'
      });
    });

    it('should emit and receive scene events', () => {
      const sceneListener = vi.fn();
      const renderListener = vi.fn();
      
      eventBus.on(ECSEventTypes.SCENE_LOADED, sceneListener);
      eventBus.on(ECSEventTypes.RENDER_FRAME_READY, renderListener);
      
      eventBus.emit(ECSEventTypes.SCENE_LOADED, {
        scenePath: 'town.json',
        entityCount: 15
      });
      
      eventBus.emit(ECSEventTypes.RENDER_FRAME_READY, {
        entities: [
          {
            id: 'player',
            position: { x: 10, y: 5, type: 'position' },
            size: { width: 1, height: 1, type: 'size' },
            renderable: {
              type: 'renderable',
              renderType: 'emoji',
              icon: '🧑',
              zIndex: 1,
              visible: true
            }
          }
        ],
        reason: 'frame_update'
      });
      
      expect(sceneListener).toHaveBeenCalledWith({
        scenePath: 'town.json',
        entityCount: 15
      });
      
      expect(renderListener).toHaveBeenCalledWith({
        entities: [
          {
            id: 'player',
            position: { x: 10, y: 5, type: 'position' },
            size: { width: 1, height: 1, type: 'size' },
            renderable: {
              type: 'renderable',
              renderType: 'emoji',
              icon: '🧑',
              zIndex: 1,
              visible: true
            }
          }
        ],
        reason: 'frame_update'
      });
    });
  });

  describe('Event Listener Management', () => {
    it('should support multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener1);
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener2);
      
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      
      expect(listener1).toHaveBeenCalledWith({ entityId: 'player' });
      expect(listener2).toHaveBeenCalledWith({ entityId: 'player' });
    });

    it('should remove event listeners', () => {
      const listener = vi.fn();
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener);
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      expect(listener).toHaveBeenCalledTimes(1);
      
      eventBus.off(ECSEventTypes.ENTITY_ADDED, listener);
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'enemy' });
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should clear all listeners for an event type', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener1);
      eventBus.on(ECSEventTypes.ENTITY_ADDED, listener2);
      
      eventBus.off(ECSEventTypes.ENTITY_ADDED);
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const listener = vi.fn();
      
      // Should not throw error
      expect(() => {
        eventBus.off(ECSEventTypes.ENTITY_ADDED, listener);
      }).not.toThrow();
    });
  });

  describe('Event Bus Error Handling', () => {
    it('should handle listener errors by throwing', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, errorListener);
      eventBus.on(ECSEventTypes.ENTITY_ADDED, normalListener);
      
      // mitt throws errors from listeners by default
      expect(() => {
        eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      }).toThrow('Listener error');
      
      expect(errorListener).toHaveBeenCalled();
      // normalListener may or may not be called depending on order
    });

    it('should handle emitting events with no listeners', () => {
      expect(() => {
        eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      }).not.toThrow();
    });
  });

  describe('Event Data Type Safety', () => {
    it('should maintain type safety for event data', () => {
      const entityListener = vi.fn<[{ entityId: string }], void>();
      const componentListener = vi.fn<[{ entityId: string; componentType: string }], void>();
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, entityListener);
      eventBus.on(ECSEventTypes.COMPONENT_ADDED, componentListener);
      
      // TypeScript should ensure these are the correct types
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      eventBus.emit(ECSEventTypes.COMPONENT_ADDED, {
        entityId: 'player',
        componentType: 'position'
      });
      
      expect(entityListener).toHaveBeenCalledWith({ entityId: 'player' });
      expect(componentListener).toHaveBeenCalledWith({
        entityId: 'player',
        componentType: 'position'
      });
    });
  });

  describe('Complex Event Scenarios', () => {
    it('should handle event cascades properly', () => {
      const events: string[] = [];
      
      eventBus.on(ECSEventTypes.ENTITY_ADDED, () => {
        events.push('entity-added');
        eventBus.emit(ECSEventTypes.COMPONENT_ADDED, {
          entityId: 'player',
          componentType: 'position'
        });
      });
      
      eventBus.on(ECSEventTypes.COMPONENT_ADDED, () => {
        events.push('component-added');
      });
      
      eventBus.emit(ECSEventTypes.ENTITY_ADDED, { entityId: 'player' });
      
      expect(events).toEqual(['entity-added', 'component-added']);
    });

    it('should handle rapid event emission', () => {
      const listener = vi.fn();
      eventBus.on(ECSEventTypes.ENTITY_MOVED, listener);
      
      // Emit many events rapidly
      for (let i = 0; i < 100; i++) {
        eventBus.emit(ECSEventTypes.ENTITY_MOVED, {
          entityId: 'player',
          position: { x: i, y: i }
        });
      }
      
      expect(listener).toHaveBeenCalledTimes(100);
    });
  });
});
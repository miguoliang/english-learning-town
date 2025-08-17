/**
 * ECS Core Types - Entity, Component, and System interfaces
 * 
 * Fundamental type definitions for the Entity Component System architecture.
 */

import type { Emitter, ECSEvents } from '../events';

export type EntityId = string;

/**
 * Entity - Just an ID
 * Entities are lightweight identifiers that tie components together
 */
export interface Entity {
  readonly id: EntityId;
}

/**
 * Component base interface
 * Components are pure data containers with no logic
 */
export interface Component {
  readonly type: string;
}

/**
 * System interface
 * Systems contain all the logic and operate on entities with specific components
 */
export interface System {
  readonly name: string;
  readonly requiredComponents: readonly string[];
  
  /**
   * Update system logic
   * @param entities - All entities in the world
   * @param components - Component manager for accessing component data
   * @param deltaTime - Time since last update
   * @param events - Event emitter for system communication
   */
  update(entities: Entity[], components: ComponentManager, deltaTime: number, events: Emitter<ECSEvents>): void;
  
  /**
   * Check if this system should process the given entity
   */
  canProcess(entity: Entity, components: ComponentManager): boolean;
}

// Forward declaration for System interface
export interface ComponentManager {
  hasComponent(entityId: EntityId, componentType: string): boolean;
  hasAllComponents(entityId: EntityId, componentTypes: readonly string[]): boolean;
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined;
  getEntitiesWithComponents(componentTypes: readonly string[]): EntityId[];
}
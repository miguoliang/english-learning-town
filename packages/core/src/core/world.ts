/**
 * ECS World - Main ECS coordinator
 * 
 * Main coordinator of entities, components, and systems.
 * Handles entity lifecycle, system management, and world updates.
 */

import { ecsEventBus, ECSEventTypes, type Emitter, type ECSEvents } from '../events';
import { ComponentManager } from './componentManager';
import type { EntityId, Entity, Component, System } from './types';

/**
 * ECS World - Main coordinator of entities, components, and systems
 */
export class World {
  private entities = new Map<EntityId, Entity>();
  private components = new ComponentManager();
  private systems: System[] = [];
  private events = ecsEventBus;
  private lastUpdateTime = 0;

  /**
   * Create a new entity
   */
  createEntity(id: EntityId): Entity {
    if (this.entities.has(id)) {
      throw new Error(`Entity with id "${id}" already exists`);
    }
    const entity: Entity = { id };
    this.entities.set(id, entity);
    this.events.emit(ECSEventTypes.ENTITY_ADDED, { entityId: id });
    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: EntityId): void {
    this.entities.delete(entityId);
    this.components.removeEntity(entityId);
    this.events.emit(ECSEventTypes.ENTITY_REMOVED, { entityId });
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    this.components.addComponent(entityId, component);
    this.events.emit(ECSEventTypes.COMPONENT_ADDED, { entityId, componentType: component.type });
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: string): void {
    this.components.removeComponent(entityId, componentType);
    this.events.emit(ECSEventTypes.COMPONENT_REMOVED, { entityId, componentType });
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined {
    return this.components.getComponent<T>(entityId, componentType);
  }

  /**
   * Add a system to the world
   */
  addSystem(system: System): void {
    this.systems.push(system);
  }

  /**
   * Remove a system from the world
   */
  removeSystem(systemName: string): void {
    this.systems = this.systems.filter(system => system.name !== systemName);
  }

  /**
   * Get event emitter for external subscriptions
   */
  getEventBus(): Emitter<ECSEvents> {
    return this.events;
  }

  /**
   * Get all systems (for testing)
   */
  getSystems(): System[] {
    return this.systems;
  }

  /**
   * Get component manager for external access
   */
  getComponentManager(): ComponentManager {
    return this.components;
  }

  /**
   * Update all systems
   */
  update(): void {
    const currentTime = Date.now();
    const deltaTime = this.lastUpdateTime ? currentTime - this.lastUpdateTime : 0;
    this.lastUpdateTime = currentTime;

    const entities = this.getAllEntities();
    
    for (const system of this.systems) {
      system.update(entities, this.components, deltaTime, this.events);
    }
  }

  /**
   * Clean up world resources
   */
  destroy(): void {
    this.entities.clear();
    this.components = new ComponentManager();
    this.systems = [];
    this.events.all.clear();
  }
}
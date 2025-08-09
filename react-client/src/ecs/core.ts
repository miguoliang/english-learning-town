/**
 * Entity Component System (ECS) Core Architecture
 * 
 * ECS Pattern:
 * - Entity: Unique identifier (ID)
 * - Component: Pure data containers
 * - System: Logic that operates on entities with specific components
 */

import { gameConfig } from '../config/gameConfig';
import { ecsEventBus, ECSEventTypes, type Emitter, type ECSEvents } from './events';
import { SystemFactory } from './systemRegistry';

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

/**
 * ComponentManager - Manages all component data
 * Provides efficient access to components by type and entity
 */
export class ComponentManager {
  private components = new Map<string, Map<EntityId, Component>>();

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    if (!this.components.has(component.type)) {
      this.components.set(component.type, new Map());
    }
    
    this.components.get(component.type)!.set(entityId, component);
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: string): void {
    const componentMap = this.components.get(componentType);
    if (componentMap) {
      componentMap.delete(entityId);
    }
  }

  /**
   * Get a specific component from an entity
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined {
    const componentMap = this.components.get(componentType);
    return componentMap?.get(entityId) as T | undefined;
  }

  /**
   * Check if entity has a specific component
   */
  hasComponent(entityId: EntityId, componentType: string): boolean {
    const componentMap = this.components.get(componentType);
    return componentMap?.has(entityId) ?? false;
  }

  /**
   * Check if entity has all required components
   */
  hasAllComponents(entityId: EntityId, componentTypes: readonly string[]): boolean {
    return componentTypes.every(type => this.hasComponent(entityId, type));
  }

  /**
   * Get all entities with a specific component type
   */
  getEntitiesWithComponent(componentType: string): EntityId[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.keys()) : [];
  }

  /**
   * Get all entities with all specified component types
   */
  getEntitiesWithComponents(componentTypes: readonly string[]): EntityId[] {
    if (componentTypes.length === 0) return [];
    
    // Start with entities that have the first component type
    let entities = this.getEntitiesWithComponent(componentTypes[0]);
    
    // Filter to only entities that have all required components
    for (let i = 1; i < componentTypes.length; i++) {
      const componentType = componentTypes[i];
      entities = entities.filter(entityId => this.hasComponent(entityId, componentType));
    }
    
    return entities;
  }

  /**
   * Remove all components for an entity (entity cleanup)
   */
  removeEntity(entityId: EntityId): void {
    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
  }
}

// Legacy EventBus removed - use ecsEventBus directly for type safety

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
    console.log(`🔧 World.addComponent: Adding ${component.type} component to entity ${entityId}`, component);
    this.components.addComponent(entityId, component);
    
    // Verify the component was added
    const hasComponent = this.components.hasComponent(entityId, component.type);
    console.log(`✅ Component ${component.type} added to ${entityId}: ${hasComponent}`);
    
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
    console.log(`🔧 World.addSystem: Adding system "${system.name}" to world. Total systems: ${this.systems.length} -> ${this.systems.length + 1}`);
    this.systems.push(system);
    
    // Initialize event-driven systems immediately
    if (SystemFactory.isEventDrivenSystem(system.name)) {
      console.log(`🔧 World.addSystem: Initializing event-driven system "${system.name}"...`);
      system.update(this.getAllEntities(), this.components, 0, this.events);
    }
    
    console.log(`✅ World.addSystem: System "${system.name}" added. Total systems now: ${this.systems.length}`);
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
   * Get component manager for external access
   */
  getComponentManager(): ComponentManager {
    return this.components;
  }

  /**
   * Update all systems (excluding event-driven systems)
   */
  update(): void {
    const currentTime = Date.now();
    const deltaTime = this.lastUpdateTime ? currentTime - this.lastUpdateTime : 0;
    this.lastUpdateTime = currentTime;

    const entities = this.getAllEntities();
    
    // Only log based on config frequency
    if (!this.frameCounter) this.frameCounter = 0;
    this.frameCounter++;
    
    // Filter out event-driven systems that don't need regular updates
    const gameLoopSystems = this.systems.filter(system => 
      !SystemFactory.isEventDrivenSystem(system.name)
    );
    
    if (gameConfig.debug.showSystemLogs && this.frameCounter % gameConfig.performance.logFrequency === 0) {
      console.log('🌍 World.update: Running', gameLoopSystems.length, 'game loop systems for', entities.length, 'entities');
    }
    
    for (const system of gameLoopSystems) {
      system.update(entities, this.components, deltaTime, this.events);
    }
  }

  private frameCounter = 0;

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
/**
 * Entity Component System (ECS) Core Architecture
 * 
 * ECS Pattern:
 * - Entity: Unique identifier (ID)
 * - Component: Pure data containers
 * - System: Logic that operates on entities with specific components
 */

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
   * @param events - Event bus for system communication
   */
  update(entities: Entity[], components: ComponentManager, deltaTime: number, events: EventBus): void;
  
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

/**
 * Event system for loosely coupled system communication
 */
export interface GameEvent {
  readonly type: string;
  readonly data?: any;
  readonly timestamp: number;
}

export class EventBus {
  private listeners = new Map<string, Array<(event: GameEvent) => void>>();

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, callback: (event: GameEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit an event
   */
  emit(eventType: string, data?: any): void {
    const event: GameEvent = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * Clear all listeners (cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }
}

/**
 * ECS World - Main coordinator of entities, components, and systems
 */
export class World {
  private entities = new Map<EntityId, Entity>();
  private components = new ComponentManager();
  private systems: System[] = [];
  private events = new EventBus();
  private lastUpdateTime = 0;

  /**
   * Create a new entity
   */
  createEntity(id: EntityId): Entity {
    const entity: Entity = { id };
    this.entities.set(id, entity);
    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: EntityId): void {
    this.entities.delete(entityId);
    this.components.removeEntity(entityId);
    this.events.emit('entity:removed', { entityId });
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
    this.events.emit('component:added', { entityId, componentType: component.type });
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: string): void {
    this.components.removeComponent(entityId, componentType);
    this.events.emit('component:removed', { entityId, componentType });
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
   * Get event bus for external subscriptions
   */
  getEventBus(): EventBus {
    return this.events;
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
    this.events.clear();
  }
}
/**
 * Pure ECS Component system for English Learning Town
 * Components are pure data containers with no logic
 * Provides type-safe component management, registration, and efficient storage
 *
 * @fileoverview Component management system for ECS architecture
 * @author English Learning Town Team
 * @version 1.0.0
 */

import { EntityId } from './Entity';
import { eventBus, CoreEvents } from './EventBus';
import { LoggerFactory } from '@english-learning-town/logger';

/**
 * String identifier for component types
 * @typedef {string} ComponentType
 */
export type ComponentType = string;

/**
 * Constructor function for creating component instances
 * @template T - The component type
 * @typedef {function} ComponentConstructor
 */
export type ComponentConstructor<T = any> = new (...args: any[]) => T;

/**
 * Base interface that all components must implement
 * Components are pure data containers in the ECS architecture
 * @interface Component
 */
export interface Component {
  /**
   * Unique identifier for the component type
   * @readonly
   * @type {ComponentType}
   */
  readonly componentType: ComponentType;
}

/**
 * Base abstract class for pure ECS components.
 * Components are pure data containers with no logic - only data and serialization.
 *
 * @abstract
 * @class BaseComponent
 * @implements {Component}
 * @example
 * ```typescript
 * class PositionComponent extends BaseComponent {
 *   readonly componentType = 'position';
 *
 *   constructor(public x: number = 0, public y: number = 0) {
 *     super();
 *   }
 *
 *   serialize() {
 *     return { componentType: this.componentType, x: this.x, y: this.y };
 *   }
 *
 *   static deserialize(data: any): PositionComponent {
 *     return new PositionComponent(data.x, data.y);
 *   }
 * }
 * ```
 */
export abstract class BaseComponent implements Component {
  /**
   * Unique identifier for the component type
   * Must be implemented by concrete components
   * @abstract
   * @readonly
   * @type {ComponentType}
   */
  abstract readonly componentType: ComponentType;

  /**
   * Serialize component data for storage/networking
   * Override in concrete components to include component-specific data
   * @returns {Record<string, any>} Serialized component data
   * @example
   * ```typescript
   * serialize() {
   *   return {
   *     componentType: this.componentType,
   *     x: this.x,
   *     y: this.y
   *   };
   * }
   * ```
   */
  serialize(): Record<string, any> {
    return { componentType: this.componentType };
  }

  /**
   * Deserialize component data from storage/networking
   * MUST be implemented by concrete components as a static method
   * @static
   * @param {Record<string, any>} data - Serialized component data
   * @returns {Component} Deserialized component instance
   * @throws {Error} If not implemented by concrete component
   * @example
   * ```typescript
   * static deserialize(data: any): PositionComponent {
   *   return new PositionComponent(data.x, data.y);
   * }
   * ```
   */
  static deserialize(_data: Record<string, any>): Component {
    throw new Error(
      'deserialize method must be implemented by concrete components'
    );
  }

  /**
   * Clone the component for duplication
   * Uses serialization by default - override for performance optimization if needed
   * @returns {Component} Cloned component instance
   * @example
   * ```typescript
   * const original = new PositionComponent(10, 20);
   * const cloned = original.clone();
   * console.log(cloned.x); // 10
   * console.log(cloned.y); // 20
   * ```
   */
  clone(): Component {
    const serialized = this.serialize();
    return (this.constructor as any).deserialize(serialized);
  }
}

/**
 * Component registry to manage component types and their constructors.
 * Provides registration, creation, and tracking of component types.
 *
 * @class ComponentRegistry
 * @example
 * ```typescript
 * const registry = new ComponentRegistry();
 *
 * // Register a component type
 * registry.registerComponentType('position', PositionComponent);
 *
 * // Create component instances
 * const position = registry.createComponent('position', 10, 20);
 *
 * // Track component usage
 * registry.trackComponentInstance('position', entityId);
 * ```
 */
export class ComponentRegistry {
  /**
   * Logger instance for debugging and monitoring
   * @private
   * @type {Logger}
   */
  private logger = LoggerFactory.getLogger('ComponentRegistry');

  /**
   * Map of component types to their constructors
   * @private
   * @type {Map<ComponentType, ComponentConstructor>}
   */
  private componentTypes: Map<ComponentType, ComponentConstructor> = new Map();

  /**
   * Map of component types to sets of entity IDs that have those components
   * @private
   * @type {Map<ComponentType, Set<EntityId>>}
   */
  private componentInstances: Map<ComponentType, Set<EntityId>> = new Map();

  /**
   * Register a component type with its constructor
   * @template T - The component type extending Component
   * @param {ComponentType} componentType - String identifier for the component type
   * @param {ComponentConstructor<T>} constructor - Constructor function for the component
   * @returns {void}
   * @throws {Error} If component type is already registered
   * @example
   * ```typescript
   * class HealthComponent extends BaseComponent {
   *   readonly componentType = 'health';
   *   constructor(public current: number, public max: number) { super(); }
   * }
   *
   * registry.registerComponentType('health', HealthComponent);
   * ```
   */
  registerComponentType<T extends Component>(
    componentType: ComponentType,
    constructor: ComponentConstructor<T>
  ): void {
    if (this.componentTypes.has(componentType)) {
      throw new Error(`Component type already registered: ${componentType}`);
    }

    this.componentTypes.set(componentType, constructor);
    this.componentInstances.set(componentType, new Set());

    this.logger.debug(
      `Registered component type: ${componentType}`,
      'ComponentRegistry'
    );

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Component type registered: ${componentType}`,
      system: 'ComponentRegistry',
      data: { componentType, totalTypes: this.componentTypes.size },
    });
  }

  /**
   * Unregister a component type and clean up its instances
   * @param {ComponentType} componentType - Component type to unregister
   * @returns {boolean} True if component was unregistered, false if it wasn't registered
   * @example
   * ```typescript
   * const success = registry.unregisterComponentType('position');
   * console.log(success); // true if 'position' was registered
   * ```
   */
  unregisterComponentType(componentType: ComponentType): boolean {
    if (!this.componentTypes.has(componentType)) {
      this.logger.warn(
        `Attempted to unregister unknown component type: ${componentType}`,
        'ComponentRegistry'
      );
      return false;
    }

    // Clean up any existing instances
    const instances = this.componentInstances.get(componentType);
    if (instances && instances.size > 0) {
      this.logger.warn(
        `Unregistering component type ${componentType} with ${instances.size} active instances`,
        'ComponentRegistry'
      );
    }

    this.componentTypes.delete(componentType);
    this.componentInstances.delete(componentType);

    this.logger.debug(
      `Unregistered component type: ${componentType}`,
      'ComponentRegistry'
    );
    return true;
  }

  /**
   * Check if a component type is registered
   * @param {ComponentType} componentType - Component type to check
   * @returns {boolean} True if component type is registered, false otherwise
   * @example
   * ```typescript
   * console.log(registry.hasComponentType('position')); // true/false
   * ```
   */
  hasComponentType(componentType: ComponentType): boolean {
    return this.componentTypes.has(componentType);
  }

  /**
   * Get all registered component types
   * @returns {ComponentType[]} Array of all registered component type names
   * @example
   * ```typescript
   * const types = registry.getComponentTypes();
   * console.log(types); // ['position', 'velocity', 'health']
   * ```
   */
  getComponentTypes(): ComponentType[] {
    return Array.from(this.componentTypes.keys());
  }

  /**
   * Get constructor function for a component type
   * @template T - The component type extending Component
   * @param {ComponentType} componentType - Component type to get constructor for
   * @returns {ComponentConstructor<T> | undefined} Constructor function or undefined if not found
   * @example
   * ```typescript
   * const PositionConstructor = registry.getComponentConstructor<PositionComponent>('position');
   * if (PositionConstructor) {
   *   const position = new PositionConstructor(10, 20);
   * }
   * ```
   */
  getComponentConstructor<T extends Component>(
    componentType: ComponentType
  ): ComponentConstructor<T> | undefined {
    return this.componentTypes.get(componentType) as
      | ComponentConstructor<T>
      | undefined;
  }

  /**
   * Create a component instance using its registered constructor
   * @template T - The component type extending Component
   * @param {ComponentType} componentType - Type of component to create
   * @param {...any[]} args - Arguments to pass to the component constructor
   * @returns {T} Created component instance
   * @throws {Error} If component type is not registered
   * @example
   * ```typescript
   * const health = registry.createComponent<HealthComponent>('health', 100, 100);
   * console.log(health.current); // 100
   * ```
   */
  createComponent<T extends Component>(
    componentType: ComponentType,
    ...args: any[]
  ): T {
    const constructor = this.componentTypes.get(componentType);
    if (!constructor) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return new constructor(...args) as T;
  }

  /**
   * Track that an entity has a component of this type
   * Used for efficient entity queries and component tracking
   * @param {ComponentType} componentType - Type of component to track
   * @param {EntityId} entityId - ID of entity that has this component
   * @returns {void}
   * @example
   * ```typescript
   * registry.trackComponentInstance('position', entity.id);
   * ```
   */
  trackComponentInstance(
    componentType: ComponentType,
    entityId: EntityId
  ): void {
    const instances = this.componentInstances.get(componentType);
    if (instances) {
      instances.add(entityId);
    }
  }

  /**
   * Stop tracking a component instance
   * Removes entity from the tracking set for this component type
   * @param {ComponentType} componentType - Type of component to untrack
   * @param {EntityId} entityId - ID of entity to stop tracking
   * @returns {void}
   * @example
   * ```typescript
   * registry.untrackComponentInstance('position', entity.id);
   * ```
   */
  untrackComponentInstance(
    componentType: ComponentType,
    entityId: EntityId
  ): void {
    const instances = this.componentInstances.get(componentType);
    if (instances) {
      instances.delete(entityId);
    }
  }

  /**
   * Get all entities that have a specific component type
   * @param {ComponentType} componentType - Component type to query for
   * @returns {EntityId[]} Array of entity IDs that have this component
   * @example
   * ```typescript
   * const movableEntities = registry.getEntitiesWithComponent('velocity');
   * console.log(`${movableEntities.length} entities can move`);
   * ```
   */
  getEntitiesWithComponent(componentType: ComponentType): EntityId[] {
    const instances = this.componentInstances.get(componentType);
    return instances ? Array.from(instances) : [];
  }

  /**
   * Get comprehensive statistics about component usage
   * @returns {Object} Statistics object
   * @returns {number} returns.registeredTypes - Number of registered component types
   * @returns {number} returns.totalInstances - Total number of component instances
   * @returns {Record<ComponentType, number>} returns.typeInstanceCounts - Instance count per component type
   * @example
   * ```typescript
   * const stats = registry.getStats();
   * console.log(`${stats.registeredTypes} types, ${stats.totalInstances} instances`);
   * console.log('Usage:', stats.typeInstanceCounts);
   * ```
   */
  getStats(): {
    registeredTypes: number;
    totalInstances: number;
    typeInstanceCounts: Record<ComponentType, number>;
  } {
    const typeInstanceCounts: Record<ComponentType, number> = {};
    let totalInstances = 0;

    for (const [type, instances] of this.componentInstances.entries()) {
      const count = instances.size;
      typeInstanceCounts[type] = count;
      totalInstances += count;
    }

    return {
      registeredTypes: this.componentTypes.size,
      totalInstances,
      typeInstanceCounts,
    };
  }

  /**
   * Reset the registry (clear all types and instances)
   * Removes all registered component types and clears instance tracking
   * @returns {void}
   * @example
   * ```typescript
   * registry.reset();
   * console.log(registry.getComponentTypes().length); // 0
   * ```
   */
  reset(): void {
    const typeCount = this.componentTypes.size;
    this.componentTypes.clear();
    this.componentInstances.clear();

    this.logger.info(
      `Reset ComponentRegistry, cleared ${typeCount} component types`,
      'ComponentRegistry'
    );
  }
}

/**
 * Component storage manages the actual component data for entities.
 * Uses a sparse set approach for efficient component access and queries.
 *
 * @class ComponentStorage
 * @example
 * ```typescript
 * const storage = new ComponentStorage();
 *
 * // Add components to entities
 * const position = new PositionComponent(10, 20);
 * storage.addComponent(entityId, position);
 *
 * // Retrieve components
 * const retrievedPosition = storage.getComponent<PositionComponent>(entityId, 'position');
 *
 * // Query entities
 * const movableEntities = storage.getEntitiesWithComponents(['position', 'velocity']);
 * ```
 */
export class ComponentStorage {
  /**
   * Logger instance for debugging and monitoring
   * @private
   * @type {Logger}
   */
  private logger = LoggerFactory.getLogger('ComponentStorage');

  /**
   * Nested map: ComponentType -> EntityId -> Component
   * Stores the actual component data
   * @private
   * @type {Map<ComponentType, Map<EntityId, Component>>}
   */
  private componentData: Map<ComponentType, Map<EntityId, Component>> =
    new Map();

  /**
   * Map: EntityId -> Set<ComponentType>
   * Tracks which components each entity has for fast lookups
   * @private
   * @type {Map<EntityId, Set<ComponentType>>}
   */
  private entityComponents: Map<EntityId, Set<ComponentType>> = new Map();

  /**
   * Add a component to an entity
   * @template T - The component type extending Component
   * @param {EntityId} entityId - ID of the entity to add component to
   * @param {T} component - Component instance to add
   * @returns {void}
   * @example
   * ```typescript
   * const position = new PositionComponent(100, 200);
   * storage.addComponent(entityId, position);
   * console.log(storage.hasComponent(entityId, 'position')); // true
   * ```
   */
  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    const componentType = component.componentType;

    // Initialize storage for this component type if needed
    if (!this.componentData.has(componentType)) {
      this.componentData.set(componentType, new Map());
    }

    // Initialize entity component tracking if needed
    if (!this.entityComponents.has(entityId)) {
      this.entityComponents.set(entityId, new Set());
    }

    // Store the component
    this.componentData.get(componentType)!.set(entityId, component);
    this.entityComponents.get(entityId)!.add(componentType);

    this.logger.debug(
      `Added component ${componentType} to entity ${entityId}`,
      'ComponentStorage'
    );

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Component added: ${componentType} to entity ${entityId}`,
      system: 'ComponentStorage',
      data: { entityId, componentType },
    });
  }

  /**
   * Remove a component from an entity
   * @param {EntityId} entityId - ID of the entity to remove component from
   * @param {ComponentType} componentType - Type of component to remove
   * @returns {boolean} True if component was removed, false if component wasn't found
   * @example
   * ```typescript
   * const success = storage.removeComponent(entityId, 'velocity');
   * console.log(success); // true if velocity component was removed
   * ```
   */
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const typeStorage = this.componentData.get(componentType);
    const entityComponents = this.entityComponents.get(entityId);

    if (!typeStorage || !entityComponents || !typeStorage.has(entityId)) {
      this.logger.warn(
        `Attempted to remove non-existent component ${componentType} from entity ${entityId}`,
        'ComponentStorage'
      );
      return false;
    }

    typeStorage.delete(entityId);
    entityComponents.delete(componentType);

    // Clean up empty sets
    if (entityComponents.size === 0) {
      this.entityComponents.delete(entityId);
    }

    this.logger.debug(
      `Removed component ${componentType} from entity ${entityId}`,
      'ComponentStorage'
    );

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Component removed: ${componentType} from entity ${entityId}`,
      system: 'ComponentStorage',
      data: { entityId, componentType },
    });

    return true;
  }

  /**
   * Get a component from an entity
   * @template T - The component type extending Component
   * @param {EntityId} entityId - ID of the entity
   * @param {ComponentType} componentType - Type of component to retrieve
   * @returns {T | undefined} Component instance or undefined if not found
   * @example
   * ```typescript
   * const position = storage.getComponent<PositionComponent>(entityId, 'position');
   * if (position) {
   *   console.log(`Entity at (${position.x}, ${position.y})`);
   * }
   * ```
   */
  getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | undefined {
    const typeStorage = this.componentData.get(componentType);
    return typeStorage?.get(entityId) as T | undefined;
  }

  /**
   * Check if an entity has a specific component
   * @param {EntityId} entityId - ID of the entity to check
   * @param {ComponentType} componentType - Type of component to check for
   * @returns {boolean} True if entity has the component, false otherwise
   * @example
   * ```typescript
   * if (storage.hasComponent(entityId, 'health')) {
   *   console.log('Entity can take damage');
   * }
   * ```
   */
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entityComponents = this.entityComponents.get(entityId);
    return entityComponents?.has(componentType) ?? false;
  }

  /**
   * Get all components for an entity
   */
  getEntityComponents(entityId: EntityId): Component[] {
    const componentTypes = this.entityComponents.get(entityId);
    if (!componentTypes) {
      return [];
    }

    const components: Component[] = [];
    for (const componentType of componentTypes) {
      const component = this.getComponent(entityId, componentType);
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Get all component types for an entity
   */
  getEntityComponentTypes(entityId: EntityId): ComponentType[] {
    const componentTypes = this.entityComponents.get(entityId);
    return componentTypes ? Array.from(componentTypes) : [];
  }

  /**
   * Get all entities that have a specific component
   */
  getEntitiesWithComponent(componentType: ComponentType): EntityId[] {
    const typeStorage = this.componentData.get(componentType);
    return typeStorage ? Array.from(typeStorage.keys()) : [];
  }

  /**
   * Get all entities that have all specified components
   * @param {ComponentType[]} componentTypes - Array of component types that entities must have
   * @returns {EntityId[]} Array of entity IDs that have all specified components
   * @example
   * ```typescript
   * const movableEntities = storage.getEntitiesWithComponents(['position', 'velocity']);
   * console.log(`${movableEntities.length} entities can move`);
   * ```
   */
  getEntitiesWithComponents(componentTypes: ComponentType[]): EntityId[] {
    if (componentTypes.length === 0) {
      return [];
    }

    // Start with entities that have the first component type
    let entities = this.getEntitiesWithComponent(componentTypes[0]);

    // Filter entities that have all remaining component types
    for (let i = 1; i < componentTypes.length; i++) {
      const componentType = componentTypes[i];
      entities = entities.filter((entityId) =>
        this.hasComponent(entityId, componentType)
      );
    }

    return entities;
  }

  /**
   * Remove all components from an entity
   */
  removeAllEntityComponents(entityId: EntityId): void {
    const componentTypes = this.entityComponents.get(entityId);
    if (!componentTypes) {
      return;
    }

    const removedTypes = Array.from(componentTypes);

    // Remove from component storage
    for (const componentType of componentTypes) {
      const typeStorage = this.componentData.get(componentType);
      if (typeStorage) {
        typeStorage.delete(entityId);
      }
    }

    // Remove entity component tracking
    this.entityComponents.delete(entityId);

    this.logger.debug(
      `Removed all components from entity ${entityId}: [${removedTypes.join(', ')}]`,
      'ComponentStorage'
    );
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalComponents: number;
    totalEntities: number;
    componentTypeCounts: Record<ComponentType, number>;
    averageComponentsPerEntity: number;
  } {
    const componentTypeCounts: Record<ComponentType, number> = {};
    let totalComponents = 0;

    for (const [componentType, storage] of this.componentData.entries()) {
      const count = storage.size;
      componentTypeCounts[componentType] = count;
      totalComponents += count;
    }

    const totalEntities = this.entityComponents.size;
    const averageComponentsPerEntity =
      totalEntities > 0 ? totalComponents / totalEntities : 0;

    return {
      totalComponents,
      totalEntities,
      componentTypeCounts,
      averageComponentsPerEntity:
        Math.round(averageComponentsPerEntity * 100) / 100,
    };
  }

  /**
   * Reset the storage (clear all data)
   */
  reset(): void {
    const componentCount = this.getStats().totalComponents;
    const entityCount = this.entityComponents.size;

    this.componentData.clear();
    this.entityComponents.clear();

    this.logger.info(
      `Reset ComponentStorage, cleared ${componentCount} components from ${entityCount} entities`,
      'ComponentStorage'
    );
  }
}

/**
 * Singleton instance of ComponentRegistry for global component type management
 * @type {ComponentRegistry}
 * @example
 * ```typescript
 * import { componentRegistry } from '@english-learning-town/core';
 *
 * componentRegistry.registerComponentType('position', PositionComponent);
 * const position = componentRegistry.createComponent('position', 10, 20);
 * ```
 */
export const componentRegistry = new ComponentRegistry();

/**
 * Singleton instance of ComponentStorage for global component data management
 * @type {ComponentStorage}
 * @example
 * ```typescript
 * import { componentStorage } from '@english-learning-town/core';
 *
 * const position = new PositionComponent(100, 200);
 * componentStorage.addComponent(entityId, position);
 * const retrieved = componentStorage.getComponent(entityId, 'position');
 * ```
 */
export const componentStorage = new ComponentStorage();

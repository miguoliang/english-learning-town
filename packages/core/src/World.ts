/**
 * Pure ECS World manager for English Learning Town
 * Central coordinator for all ECS operations - entities, components, and systems
 * Provides the single source of truth for the entire ECS architecture
 */

import { Entity, EntityId, entityManager } from './Entity';
import {
  Component,
  ComponentType,
  componentRegistry,
  componentStorage,
  ComponentConstructor,
} from './Component';
import { GameSystem, systemManager } from './GameSystem';
import { eventBus, CoreEvents } from './EventBus';
import { LoggerFactory } from '@english-learning-town/logger';

/**
 * World represents a complete ECS environment
 * Provides a unified interface for managing entities, components, and systems
 */
export class World {
  private logger = LoggerFactory.getLogger('World');
  private entityManager = entityManager;
  private componentRegistry = componentRegistry;
  private componentStorage = componentStorage;
  private systemManager = systemManager;
  private initialized = false;
  private running = false;

  /**
   * Initialize the world and all registered systems
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('World is already initialized');
      return;
    }

    try {
      // Initialize systems
      await this.systemManager.initializeAll();

      this.initialized = true;

      this.logger.info('World initialized successfully');

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'info',
        message: 'ECS World initialized',
        system: 'World',
        data: this.getStats(),
      });
    } catch (error) {
      this.logger.error(
        'Failed to initialize world',
        'World',
        {},
        error as Error
      );
      throw error;
    }
  }

  /**
   * Start the world (starts all systems)
   */
  start(): void {
    if (!this.initialized) {
      throw new Error('World must be initialized before starting');
    }

    if (this.running) {
      this.logger.warn('World is already running');
      return;
    }

    try {
      this.systemManager.startAll();
      this.running = true;

      this.logger.info('World started');

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'info',
        message: 'ECS World started',
        system: 'World',
      });
    } catch (error) {
      this.logger.error('Failed to start world', 'World', {}, error as Error);
      throw error;
    }
  }

  /**
   * Stop the world (stops all systems)
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    try {
      this.systemManager.stopAll();
      this.running = false;

      this.logger.info('World stopped');

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'info',
        message: 'ECS World stopped',
        system: 'World',
      });
    } catch (error) {
      this.logger.error('Failed to stop world', 'World', {}, error as Error);
    }
  }

  /**
   * Update the world (updates all systems)
   */
  update(deltaTime: number, currentTime?: number): void {
    if (!this.running) {
      return;
    }

    try {
      this.systemManager.updateAll(deltaTime, currentTime);
    } catch (error) {
      this.logger.error(
        'Error during world update',
        'World',
        { deltaTime },
        error as Error
      );
    }
  }

  /**
   * Cleanup the world and all its components
   */
  async cleanup(): Promise<void> {
    try {
      this.stop();

      // Cleanup systems
      await this.systemManager.cleanupAll();

      // Reset all managers
      this.componentStorage.reset();
      this.componentRegistry.reset();
      this.entityManager.reset();

      this.initialized = false;

      this.logger.info('World cleaned up');

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'info',
        message: 'ECS World cleaned up',
        system: 'World',
      });
    } catch (error) {
      this.logger.error(
        'Error during world cleanup',
        'World',
        {},
        error as Error
      );
    }
  }

  // ========== Entity Management ==========

  /**
   * Create a new entity
   */
  createEntity(): Entity {
    const entity = this.entityManager.createEntity();

    this.logger.debug(`Created entity ${entity.id}`);

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Entity created in world: ${entity.id}`,
      system: 'World',
      data: { entityId: entity.id },
    });

    return entity;
  }

  /**
   * Destroy an entity and all its components
   */
  destroyEntity(entityId: EntityId): boolean {
    if (!this.entityManager.hasEntity(entityId)) {
      this.logger.warn(`Attempted to destroy non-existent entity: ${entityId}`);
      return false;
    }

    // Remove all components first
    this.componentStorage.removeAllEntityComponents(entityId);

    // Then destroy the entity
    const success = this.entityManager.destroyEntity(entityId);

    if (success) {
      this.logger.debug(`Destroyed entity ${entityId} and all its components`);

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'debug',
        message: `Entity destroyed in world: ${entityId}`,
        system: 'World',
        data: { entityId },
      });
    }

    return success;
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entityManager.getEntity(entityId);
  }

  /**
   * Check if an entity exists
   */
  hasEntity(entityId: EntityId): boolean {
    return this.entityManager.hasEntity(entityId);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return this.entityManager.getAllEntities();
  }

  // ========== Component Management ==========

  /**
   * Register a component type
   */
  registerComponentType<T extends Component>(
    componentType: ComponentType,
    constructor: ComponentConstructor<T>
  ): void {
    this.componentRegistry.registerComponentType(componentType, constructor);

    this.logger.debug(`Registered component type: ${componentType}`);
  }

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    if (!this.entityManager.hasEntity(entityId)) {
      throw new Error(
        `Cannot add component to non-existent entity: ${entityId}`
      );
    }

    this.componentStorage.addComponent(entityId, component);
    this.componentRegistry.trackComponentInstance(
      component.componentType,
      entityId
    );

    this.logger.debug(
      `Added component ${component.componentType} to entity ${entityId}`
    );

    // Invalidate system query caches
    this.invalidateSystemCaches();
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const success = this.componentStorage.removeComponent(
      entityId,
      componentType
    );

    if (success) {
      this.componentRegistry.untrackComponentInstance(componentType, entityId);
      this.logger.debug(
        `Removed component ${componentType} from entity ${entityId}`
      );

      // Invalidate system query caches
      this.invalidateSystemCaches();
    }

    return success;
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | undefined {
    return this.componentStorage.getComponent<T>(entityId, componentType);
  }

  /**
   * Check if an entity has a component
   */
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.componentStorage.hasComponent(entityId, componentType);
  }

  /**
   * Get all components for an entity
   */
  getEntityComponents(entityId: EntityId): Component[] {
    return this.componentStorage.getEntityComponents(entityId);
  }

  /**
   * Create and add a component to an entity
   */
  createAndAddComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType,
    ...args: any[]
  ): T {
    const component = this.componentRegistry.createComponent<T>(
      componentType,
      ...args
    );
    this.addComponent(entityId, component);
    return component;
  }

  // ========== Query Methods ==========

  /**
   * Query entities that have all specified components
   */
  queryEntities(componentTypes: ComponentType[]): EntityId[] {
    return this.componentStorage
      .getEntitiesWithComponents(componentTypes)
      .filter((entityId) => this.entityManager.hasEntity(entityId));
  }

  /**
   * Query entities that have a specific component
   */
  queryEntitiesWithComponent(componentType: ComponentType): EntityId[] {
    return this.queryEntities([componentType]);
  }

  // ========== System Management ==========

  /**
   * Register a system
   */
  registerSystem(system: GameSystem): void {
    this.systemManager.registerSystem(system);

    this.logger.debug(`Registered system: ${system.name}`);
  }

  /**
   * Unregister a system
   */
  async unregisterSystem(systemName: string): Promise<void> {
    await this.systemManager.unregisterSystem(systemName);

    this.logger.debug(`Unregistered system: ${systemName}`);
  }

  /**
   * Get a system by name
   */
  getSystem<T extends GameSystem>(systemName: string): T | undefined {
    return this.systemManager.getSystem<T>(systemName);
  }

  /**
   * Start a specific system
   */
  startSystem(systemName: string): void {
    this.systemManager.startSystem(systemName);
  }

  /**
   * Stop a specific system
   */
  stopSystem(systemName: string): void {
    this.systemManager.stopSystem(systemName);
  }

  // ========== Utility Methods ==========

  /**
   * Get world statistics
   */
  getStats(): {
    initialized: boolean;
    running: boolean;
    entities: ReturnType<typeof entityManager.getStats>;
    components: ReturnType<typeof componentStorage.getStats>;
    systems: ReturnType<typeof systemManager.getStats>;
  } {
    return {
      initialized: this.initialized,
      running: this.running,
      entities: this.entityManager.getStats(),
      components: this.componentStorage.getStats(),
      systems: this.systemManager.getStats(),
    };
  }

  /**
   * Check if the world is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if the world is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Perform garbage collection (cleanup inactive entities)
   */
  garbageCollect(): void {
    this.entityManager.cleanup();

    this.logger.debug('Performed garbage collection');
  }

  /**
   * Invalidate all system query caches
   * Called when components are added/removed to ensure systems get fresh data
   */
  private invalidateSystemCaches(): void {
    // Get all systems and invalidate their caches
    const systems = this.systemManager.getSystemsByState('initialized');
    systems.forEach((system) => {
      // Access the protected method through casting
      (system as any).invalidateQueryCache?.();
    });
  }
}

// Singleton instance for global world management
export const world = new World();

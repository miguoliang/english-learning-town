/**
 * Pure ECS (Entity-Component-System) architecture for English Learning Town
 * Systems operate exclusively on entities that have specific component combinations
 * No legacy patterns - pure ECS implementation
 *
 * @fileoverview ECS System architecture with pure entity-component processing
 * @author English Learning Town Team
 * @version 1.0.0
 */

import { EntityId, entityManager } from './Entity';
import { ComponentType, Component, componentStorage } from './Component';
import { eventBus, CoreEvents } from './EventBus';
import {
  BaseSystemConfig,
  ResolvedSystemConfig,
  CachedQuery,
} from './types/UtilityTypes';

/**
 * System configuration type alias for backward compatibility
 * @typedef {BaseSystemConfig} SystemConfig
 */
export type SystemConfig = BaseSystemConfig;

/**
 * Enumeration of system types for categorization and prioritization
 * @enum {string}
 * @readonly
 */
export enum SystemType {
  /** Essential systems like rendering and input */
  CORE = 'core',
  /** Game logic systems */
  GAMEPLAY = 'gameplay',
  /** User interface systems */
  UI = 'ui',
  /** Audio systems */
  AUDIO = 'audio',
  /** Networking systems */
  NETWORK = 'network',
  /** Debug and development systems */
  DEBUG = 'debug',
}

/**
 * Generic system state interface using mapped types
 * @interface SystemStateFlags
 * @readonly
 */
interface SystemStateFlags {
  /** Whether the system has been initialized */
  readonly initialized: boolean;
  /** Whether the system is currently running */
  readonly running: boolean;
}

/**
 * Base class for all ECS systems.
 * Systems contain logic that operates on entities with specific component combinations.
 *
 * @abstract
 * @class GameSystem
 * @implements {SystemStateFlags}
 * @example
 * ```typescript
 * @GameplaySystem({ priority: 100 })
 * @RequiresComponents('position', 'velocity')
 * export class MovementSystem extends GameSystem {
 *   protected processEntity(entityId: EntityId, deltaTime: number): void {
 *     const { position, velocity } = this.getComponents(entityId, {
 *       position: 'position',
 *       velocity: 'velocity'
 *     });
 *
 *     if (position && velocity) {
 *       position.x += velocity.x * deltaTime;
 *       position.y += velocity.y * deltaTime;
 *     }
 *   }
 * }
 * ```
 */
export abstract class GameSystem implements SystemStateFlags {
  protected readonly config: ResolvedSystemConfig;
  public initialized = false;
  public running = false;

  // Optimized query cache using utility types
  private readonly queryCache = new Map<string, CachedQuery>();
  private readonly updateInterval: number;

  /**
   * Creates a new GameSystem instance
   * @param {SystemConfig} config - System configuration object
   * @example
   * ```typescript
   * constructor() {
   *   super({
   *     name: 'MovementSystem',
   *     priority: 100,
   *     systemType: SystemType.GAMEPLAY
   *   });
   * }
   * ```
   */
  constructor(config: SystemConfig) {
    this.config = {
      systemType: SystemType.GAMEPLAY,
      updateFrequency: 0,
      autoStart: true,
      enabled: true,
      dependencies: [],
      ...config,
    } as ResolvedSystemConfig;

    this.updateInterval =
      this.config.updateFrequency > 0 ? 1000 / this.config.updateFrequency : 0;
  }

  // Use generic accessor pattern to reduce getter boilerplate
  protected getConfigValue<K extends keyof ResolvedSystemConfig>(
    key: K
  ): ResolvedSystemConfig[K] {
    return this.config[key];
  }

  // Simplified property accessors using the generic pattern
  get name() {
    return this.getConfigValue('name');
  }
  get priority() {
    return this.getConfigValue('priority');
  }
  get systemType() {
    return this.getConfigValue('systemType');
  }
  get updateFrequency() {
    return this.getConfigValue('updateFrequency');
  }
  get dependencies() {
    return this.getConfigValue('dependencies');
  }
  get shouldAutoStart() {
    return this.getConfigValue('autoStart');
  }
  get isEnabled() {
    return this.getConfigValue('enabled');
  }

  // State flags (no change needed - simple boolean accessors)
  get isInitialized() {
    return this.initialized;
  }
  get isRunning() {
    return this.running;
  }

  // ========== ECS Query Methods (Optimized) ==========

  /**
   * Generic query method with automatic caching
   * Queries entities that have all specified component types
   * @template T - Readonly array of component types
   * @param {T} componentTypes - Array of component types to query for
   * @param {number} [ttl=16] - Cache time-to-live in milliseconds
   * @returns {EntityId[]} Array of entity IDs that have all specified components
   * @example
   * ```typescript
   * const movableEntities = this.query(['position', 'velocity'] as const);
   * movableEntities.forEach(entityId => {
   *   // Process each movable entity
   * });
   * ```
   */
  protected query<T extends readonly ComponentType[]>(
    componentTypes: T,
    ttl: number = 16
  ): EntityId[] {
    const cacheKey = [...componentTypes].sort().join('|');
    const cached = this.queryCache.get(cacheKey);
    const now = performance.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const entities = componentStorage
      .getEntitiesWithComponents([...componentTypes])
      .filter((entityId) => entityManager.hasEntity(entityId));

    this.queryCache.set(cacheKey, {
      data: entities,
      timestamp: now,
      ttl,
      key: cacheKey,
    });

    return entities;
  }

  /**
   * Type-safe component accessor with generic constraints
   */
  protected getComponent<T extends Component>(
    entityId: EntityId,
    componentType: ComponentType
  ): T | undefined {
    return componentStorage.getComponent<T>(entityId, componentType);
  }

  /**
   * Multi-component getter - reduces multiple getComponent calls
   * Efficiently retrieves multiple components from an entity in one call
   * @template T - Record mapping keys to component types
   * @param {EntityId} entityId - ID of the entity to get components from
   * @param {T} componentMap - Object mapping keys to component types
   * @returns {Object} Object with same keys, values are components or undefined
   * @example
   * ```typescript
   * const { position, velocity, health } = this.getComponents(entityId, {
   *   position: 'position',
   *   velocity: 'velocity',
   *   health: 'health'
   * });
   *
   * if (position && velocity) {
   *   position.x += velocity.x * deltaTime;
   * }
   * ```
   */
  protected getComponents<T extends Record<string, ComponentType>>(
    entityId: EntityId,
    componentMap: T
  ): { [K in keyof T]: Component | undefined } {
    const result = {} as { [K in keyof T]: Component | undefined };

    for (const [key, componentType] of Object.entries(componentMap)) {
      result[key as keyof T] = this.getComponent(entityId, componentType);
    }

    return result;
  }

  /**
   * Batch component existence check
   */
  protected hasComponents(
    entityId: EntityId,
    componentTypes: readonly ComponentType[]
  ): boolean {
    return componentTypes.every((type) =>
      componentStorage.hasComponent(entityId, type)
    );
  }

  /**
   * Single component existence check
   */
  protected hasComponent(
    entityId: EntityId,
    componentType: ComponentType
  ): boolean {
    return componentStorage.hasComponent(entityId, componentType);
  }

  /**
   * Get all components for an entity
   */
  protected getEntityComponents(entityId: EntityId): Component[] {
    return componentStorage.getEntityComponents(entityId);
  }

  /**
   * Cache management with granular control
   */
  protected invalidateQueryCache(pattern?: string): void {
    if (pattern) {
      // Clear specific cache entries matching pattern
      for (const [key] of this.queryCache.entries()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  /**
   * Process entities that match the system's component requirements.
   * Override this method to implement your system's core logic.
   * Called automatically by the update loop with filtered entities.
   * @param {EntityId[]} entities - Array of entity IDs that match component requirements
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @returns {void}
   * @example
   * ```typescript
   * protected processEntities(entities: EntityId[], deltaTime: number): void {
   *   // Batch process all entities
   *   entities.forEach(entityId => {
   *     this.processEntity(entityId, deltaTime);
   *   });
   * }
   * ```
   */
  protected processEntities(entities: EntityId[], deltaTime: number): void {
    // Default implementation processes each entity individually
    for (const entityId of entities) {
      this.processEntity(entityId, deltaTime);
    }
  }

  /**
   * Process a single entity
   * Override this for per-entity logic
   */
  protected processEntity(_entityId: EntityId, _deltaTime: number): void {
    // Override in concrete systems
  }

  /**
   * Define which components this system requires.
   * MUST override this in concrete systems to specify component requirements.
   * Entities will only be processed if they have ALL these components.
   * @abstract
   * @returns {ComponentType[]} Array of component types this system requires
   * @example
   * ```typescript
   * protected getRequiredComponents(): ComponentType[] {
   *   return ['position', 'velocity', 'renderable'];
   * }
   * ```
   */
  protected abstract getRequiredComponents(): ComponentType[];

  /**
   * Define which components this system is interested in (optional components)
   * Override this in subclasses to specify optional components for optimization
   */
  protected getOptionalComponents(): ComponentType[] {
    return [];
  }

  // ========== System Lifecycle Methods ==========

  /**
   * Initialize the system
   * Sets up the system and calls the onInitialize hook
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * @throws {Error} If system is already initialized
   * @example
   * ```typescript
   * await system.initialize();
   * console.log(system.isInitialized); // true
   * ```
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn(`System ${this.name} is already initialized`);
      return;
    }

    try {
      await this.onInitialize();
      this.initialized = true;
      eventBus.emit(CoreEvents.SYSTEM_INITIALIZED, {
        level: 'info',
        message: `System ${this.name} initialized`,
        system: this.name,
      });
    } catch (error) {
      eventBus.emit(CoreEvents.SYSTEM_ERROR, {
        error,
        context: `System ${this.name} initialization`,
        system: this.name,
      });
      throw error;
    }
  }

  /**
   * Start the system
   */
  start(): void {
    if (!this.initialized) {
      throw new Error(
        `System ${this.name} must be initialized before starting`
      );
    }

    if (this.running) {
      console.warn(`System ${this.name} is already running`);
      return;
    }

    this.running = true;
    this.onStart();
    eventBus.emit(CoreEvents.SYSTEM_STARTED, {
      level: 'info',
      message: `System ${this.name} started`,
      system: this.name,
    });
  }

  /**
   * Stop the system
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    this.onStop();
    eventBus.emit(CoreEvents.SYSTEM_STOPPED, {
      level: 'info',
      message: `System ${this.name} stopped`,
      system: this.name,
    });
  }

  /**
   * Update the system - optimized with TypeScript utility types
   * Called every frame by the game engine to process entities
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @param {number} [currentTime=performance.now()] - Current timestamp
   * @returns {void}
   * @example
   * ```typescript
   * // Called automatically by the engine
   * system.update(16.67); // 60 FPS
   * ```
   */
  update(deltaTime: number, currentTime: number = performance.now()): void {
    if (!this.running || !this.isEnabled) return;

    // Frequency throttling using config accessor
    if (this.updateInterval > 0) {
      const timeSinceLastUpdate = currentTime - (this.lastUpdateTime || 0);
      if (timeSinceLastUpdate < this.updateInterval) return;
      this.lastUpdateTime = currentTime;
    }

    try {
      // Pure ECS update using optimized query method
      const requiredComponents = this.getRequiredComponents();
      if (requiredComponents.length > 0) {
        const entities = this.query(requiredComponents);
        this.processEntities(entities, deltaTime);
      }
    } catch (error) {
      eventBus.emit(CoreEvents.SYSTEM_ERROR, {
        error,
        context: `System ${this.name} update`,
        system: this.name,
      });
    }
  }

  private lastUpdateTime = 0;

  /**
   * Cleanup the system
   */
  async cleanup(): Promise<void> {
    this.stop();

    // Clear ECS query cache
    this.queryCache.clear();

    await this.onCleanup();
    this.initialized = false;
    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'info',
      message: `System ${this.name} cleaned up`,
      system: this.name,
    });
  }

  /**
   * Enable the system
   */
  enable(): void {
    // Use object mutation for config changes
    (this.config as any).enabled = true;
    this.onEnabled();
  }

  /**
   * Disable the system
   */
  disable(): void {
    // Use object mutation for config changes
    (this.config as any).enabled = false;
    this.onDisabled();
  }

  // ========== System Lifecycle Hooks ==========
  // Override these methods in concrete systems for custom behavior

  /**
   * Called during system initialization
   * Override to perform system-specific setup
   */
  protected async onInitialize(): Promise<void> {
    // Override in concrete systems
  }

  /**
   * Called when the system starts
   * Override to perform system-specific startup logic
   */
  protected onStart(): void {
    // Override in concrete systems
  }

  /**
   * Called when the system stops
   * Override to perform system-specific shutdown logic
   */
  protected onStop(): void {
    // Override in concrete systems
  }

  /**
   * Called during system cleanup
   * Override to perform system-specific cleanup
   */
  protected async onCleanup(): Promise<void> {
    // Override in concrete systems
  }

  /**
   * Called when the system is enabled
   */
  protected onEnabled(): void {
    // Default implementation - can be overridden
  }

  /**
   * Called when the system is disabled
   */
  protected onDisabled(): void {
    // Default implementation - can be overridden
  }
}

/**
 * System manager to handle multiple game systems.
 * Manages system lifecycle, dependencies, and execution order.
 *
 * @class SystemManager
 * @example
 * ```typescript
 * const manager = new SystemManager();
 *
 * // Register systems
 * manager.registerSystem(new MovementSystem());
 * manager.registerSystem(new RenderSystem());
 *
 * // Initialize and start all systems
 * await manager.initializeAll();
 * manager.startAll();
 *
 * // Update systems each frame
 * manager.updateAll(deltaTime);
 * ```
 */
export class SystemManager {
  /**
   * Map of system names to system instances
   * @private
   * @type {Map<string, GameSystem>}
   */
  private systems: Map<string, GameSystem> = new Map();

  /**
   * Array of system names in execution order (sorted by priority)
   * @private
   * @type {string[]}
   */
  private systemOrder: string[] = [];

  /**
   * Whether the system manager has been initialized
   * @private
   * @type {boolean}
   */
  private initialized = false;

  /**
   * Whether the system manager is currently running
   * @private
   * @type {boolean}
   */
  private running = false;

  /**
   * Register a new system with the manager
   * @param {GameSystem} system - System instance to register
   * @returns {void}
   * @throws {Error} If system name is already registered
   * @example
   * ```typescript
   * const movementSystem = new MovementSystem();
   * systemManager.registerSystem(movementSystem);
   * ```
   */
  registerSystem(system: GameSystem): void {
    if (this.systems.has(system.name)) {
      throw new Error(`System ${system.name} is already registered`);
    }

    this.systems.set(system.name, system);
    this.updateSystemOrder();

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'info',
      message: `System ${system.name} registered`,
      system: 'SystemManager',
    });
  }

  /**
   * Unregister a system
   */
  async unregisterSystem(systemName: string): Promise<void> {
    const system = this.systems.get(systemName);
    if (!system) {
      return;
    }

    await system.cleanup();
    this.systems.delete(systemName);
    this.updateSystemOrder();

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'info',
      message: `System ${systemName} unregistered`,
      system: 'SystemManager',
    });
  }

  /**
   * Get a system by name
   */
  getSystem<T extends GameSystem>(systemName: string): T | undefined {
    return this.systems.get(systemName) as T | undefined;
  }

  /**
   * Initialize all systems in dependency order
   */
  async initializeAll(): Promise<void> {
    if (this.initialized) {
      console.warn('SystemManager is already initialized');
      return;
    }

    const initOrder = this.resolveDependencyOrder();

    for (const systemName of initOrder) {
      const system = this.systems.get(systemName);
      if (system && !system.isInitialized) {
        await system.initialize();
      }
    }

    this.initialized = true;
    eventBus.emit(CoreEvents.ENGINE_INITIALIZED, {
      systems: Array.from(this.systems.keys()),
    });
  }

  /**
   * Start all systems (only those marked for auto-start)
   */
  startAll(): void {
    if (!this.initialized) {
      throw new Error('SystemManager must be initialized before starting');
    }

    if (this.running) {
      console.warn('SystemManager is already running');
      return;
    }

    for (const systemName of this.systemOrder) {
      const system = this.systems.get(systemName);
      if (
        system &&
        system.isEnabled &&
        !system.isRunning &&
        system.shouldAutoStart
      ) {
        system.start();
      }
    }

    this.running = true;
    eventBus.emit(CoreEvents.ENGINE_STARTED, {
      systems: this.systemOrder,
    });
  }

  /**
   * Start a specific system by name
   */
  startSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (!system) {
      throw new Error(`System not found: ${systemName}`);
    }

    if (!system.isInitialized) {
      throw new Error(
        `System ${systemName} must be initialized before starting`
      );
    }

    if (!system.isRunning && system.isEnabled) {
      system.start();
    }
  }

  /**
   * Stop a specific system by name
   */
  stopSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (system && system.isRunning) {
      system.stop();
    }
  }

  /**
   * Stop all systems
   */
  stopAll(): void {
    if (!this.running) {
      return;
    }

    // Stop in reverse order
    for (let i = this.systemOrder.length - 1; i >= 0; i--) {
      const systemName = this.systemOrder[i];
      const system = this.systems.get(systemName);
      if (system && system.isRunning) {
        system.stop();
      }
    }

    this.running = false;
    eventBus.emit(CoreEvents.ENGINE_STOPPED, {
      systems: this.systemOrder,
    });
  }

  /**
   * Update all systems
   */
  updateAll(deltaTime: number, currentTime: number = performance.now()): void {
    if (!this.running) {
      return;
    }

    for (const systemName of this.systemOrder) {
      const system = this.systems.get(systemName);
      if (system && system.isRunning) {
        system.update(deltaTime, currentTime);
      }
    }
  }

  /**
   * Get systems by type
   */
  getSystemsByType(systemType: SystemType): GameSystem[] {
    const systems: GameSystem[] = [];
    for (const system of this.systems.values()) {
      if (system.systemType === systemType) {
        systems.push(system);
      }
    }
    return systems;
  }

  /**
   * Get all systems of a specific state
   */
  getSystemsByState(
    state: 'initialized' | 'running' | 'enabled'
  ): GameSystem[] {
    const systems: GameSystem[] = [];
    for (const system of this.systems.values()) {
      let matches = false;
      switch (state) {
        case 'initialized':
          matches = system.isInitialized;
          break;
        case 'running':
          matches = system.isRunning;
          break;
        case 'enabled':
          matches = system.isEnabled;
          break;
      }
      if (matches) {
        systems.push(system);
      }
    }
    return systems;
  }

  /**
   * Cleanup all systems
   */
  async cleanupAll(): Promise<void> {
    this.stopAll();

    // Cleanup in reverse order
    for (let i = this.systemOrder.length - 1; i >= 0; i--) {
      const systemName = this.systemOrder[i];
      const system = this.systems.get(systemName);
      if (system) {
        await system.cleanup();
      }
    }

    this.systems.clear();
    this.systemOrder = [];
    this.initialized = false;
  }

  /**
   * Get all system names in execution order
   */
  getSystemOrder(): string[] {
    return [...this.systemOrder];
  }

  /**
   * Get system stats
   */
  getStats(): {
    total: number;
    running: number;
    initialized: number;
    enabled: number;
  } {
    let running = 0;
    let initialized = 0;
    let enabled = 0;

    for (const system of this.systems.values()) {
      if (system.isRunning) running++;
      if (system.isInitialized) initialized++;
      if (system.isEnabled) enabled++;
    }

    return {
      total: this.systems.size,
      running,
      initialized,
      enabled,
    };
  }

  private updateSystemOrder(): void {
    this.systemOrder = Array.from(this.systems.values())
      .sort((a, b) => a.priority - b.priority)
      .map((system) => system.name);
  }

  private resolveDependencyOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (systemName: string): void => {
      if (visited.has(systemName)) {
        return;
      }

      if (visiting.has(systemName)) {
        throw new Error(
          `Circular dependency detected involving system: ${systemName}`
        );
      }

      const system = this.systems.get(systemName);
      if (!system) {
        throw new Error(`System not found: ${systemName}`);
      }

      visiting.add(systemName);

      for (const dependency of system.dependencies) {
        if (!this.systems.has(dependency)) {
          throw new Error(
            `Dependency not found: ${dependency} for system: ${systemName}`
          );
        }
        visit(dependency);
      }

      visiting.delete(systemName);
      visited.add(systemName);
      result.push(systemName);
    };

    for (const systemName of this.systems.keys()) {
      visit(systemName);
    }

    return result;
  }
}

/**
 * Singleton instance of SystemManager for global system management
 * Provides a shared SystemManager across the entire application
 * @type {SystemManager}
 * @example
 * ```typescript
 * import { systemManager } from '@english-learning-town/core';
 *
 * // Register systems with the singleton
 * systemManager.registerSystem(new MovementSystem());
 * systemManager.registerSystem(new RenderSystem());
 *
 * // Initialize and start all systems
 * await systemManager.initializeAll();
 * systemManager.startAll();
 * ```
 */
export const systemManager = new SystemManager();

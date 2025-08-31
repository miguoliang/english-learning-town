/**
 * Base game system architecture for English Learning Town
 * Provides a foundation for modular game systems (rendering, input, dialogue, etc.)
 */

import { eventBus, CoreEvents } from './EventBus';

export interface SystemConfig {
  name: string;
  priority: number;
  enabled: boolean;
  dependencies?: string[];
  systemType?: SystemType;
  updateFrequency?: number; // Updates per second, 0 = every frame
  autoStart?: boolean; // Whether to start automatically when engine starts
}

export enum SystemType {
  CORE = 'core', // Essential systems (rendering, input)
  GAMEPLAY = 'gameplay', // Game logic systems
  UI = 'ui', // User interface systems
  AUDIO = 'audio', // Audio systems
  NETWORK = 'network', // Networking systems
  DEBUG = 'debug', // Debug and development systems
}

export abstract class GameSystem {
  protected config: SystemConfig;
  protected initialized = false;
  protected running = false;

  // Timing control for update frequency
  private lastUpdateTime = 0;
  private updateInterval: number;

  constructor(config: SystemConfig) {
    this.config = {
      systemType: SystemType.GAMEPLAY,
      updateFrequency: 0, // Default to every frame
      autoStart: true,
      ...config,
    };

    // Calculate update interval in milliseconds
    this.updateInterval =
      this.config.updateFrequency! > 0
        ? 1000 / this.config.updateFrequency!
        : 0;
  }

  get name(): string {
    return this.config.name;
  }

  get priority(): number {
    return this.config.priority;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get dependencies(): string[] {
    return this.config.dependencies || [];
  }

  get systemType(): SystemType {
    return this.config.systemType || SystemType.GAMEPLAY;
  }

  get updateFrequency(): number {
    return this.config.updateFrequency || 0;
  }

  get shouldAutoStart(): boolean {
    return this.config.autoStart !== false;
  }

  /**
   * Initialize the system
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
   * Update the system (called every frame, but may skip based on updateFrequency)
   */
  update(deltaTime: number, currentTime: number = performance.now()): void {
    if (!this.running || !this.config.enabled) {
      return;
    }

    // Check if enough time has passed for systems with limited update frequency
    if (this.updateInterval > 0) {
      if (currentTime - this.lastUpdateTime < this.updateInterval) {
        return;
      }
      this.lastUpdateTime = currentTime;
    }

    try {
      this.onUpdate(deltaTime);
    } catch (error) {
      eventBus.emit(CoreEvents.SYSTEM_ERROR, {
        error,
        context: `System ${this.name} update`,
        system: this.name,
      });
    }
  }

  /**
   * Cleanup the system
   */
  async cleanup(): Promise<void> {
    this.stop();
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
    this.config.enabled = true;
    this.onEnabled();
  }

  /**
   * Disable the system
   */
  disable(): void {
    this.config.enabled = false;
    this.onDisabled();
  }

  // Abstract methods to be implemented by concrete systems

  /**
   * Called during system initialization
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Called when the system starts
   */
  protected abstract onStart(): void;

  /**
   * Called when the system stops
   */
  protected abstract onStop(): void;

  /**
   * Called every frame with delta time
   */
  protected abstract onUpdate(deltaTime: number): void;

  /**
   * Called during system cleanup
   */
  protected abstract onCleanup(): Promise<void>;

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
 * System manager to handle multiple game systems
 */
export class SystemManager {
  private systems: Map<string, GameSystem> = new Map();
  private systemOrder: string[] = [];
  private initialized = false;
  private running = false;

  /**
   * Register a new system
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

// Singleton instance
export const systemManager = new SystemManager();

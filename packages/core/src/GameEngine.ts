/**
 * Main game engine for English Learning Town
 * Orchestrates all game systems, manages the game loop, and handles core game state
 */

import { GameSystem, SystemManager, systemManager } from './GameSystem';
import { eventBus, CoreEvents } from './EventBus';

export interface GameEngineConfig {
  targetFPS: number;
  enableVSync: boolean;
  enableDebug: boolean;
  maxDeltaTime: number;
}

export interface GameEngineStats {
  fps: number;
  deltaTime: number;
  frameCount: number;
  uptime: number;
  systemStats: ReturnType<SystemManager['getStats']>;
}

export enum GameState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export class GameEngine {
  private config: GameEngineConfig;
  private state: GameState = GameState.UNINITIALIZED;
  private systemManager: SystemManager;

  // Game loop variables
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private accumulator = 0;
  private targetFrameTime: number;

  // Stats tracking
  private frameCount = 0;
  private fpsCalculationTime = 0;
  private currentFPS = 0;
  private startTime = 0;
  private lastDeltaTime = 0;

  // Error handling
  private errorCallback?: (error: Error) => void;

  constructor(config: Partial<GameEngineConfig> = {}) {
    this.config = {
      targetFPS: 60,
      enableVSync: true,
      enableDebug: false,
      maxDeltaTime: 1000 / 20, // 20 FPS minimum
      ...config,
    };

    this.targetFrameTime = 1000 / this.config.targetFPS;
    this.systemManager = systemManager;

    // Bind methods to preserve context
    this.gameLoop = this.gameLoop.bind(this);
    this.handleError = this.handleError.bind(this);

    // Set up error handling
    this.setupErrorHandling();
  }

  /**
   * Initialize the game engine and all systems
   */
  async initialize(): Promise<void> {
    if (this.state !== GameState.UNINITIALIZED) {
      throw new Error(
        `Cannot initialize game engine from state: ${this.state}`
      );
    }

    this.setState(GameState.INITIALIZING);

    try {
      // Initialize all registered systems
      await this.systemManager.initializeAll();

      this.setState(GameState.INITIALIZED);

      eventBus.emit(CoreEvents.ENGINE_INITIALIZED, {
        level: 'info',
        message: 'Game engine initialized successfully',
        system: 'GameEngine',
      });
    } catch (error) {
      this.setState(GameState.ERROR);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Start the game engine and begin the game loop
   */
  start(): void {
    if (
      this.state !== GameState.INITIALIZED &&
      this.state !== GameState.STOPPED
    ) {
      throw new Error(`Cannot start game engine from state: ${this.state}`);
    }

    this.setState(GameState.STARTING);

    try {
      // Start all systems
      this.systemManager.startAll();

      // Initialize timing
      this.startTime = performance.now();
      this.lastFrameTime = this.startTime;
      this.frameCount = 0;
      this.fpsCalculationTime = this.startTime;
      this.currentFPS = 0;

      // Start the game loop
      this.startGameLoop();

      this.setState(GameState.RUNNING);

      eventBus.emit(CoreEvents.ENGINE_STARTED, {
        level: 'info',
        message: 'Game engine started',
        system: 'GameEngine',
      });
    } catch (error) {
      this.setState(GameState.ERROR);
      this.handleError(error as Error);
    }
  }

  /**
   * Pause the game engine
   */
  pause(): void {
    if (this.state !== GameState.RUNNING) {
      console.warn(`Cannot pause game engine from state: ${this.state}`);
      return;
    }

    this.setState(GameState.PAUSED);

    eventBus.emit(CoreEvents.ENGINE_PAUSED, {
      uptime: this.getUptime(),
      frameCount: this.frameCount,
    });
  }

  /**
   * Resume the game engine from paused state
   */
  resume(): void {
    if (this.state !== GameState.PAUSED) {
      console.warn(`Cannot resume game engine from state: ${this.state}`);
      return;
    }

    this.setState(GameState.RUNNING);

    // Reset timing to prevent large delta time
    this.lastFrameTime = performance.now();

    eventBus.emit(CoreEvents.ENGINE_RESUMED, {
      uptime: this.getUptime(),
      frameCount: this.frameCount,
    });
  }

  /**
   * Stop the game engine
   */
  stop(): void {
    if (
      this.state === GameState.STOPPED ||
      this.state === GameState.UNINITIALIZED
    ) {
      return;
    }

    this.setState(GameState.STOPPING);

    try {
      // Stop the game loop
      this.stopGameLoop();

      // Stop all systems
      this.systemManager.stopAll();

      this.setState(GameState.STOPPED);

      eventBus.emit(CoreEvents.ENGINE_STOPPED, {
        level: 'info',
        message: 'Game engine stopped',
        system: 'GameEngine',
      });
    } catch (error) {
      this.setState(GameState.ERROR);
      this.handleError(error as Error);
    }
  }

  /**
   * Cleanup the game engine and all systems
   */
  async cleanup(): Promise<void> {
    this.stop();

    try {
      await this.systemManager.cleanupAll();

      this.setState(GameState.UNINITIALIZED);

      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'info',
        message: 'Game engine cleaned up',
        system: 'GameEngine',
      });
    } catch (error) {
      this.setState(GameState.ERROR);
      this.handleError(error as Error);
    }
  }

  /**
   * Register a system with the engine
   */
  registerSystem(system: GameSystem): void {
    this.systemManager.registerSystem(system);
  }

  /**
   * Unregister a system from the engine
   */
  async unregisterSystem(systemName: string): Promise<void> {
    await this.systemManager.unregisterSystem(systemName);
  }

  /**
   * Get a system by name
   */
  getSystem<T extends GameSystem>(systemName: string): T | undefined {
    return this.systemManager.getSystem<T>(systemName);
  }

  /**
   * Get current engine state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Get engine configuration
   */
  getConfig(): Readonly<GameEngineConfig> {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(newConfig: Partial<GameEngineConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Update target frame time if FPS changed
    if (newConfig.targetFPS && newConfig.targetFPS !== oldConfig.targetFPS) {
      this.targetFrameTime = 1000 / this.config.targetFPS;
    }

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'info',
      message: 'Game engine configuration updated',
      system: 'GameEngine',
      data: { oldConfig, newConfig: this.config },
    });
  }

  /**
   * Get engine statistics
   */
  getStats(): GameEngineStats {
    return {
      fps: this.currentFPS,
      deltaTime: this.lastDeltaTime,
      frameCount: this.frameCount,
      uptime: this.getUptime(),
      systemStats: this.systemManager.getStats(),
    };
  }

  /**
   * Set error callback
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  private startGameLoop(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    const loop = () => {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    loop();
  }

  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop(currentTime: number): void {
    if (this.state !== GameState.RUNNING) {
      return;
    }

    try {
      // Calculate delta time
      const rawDeltaTime = currentTime - this.lastFrameTime;
      const deltaTime = Math.min(rawDeltaTime, this.config.maxDeltaTime);
      this.lastDeltaTime = deltaTime;
      this.lastFrameTime = currentTime;

      // Update frame count and FPS
      this.frameCount++;
      if (currentTime - this.fpsCalculationTime >= 1000) {
        this.currentFPS = Math.round(
          (this.frameCount * 1000) / (currentTime - this.fpsCalculationTime)
        );
        this.frameCount = 0;
        this.fpsCalculationTime = currentTime;
      }

      // Fixed timestep with accumulator for consistent updates
      this.accumulator += deltaTime;

      while (this.accumulator >= this.targetFrameTime) {
        // Update all systems
        this.systemManager.updateAll(this.targetFrameTime, currentTime);
        this.accumulator -= this.targetFrameTime;
      }

      // Continue the loop
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    } catch (error) {
      this.setState(GameState.ERROR);
      this.handleError(error as Error);
    }
  }

  private setState(newState: GameState): void {
    const oldState = this.state;
    this.state = newState;

    if (this.config.enableDebug) {
      eventBus.emit(CoreEvents.DEBUG_LOG, {
        level: 'debug',
        message: `Game engine state changed: ${oldState} -> ${newState}`,
        system: 'GameEngine',
      });
    }
  }

  private getUptime(): number {
    if (this.startTime === 0) {
      return 0;
    }
    return performance.now() - this.startTime;
  }

  private handleError(error: Error): void {
    eventBus.emit(CoreEvents.ERROR_OCCURRED, {
      error,
      context: 'GameEngine',
      state: this.state,
      uptime: this.getUptime(),
    });

    if (this.errorCallback) {
      this.errorCallback(error);
    } else {
      console.error('Game Engine Error:', error);
    }
  }

  private setupErrorHandling(): void {
    // Global error handling
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason));
    });
  }
}

// Export singleton instance
export const gameEngine = new GameEngine();

import { GameEngine as IGameEngine, GameSystem } from '@english-learning-town/types';
import { gameEventBus } from './EventBus';

/**
 * Core game engine implementation using best practices
 * - Uses Mitt-based event system for reliability
 * - Clean, focused responsibilities
 * - Type-safe event handling
 */
export class GameEngine implements IGameEngine {
  private systems = new Map<string, GameSystem>();
  private isRunning = false;
  private isPaused = false;
  private lastFrameTime = 0;
  private animationFrameId: number | null = null;

  constructor() {
    this.update = this.update.bind(this);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize systems in priority order
      const sortedSystems = Array.from(this.systems.values())
        .sort((a, b) => b.priority - a.priority);

      for (const system of sortedSystems) {
        await system.initialize();
      }

      gameEventBus.emit('engine:initialized', {});
    } catch (error) {
      gameEventBus.emit('engine:error', { error: error as Error });
      throw error;
    }
  }

  registerSystem(system: GameSystem): void {
    if (this.systems.has(system.name)) {
      console.warn(`System ${system.name} is already registered`);
      return;
    }

    this.systems.set(system.name, system);
  }

  unregisterSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (system) {
      system.cleanup();
      this.systems.delete(systemName);
    }
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.update);
    
    gameEventBus.emit('engine:started', {});
  }

  pause(): void {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    gameEventBus.emit('engine:paused', {});
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.update);

    gameEventBus.emit('engine:resumed', {});
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Cleanup all systems
    this.systems.forEach(system => system.cleanup());

    gameEventBus.emit('engine:stopped', {});
  }

  private update(currentTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update all systems
    this.systems.forEach(system => {
      try {
        system.update(deltaTime);
      } catch (error) {
        gameEventBus.emit('system:error', { 
          systemName: system.name, 
          error: error as Error 
        });
      }
    });

    this.render();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.update);
  }

  private render(): void {
    // Rendering is handled by React components in our architecture
    // This method can be used for any global rendering logic
  }

  getSystem<T extends GameSystem>(systemName: string): T | undefined {
    return this.systems.get(systemName) as T;
  }

  get running(): boolean {
    return this.isRunning;
  }

  get paused(): boolean {
    return this.isPaused;
  }
}
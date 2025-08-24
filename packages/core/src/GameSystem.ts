import { GameSystem as IGameSystem } from '@english-learning-town/types';

/**
 * Abstract base class for game systems
 * Provides common functionality and structure for all systems
 */
export abstract class GameSystem implements IGameSystem {
  public readonly name: string;
  public readonly priority: number;
  protected isInitialized = false;

  constructor(name: string, priority: number = 0) {
    this.name = name;
    this.priority = priority;
  }

  /**
   * Initialize the system
   * Must be implemented by subclasses
   */
  abstract initialize(): Promise<void>;

  /**
   * Update the system
   * Must be implemented by subclasses
   */
  abstract update(deltaTime: number): void;

  /**
   * Cleanup the system
   * Must be implemented by subclasses
   */
  abstract cleanup(): void;

  /**
   * Check if system is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Mark system as initialized
   */
  protected setInitialized(): void {
    this.isInitialized = true;
  }
}

/**
 * System priorities for initialization and update order
 */
export enum SystemPriority {
  // High priority systems (initialized first, updated first)
  CONTENT = 100,
  AUDIO = 90,
  INPUT = 80,
  
  // Medium priority systems
  DIALOGUE = 50,
  QUEST = 40,
  INVENTORY = 30,
  LOCATION = 20,
  
  // Low priority systems (initialized last, updated last)
  UI = 10,
  DEBUG = 0
}
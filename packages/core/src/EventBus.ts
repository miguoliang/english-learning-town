import mitt, { Emitter } from 'mitt';

/**
 * Game events type definition for type-safe event handling
 */
export interface GameEvents {
  'engine:initialized': Record<string, never>;
  'engine:started': Record<string, never>;
  'engine:paused': Record<string, never>;
  'engine:resumed': Record<string, never>;
  'engine:stopped': Record<string, never>;
  'engine:error': { error: Error };
  'system:error': { systemName: string; error: Error };
  // Add more specific events as needed
}

/**
 * Event bus singleton using Mitt for optimal performance and reliability
 * 
 * Best practices:
 * - Uses mature, battle-tested Mitt library (200 bytes)
 * - Full TypeScript support with strongly typed events
 * - Singleton pattern for global access
 * - No custom implementations - leverages proven solution
 */
export class EventBus {
  private static instance: EventBus;
  private readonly emitter: Emitter<GameEvents>;

  private constructor() {
    this.emitter = mitt<GameEvents>();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event with type safety
   */
  on<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void {
    this.emitter.on(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof GameEvents>(event: K, handler?: (payload: GameEvents[K]) => void): void {
    this.emitter.off(event, handler);
  }

  /**
   * Emit an event with type safety
   */
  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.emitter.all.clear();
  }

  /**
   * Get the underlying Mitt emitter for advanced usage
   */
  get mitt(): Emitter<GameEvents> {
    return this.emitter;
  }
}

/**
 * Export a convenient instance for immediate use
 */
export const gameEventBus = EventBus.getInstance();
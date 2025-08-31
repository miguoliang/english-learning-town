/**
 * Centralized event bus system for the English Learning Town game
 * Built on top of mitt - a tiny, functional event emitter library
 * Handles all game events, component communication, and state synchronization
 */

import mitt, { Emitter } from 'mitt';
import {
  LoggerFactory,
  LogLevel,
  LogEntry,
} from '@english-learning-town/logger';

export type EventHandler<T = any> = (data: T) => void;

export interface CoreGameEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  id: string;
}

export interface GameEventMap extends Record<string | symbol, unknown> {
  [key: string]: any;
}

export class EventBus {
  private emitter: Emitter<GameEventMap>;
  private eventHistory: CoreGameEvent[] = [];
  private maxHistorySize = 1000;
  private debugMode = false;
  private logger = LoggerFactory.getLogger('EventBus');

  constructor(enableDebug = false) {
    this.emitter = mitt<GameEventMap>();
    this.debugMode = enableDebug;

    // Set up logger integration - forward debug logs to event bus
    this.logger.setCustomOutputHandler((entry: LogEntry) => {
      // Only forward non-debug events to avoid circular logging
      if (entry.level >= LogLevel.INFO) {
        this.emit(CoreEvents.DEBUG_LOG, {
          level: LogLevel[entry.level].toLowerCase(),
          message: entry.message,
          system: entry.system,
          context: entry.context,
          data: entry.data,
        });
      }
    });
  }

  /**
   * Subscribe to an event type
   */
  on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      try {
        handler(data);
      } catch (error) {
        this.logger.error(
          `Error in event handler for ${eventType}`,
          'EventBus',
          { eventType, originalData: data },
          error as Error
        );
        this.emit('error:handler', { error, eventType, originalData: data });
      }
    };

    this.emitter.on(eventType, wrappedHandler);

    // Return unsubscribe function
    return () => {
      this.emitter.off(eventType, wrappedHandler);
    };
  }

  /**
   * Subscribe to an event type, but only handle it once
   */
  once<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      try {
        handler(data);
        this.emitter.off(eventType, wrappedHandler);
      } catch (error) {
        this.logger.error(
          `Error in one-time event handler for ${eventType}`,
          'EventBus',
          { eventType, originalData: data },
          error as Error
        );
        this.emit('error:handler', { error, eventType, originalData: data });
      }
    };

    this.emitter.on(eventType, wrappedHandler);

    // Return unsubscribe function (in case they want to cancel before it fires)
    return () => {
      this.emitter.off(eventType, wrappedHandler);
    };
  }

  /**
   * Unsubscribe from an event type
   */
  off<T = any>(eventType: string, handler?: EventHandler<T>): void {
    this.emitter.off(eventType, handler);
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(eventType: string, data?: T): void {
    const event: CoreGameEvent<T> = {
      type: eventType,
      data: data as T,
      timestamp: Date.now(),
      id: `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to history (skip internal events to prevent infinite loops)
    if (!eventType.startsWith('debug:') && !eventType.startsWith('internal:')) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    // Debug logging through logger system
    if (this.debugMode && !eventType.startsWith('debug:')) {
      this.logger.debug(`Event emitted: ${eventType}`, 'EventBus', data);
    }

    // Emit through mitt
    this.emitter.emit(eventType, data);
  }

  /**
   * Get event history for debugging
   */
  getHistory(eventType?: string): CoreGameEvent[] {
    if (eventType) {
      return this.eventHistory.filter((event) => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get all active event types
   */
  getActiveEventTypes(): string[] {
    // Mitt doesn't expose this directly, so we'll track from history
    const eventTypes = new Set(this.eventHistory.map((event) => event.type));
    return Array.from(eventTypes);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.emitter.all.clear();
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get debug mode status
   */
  isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Get the underlying mitt emitter (for advanced usage)
   */
  getEmitter(): Emitter<GameEventMap> {
    return this.emitter;
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    uniqueEventTypes: number;
    historySize: number;
    activeListeners: number;
  } {
    return {
      totalEvents: this.eventHistory.length,
      uniqueEventTypes: this.getActiveEventTypes().length,
      historySize: this.maxHistorySize,
      activeListeners: this.emitter.all.size,
    };
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Core system events (generic, reusable)
export const CoreEvents = {
  // System lifecycle events
  SYSTEM_INITIALIZED: 'system:initialized',
  SYSTEM_STARTED: 'system:started',
  SYSTEM_STOPPED: 'system:stopped',
  SYSTEM_ERROR: 'system:error',

  // Engine events
  ENGINE_INITIALIZED: 'engine:initialized',
  ENGINE_STARTED: 'engine:started',
  ENGINE_PAUSED: 'engine:paused',
  ENGINE_RESUMED: 'engine:resumed',
  ENGINE_STOPPED: 'engine:stopped',

  // Generic error and debug events
  ERROR_OCCURRED: 'error:occurred',
  DEBUG_LOG: 'debug:log',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Note: Application-specific events have been moved to maintain SRP
// The core package now only contains generic, reusable events
// Game-specific events should be defined in the application layer

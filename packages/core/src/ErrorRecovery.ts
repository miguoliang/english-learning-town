/**
 * Error recovery and resilience system for the game engine
 * Provides patterns for graceful error handling and system recovery
 */

import { eventBus, CoreEvents } from './EventBus';
import { LoggerFactory } from '@english-learning-town/logger';

export interface ErrorContext {
  system: string;
  operation: string;
  timestamp: number;
  severity: ErrorSeverity;
  recoverable: boolean;
  metadata?: Record<string, any>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface RecoveryStrategy {
  name: string;
  canRecover: (error: Error, context: ErrorContext) => boolean;
  recover: (error: Error, context: ErrorContext) => Promise<boolean>;
  maxAttempts: number;
  backoffMs: number;
}

export class ErrorRecoveryManager {
  private logger = LoggerFactory.getLogger('ErrorRecovery');
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private lastAttemptTime: Map<string, number> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.logger.debug(`Registered recovery strategy: ${strategy.name}`);
  }

  /**
   * Handle an error with automatic recovery attempts
   */
  async handleError(
    error: Error,
    context: ErrorContext,
    fallback?: () => Promise<void>
  ): Promise<boolean> {
    const errorKey = `${context.system}:${context.operation}`;

    this.logger.error(
      `Error in ${context.system}.${context.operation}`,
      'ErrorRecovery',
      { error: error.message, context },
      error
    );

    // Emit error event
    eventBus.emit(CoreEvents.ERROR_OCCURRED, {
      error,
      context,
      timestamp: Date.now(),
    });

    // Don't attempt recovery for non-recoverable errors
    if (!context.recoverable) {
      this.logger.warn(`Error marked as non-recoverable: ${errorKey}`);
      if (fallback) {
        await fallback();
      }
      return false;
    }

    // Try recovery strategies
    for (const strategy of this.strategies.values()) {
      if (!strategy.canRecover(error, context)) {
        continue;
      }

      const attempts =
        this.recoveryAttempts.get(`${errorKey}:${strategy.name}`) || 0;
      const lastAttempt =
        this.lastAttemptTime.get(`${errorKey}:${strategy.name}`) || 0;

      // Check if we've exceeded max attempts
      if (attempts >= strategy.maxAttempts) {
        this.logger.warn(
          `Max recovery attempts reached for ${errorKey} using ${strategy.name}`,
          'ErrorRecovery'
        );
        continue;
      }

      // Check if enough time has passed since last attempt (backoff)
      const now = Date.now();
      if (now - lastAttempt < strategy.backoffMs) {
        this.logger.debug(
          `Backoff period not elapsed for ${errorKey} using ${strategy.name}`,
          'ErrorRecovery'
        );
        continue;
      }

      try {
        this.logger.info(
          `Attempting recovery for ${errorKey} using ${strategy.name} (attempt ${attempts + 1}/${strategy.maxAttempts})`,
          'ErrorRecovery'
        );

        const recovered = await strategy.recover(error, context);

        this.recoveryAttempts.set(`${errorKey}:${strategy.name}`, attempts + 1);
        this.lastAttemptTime.set(`${errorKey}:${strategy.name}`, now);

        if (recovered) {
          this.logger.info(
            `Successfully recovered from error in ${errorKey} using ${strategy.name}`,
            'ErrorRecovery'
          );

          // Reset attempt counter on successful recovery
          this.recoveryAttempts.delete(`${errorKey}:${strategy.name}`);
          return true;
        } else {
          this.logger.warn(
            `Recovery attempt failed for ${errorKey} using ${strategy.name}`,
            'ErrorRecovery'
          );
        }
      } catch (recoveryError) {
        this.logger.error(
          `Recovery strategy ${strategy.name} threw an error for ${errorKey}`,
          'ErrorRecovery',
          {
            originalError: error.message,
            recoveryError: (recoveryError as Error).message,
          },
          recoveryError as Error
        );
      }
    }

    // All recovery strategies failed
    this.logger.error(
      `All recovery strategies failed for ${errorKey}`,
      'ErrorRecovery',
      { context }
    );

    if (fallback) {
      try {
        await fallback();
        this.logger.info(
          `Fallback executed successfully for ${errorKey}`,
          'ErrorRecovery'
        );
      } catch (fallbackError) {
        this.logger.error(
          `Fallback failed for ${errorKey}`,
          'ErrorRecovery',
          { fallbackError: (fallbackError as Error).message },
          fallbackError as Error
        );
      }
    }

    return false;
  }

  /**
   * Create an error context
   */
  createContext(
    system: string,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable: boolean = true,
    metadata?: Record<string, any>
  ): ErrorContext {
    return {
      system,
      operation,
      timestamp: Date.now(),
      severity,
      recoverable,
      metadata,
    };
  }

  /**
   * Clear recovery attempt history for a specific error
   */
  clearRecoveryHistory(system: string, operation?: string): void {
    const prefix = operation ? `${system}:${operation}` : system;

    for (const key of this.recoveryAttempts.keys()) {
      if (key.startsWith(prefix)) {
        this.recoveryAttempts.delete(key);
        this.lastAttemptTime.delete(key);
      }
    }

    this.logger.debug(
      `Cleared recovery history for ${prefix}`,
      'ErrorRecovery'
    );
  }

  /**
   * Register default recovery strategies
   */
  private registerDefaultStrategies(): void {
    // Retry strategy - simple retry with exponential backoff
    this.registerStrategy({
      name: 'retry',
      canRecover: (error, context) =>
        context.severity !== ErrorSeverity.CRITICAL,
      recover: async (_error, _context) => {
        // For now, just return false as retry logic should be implemented
        // by the calling system. This strategy mainly provides backoff timing.
        return false;
      },
      maxAttempts: 3,
      backoffMs: 1000,
    });

    // Reset strategy - try to reset the system to a known good state
    this.registerStrategy({
      name: 'reset',
      canRecover: (error, context) =>
        context.severity === ErrorSeverity.HIGH &&
        context.metadata?.supportsReset === true,
      recover: async (error, context) => {
        // Emit a reset event that systems can listen to
        eventBus.emit(CoreEvents.SYSTEM_ERROR, {
          action: 'reset',
          system: context.system,
          error,
        });
        return true;
      },
      maxAttempts: 2,
      backoffMs: 2000,
    });

    // Graceful degradation strategy
    this.registerStrategy({
      name: 'degrade',
      canRecover: (error, context) =>
        context.metadata?.supportsDegradation === true,
      recover: async (error, context) => {
        // Emit a degradation event
        eventBus.emit(CoreEvents.SYSTEM_ERROR, {
          action: 'degrade',
          system: context.system,
          error,
        });
        return true;
      },
      maxAttempts: 1,
      backoffMs: 0,
    });
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    activeRecoveries: number;
    strategyCounts: Record<string, number>;
  } {
    const strategyCounts: Record<string, number> = {};
    let totalAttempts = 0;
    let activeRecoveries = 0;

    for (const [key, attempts] of this.recoveryAttempts.entries()) {
      totalAttempts += attempts;
      activeRecoveries++;

      const strategyName = key.split(':').pop() || 'unknown';
      strategyCounts[strategyName] =
        (strategyCounts[strategyName] || 0) + attempts;
    }

    return {
      totalAttempts,
      activeRecoveries,
      strategyCounts,
    };
  }
}

// Singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

/**
 * Utility function to wrap operations with error recovery
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const recovered = await errorRecoveryManager.handleError(
      error as Error,
      context,
      fallback
        ? async () => {
            await fallback();
          }
        : undefined
    );

    if (!recovered && fallback) {
      return await fallback();
    }

    return undefined;
  }
}

/**
 * Decorator for automatic error recovery (for class methods)
 */
export function withRecovery(
  system: string,
  operation: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  recoverable: boolean = true
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context = errorRecoveryManager.createContext(
        system,
        operation || propertyKey,
        severity,
        recoverable,
        { method: propertyKey, args }
      );

      return withErrorRecovery(() => originalMethod.apply(this, args), context);
    };

    return descriptor;
  };
}

/**
 * Comprehensive logging system with multiple output targets
 * Designed to be framework-agnostic and reusable across different applications
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  system: string;
  context?: string;
  data?: any;
  stackTrace?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableHistory: boolean;
  maxHistorySize: number;
  enableCustomOutput: boolean;
  customOutputHandler?: (entry: LogEntry) => void;
  formatMessage?: (entry: LogEntry) => string;
}

export class Logger {
  private config: LoggerConfig;
  private history: LogEntry[] = [];
  private systemName: string;

  constructor(systemName: string, config: Partial<LoggerConfig> = {}) {
    this.systemName = systemName;
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableHistory: true,
      maxHistorySize: 1000,
      enableCustomOutput: false,
      ...config,
    };
  }

  /**
   * Log a trace message (very detailed debug information)
   */
  trace(message: string, context?: string, data?: any): void {
    this.log(LogLevel.TRACE, message, context, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: Date.now(),
      system: this.systemName,
      context,
      data,
      stackTrace: error?.stack,
    };

    this.processLogEntry(entry);
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      level: LogLevel.FATAL,
      message,
      timestamp: Date.now(),
      system: this.systemName,
      context,
      data,
      stackTrace: error?.stack,
    };

    this.processLogEntry(entry);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      system: this.systemName,
      context,
      data,
    };

    this.processLogEntry(entry);
  }

  /**
   * Process a log entry through all configured outputs
   */
  private processLogEntry(entry: LogEntry): void {
    // Add to history
    if (this.config.enableHistory) {
      this.history.push(entry);
      if (this.history.length > this.config.maxHistorySize) {
        this.history.shift();
      }
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Custom output handler
    if (this.config.enableCustomOutput && this.config.customOutputHandler) {
      try {
        this.config.customOutputHandler(entry);
      } catch (error) {
        // Avoid infinite loops by not logging this error
        console.error('Logger custom output handler error:', error);
      }
    }
  }

  /**
   * Output log entry to console
   */
  private logToConsole(entry: LogEntry): void {
    const message = this.config.formatMessage
      ? this.config.formatMessage(entry)
      : this.formatDefaultMessage(entry);

    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.data) {
      consoleMethod(message, entry.data);
    } else {
      consoleMethod(message);
    }

    if (entry.stackTrace) {
      console.error('Stack trace:', entry.stackTrace);
    }
  }

  /**
   * Default message formatting
   */
  private formatDefaultMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.system}]`;

    let message = `${prefix} ${entry.message}`;
    if (entry.context) {
      message += ` (${entry.context})`;
    }

    return message;
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.history.filter((entry) => entry.level === level);
    }
    return [...this.history];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }

  /**
   * Set a custom output handler
   */
  setCustomOutputHandler(handler: (entry: LogEntry) => void): void {
    this.config.customOutputHandler = handler;
    this.config.enableCustomOutput = true;
  }

  /**
   * Remove custom output handler
   */
  removeCustomOutputHandler(): void {
    this.config.customOutputHandler = undefined;
    this.config.enableCustomOutput = false;
  }
}

/**
 * Global logger factory for managing multiple loggers
 */
export class LoggerFactory {
  private static loggers: Map<string, Logger> = new Map();
  private static globalConfig: Partial<LoggerConfig> = {};

  /**
   * Get or create a logger for a system
   */
  static getLogger(systemName: string, config?: Partial<LoggerConfig>): Logger {
    if (!this.loggers.has(systemName)) {
      const mergedConfig = { ...this.globalConfig, ...config };
      this.loggers.set(systemName, new Logger(systemName, mergedConfig));
    }
    return this.loggers.get(systemName)!;
  }

  /**
   * Update global logger configuration
   */
  static setGlobalConfig(config: Partial<LoggerConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };

    // Update existing loggers
    for (const logger of this.loggers.values()) {
      logger.updateConfig(config);
    }
  }

  /**
   * Set a global custom output handler for all loggers
   */
  static setGlobalCustomOutputHandler(
    handler: (entry: LogEntry) => void
  ): void {
    this.setGlobalConfig({
      enableCustomOutput: true,
      customOutputHandler: handler,
    });
  }

  /**
   * Remove global custom output handler
   */
  static removeGlobalCustomOutputHandler(): void {
    this.setGlobalConfig({
      enableCustomOutput: false,
      customOutputHandler: undefined,
    });
  }

  /**
   * Get all active loggers
   */
  static getAllLoggers(): Logger[] {
    return Array.from(this.loggers.values());
  }

  /**
   * Get combined history from all loggers
   */
  static getCombinedHistory(): LogEntry[] {
    const allEntries: LogEntry[] = [];
    for (const logger of this.loggers.values()) {
      allEntries.push(...logger.getHistory());
    }

    // Sort by timestamp
    return allEntries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clear all loggers and their history
   */
  static clearAll(): void {
    for (const logger of this.loggers.values()) {
      logger.clearHistory();
    }
    this.loggers.clear();
  }

  /**
   * Get logger statistics
   */
  static getStats(): {
    totalLoggers: number;
    totalEntries: number;
    entriesByLevel: Record<string, number>;
  } {
    const stats = {
      totalLoggers: this.loggers.size,
      totalEntries: 0,
      entriesByLevel: {} as Record<string, number>,
    };

    for (const logger of this.loggers.values()) {
      const history = logger.getHistory();
      stats.totalEntries += history.length;

      for (const entry of history) {
        const levelName = LogLevel[entry.level];
        stats.entriesByLevel[levelName] =
          (stats.entriesByLevel[levelName] || 0) + 1;
      }
    }

    return stats;
  }
}

/**
 * Utility functions for common logging patterns
 */
export const LoggerUtils = {
  /**
   * Create a performance logger that measures execution time
   */
  createPerformanceLogger: (systemName: string) => {
    const logger = LoggerFactory.getLogger(`${systemName}-Performance`);

    return {
      time: (label: string) => {
        const start = performance.now();
        return {
          end: () => {
            const duration = performance.now() - start;
            logger.debug(`${label} completed`, 'Performance', {
              duration: `${duration.toFixed(2)}ms`,
            });
          },
        };
      },

      measure: async <T>(
        label: string,
        operation: () => Promise<T>
      ): Promise<T> => {
        const start = performance.now();
        try {
          const result = await operation();
          const duration = performance.now() - start;
          logger.info(`${label} completed successfully`, 'Performance', {
            duration: `${duration.toFixed(2)}ms`,
          });
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          logger.error(
            `${label} failed`,
            'Performance',
            {
              duration: `${duration.toFixed(2)}ms`,
              error: (error as Error).message,
            },
            error as Error
          );
          throw error;
        }
      },
    };
  },

  /**
   * Create a structured logger with predefined context
   */
  createStructuredLogger: (
    systemName: string,
    context: Record<string, any>
  ) => {
    const logger = LoggerFactory.getLogger(systemName);

    return {
      trace: (message: string, data?: any) =>
        logger.trace(message, JSON.stringify(context), { ...context, ...data }),
      debug: (message: string, data?: any) =>
        logger.debug(message, JSON.stringify(context), { ...context, ...data }),
      info: (message: string, data?: any) =>
        logger.info(message, JSON.stringify(context), { ...context, ...data }),
      warn: (message: string, data?: any) =>
        logger.warn(message, JSON.stringify(context), { ...context, ...data }),
      error: (message: string, data?: any, error?: Error) =>
        logger.error(
          message,
          JSON.stringify(context),
          { ...context, ...data },
          error
        ),
      fatal: (message: string, data?: any, error?: Error) =>
        logger.fatal(
          message,
          JSON.stringify(context),
          { ...context, ...data },
          error
        ),
    };
  },
};

/**
 * Comprehensive logging system for applications
 * Provides structured logging with multiple output targets and flexible configuration
 */

export { Logger, LoggerFactory, LoggerUtils, LogLevel } from './Logger';

export type { LogEntry, LoggerConfig } from './Logger';

// Import for creating default logger
import { LoggerFactory } from './Logger';

// Create a default logger instance for convenience
export const defaultLogger = LoggerFactory.getLogger('Default');

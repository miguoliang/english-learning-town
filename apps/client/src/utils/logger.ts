/**
 * Development Logger - Only logs in development mode
 * Provides clean console output with emoji prefixes
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const prefix = this.getPrefix(level);
    const timestamp = new Date().toLocaleTimeString();
    
    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ${prefix} ${message}`, ...args);
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${prefix} ${message}`, ...args);
        break;
      case 'debug':
        console.debug(`[${timestamp}] ${prefix} ${message}`, ...args);
        break;
      default:
        console.log(`[${timestamp}] ${prefix} ${message}`, ...args);
    }
  }

  private getPrefix(level: LogLevel): string {
    switch (level) {
      case 'info': return '🎮';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🔍';
      default: return '🎮';
    }
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  // Game-specific convenience methods
  ecs(message: string, ...args: unknown[]): void {
    this.log('info', `🌍 ECS: ${message}`, ...args);
  }

  scene(message: string, ...args: unknown[]): void {
    this.log('info', `🏙️ Scene: ${message}`, ...args);
  }

  player(message: string, ...args: unknown[]): void {
    this.log('info', `🧑 Player: ${message}`, ...args);
  }

  achievement(message: string, ...args: unknown[]): void {
    this.log('info', `🏆 Achievement: ${message}`, ...args);
  }
}

export const logger = new Logger();
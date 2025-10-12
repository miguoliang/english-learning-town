import { DebugConfig } from '../systems/DebugSystem';

/**
 * Environment-based debug configurations
 */
export const DEBUG_CONFIGURATIONS = {
  /** Development mode - all debug features enabled */
  development: {
    showGrid: true,
    showTileIndicator: true,
    testCoordinates: true,
    debugMovement: true,
    showDoorHighlights: true,
  } as DebugConfig,

  /** Testing mode - minimal debug for testing */
  testing: {
    showGrid: false,
    showTileIndicator: true,
    testCoordinates: true,
    debugMovement: false,
    showDoorHighlights: false,
  } as DebugConfig,

  /** Production mode - all debug features disabled */
  production: {
    showGrid: false,
    showTileIndicator: false,
    testCoordinates: false,
    debugMovement: false,
    showDoorHighlights: false,
  } as DebugConfig,

  /** Demo mode - visual debug only */
  demo: {
    showGrid: true,
    showTileIndicator: true,
    testCoordinates: false,
    debugMovement: false,
    showDoorHighlights: false,
  } as DebugConfig,
} as const;

/**
 * Get debug configuration based on environment
 * @param env - Environment name (defaults to 'development')
 * @returns Debug configuration for the environment
 */
export function getDebugConfig(env: keyof typeof DEBUG_CONFIGURATIONS = 'development'): DebugConfig {
  return DEBUG_CONFIGURATIONS[env] || DEBUG_CONFIGURATIONS.development;
}

/**
 * Get current environment from process.env or default to development
 * @returns Current environment name
 */
export function getCurrentEnvironment(): keyof typeof DEBUG_CONFIGURATIONS {
  // Check various environment variables
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : '';
  const viteMode = typeof import.meta !== 'undefined' ? import.meta.env?.MODE : '';

  // Map common environment values
  if (nodeEnv === 'production' || viteMode === 'production') {
    return 'production';
  }
  if (nodeEnv === 'test' || viteMode === 'test') {
    return 'testing';
  }
  if (viteMode === 'demo') {
    return 'demo';
  }

  // Default to development
  return 'development';
}

/**
 * Get debug configuration for current environment
 * @returns Debug configuration
 */
export function getCurrentDebugConfig(): DebugConfig {
  return getDebugConfig(getCurrentEnvironment());
}

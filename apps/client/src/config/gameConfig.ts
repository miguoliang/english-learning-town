/**
 * Game Configuration
 * Centralized configuration for game settings
 */

interface GameConfig {
  // Visual settings
  display: {
    showGrid: boolean;
    cellSize: number;
    gridOpacity: number;
  };

  // Performance settings
  performance: {
    renderFPS: number; // How often to check for render updates (divide 60 by this)
    logFrequency: number; // How often to log debug info (frames)
  };

  // Debug settings
  debug: {
    enabled: boolean;
    showEntityInfo: boolean;
    showSystemLogs: boolean;
  };

  // Game mechanics
  gameplay: {
    playerSpeed: number;
    defaultPlayerPosition: { x: number; y: number };
    defaultScenePath: string;
    defaultPlayerName: string;
  };

  // Scene loading
  scenes: {
    retryAttempts: number;
    timeoutMs: number;
    defaultGridSize: { width: number; height: number };
  };

  // Audio settings
  audio: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  };
}

// Default configuration
const defaultConfig: GameConfig = {
  display: {
    showGrid: true, // Show grid by default for development
    cellSize: 40,
    gridOpacity: 0.1,
  },

  performance: {
    renderFPS: 15, // Check for render updates at 15 FPS (every 4 frames)
    logFrequency: 60, // Log debug info once per second
  },

  debug: {
    enabled: process.env.NODE_ENV === "development",
    showEntityInfo: false,
    showSystemLogs: process.env.NODE_ENV === "development",
  },

  gameplay: {
    playerSpeed: 5,
    defaultPlayerPosition: { x: 10, y: 10 },
    defaultScenePath: "/data/scenes/town.json",
    defaultPlayerName: "Player",
  },

  scenes: {
    retryAttempts: 3,
    timeoutMs: 5000,
    defaultGridSize: { width: 800, height: 600 },
  },

  audio: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    muted: false,
  },
};

// Environment-specific overrides
const getEnvironmentConfig = (): Partial<GameConfig> => {
  if (process.env.NODE_ENV === "production") {
    return {
      display: {
        showGrid: false, // Hide grid in production
        cellSize: 40,
        gridOpacity: 0.1,
      },
      debug: {
        enabled: false,
        showEntityInfo: false,
        showSystemLogs: false,
      },
    };
  }

  return {};
};

// Merge default config with environment overrides
export const gameConfig: GameConfig = {
  ...defaultConfig,
  ...getEnvironmentConfig(),
  // Deep merge nested objects
  display: {
    ...defaultConfig.display,
    ...getEnvironmentConfig().display,
  },
  debug: {
    ...defaultConfig.debug,
    ...getEnvironmentConfig().debug,
  },
};

// Utility functions for config access
export const isDebugMode = () => gameConfig.debug.enabled;
export const shouldShowGrid = () => gameConfig.display.showGrid;
export const getCellSize = () => gameConfig.display.cellSize;
export const getPlayerSpeed = () => gameConfig.gameplay.playerSpeed;
export const getDefaultPlayerPosition = () =>
  gameConfig.gameplay.defaultPlayerPosition;
export const getDefaultScenePath = () => gameConfig.gameplay.defaultScenePath;
export const getDefaultPlayerName = () => gameConfig.gameplay.defaultPlayerName;

// Configuration update function (for settings UI later)
export const updateGameConfig = (updates: Partial<GameConfig>) => {
  Object.assign(gameConfig, updates);
};

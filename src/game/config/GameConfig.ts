/**
 * Type definitions for game configuration
 */
interface NPCConfig {
  x: number;
  y: number;
  radius: number;
  color: number;
  emoji: string;
  name: string;
  type: string;
  greeting: string;
  activity: string;
}

interface BuildingConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  sceneKey: string;
}

interface FontStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  align: 'center' | 'left' | 'right';
  stroke?: string;
  strokeThickness?: number;
}

interface InteractionStyle extends FontStyle {
  backgroundColor: string;
  padding: { x: number; y: number };
}

/**
 * Global scale ratio for rendering calculations
 * Calculated at game start, used globally for consistent scaling
 */
let globalScaleRatio: number | null = null;

/**
 * Standard map width in pixels for scale calculation
 * Maps are typically 32 tiles wide at 16px per tile = 512px
 */
const STANDARD_MAP_WIDTH_PX = 512;

/**
 * Initialize the global scale ratio
 * Should be called once at game start (e.g., in Boot or Preloader scene)
 * @param mapWidthInPixels - Width of the reference map in pixels (optional, defaults to 512px standard map width)
 */
export function initializeGlobalScaleRatio(mapWidthInPixels?: number): void {
  if (globalScaleRatio !== null) {
    console.warn('Global scale ratio already initialized. Overwriting with new value.');
  }
  
  // Use standard map width (32 tiles * 16px = 512px) as reference
  // This provides a consistent scale ratio that can be used globally
  const referenceWidth = mapWidthInPixels ?? STANDARD_MAP_WIDTH_PX;
  globalScaleRatio = GameConfig.screenWidth / referenceWidth;
  
  console.log(`Global scale ratio initialized: ${globalScaleRatio.toFixed(4)} (screen: ${GameConfig.screenWidth}px / map: ${referenceWidth}px)`);
}

/**
 * Get the global scale ratio
 * @returns The global scale ratio, or null if not yet initialized
 */
export function getGlobalScaleRatio(): number | null {
  return globalScaleRatio;
}

/**
 * Get the global scale ratio, with fallback to default value if not initialized
 * @param fallback - Fallback value if scale ratio is not initialized (default: 1.0)
 * @returns The global scale ratio, or the fallback value
 */
export function getGlobalScaleRatioOrDefault(fallback: number = 1.0): number {
  return globalScaleRatio ?? fallback;
}

/**
 * Scale a value by the global scale ratio
 * Useful for rendering operations that need to scale sizes, positions, etc.
 * @param value - The value to scale
 * @param fallbackScale - Fallback scale if global scale not initialized (default: 1.0)
 * @returns The scaled value
 */
export function scaleByGlobalRatio(value: number, fallbackScale: number = 1.0): number {
  const scale = getGlobalScaleRatioOrDefault(fallbackScale);
  return value * scale;
}

/**
 * Centralized configuration for the English Learning Town game
 * Using const assertion and proper typing instead of class-only static pattern
 */
export const GameConfig = {
  get screenWidth() {
    return window.visualViewport?.width ?? window.innerWidth;
  },
  get screenHeight() {
    return window.visualViewport?.height ?? window.innerHeight;
  },

  /**
   * Global scale ratio for rendering calculations
   * Access via getGlobalScaleRatio() - initialized at game start
   */
  get globalScaleRatio() {
    return globalScaleRatio;
  },

  PLAYER: {
    SPEED: 200,
    RUN_SPEED_MULTIPLIER: 1.75, // Running is 75% faster than walking
    SCALE: 0.5,
    TINT: 0x4169e1, // Royal blue
    SPRITE_WIDTH: 16, // Actual sprite width from atlas
    SPRITE_HEIGHT: 16, // Actual sprite height from atlas
    COLLISION_WIDTH: 10, // Collision box width (smaller for smoother movement)
    COLLISION_HEIGHT: 10, // Collision box height (smaller for smoother movement)
  },

  COLORS: {
    skyBlue: 0x87ceeb,
    lightGreen: 0x90ee90,
    brownWall: 0x8b4513,
    darkBrown: 0x654321,
    BEIGE: 0xf5f5dc,
    WHEAT: 0xf5deb3,
    aliceBlue: 0xf0f8ff,
    TAN: 0xd2b48c,
    lightGray: 0xf0f0f0,
    LAVENDER: 0xe6e6fa,
    successGreen: 0x4caf50,
    interactionRed: 0xff0000,
    textDarkGreen: '#2C5F41',
  },

  INTERACTION: {
    DISTANCE: 80,
    promptY: 150,
    promptStyle: {
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center',
    } as const satisfies InteractionStyle,
  },

  textStyles: {
    TITLE: {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#2C5F41',
      stroke: '#ffffff',
      strokeThickness: 4,
      align: 'center',
    } as const satisfies FontStyle,
    INSTRUCTION: {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#2C5F41',
      align: 'center',
    } as const satisfies FontStyle,
    buildingLabel: {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff',
      align: 'center',
    } as const satisfies FontStyle,
    npcName: {
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#2C5F41',
      align: 'center',
    } as const satisfies FontStyle,
  },

  UI: {
    get centerX() {
      return (window.visualViewport?.width ?? window.innerWidth) / 2;
    },
    get centerY() {
      return (window.visualViewport?.height ?? window.innerHeight) / 2;
    },
    fontSizes: {
      HUGE: 48,
      LARGE: 32,
      MEDIUM: 20,
      SMALL: 16,
      TINY: 12,
    },
  },
} as const;

/**
 * Type exports for external usage
 */
export type NPCConfigType = NPCConfig;
export type BuildingConfigType = BuildingConfig;

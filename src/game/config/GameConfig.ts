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

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
    SCALE: 0.5,
    TINT: 0x4169e1, // Royal blue
    SIZE: 50, // Collision box size
    collisionPadding: 25,
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

  BUILDINGS: {
    SCHOOL: {
      x: 200,
      y: 150,
      width: 160,
      height: 100,
      color: 0xb22222, // Red brick
      sceneKey: 'SchoolInterior',
    },
    LIBRARY: {
      x: 824,
      y: 150,
      width: 160,
      height: 100,
      color: 0x8b4513, // Brown
      sceneKey: 'LibraryInterior',
    },
    CAFE: {
      x: 300,
      y: 500,
      width: 140,
      height: 90,
      color: 0xff8c00, // Orange
      sceneKey: 'CafeInterior',
    },
    SHOP: {
      x: 724,
      y: 500,
      width: 140,
      height: 90,
      color: 0x9370db, // Purple
      sceneKey: 'ShopInterior',
    },
  } as const satisfies Record<string, BuildingConfig>,

  NPCS: {
    TEACHER: {
      x: 280,
      y: 240,
      radius: 25,
      color: 0xffb6c1,
      emoji: '👩‍🏫',
      name: 'Ms. Smith',
      type: 'teacher',
      greeting: 'Hello! Ready to learn some grammar today?',
      activity: 'grammar-lesson',
    },
    LIBRARIAN: {
      x: 750,
      y: 240,
      radius: 25,
      color: 0xdda0dd,
      emoji: '👨‍💼',
      name: 'Mr. Johnson',
      type: 'librarian',
      greeting: "Welcome to the library! Let's improve your reading skills.",
      activity: 'reading-comprehension',
    },
    SHOPKEEPER: {
      x: 650,
      y: 520,
      radius: 25,
      color: 0xf0e68c,
      emoji: '👨‍💼',
      name: 'Mr. Brown',
      type: 'shopkeeper',
      greeting: "Welcome to my shop! Let's practice some shopping vocabulary.",
      activity: 'vocabulary-shopping',
    },
  } as const satisfies Record<string, NPCConfig>,

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

  INTERIOR: {
    playerStartY: 600,
    exitZone: {
      x: 512,
      y: 650,
      width: 100,
      height: 60,
      color: 0xff0000,
      alpha: 0.3,
    },
    wallThickness: 100,
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

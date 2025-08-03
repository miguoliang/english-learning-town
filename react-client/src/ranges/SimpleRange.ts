/**
 * Simple concrete Range implementations focusing on the 4 core concerns
 */

import { Range } from '../types/ranges';
import { EmojiStrategy, StaticImageStrategy, AnimatedGifStrategy } from '../types/renderingStrategies';
import type { RenderingStrategy } from '../types/renderingStrategies';
import type { GridPosition, GridSize } from '../types/ranges';

/**
 * Building Range - Non-walkable, interactive structures
 */
export class Building extends Range {
  private onInteractionCallback?: () => void;

  constructor(data: {
    id: string;
    position: GridPosition;
    size: GridSize;
    renderingStrategy?: RenderingStrategy;
    onInteraction?: () => void;
  }) {
    super({
      ...data,
      renderingStrategy: data.renderingStrategy || new EmojiStrategy('🏠'),
      isWalkable: false // Buildings block movement
    });
    this.onInteractionCallback = data.onInteraction;
  }

  canInteract(): boolean {
    return true; // Buildings are always interactive
  }

  onInteraction(): void {
    if (this.onInteractionCallback) {
      this.onInteractionCallback();
    }
  }

  getTypeName(): string {
    return 'building';
  }

  // Factory methods for common building types
  static createSchool(position: GridPosition): Building {
    return new Building({
      id: 'school',
      position,
      size: { width: 4, height: 3 },
      renderingStrategy: new EmojiStrategy('🏫', '#e17055', '#2d3436'),
      onInteraction: () => console.log('Welcome to school!')
    });
  }

  static createShop(position: GridPosition): Building {
    return new Building({
      id: 'shop',
      position,
      size: { width: 4, height: 3 },
      renderingStrategy: new EmojiStrategy('🏪', '#00b894', '#2d3436'),
      onInteraction: () => console.log('Welcome to the shop!')
    });
  }

  static createLibrary(position: GridPosition): Building {
    return new Building({
      id: 'library',
      position,
      size: { width: 3, height: 3 },
      renderingStrategy: new EmojiStrategy('📚', '#6c5ce7', '#2d3436'),
      onInteraction: () => console.log('Welcome to the library!')
    });
  }
}

/**
 * Character Range - NPCs and Player sprites
 */
export class Character extends Range {
  private onInteractionCallback?: () => void;
  private isPlayer: boolean;

  constructor(data: {
    id: string;
    position: GridPosition;
    renderingStrategy?: RenderingStrategy;
    isPlayer?: boolean;
    canWalkThrough?: boolean;
    onInteraction?: () => void;
  }) {
    super({
      ...data,
      size: { width: 1, height: 1 }, // Characters are always 1x1
      renderingStrategy: data.renderingStrategy || new EmojiStrategy('🧑'),
      isWalkable: data.canWalkThrough ?? data.isPlayer ?? false
    });
    this.isPlayer = data.isPlayer ?? false;
    this.onInteractionCallback = data.onInteraction;
  }

  canInteract(): boolean {
    return !this.isPlayer; // Only NPCs are interactive
  }

  onInteraction(): void {
    if (this.onInteractionCallback && !this.isPlayer) {
      this.onInteractionCallback();
    }
  }

  getTypeName(): string {
    return 'character';
  }

  // Factory methods
  static createPlayer(position: GridPosition): Character {
    return new Character({
      id: 'player',
      position,
      renderingStrategy: new EmojiStrategy('🧑', 'rgba(255,255,255,0.1)', '#fff'),
      isPlayer: true,
      canWalkThrough: true // Player doesn't block movement
    });
  }

  static createNPC(data: {
    id: string;
    position: GridPosition;
    emoji: string;
    onInteraction?: () => void;
  }): Character {
    return new Character({
      ...data,
      renderingStrategy: new EmojiStrategy(data.emoji),
      isPlayer: false,
      canWalkThrough: false, // NPCs block movement
      onInteraction: data.onInteraction
    });
  }
}

/**
 * Decoration Range - Environmental elements
 */
export class Decoration extends Range {
  constructor(data: {
    id: string;
    position: GridPosition;
    size?: GridSize;
    renderingStrategy?: RenderingStrategy;
    canWalkThrough?: boolean;
  }) {
    super({
      ...data,
      size: data.size || { width: 1, height: 1 },
      renderingStrategy: data.renderingStrategy || new EmojiStrategy('🌸'),
      isWalkable: data.canWalkThrough ?? true // Most decorations are walkable
    });
  }

  canInteract(): boolean {
    return false; // Decorations are not interactive by default
  }

  getTypeName(): string {
    return 'decoration';
  }

  // Factory methods for common decorations
  static createTree(id: string, position: GridPosition): Decoration {
    return new Decoration({
      id,
      position,
      size: { width: 2, height: 2 },
      renderingStrategy: new EmojiStrategy('🌳'),
      canWalkThrough: false // Trees block movement
    });
  }

  static createFlower(id: string, position: GridPosition): Decoration {
    return new Decoration({
      id,
      position,
      renderingStrategy: new EmojiStrategy('🌸'),
      canWalkThrough: true // Can walk through flowers
    });
  }

  static createBush(id: string, position: GridPosition): Decoration {
    return new Decoration({
      id,
      position,
      renderingStrategy: new EmojiStrategy('🌿'),
      canWalkThrough: false // Bushes block movement
    });
  }

  static createGrass(id: string, position: GridPosition): Decoration {
    return new Decoration({
      id,
      position,
      renderingStrategy: new EmojiStrategy('🌱'),
      canWalkThrough: true // Can walk through grass
    });
  }
}

/**
 * Interactive Object Range - Items, triggers, etc.
 */
export class InteractiveObject extends Range {
  private onInteractionCallback: () => void;

  constructor(data: {
    id: string;
    position: GridPosition;
    size?: GridSize;
    renderingStrategy?: RenderingStrategy;
    canWalkThrough?: boolean;
    onInteraction: () => void;
  }) {
    super({
      ...data,
      size: data.size || { width: 1, height: 1 },
      renderingStrategy: data.renderingStrategy || new EmojiStrategy('❓'),
      isWalkable: data.canWalkThrough ?? true
    });
    this.onInteractionCallback = data.onInteraction;
  }

  canInteract(): boolean {
    return true; // Interactive objects are always interactive
  }

  onInteraction(): void {
    this.onInteractionCallback();
  }

  getTypeName(): string {
    return 'interactive';
  }

  // Factory methods
  static createQuestItem(id: string, position: GridPosition, onPickup: () => void): InteractiveObject {
    return new InteractiveObject({
      id,
      position,
      renderingStrategy: new EmojiStrategy('📦'),
      canWalkThrough: true,
      onInteraction: onPickup
    });
  }

  static createTrigger(id: string, position: GridPosition, onTrigger: () => void): InteractiveObject {
    return new InteractiveObject({
      id,
      position,
      renderingStrategy: new EmojiStrategy('⚡', 'transparent'), // Invisible trigger
      canWalkThrough: true,
      onInteraction: onTrigger
    });
  }
}

/**
 * Factory class for creating common range combinations
 */
export class RangeFactory {
  /**
   * Create a complete town scene
   */
  static createTownScene(screenWidth: number, screenHeight: number): Range[] {
    const cellSize = 40;
    const gridWidth = Math.floor(screenWidth / cellSize);
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(screenHeight / cellSize / 2);

    const ranges: Range[] = [];

    // Add buildings
    ranges.push(Building.createSchool({ x: 5, y: 3 }));
    ranges.push(Building.createShop({ x: gridWidth - 8, y: 4 }));
    ranges.push(Building.createLibrary({ x: 8, y: 12 }));

    // Add NPCs
    ranges.push(Character.createNPC({
      id: 'teacher',
      position: { x: 6, y: 7 },
      emoji: '👩‍🏫',
      onInteraction: () => console.log('Hello student!')
    }));

    ranges.push(Character.createNPC({
      id: 'shopkeeper',
      position: { x: gridWidth - 6, y: 8 },
      emoji: '👨‍💼',
      onInteraction: () => console.log('Welcome to my shop!')
    }));

    // Add decorations
    ranges.push(Decoration.createTree('tree1', { x: 2, y: 8 }));
    ranges.push(Decoration.createFlower('flower1', { x: 7, y: 10 }));
    ranges.push(Decoration.createBush('bush1', { x: 4, y: 15 }));

    // Add player
    ranges.push(Character.createPlayer({ x: centerX, y: centerY }));

    return ranges;
  }

  /**
   * Create ranges with custom image assets
   */
  static createWithImages(baseUrl: string): Range[] {
    return [
      new Building({
        id: 'fancy-school',
        position: { x: 10, y: 5 },
        size: { width: 6, height: 4 },
        renderingStrategy: new StaticImageStrategy(`${baseUrl}/school.png`, 'School building')
      }),
      
      new Character({
        id: 'animated-npc',
        position: { x: 12, y: 10 },
        renderingStrategy: new AnimatedGifStrategy(`${baseUrl}/npc-walking.gif`, 'Walking NPC')
      })
    ];
  }
}
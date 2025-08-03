/**
 * Factory for creating different types of Range objects
 * Centralizes range creation logic and provides convenience methods
 */

import { BuildingRange } from './BuildingRange';
import { SpriteRange } from './SpriteRange';
import { PlantRange } from './PlantRange';
import type { GridPosition, GridSize, Range } from '../types/ranges';
import { EmojiStrategy } from '../types/renderingStrategies';

export class RangeFactory {
  private static cellSize = 40;

  /**
   * Create a building range with standard configuration
   */
  static createBuilding(config: {
    id: string;
    position: GridPosition;
    size: GridSize;
    name: string;
    color: string;
    icon: string;
  }): BuildingRange {
    return new BuildingRange({
      ...config,
      renderingStrategy: new EmojiStrategy(config.icon, config.color)
    });
  }

  /**
   * Create predefined building types
   */
  static createSchool(position: GridPosition): BuildingRange {
    return this.createBuilding({
      id: 'school',
      position,
      size: { width: 4, height: 3 },
      name: 'School',
      color: '#e17055',
      icon: '🏫'
    });
  }

  static createShop(position: GridPosition): BuildingRange {
    return this.createBuilding({
      id: 'shop',
      position,
      size: { width: 4, height: 3 },
      name: 'Shop',
      color: '#00b894',
      icon: '🏪'
    });
  }

  static createLibrary(position: GridPosition): BuildingRange {
    return this.createBuilding({
      id: 'library',
      position,
      size: { width: 3, height: 3 },
      name: 'Library',
      color: '#6c5ce7',
      icon: '📚'
    });
  }

  static createCafe(position: GridPosition): BuildingRange {
    return this.createBuilding({
      id: 'cafe',
      position,
      size: { width: 3, height: 2 },
      name: 'Café',
      color: '#fdcb6e',
      icon: '☕'
    });
  }

  /**
   * Create NPC sprites
   */
  static createNPC(config: {
    id: string;
    position: GridPosition;
    name: string;
    icon: string;
    blocksMovement?: boolean;
  }): SpriteRange {
    return SpriteRange.createNPC(config);
  }

  /**
   * Create predefined NPC types
   */
  static createTeacher(position: GridPosition): SpriteRange {
    return this.createNPC({
      id: 'teacher',
      position,
      name: 'Ms. Johnson',
      icon: '👩‍🏫'
    });
  }

  static createShopkeeper(position: GridPosition): SpriteRange {
    return this.createNPC({
      id: 'shopkeeper',
      position,
      name: 'Mr. Smith',
      icon: '👨‍💼'
    });
  }

  static createLibrarian(position: GridPosition): SpriteRange {
    return this.createNPC({
      id: 'librarian',
      position,
      name: 'Dr. Brown',
      icon: '👩‍🎓'
    });
  }

  /**
   * Create player sprite
   */
  static createPlayer(position: GridPosition): SpriteRange {
    return SpriteRange.createPlayer(position);
  }

  /**
   * Create plant ranges
   */
  static createTree(id: string, position: GridPosition, size?: GridSize): PlantRange {
    return PlantRange.createTree(id, position, size);
  }

  static createBush(id: string, position: GridPosition): PlantRange {
    return PlantRange.createBush(id, position);
  }

  static createFlower(id: string, position: GridPosition): PlantRange {
    return PlantRange.createFlower(id, position);
  }

  static createGrass(id: string, position: GridPosition): PlantRange {
    return PlantRange.createGrass(id, position);
  }

  /**
   * Create a complete town layout
   */
  static createTownLayout(screenWidth: number, screenHeight: number): Range[] {
    const gridWidth = Math.floor(screenWidth / this.cellSize);
    const gridHeight = Math.floor(screenHeight / this.cellSize);
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);

    const ranges: Range[] = [];

    // Add buildings
    ranges.push(this.createSchool({ x: 5, y: 3 }));
    ranges.push(this.createShop({ x: gridWidth - 8, y: 4 }));
    ranges.push(this.createLibrary({ x: 8, y: 12 }));
    ranges.push(this.createCafe({ x: gridWidth - 7, y: 14 }));

    // Add NPCs
    ranges.push(this.createTeacher({ x: 6, y: 7 }));
    ranges.push(this.createShopkeeper({ x: gridWidth - 6, y: 8 }));
    ranges.push(this.createLibrarian({ x: 9, y: 16 }));

    // Add plants for decoration
    ranges.push(this.createTree('tree1', { x: 2, y: 8 }));
    ranges.push(this.createTree('tree2', { x: gridWidth - 3, y: 6 }));
    ranges.push(this.createBush('bush1', { x: 4, y: 15 }));
    ranges.push(this.createBush('bush2', { x: 12, y: 18 }));
    ranges.push(this.createFlower('flower1', { x: 7, y: 10 }));
    ranges.push(this.createFlower('flower2', { x: 10, y: 8 }));
    ranges.push(this.createGrass('grass1', { x: 3, y: 12 }));
    ranges.push(this.createGrass('grass2', { x: 14, y: 11 }));

    // Add player at center
    ranges.push(this.createPlayer({ x: centerX, y: centerY }));

    return ranges;
  }

  /**
   * Create random decorative elements for empty areas
   */
  static createRandomDecoration(validPositions: GridPosition[]): PlantRange[] {
    const decorations: PlantRange[] = [];
    const decorationCount = Math.min(10, Math.floor(validPositions.length * 0.1));

    for (let i = 0; i < decorationCount; i++) {
      const randomIndex = Math.floor(Math.random() * validPositions.length);
      const position = validPositions[randomIndex];
      
      decorations.push(PlantRange.createRandomDecoration(`decoration_${i}`, position));
      
      // Remove used position
      validPositions.splice(randomIndex, 1);
    }

    return decorations;
  }

  /**
   * Validate and sanitize range data
   */
  static validateRange(range: Range, gridWidth: number, gridHeight: number): boolean {
    // Check if range fits within grid bounds
    const maxX = range.position.x + range.size.width;
    const maxY = range.position.y + range.size.height;
    
    return range.position.x >= 0 && 
           range.position.y >= 0 && 
           maxX <= gridWidth && 
           maxY <= gridHeight;
  }

  /**
   * Convert legacy data to Range objects
   */
  static fromLegacyBuilding(building: {
    id: string;
    x: number;
    y: number;
    name: string;
    color: string;
    icon: string;
    gridSize?: { width: number; height: number };
  }): BuildingRange {
    return BuildingRange.fromLegacyBuilding(building);
  }

  static fromLegacyNPC(npc: {
    id: string;
    x: number;
    y: number;
    name: string;
    icon: string;
  }): SpriteRange {
    return SpriteRange.fromLegacyNPC(npc);
  }
}
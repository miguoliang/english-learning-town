/**
 * Range-based Grid System for English Learning Town
 * Manages grid layout with polymorphic Range objects
 */

import { Range } from '../types/ranges';
import type { GridPosition, GridSize } from '../types/ranges';

export interface RangeCollisionArea {
  id: string;
  position: GridPosition;
  size: GridSize;
  type: string;
  range: Range;
}

export class RangeGridSystem {
  public readonly cellSize: number;
  public readonly gridWidth: number;
  public readonly gridHeight: number;
  private collisionMap: boolean[][];
  private ranges: Map<string, Range>;
  private rangeCollisionAreas: Map<string, RangeCollisionArea>;

  constructor(screenWidth: number, screenHeight: number, cellSize: number = 40) {
    this.cellSize = cellSize;
    this.gridWidth = Math.floor(screenWidth / cellSize);
    this.gridHeight = Math.floor(screenHeight / cellSize);
    
    // Initialize collision map (false = walkable, true = blocked)
    this.collisionMap = Array(this.gridHeight).fill(null).map(() => 
      Array(this.gridWidth).fill(false)
    );
    
    this.ranges = new Map();
    this.rangeCollisionAreas = new Map();
  }

  /**
   * Convert screen coordinates to grid position
   */
  screenToGrid(screenX: number, screenY: number): GridPosition {
    return {
      x: Math.floor(screenX / this.cellSize),
      y: Math.floor(screenY / this.cellSize)
    };
  }

  /**
   * Convert grid position to screen coordinates (top-left of cell)
   */
  gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize,
      y: gridY * this.cellSize
    };
  }

  /**
   * Convert grid position to screen coordinates (center of cell)
   */
  gridToScreenCenter(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2
    };
  }

  /**
   * Check if a grid position is within bounds
   */
  isValidPosition(gridX: number, gridY: number): boolean {
    return gridX >= 0 && gridX < this.gridWidth && 
           gridY >= 0 && gridY < this.gridHeight;
  }

  /**
   * Check if a grid position is walkable (not blocked by collision)
   */
  isWalkable(gridX: number, gridY: number): boolean {
    if (!this.isValidPosition(gridX, gridY)) {
      return false;
    }
    return !this.collisionMap[gridY][gridX];
  }

  /**
   * Add a Range to the grid system
   */
  addRange(range: Range): void {
    this.ranges.set(range.id, range);
    
    // Create collision area
    const collisionArea: RangeCollisionArea = {
      id: range.id,
      position: range.position,
      size: range.size,
      type: range.getTypeName(),
      range: range
    };
    
    this.rangeCollisionAreas.set(range.id, collisionArea);
    
    // Update collision map if range blocks movement
    if (!range.isWalkableRange()) {
      this.updateCollisionMap(range, true);
    }
  }

  /**
   * Remove a Range from the grid system
   */
  removeRange(rangeId: string): void {
    const range = this.ranges.get(rangeId);
    if (!range) return;

    // Clear collision map
    if (!range.isWalkableRange()) {
      this.updateCollisionMap(range, false);
    }

    this.ranges.delete(rangeId);
    this.rangeCollisionAreas.delete(rangeId);
  }

  /**
   * Update collision map for a range
   */
  private updateCollisionMap(range: Range, blocked: boolean): void {
    for (let y = range.position.y; y < range.position.y + range.size.height; y++) {
      for (let x = range.position.x; x < range.position.x + range.size.width; x++) {
        if (this.isValidPosition(x, y)) {
          this.collisionMap[y][x] = blocked;
        }
      }
    }
  }

  /**
   * Update range position (e.g., for moving sprites)
   */
  updateRangePosition(rangeId: string, newPosition: GridPosition): void {
    const range = this.ranges.get(rangeId);
    if (!range) return;

    // Clear old collision
    if (!range.isWalkableRange()) {
      this.updateCollisionMap(range, false);
    }

    // Update range position (create new range with updated position)
    const updatedRange = new (range.constructor as any)({
      ...range,
      position: newPosition
    });

    // Update maps
    this.ranges.set(rangeId, updatedRange);
    this.rangeCollisionAreas.set(rangeId, {
      ...this.rangeCollisionAreas.get(rangeId)!,
      position: newPosition,
      range: updatedRange
    });

    // Set new collision
    if (!updatedRange.isWalkableRange()) {
      this.updateCollisionMap(updatedRange, true);
    }
  }

  /**
   * Get range at a specific grid position
   */
  getRangeAt(gridX: number, gridY: number): Range | null {
    for (const range of this.ranges.values()) {
      if (range.containsPosition(gridX, gridY)) {
        return range;
      }
    }
    return null;
  }

  /**
   * Get all ranges of a specific type
   */
  getRangesByType<T extends Range>(type: string): T[] {
    return Array.from(this.ranges.values())
      .filter(range => range.getTypeName() === type) as T[];
  }

  /**
   * Get all ranges
   */
  getAllRanges(): Range[] {
    return Array.from(this.ranges.values());
  }

  /**
   * Get collision areas for visualization
   */
  getCollisionAreas(): RangeCollisionArea[] {
    return Array.from(this.rangeCollisionAreas.values());
  }

  /**
   * Get collision area at a specific grid position
   */
  getCollisionAreaAt(gridX: number, gridY: number): RangeCollisionArea | null {
    for (const area of this.rangeCollisionAreas.values()) {
      if (gridX >= area.position.x && 
          gridX < area.position.x + area.size.width &&
          gridY >= area.position.y && 
          gridY < area.position.y + area.size.height) {
        return area;
      }
    }
    return null;
  }

  /**
   * Clear all ranges
   */
  clearAllRanges(): void {
    this.ranges.clear();
    this.rangeCollisionAreas.clear();
    this.collisionMap = Array(this.gridHeight).fill(null).map(() => 
      Array(this.gridWidth).fill(false)
    );
  }

  /**
   * Get the grid dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.gridWidth,
      height: this.gridHeight
    };
  }

  /**
   * Debug: Get collision map visualization
   */
  getCollisionMapDebug(): string[][] {
    return this.collisionMap.map(row => 
      row.map(cell => cell ? '█' : '·')
    );
  }

  /**
   * Find valid positions for placing a new range
   */
  findValidPositions(size: GridSize, avoidCollision: boolean = true): GridPosition[] {
    const validPositions: GridPosition[] = [];
    
    for (let y = 0; y <= this.gridHeight - size.height; y++) {
      for (let x = 0; x <= this.gridWidth - size.width; x++) {
        let isValid = true;
        
        if (avoidCollision) {
          // Check if area is clear
          for (let dy = 0; dy < size.height && isValid; dy++) {
            for (let dx = 0; dx < size.width && isValid; dx++) {
              if (!this.isWalkable(x + dx, y + dy)) {
                isValid = false;
              }
            }
          }
        }
        
        if (isValid) {
          validPositions.push({ x, y });
        }
      }
    }
    
    return validPositions;
  }
}
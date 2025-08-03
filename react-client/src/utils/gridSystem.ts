/**
 * Grid-based map system for English Learning Town
 * Provides collision detection and structured movement
 */

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
}

export interface CollisionArea {
  id: string;
  position: GridPosition;
  size: GridSize;
  type: 'building' | 'npc' | 'obstacle';
}

export class GridSystem {
  public readonly cellSize: number;
  public readonly gridWidth: number;
  public readonly gridHeight: number;
  private collisionMap: boolean[][];
  private collisionAreas: Map<string, CollisionArea>;

  constructor(screenWidth: number, screenHeight: number, cellSize: number = 40) {
    this.cellSize = cellSize;
    this.gridWidth = Math.floor(screenWidth / cellSize);
    this.gridHeight = Math.floor(screenHeight / cellSize);
    
    // Initialize collision map (false = walkable, true = blocked)
    this.collisionMap = Array(this.gridHeight).fill(null).map(() => 
      Array(this.gridWidth).fill(false)
    );
    
    this.collisionAreas = new Map();
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
   * Add a collision area to the grid
   */
  addCollisionArea(area: CollisionArea): void {
    this.collisionAreas.set(area.id, area);
    
    // Mark grid cells as blocked
    for (let y = area.position.y; y < area.position.y + area.size.height; y++) {
      for (let x = area.position.x; x < area.position.x + area.size.width; x++) {
        if (this.isValidPosition(x, y)) {
          this.collisionMap[y][x] = true;
        }
      }
    }
  }

  /**
   * Remove a collision area from the grid
   */
  removeCollisionArea(areaId: string): void {
    const area = this.collisionAreas.get(areaId);
    if (!area) return;

    // Clear grid cells
    for (let y = area.position.y; y < area.position.y + area.size.height; y++) {
      for (let x = area.position.x; x < area.position.x + area.size.width; x++) {
        if (this.isValidPosition(x, y)) {
          this.collisionMap[y][x] = false;
        }
      }
    }

    this.collisionAreas.delete(areaId);
  }

  /**
   * Get collision area at a specific grid position
   */
  getCollisionAreaAt(gridX: number, gridY: number): CollisionArea | null {
    for (const area of this.collisionAreas.values()) {
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
   * Get the grid dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.gridWidth,
      height: this.gridHeight
    };
  }

  /**
   * Clear all collision areas
   */
  clearCollisionAreas(): void {
    this.collisionAreas.clear();
    this.collisionMap = Array(this.gridHeight).fill(null).map(() => 
      Array(this.gridWidth).fill(false)
    );
  }

  /**
   * Debug: Get collision map visualization
   */
  getCollisionMapDebug(): string[][] {
    return this.collisionMap.map(row => 
      row.map(cell => cell ? '█' : '·')
    );
  }
}
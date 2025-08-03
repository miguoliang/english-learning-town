/**
 * Grid System - Manages walkable and interactive cells
 * Single Responsibility: Grid cell management
 */

export interface GameEntity {
  id: string;
  type: 'building' | 'npc';
  gridX: number;
  gridY: number;
  width?: number;
  height?: number;
  icon: string;
  name: string;
  color?: string;
}

export class GridSystem {
  private walkableCells = new Set<string>();
  private interactiveCells = new Map<string, GameEntity>();

  /**
   * Initialize grid with entities
   */
  initialize(entities: GameEntity[]): void {
    this.walkableCells.clear();
    this.interactiveCells.clear();

    // Mark all cells as walkable by default
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 30; y++) {
        this.walkableCells.add(`${x},${y}`);
      }
    }

    // Process entities
    entities.forEach(entity => {
      if (entity.type === 'building') {
        this.processBuildingEntity(entity);
      } else if (entity.type === 'npc') {
        this.processNPCEntity(entity);
      }
    });
  }

  private processBuildingEntity(entity: GameEntity): void {
    const width = entity.width || 1;
    const height = entity.height || 1;
    
    // Mark building cells as non-walkable
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.walkableCells.delete(`${entity.gridX + x},${entity.gridY + y}`);
      }
    }

    // Mark adjacent cells as interactive
    for (let x = -1; x <= width; x++) {
      for (let y = -1; y <= height; y++) {
        if (x === -1 || x === width || y === -1 || y === height) {
          const adjX = entity.gridX + x;
          const adjY = entity.gridY + y;
          if (this.walkableCells.has(`${adjX},${adjY}`)) {
            this.interactiveCells.set(`${adjX},${adjY}`, entity);
          }
        }
      }
    }
  }

  private processNPCEntity(entity: GameEntity): void {
    // Mark NPC cell as non-walkable
    this.walkableCells.delete(`${entity.gridX},${entity.gridY}`);
    
    // Mark adjacent cells as interactive
    const adjacent = [
      { x: entity.gridX - 1, y: entity.gridY },
      { x: entity.gridX + 1, y: entity.gridY },
      { x: entity.gridX, y: entity.gridY - 1 },
      { x: entity.gridX, y: entity.gridY + 1 }
    ];
    
    adjacent.forEach(pos => {
      if (this.walkableCells.has(`${pos.x},${pos.y}`)) {
        this.interactiveCells.set(`${pos.x},${pos.y}`, entity);
      }
    });
  }

  /**
   * Check if a position is walkable
   */
  isWalkable(x: number, y: number): boolean {
    return this.walkableCells.has(`${x},${y}`);
  }

  /**
   * Get interactive entity at position
   */
  getInteractiveEntity(x: number, y: number): GameEntity | null {
    return this.interactiveCells.get(`${x},${y}`) || null;
  }
}
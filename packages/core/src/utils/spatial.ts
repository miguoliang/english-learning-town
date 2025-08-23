/**
 * Spatial Utilities - Spatial indexing and collision detection
 * Fast spatial queries and optimization for entity positioning
 */

/**
 * Spatial indexing for fast collision detection and queries
 */
export class SpatialIndex {
  private grid: Map<string, string[]> = new Map();
  private cellSize: number;

  constructor(cellSize = 5) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX}:${cellY}`;
  }

  addEntity(entityId: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(entityId);
  }

  removeEntity(entityId: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    const entities = this.grid.get(key);
    if (entities) {
      const index = entities.indexOf(entityId);
      if (index > -1) {
        entities.splice(index, 1);
      }
    }
  }

  getNearbyEntities(x: number, y: number, radius = 1): string[] {
    const nearby: string[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(x / this.cellSize);
    const centerCellY = Math.floor(y / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx}:${centerCellY + dy}`;
        const entities = this.grid.get(key);
        if (entities) {
          nearby.push(...entities);
        }
      }
    }

    return nearby;
  }

  clear(): void {
    this.grid.clear();
  }
}

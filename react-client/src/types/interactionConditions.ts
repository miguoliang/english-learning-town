/**
 * Interaction Conditions - Spatial rules for when entities can be interacted with
 * 
 * This system defines WHERE a player must be positioned relative to an interactive
 * range in order to trigger an interaction.
 */

import type { GridPosition } from './ranges';

export interface InteractionCondition {
  /**
   * Check if interaction is possible from the given player position
   * @param playerPos - Current player grid position
   * @param targetPos - Target range's grid position
   * @param targetSize - Target range's grid size
   * @returns true if interaction is allowed from this position
   */
  canInteractFrom(
    playerPos: GridPosition, 
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): boolean;

  /**
   * Get valid interaction positions relative to target
   * @param targetPos - Target range's grid position
   * @param targetSize - Target range's grid size
   * @returns Array of valid grid positions for interaction
   */
  getValidInteractionPositions(
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): GridPosition[];

  /**
   * Get description of this interaction condition for debugging
   */
  getDescription(): string;
}

/**
 * Adjacent Interaction - Player must be directly adjacent (no diagonal)
 * Used for: NPCs, most building entrances
 */
export class AdjacentInteraction implements InteractionCondition {
  canInteractFrom(
    playerPos: GridPosition, 
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): boolean {
    // Check if player is adjacent to any edge of the target
    const playerX = playerPos.x;
    const playerY = playerPos.y;
    
    const targetLeft = targetPos.x;
    const targetRight = targetPos.x + targetSize.width - 1;
    const targetTop = targetPos.y;
    const targetBottom = targetPos.y + targetSize.height - 1;

    // Adjacent to left edge
    if (playerX === targetLeft - 1 && playerY >= targetTop && playerY <= targetBottom) {
      return true;
    }
    
    // Adjacent to right edge
    if (playerX === targetRight + 1 && playerY >= targetTop && playerY <= targetBottom) {
      return true;
    }
    
    // Adjacent to top edge
    if (playerY === targetTop - 1 && playerX >= targetLeft && playerX <= targetRight) {
      return true;
    }
    
    // Adjacent to bottom edge
    if (playerY === targetBottom + 1 && playerX >= targetLeft && playerX <= targetRight) {
      return true;
    }

    return false;
  }

  getValidInteractionPositions(
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): GridPosition[] {
    const positions: GridPosition[] = [];
    
    const targetLeft = targetPos.x;
    const targetRight = targetPos.x + targetSize.width - 1;
    const targetTop = targetPos.y;
    const targetBottom = targetPos.y + targetSize.height - 1;

    // Left edge positions
    for (let y = targetTop; y <= targetBottom; y++) {
      positions.push({ x: targetLeft - 1, y });
    }
    
    // Right edge positions
    for (let y = targetTop; y <= targetBottom; y++) {
      positions.push({ x: targetRight + 1, y });
    }
    
    // Top edge positions
    for (let x = targetLeft; x <= targetRight; x++) {
      positions.push({ x, y: targetTop - 1 });
    }
    
    // Bottom edge positions
    for (let x = targetLeft; x <= targetRight; x++) {
      positions.push({ x, y: targetBottom + 1 });
    }

    return positions;
  }

  getDescription(): string {
    return 'Adjacent (north, south, east, west) - no diagonal';
  }
}

/**
 * Exact Position Interaction - Player must be at exact position
 * Used for: Building entrances at specific spots
 */
export class ExactPositionInteraction implements InteractionCondition {
  constructor(private validPositions: GridPosition[]) {}

  canInteractFrom(
    playerPos: GridPosition, 
    _targetPos: GridPosition, 
    _targetSize: { width: number; height: number }
  ): boolean {
    return this.validPositions.some(pos => 
      pos.x === playerPos.x && pos.y === playerPos.y
    );
  }

  getValidInteractionPositions(
    _targetPos: GridPosition, 
    _targetSize: { width: number; height: number }
  ): GridPosition[] {
    return [...this.validPositions];
  }

  getDescription(): string {
    return `Exact positions: ${this.validPositions.map(p => `(${p.x},${p.y})`).join(', ')}`;
  }
}

/**
 * Proximity Interaction - Player must be within distance
 * Used for: Area triggers, large interactive objects
 */
export class ProximityInteraction implements InteractionCondition {
  constructor(private maxDistance: number) {}

  canInteractFrom(
    playerPos: GridPosition, 
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): boolean {
    // Find closest point on target to player
    const targetCenterX = targetPos.x + targetSize.width / 2;
    const targetCenterY = targetPos.y + targetSize.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(playerPos.x - targetCenterX, 2) + 
      Math.pow(playerPos.y - targetCenterY, 2)
    );
    
    return distance <= this.maxDistance;
  }

  getValidInteractionPositions(
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): GridPosition[] {
    const positions: GridPosition[] = [];
    const targetCenterX = targetPos.x + targetSize.width / 2;
    const targetCenterY = targetPos.y + targetSize.height / 2;
    
    // Generate grid positions within proximity distance
    const minX = Math.floor(targetCenterX - this.maxDistance);
    const maxX = Math.ceil(targetCenterX + this.maxDistance);
    const minY = Math.floor(targetCenterY - this.maxDistance);
    const maxY = Math.ceil(targetCenterY + this.maxDistance);
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const distance = Math.sqrt(
          Math.pow(x - targetCenterX, 2) + 
          Math.pow(y - targetCenterY, 2)
        );
        if (distance <= this.maxDistance) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  getDescription(): string {
    return `Within ${this.maxDistance} grid units`;
  }
}

/**
 * Directional Interaction - Player must approach from specific direction
 * Used for: Doors that can only be opened from one side, directional objects
 */
export class DirectionalInteraction implements InteractionCondition {
  constructor(private allowedDirections: ('north' | 'south' | 'east' | 'west')[]) {}

  canInteractFrom(
    playerPos: GridPosition, 
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): boolean {
    const targetLeft = targetPos.x;
    const targetRight = targetPos.x + targetSize.width - 1;
    const targetTop = targetPos.y;
    const targetBottom = targetPos.y + targetSize.height - 1;

    for (const direction of this.allowedDirections) {
      switch (direction) {
        case 'west': // From left side
          if (playerPos.x === targetLeft - 1 && 
              playerPos.y >= targetTop && 
              playerPos.y <= targetBottom) {
            return true;
          }
          break;
        case 'east': // From right side
          if (playerPos.x === targetRight + 1 && 
              playerPos.y >= targetTop && 
              playerPos.y <= targetBottom) {
            return true;
          }
          break;
        case 'north': // From top
          if (playerPos.y === targetTop - 1 && 
              playerPos.x >= targetLeft && 
              playerPos.x <= targetRight) {
            return true;
          }
          break;
        case 'south': // From bottom
          if (playerPos.y === targetBottom + 1 && 
              playerPos.x >= targetLeft && 
              playerPos.x <= targetRight) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  getValidInteractionPositions(
    targetPos: GridPosition, 
    targetSize: { width: number; height: number }
  ): GridPosition[] {
    const positions: GridPosition[] = [];
    
    const targetLeft = targetPos.x;
    const targetRight = targetPos.x + targetSize.width - 1;
    const targetTop = targetPos.y;
    const targetBottom = targetPos.y + targetSize.height - 1;

    for (const direction of this.allowedDirections) {
      switch (direction) {
        case 'west':
          for (let y = targetTop; y <= targetBottom; y++) {
            positions.push({ x: targetLeft - 1, y });
          }
          break;
        case 'east':
          for (let y = targetTop; y <= targetBottom; y++) {
            positions.push({ x: targetRight + 1, y });
          }
          break;
        case 'north':
          for (let x = targetLeft; x <= targetRight; x++) {
            positions.push({ x, y: targetTop - 1 });
          }
          break;
        case 'south':
          for (let x = targetLeft; x <= targetRight; x++) {
            positions.push({ x, y: targetBottom + 1 });
          }
          break;
      }
    }

    return positions;
  }

  getDescription(): string {
    return `From directions: ${this.allowedDirections.join(', ')}`;
  }
}

/**
 * Entrance Interaction - Player must be adjacent to entrance positions in walkable cells
 * Used for: Building entrances where entrance positions are inside non-walkable buildings
 * This finds only the walkable cells adjacent to entrance positions (outside building range)
 */
export class EntranceInteraction implements InteractionCondition {
  constructor(
    private entrancePositions: GridPosition[],
    private buildingPos: GridPosition,
    private buildingSize: { width: number; height: number }
  ) {}

  private isPositionInBuilding(pos: GridPosition): boolean {
    return pos.x >= this.buildingPos.x && 
           pos.x < this.buildingPos.x + this.buildingSize.width &&
           pos.y >= this.buildingPos.y && 
           pos.y < this.buildingPos.y + this.buildingSize.height;
  }

  canInteractFrom(
    playerPos: GridPosition, 
    _targetPos: GridPosition, 
    _targetSize: { width: number; height: number }
  ): boolean {
    // Check if player is adjacent to any entrance position AND outside building
    for (const entrance of this.entrancePositions) {
      // Check all 4 adjacent positions around the entrance
      const adjacentPositions = [
        { x: entrance.x - 1, y: entrance.y },     // West
        { x: entrance.x + 1, y: entrance.y },     // East  
        { x: entrance.x, y: entrance.y - 1 },     // North
        { x: entrance.x, y: entrance.y + 1 }      // South
      ];

      for (const adjPos of adjacentPositions) {
        // Position must match player AND be outside building (walkable)
        if (playerPos.x === adjPos.x && 
            playerPos.y === adjPos.y && 
            !this.isPositionInBuilding(adjPos)) {
          return true;
        }
      }
    }

    return false;
  }

  getValidInteractionPositions(
    _targetPos: GridPosition, 
    _targetSize: { width: number; height: number }
  ): GridPosition[] {
    const positions: GridPosition[] = [];
    
    // For each entrance position, add only adjacent positions that are outside the building
    for (const entrance of this.entrancePositions) {
      const adjacentPositions = [
        { x: entrance.x - 1, y: entrance.y },     // West
        { x: entrance.x + 1, y: entrance.y },     // East  
        { x: entrance.x, y: entrance.y - 1 },     // North
        { x: entrance.x, y: entrance.y + 1 }      // South
      ];

      // Only include positions that are outside the building (walkable)
      for (const adjPos of adjacentPositions) {
        if (!this.isPositionInBuilding(adjPos)) {
          positions.push(adjPos);
        }
      }
    }

    return positions;
  }

  getDescription(): string {
    return `Adjacent to entrances (outside building): ${this.entrancePositions.map(p => `(${p.x},${p.y})`).join(', ')}`;
  }
}
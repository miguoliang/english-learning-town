/**
 * Player Controller - Manages player position and movement
 * Single Responsibility: Player movement logic
 */

import type { GridSystem } from './GridSystem';

export interface PlayerPosition {
  x: number;
  y: number;
}

export class PlayerController {
  private position: PlayerPosition = { x: 10, y: 10 };
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
  }

  /**
   * Get current player position
   */
  getPosition(): PlayerPosition {
    return { ...this.position };
  }

  /**
   * Set player position
   */
  setPosition(newPosition: PlayerPosition): void {
    this.position = newPosition;
  }

  /**
   * Try to move player in a direction
   */
  move(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const { x, y } = this.position;
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up': newY = y - 1; break;
      case 'down': newY = y + 1; break;
      case 'left': newX = x - 1; break;
      case 'right': newX = x + 1; break;
    }

    if (this.gridSystem.isWalkable(newX, newY)) {
      this.position = { x: newX, y: newY };
      return true; // Movement successful
    }
    
    return false; // Movement blocked
  }

  /**
   * Try to interact at current position
   */
  interact(): string | null {
    const entity = this.gridSystem.getInteractiveEntity(this.position.x, this.position.y);
    if (entity) {
      return `Interacting with ${entity.name}!`;
    }
    return null;
  }

  /**
   * Get current location name
   */
  getCurrentLocation(): string {
    const entity = this.gridSystem.getInteractiveEntity(this.position.x, this.position.y);
    return entity ? `Near ${entity.name}` : 'English Learning Town';
  }
}
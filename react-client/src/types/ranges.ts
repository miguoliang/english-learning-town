/**
 * Simplified Range abstraction focused on core concerns:
 * 1. Boundary (position + size)
 * 2. Walkability (can sprites pass through?)
 * 3. Interaction (what happens when engaged?)
 * 4. Rendering (how does it look?)
 */

import type { ReactNode } from 'react';
import type { RenderingStrategy } from './renderingStrategies';

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
}

/**
 * Core data for any Range
 */
export interface RangeData {
  id: string;
  position: GridPosition;
  size: GridSize;
  renderingStrategy: RenderingStrategy;
  isWalkable?: boolean;
}

/**
 * Simplified Range abstraction
 * Every entity in the grid is defined by these 4 core behaviors
 */
export abstract class Range {
  public readonly id: string;
  public readonly position: GridPosition;
  public readonly size: GridSize;
  protected renderingStrategy: RenderingStrategy;
  private walkable: boolean;

  constructor(data: RangeData) {
    this.id = data.id;
    this.position = data.position;
    this.size = data.size;
    this.renderingStrategy = data.renderingStrategy;
    this.walkable = data.isWalkable ?? false;
  }

  // ========== CORE CONCERN 1: BOUNDARY ==========
  
  /**
   * Check if this range contains a specific grid position
   */
  containsPosition(gridX: number, gridY: number): boolean {
    return gridX >= this.position.x && 
           gridX < this.position.x + this.size.width &&
           gridY >= this.position.y && 
           gridY < this.position.y + this.size.height;
  }

  /**
   * Get screen coordinates from grid position
   */
  getScreenPosition(cellSize: number): { x: number; y: number } {
    return {
      x: this.position.x * cellSize,
      y: this.position.y * cellSize
    };
  }

  /**
   * Get visual dimensions in pixels
   */
  getScreenSize(cellSize: number): { width: number; height: number } {
    return {
      width: this.size.width * cellSize,
      height: this.size.height * cellSize
    };
  }

  /**
   * Get center coordinates of the range in screen space
   */
  getScreenCenter(cellSize: number): { x: number; y: number } {
    return {
      x: this.position.x * cellSize + (this.size.width * cellSize) / 2,
      y: this.position.y * cellSize + (this.size.height * cellSize) / 2
    };
  }

  // ========== CORE CONCERN 2: WALKABILITY ==========
  
  /**
   * Can sprites move through this range?
   */
  isWalkableRange(): boolean {
    return this.walkable;
  }

  /**
   * Set walkability (for dynamic ranges)
   */
  setWalkable(walkable: boolean): void {
    this.walkable = walkable;
  }

  // ========== CORE CONCERN 3: INTERACTION ==========
  
  /**
   * Get the interactive position within this range
   * Default: center of the range
   */
  getInteractionPosition(): GridPosition {
    return {
      x: this.position.x + Math.floor(this.size.width / 2),
      y: this.position.y + Math.floor(this.size.height / 2)
    };
  }

  /**
   * Handle interaction when player engages with this range
   * Override in concrete classes for specific behavior
   */
  onInteraction(): void {
    // Default: no interaction
  }

  /**
   * Check if this range can be interacted with
   */
  abstract canInteract(): boolean;

  // ========== CORE CONCERN 4: RENDERING ==========
  
  /**
   * Render this range using its strategy
   */
  render(cellSize: number = 40): ReactNode {
    const screenPos = this.getScreenPosition(cellSize);
    const screenSize = this.getScreenSize(cellSize);
    
    return this.renderingStrategy.render({
      screenX: screenPos.x,
      screenY: screenPos.y,
      screenWidth: screenSize.width,
      screenHeight: screenSize.height,
      onClick: this.canInteract() ? () => this.onInteraction() : undefined
    });
  }

  /**
   * Change rendering strategy (for dynamic visuals)
   */
  setRenderingStrategy(strategy: RenderingStrategy): void {
    this.renderingStrategy = strategy;
  }

  // ========== UTILITY METHODS ==========
  
  /**
   * Get collision area for grid system compatibility
   */
  getCollisionArea() {
    return {
      id: this.id,
      position: this.position,
      size: this.size,
      type: this.getTypeName()
    };
  }

  /**
   * Get type name for debugging/compatibility
   */
  abstract getTypeName(): string;
}
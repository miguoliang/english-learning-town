/**
 * Interaction Manager - Handles spatial interaction logic for the Range system
 * 
 * This utility provides methods to check and manage interactions between the player
 * and interactive ranges based on their spatial interaction conditions.
 */

import type { GridPosition } from '../types/ranges';
import type { Range } from '../types/ranges';

export interface InteractionResult {
  canInteract: boolean;
  range: Range;
  distance: number;
  validPositions: GridPosition[];
}

export class InteractionManager {
  /**
   * Check which ranges the player can interact with from their current position
   * @param playerPos - Current player grid position
   * @param ranges - Array of ranges to check
   * @returns Array of interaction results for interactive ranges
   */
  static checkInteractions(playerPos: GridPosition, ranges: Range[]): InteractionResult[] {
    return ranges
      .filter(range => range.canInteract())
      .map(range => {
        const canInteract = range.canInteractFrom(playerPos);
        const distance = this.calculateDistance(playerPos, range.position, range.size);
        const validPositions = range.getValidInteractionPositions();
        
        return {
          canInteract,
          range,
          distance,
          validPositions
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance, closest first
  }

  /**
   * Get the closest interactive range that can be interacted with
   * @param playerPos - Current player grid position
   * @param ranges - Array of ranges to check
   * @returns The closest interactable range, or null if none available
   */
  static getClosestInteractableRange(playerPos: GridPosition, ranges: Range[]): Range | null {
    const interactions = this.checkInteractions(playerPos, ranges);
    const interactable = interactions.find(result => result.canInteract);
    return interactable?.range || null;
  }

  /**
   * Check if player can interact with a specific range
   * @param playerPos - Current player grid position
   * @param range - Range to check interaction with
   * @returns true if interaction is possible
   */
  static canInteractWith(playerPos: GridPosition, range: Range): boolean {
    if (!range.canInteract()) {
      return false;
    }
    return range.canInteractFrom(playerPos);
  }

  /**
   * Get all ranges that can be interacted with from current position
   * @param playerPos - Current player grid position
   * @param ranges - Array of ranges to check
   * @returns Array of ranges that can be interacted with
   */
  static getInteractableRanges(playerPos: GridPosition, ranges: Range[]): Range[] {
    return this.checkInteractions(playerPos, ranges)
      .filter(result => result.canInteract)
      .map(result => result.range);
  }

  /**
   * Calculate distance from player to range
   * @param playerPos - Player grid position
   * @param rangePos - Range grid position
   * @param rangeSize - Range size
   * @returns Distance to closest point of range
   */
  private static calculateDistance(
    playerPos: GridPosition, 
    rangePos: GridPosition, 
    rangeSize: { width: number; height: number }
  ): number {
    // Find closest point on range to player
    const closestX = Math.max(rangePos.x, Math.min(playerPos.x, rangePos.x + rangeSize.width - 1));
    const closestY = Math.max(rangePos.y, Math.min(playerPos.y, rangePos.y + rangeSize.height - 1));
    
    // Calculate Euclidean distance
    return Math.sqrt(
      Math.pow(playerPos.x - closestX, 2) + 
      Math.pow(playerPos.y - closestY, 2)
    );
  }

  /**
   * Get visual feedback for interaction possibilities
   * @param playerPos - Current player grid position
   * @param ranges - Array of ranges to check
   * @returns Object with interaction feedback data
   */
  static getInteractionFeedback(playerPos: GridPosition, ranges: Range[]) {
    const interactions = this.checkInteractions(playerPos, ranges);
    
    return {
      interactableNow: interactions.filter(r => r.canInteract),
      nearbyInteractable: interactions.filter(r => !r.canInteract && r.distance <= 2),
      allValidPositions: interactions.flatMap(r => r.validPositions)
    };
  }

  /**
   * Get interaction hints for UI display
   * @param playerPos - Current player grid position
   * @param ranges - Array of ranges to check
   * @returns Array of interaction hints
   */
  static getInteractionHints(playerPos: GridPosition, ranges: Range[]): string[] {
    const hints: string[] = [];
    const interactions = this.checkInteractions(playerPos, ranges);
    
    for (const interaction of interactions) {
      if (interaction.canInteract) {
        hints.push(`Press SPACE to interact with ${interaction.range.id}`);
      } else if (interaction.distance <= 2) {
        const condition = (interaction.range as any).interactionCondition;
        if (condition) {
          hints.push(
            `Move to interact with ${interaction.range.id} (${condition.getDescription()})`
          );
        }
      }
    }
    
    return hints;
  }
}
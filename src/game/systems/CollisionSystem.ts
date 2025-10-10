/**
 * Utility functions for game interactions and distance calculations
 */
export const CollisionSystem = {
  /**
   * Calculates distance between two points
   * @param x1 - First point x coordinate
   * @param y1 - First point y coordinate
   * @param x2 - Second point x coordinate
   * @param y2 - Second point y coordinate
   * @returns Distance between the points
   */
  getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2);
  },
};

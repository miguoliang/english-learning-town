import { GameConfig } from '../config/GameConfig';

/**
 * Collision detection utilities for handling player collisions with game objects
 */
export const CollisionSystem = {
  /**
   * Checks if the player would collide with any objects at the given position
   * @param x The x coordinate to check
   * @param y The y coordinate to check
   * @param buildings Array of building game objects
   * @param npcs Array of NPC game objects
   * @param fountain Fountain game object (optional)
   * @returns true if collision detected, false otherwise
   */
  checkCollisions(
    x: number,
    y: number,
    buildings: (Phaser.GameObjects.Rectangle | null)[],
    npcs: (Phaser.GameObjects.Arc | null)[] = [],
    fountain: Phaser.GameObjects.Arc | null = null
  ): boolean {
    const playerBounds = new Phaser.Geom.Rectangle(
      x - GameConfig.PLAYER.collisionPadding,
      y - GameConfig.PLAYER.collisionPadding,
      GameConfig.PLAYER.SIZE,
      GameConfig.PLAYER.SIZE
    );

    // Check collision with buildings
    for (const building of buildings) {
      if (building && CollisionSystem.checkBuildingCollision(playerBounds, building)) {
        return true;
      }
    }

    // Check collision with NPCs
    for (const npc of npcs) {
      if (npc && CollisionSystem.checkNPCCollision(playerBounds, npc)) {
        return true;
      }
    }

    // Check collision with fountain
    if (fountain && CollisionSystem.checkFountainCollision(playerBounds, fountain)) {
      return true;
    }

    return false;
  },

  /**
   * Checks collision between player and a building
   * @param playerBounds Player collision rectangle
   * @param building Building game object
   * @returns true if collision detected
   */
  checkBuildingCollision(
    playerBounds: Phaser.Geom.Rectangle,
    building: Phaser.GameObjects.Rectangle
  ): boolean {
    const buildingBounds = new Phaser.Geom.Rectangle(
      building.x - building.width / 2,
      building.y - building.height / 2,
      building.width,
      building.height
    );

    return Phaser.Geom.Rectangle.Overlaps(playerBounds, buildingBounds);
  },

  /**
   * Checks collision between player and an NPC
   * @param playerBounds Player collision rectangle
   * @param npc NPC game object (circular)
   * @returns true if collision detected
   */
  checkNPCCollision(playerBounds: Phaser.Geom.Rectangle, npc: Phaser.GameObjects.Arc): boolean {
    const npcBounds = new Phaser.Geom.Rectangle(
      npc.x - 30, // NPC radius + padding
      npc.y - 30,
      60, // NPC diameter + padding
      60
    );

    return Phaser.Geom.Rectangle.Overlaps(playerBounds, npcBounds);
  },

  /**
   * Checks collision between player and the fountain
   * @param playerBounds Player collision rectangle
   * @param fountain Fountain game object (circular)
   * @returns true if collision detected
   */
  checkFountainCollision(
    playerBounds: Phaser.Geom.Rectangle,
    fountain: Phaser.GameObjects.Arc
  ): boolean {
    const fountainBounds = new Phaser.Geom.Rectangle(
      fountain.x - 40, // Fountain radius + padding
      fountain.y - 40,
      80, // Fountain collision diameter
      80
    );

    return Phaser.Geom.Rectangle.Overlaps(playerBounds, fountainBounds);
  },

  /**
   * Calculates distance between two points
   * @param x1 First point x
   * @param y1 First point y
   * @param x2 Second point x
   * @param y2 Second point y
   * @returns Distance between the points
   */
  getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2);
  },

  /**
   * Checks if a point is within interaction distance of another point
   * @param x1 First point x
   * @param y1 First point y
   * @param x2 Second point x
   * @param y2 Second point y
   * @param distance Maximum interaction distance
   * @returns true if within interaction distance
   */
  isWithinInteractionDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    distance: number = GameConfig.INTERACTION.DISTANCE
  ): boolean {
    return CollisionSystem.getDistance(x1, y1, x2, y2) < distance;
  },

  /**
   * Checks if player is on the south side of a building (for entry)
   * @param playerY Player Y position
   * @param buildingY Building center Y position
   * @returns true if player is on south side
   */
  isOnSouthSide(playerY: number, buildingY: number): boolean {
    return playerY > buildingY;
  },
};

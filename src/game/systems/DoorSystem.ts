import { Scene } from 'phaser';
import { TilePropertyHelper } from '../utils/TilePropertyHelper';

/**
 * Represents a door's state and position in the game world
 */
interface Door {
  tileX: number;
  tileY: number;
  layer: Phaser.Tilemaps.TilemapLayer;
  isOpen: boolean;
  closedTileId: number;
  openTileId: number;
  collisionBody?: MatterJS.BodyType | null;
  buildingName: string; // e.g., "home", "school", "shop", "library"
}

/**
 * System for managing door interactions, opening/closing, and collision states
 */
export class DoorSystem {
  private scene: Scene;
  private doors: Map<string, Door> = new Map();
  private tilePropertyHelper: TilePropertyHelper;
  private map: Phaser.Tilemaps.Tilemap | null = null;

  constructor(scene: Scene, tilePropertyHelper: TilePropertyHelper) {
    this.scene = scene;
    this.tilePropertyHelper = tilePropertyHelper;
  }

  /**
   * Initializes the door system with the tilemap
   * @param map The tilemap containing doors
   */
  initialize(map: Phaser.Tilemaps.Tilemap): void {
    this.map = map;
  }

  /**
   * Registers a door in the system
   * @param buildingName Name of the building (e.g., "home", "school")
   * @param tileX Tile X coordinate
   * @param tileY Tile Y coordinate
   * @param layer The tilemap layer containing the door
   * @param closedTileId Tile ID for closed door state
   * @param openTileId Tile ID for open door state
   */
  registerDoor(
    buildingName: string,
    tileX: number,
    tileY: number,
    layer: Phaser.Tilemaps.TilemapLayer,
    closedTileId: number,
    openTileId: number
  ): void {
    const doorKey = `${buildingName}_${tileX}_${tileY}`;

    this.doors.set(doorKey, {
      tileX,
      tileY,
      layer,
      isOpen: false,
      closedTileId,
      openTileId,
      collisionBody: null,
      buildingName,
    });

    console.log(`🚪 Registered door at (${tileX}, ${tileY}) for ${buildingName}`);
  }

  /**
   * Associates a Matter.js collision body with a door
   * This allows us to remove collision when the door opens
   * @param buildingName Building name
   * @param tileX Tile X coordinate
   * @param tileY Tile Y coordinate
   * @param body Matter.js body representing the door collision
   */
  setDoorCollisionBody(
    buildingName: string,
    tileX: number,
    tileY: number,
    body: MatterJS.BodyType
  ): void {
    const doorKey = `${buildingName}_${tileX}_${tileY}`;
    const door = this.doors.get(doorKey);

    if (door) {
      door.collisionBody = body;
      console.log(`🚪 Collision body assigned to door at (${tileX}, ${tileY})`);
    }
  }

  /**
   * Finds the nearest door to the player within interaction range
   * @param playerX Player world X position
   * @param playerY Player world Y position
   * @param maxDistance Maximum interaction distance in pixels
   * @returns Door key if found, null otherwise
   */
  findNearestDoor(playerX: number, playerY: number, maxDistance: number = 80): string | null {
    if (!this.map) return null;

    let nearestDoorKey: string | null = null;
    let nearestDistance = Infinity;

    for (const [doorKey, door] of this.doors.entries()) {
      // Convert tile coordinates to world coordinates
      const doorWorldPos = this.tilePropertyHelper.tileToWorldCoords(door.tileX, door.tileY);

      // Calculate distance from player to door
      const distance = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        doorWorldPos.worldX,
        doorWorldPos.worldY
      );

      if (distance < maxDistance && distance < nearestDistance) {
        nearestDistance = distance;
        nearestDoorKey = doorKey;
      }
    }

    return nearestDoorKey;
  }

  /**
   * Toggles a door's state between open and closed
   * @param doorKey The door identifier
   * @returns True if door was toggled, false if door not found
   */
  toggleDoor(doorKey: string): boolean {
    const door = this.doors.get(doorKey);
    if (!door) return false;

    if (door.isOpen) {
      this.closeDoor(doorKey);
    } else {
      this.openDoor(doorKey);
    }

    return true;
  }

  /**
   * Opens a door
   * @param doorKey The door identifier
   */
  openDoor(doorKey: string): void {
    const door = this.doors.get(doorKey);
    if (!door || door.isOpen) return;

    // Change tile to open state
    door.layer.putTileAt(door.openTileId, door.tileX, door.tileY);
    door.isOpen = true;

    // Remove collision body
    if (door.collisionBody && this.scene.matter.world) {
      this.scene.matter.world.remove(door.collisionBody);
      door.collisionBody = null;
    }

    console.log(`🚪 Opened door at (${door.tileX}, ${door.tileY})`);
  }

  /**
   * Closes a door
   * @param doorKey The door identifier
   */
  closeDoor(doorKey: string): void {
    const door = this.doors.get(doorKey);
    if (!door || !door.isOpen) return;

    // Change tile to closed state
    door.layer.putTileAt(door.closedTileId, door.tileX, door.tileY);
    door.isOpen = false;

    // Recreate collision body if needed
    // Note: You'll need to pass the scale and offset for proper positioning
    // This is a simplified version - adjust based on your map setup
    const doorWorldPos = this.tilePropertyHelper.tileToWorldCoords(door.tileX, door.tileY);

    if (this.map && this.scene.matter.world) {
      door.collisionBody = this.scene.matter.add.rectangle(
        doorWorldPos.worldX,
        doorWorldPos.worldY,
        this.map.tileWidth,
        this.map.tileHeight,
        {
          isStatic: true,
          friction: 0.1,
          restitution: 0,
          label: `door_collision_${door.buildingName}`,
        }
      ) as unknown as MatterJS.BodyType;
    }

    console.log(`🚪 Closed door at (${door.tileX}, ${door.tileY})`);
  }

  /**
   * Checks if a door is currently open
   * @param doorKey The door identifier
   * @returns True if door is open, false otherwise
   */
  isDoorOpen(doorKey: string): boolean {
    const door = this.doors.get(doorKey);
    return door ? door.isOpen : false;
  }

  /**
   * Gets the building name for a door
   * @param doorKey The door identifier
   * @returns Building name or null if not found
   */
  getDoorBuilding(doorKey: string): string | null {
    const door = this.doors.get(doorKey);
    return door ? door.buildingName : null;
  }

  /**
   * Cleans up all doors and resources
   */
  destroy(): void {
    // Remove all collision bodies
    for (const door of this.doors.values()) {
      if (door.collisionBody && this.scene.matter.world) {
        this.scene.matter.world.remove(door.collisionBody);
      }
    }

    this.doors.clear();
  }
}


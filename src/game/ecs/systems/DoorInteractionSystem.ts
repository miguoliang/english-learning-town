import { IWorld, defineQuery } from 'bitecs';
import { DoorComponent, DoorLayerRegistry, DoorCollisionRegistry } from '../components/DoorComponent';
import { InteractableComponent } from '../components/InteractableComponent';
import { PositionComponent } from '../components/PositionComponent';

/**
 * Query for all door entities with required components
 */
const doorQuery = defineQuery([DoorComponent, InteractableComponent, PositionComponent]);

/**
 * System for handling door interactions, opening/closing, and collision states
 * This is the ECS version of the old DoorSystem
 */
export class DoorInteractionSystem {
  private scene: Phaser.Scene;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private doorHighlights: Map<number, Phaser.GameObjects.Graphics> = new Map();
  private showDebugHighlights: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Finds the nearest interactable door to a given position
   * @param world - The ECS world
   * @param x - X position to check from
   * @param y - Y position to check from
   * @returns Entity ID of nearest door, or null if none in range
   */
  findNearestDoor(world: IWorld, x: number, y: number): number | null {
    const doors = doorQuery(world);
    let nearestDoor: number | null = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < doors.length; i++) {
      const eid = doors[i];

      // Skip inactive doors
      if (InteractableComponent.isActive[eid] === 0) continue;

      const doorX = PositionComponent.x[eid];
      const doorY = PositionComponent.y[eid];
      const interactionRange = InteractableComponent.interactionRange[eid];

      // Calculate distance
      const distance = Math.sqrt((x - doorX) ** 2 + (y - doorY) ** 2);

      if (distance <= interactionRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestDoor = eid;
      }
    }

    return nearestDoor;
  }

  /**
   * Toggles a door between open and closed states
   * @param world - The ECS world
   * @param doorEntityId - The door entity ID
   * @returns True if successfully toggled, false otherwise
   */
  toggleDoor(world: IWorld, doorEntityId: number): boolean {
    if (!doorQuery(world).includes(doorEntityId)) return false;

    const isOpen = DoorComponent.isOpen[doorEntityId];

    if (isOpen === 1) {
      this.closeDoor(doorEntityId);
    } else {
      this.openDoor(doorEntityId);
    }

    return true;
  }

  /**
   * Opens a door entity
   * @param doorEntityId - The door entity ID
   */
  openDoor(doorEntityId: number): void {
    if (DoorComponent.isOpen[doorEntityId] === 1) return;

    const tileX = DoorComponent.tileX[doorEntityId];
    const tileY = DoorComponent.tileY[doorEntityId];
    const openTileId = DoorComponent.openTileId[doorEntityId];
    const layer = DoorLayerRegistry.get(doorEntityId);

    if (!layer) {
      console.warn(`🚪 No layer found for door entity ${doorEntityId}`);
      return;
    }

    // Change tile to open state
    layer.putTileAt(openTileId, tileX, tileY);
    DoorComponent.isOpen[doorEntityId] = 1;

    // Remove collision body
    const collisionBody = DoorCollisionRegistry.get(doorEntityId);
    if (collisionBody && this.scene.matter.world) {
      this.scene.matter.world.remove(collisionBody);
      DoorCollisionRegistry.delete(doorEntityId);
    }

    console.log(`🚪 Opened door at (${tileX}, ${tileY}) (eid: ${doorEntityId})`);
  }

  /**
   * Closes a door entity
   * @param doorEntityId - The door entity ID
   */
  closeDoor(doorEntityId: number): void {
    if (DoorComponent.isOpen[doorEntityId] === 0) return;

    const tileX = DoorComponent.tileX[doorEntityId];
    const tileY = DoorComponent.tileY[doorEntityId];
    const closedTileId = DoorComponent.closedTileId[doorEntityId];
    const layer = DoorLayerRegistry.get(doorEntityId);

    if (!layer) {
      console.warn(`🚪 No layer found for door entity ${doorEntityId}`);
      return;
    }

    // Change tile to closed state
    layer.putTileAt(closedTileId, tileX, tileY);
    DoorComponent.isOpen[doorEntityId] = 0;

    // Recreate collision body
    const doorX = PositionComponent.x[doorEntityId];
    const doorY = PositionComponent.y[doorEntityId];

    if (this.scene.matter.world) {
      // Get tile size from layer
      const tileWidth = layer.tilemap ? layer.tilemap.tileWidth : 16;
      const tileHeight = layer.tilemap ? layer.tilemap.tileHeight : 16;
      const scale = layer.scaleX;

      const collisionBody = this.scene.matter.add.rectangle(
        doorX,
        doorY,
        tileWidth * scale,
        tileHeight * scale,
        {
          isStatic: true,
          friction: 0.1,
          restitution: 0,
          label: `door_collision_${doorEntityId}`,
        }
      ) as unknown as MatterJS.BodyType;

      DoorCollisionRegistry.set(doorEntityId, collisionBody);
    }

    console.log(`🚪 Closed door at (${tileX}, ${tileY}) (eid: ${doorEntityId})`);
  }

  /**
   * Checks if a door is currently open
   * @param doorEntityId - The door entity ID
   * @returns True if door is open, false otherwise
   */
  isDoorOpen(doorEntityId: number): boolean {
    return DoorComponent.isOpen[doorEntityId] === 1;
  }

  /**
   * Updates all doors - handles cooldowns and player proximity
   * @param world - The ECS world
   * @param playerX - Player X position
   * @param playerY - Player Y position
   */
  update(world: IWorld, playerX: number, playerY: number): void {
    const doors = doorQuery(world);

    for (let i = 0; i < doors.length; i++) {
      const eid = doors[i];

      // Update cooldown
      if (InteractableComponent.cooldown[eid] > 0) {
        InteractableComponent.cooldown[eid]--;
      }

      // Update player in range status
      const doorX = PositionComponent.x[eid];
      const doorY = PositionComponent.y[eid];
      const interactionRange = InteractableComponent.interactionRange[eid];
      const distance = Math.sqrt((playerX - doorX) ** 2 + (playerY - doorY) ** 2);

      InteractableComponent.playerInRange[eid] = distance <= interactionRange ? 1 : 0;
    }

    // Update debug highlights if enabled
    if (this.showDebugHighlights) {
      this.updateDebugHighlights(world);
    }
  }

  /**
   * Toggles debug highlighting of doors
   * @param enabled - Whether to show highlights
   */
  setDebugHighlights(enabled: boolean): void {
    this.showDebugHighlights = enabled;
    if (!enabled) {
      this.clearDebugHighlights();
    }
  }

  /**
   * Updates debug visual highlights for all doors
   * @param world - The ECS world
   */
  private updateDebugHighlights(world: IWorld): void {
    const doors = doorQuery(world);

    // Clear old highlights
    this.clearDebugHighlights();

    for (let i = 0; i < doors.length; i++) {
      const eid = doors[i];
      const doorX = PositionComponent.x[eid];
      const doorY = PositionComponent.y[eid];
      const interactionRange = InteractableComponent.interactionRange[eid];
      const isOpen = DoorComponent.isOpen[eid] === 1;
      const playerInRange = InteractableComponent.playerInRange[eid] === 1;

      // Create graphics for this door
      const graphics = this.scene.add.graphics();
      graphics.setDepth(20000); // Render above everything

      // Draw interaction range circle
      if (playerInRange) {
        graphics.lineStyle(2, 0x00ff00, 0.8); // Green if in range
      } else {
        graphics.lineStyle(2, 0xffff00, 0.5); // Yellow if out of range
      }
      graphics.strokeCircle(doorX, doorY, interactionRange);

      // Draw door position marker
      const markerSize = 8;
      if (isOpen) {
        graphics.fillStyle(0x00ff00, 0.8); // Green if open
      } else {
        graphics.fillStyle(0xff0000, 0.8); // Red if closed
      }
      graphics.fillRect(doorX - markerSize / 2, doorY - markerSize / 2, markerSize, markerSize);

      // Draw door state text
      const stateText = isOpen ? 'OPEN' : 'CLOSED';
      const text = this.scene.add.text(doorX, doorY - 20, stateText, {
        fontSize: '12px',
        color: isOpen ? '#00ff00' : '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      text.setOrigin(0.5);
      text.setDepth(20001);

      this.doorHighlights.set(eid, graphics);
      this.doorHighlights.set(eid + 0.1, text as any); // Store text separately
    }
  }

  /**
   * Clears all debug highlight graphics
   */
  private clearDebugHighlights(): void {
    for (const [, graphic] of this.doorHighlights) {
      if (graphic) {
        graphic.destroy();
      }
    }
    this.doorHighlights.clear();
  }

  /**
   * Cleans up all door resources
   * @param world - The ECS world
   */
  cleanup(world: IWorld): void {
    const doors = doorQuery(world);

    for (let i = 0; i < doors.length; i++) {
      const eid = doors[i];
      const collisionBody = DoorCollisionRegistry.get(eid);

      if (collisionBody && this.scene.matter.world) {
        this.scene.matter.world.remove(collisionBody);
      }

      DoorCollisionRegistry.delete(eid);
      DoorLayerRegistry.delete(eid);
    }

    this.clearDebugHighlights();
  }
}


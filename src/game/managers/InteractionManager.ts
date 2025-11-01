import { Scene } from 'phaser';
import { IWorld } from 'bitecs';
import { DoorInteractionSystem } from '../ecs/systems/DoorInteractionSystem';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { DoorComponent } from '../ecs/components/DoorComponent';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { GameConfig } from '../config/GameConfig';
import { MapTransform } from '../utils/PlayerUtils';

/**
 * Configuration for door interaction handler
 */
export interface DoorInteractionConfig {
  doorInteractionSystem: DoorInteractionSystem;
  ecsWorld: IWorld;
  player: Phaser.GameObjects.Sprite;
  playerController: BasePlayerController;
  interactionPrompt: Phaser.GameObjects.Text;
  doorToBuilding: Map<number, string>;
  map: Phaser.Tilemaps.Tilemap;
  transform: MapTransform;
  onTransition?: (doorEntityId: number, buildingName: string) => void;
}

/**
 * Configuration for exit interaction handler
 */
export interface ExitInteractionConfig {
  player: Phaser.GameObjects.Sprite;
  playerController: BasePlayerController;
  interactionPrompt: Phaser.GameObjects.Text;
  exitArea: { x: number; y: number; range: number };
  onExit: () => void;
}

/**
 * Manages player interactions (doors, exits, etc.)
 */
export class InteractionManager {
  private scene: Scene;
  private doorInteractionConfig: DoorInteractionConfig | null = null;
  private exitInteractionConfig: ExitInteractionConfig | null = null;
  private hasLoggedConfigMissing = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Sets up door interaction handling
   */
  setupDoorInteractions(config: DoorInteractionConfig): void {
    this.doorInteractionConfig = config;
  }

  /**
   * Sets up exit interaction handling
   */
  setupExitInteraction(config: ExitInteractionConfig): void {
    this.exitInteractionConfig = config;
  }

  /**
   * Updates door interactions - call this from scene update()
   */
  updateDoorInteractions(): void {
    if (!this.doorInteractionConfig) {
      // Debug: log once if config is missing
      if (!this.hasLoggedConfigMissing) {
        console.warn('⚠️ Door interaction config not set up');
        this.hasLoggedConfigMissing = true;
      }
      return;
    }

    const {
      doorInteractionSystem,
      ecsWorld,
      player,
      playerController,
      interactionPrompt,
      doorToBuilding,
      map,
      transform,
      onTransition,
    } = this.doorInteractionConfig;

    // Find nearest door to player
    const nearestDoor = doorInteractionSystem.findNearestDoor(ecsWorld, player.x, player.y);

    // Update interaction prompt
    if (nearestDoor !== null) {
      const isOpen = doorInteractionSystem.isDoorOpen(nearestDoor);
      const buildingName = doorToBuilding.get(nearestDoor);

      // Check if SPACE key was pressed FIRST (before checking for transition)
      // This allows closing doors even when standing in the doorway
      if (playerController['keyboardHandler'].isSpaceJustPressed()) {
        doorInteractionSystem.toggleDoor(ecsWorld, nearestDoor);
        // After toggling, update the open state
        const newIsOpen = doorInteractionSystem.isDoorOpen(nearestDoor);
        if (newIsOpen && buildingName && this.isPlayerWalkingThroughDoor(nearestDoor, player, map, transform)) {
          // Only trigger transition if door was just opened and player is walking through
          if (onTransition) {
            onTransition(nearestDoor, buildingName);
          }
        }
        return;
      }

      // Check if player is walking through an open door (only if door is open and player didn't just toggle)
      if (isOpen && buildingName && this.isPlayerWalkingThroughDoor(nearestDoor, player, map, transform)) {
        if (onTransition) {
          onTransition(nearestDoor, buildingName);
        }
        return;
      }

      const action = isOpen ? 'close' : 'open';
      interactionPrompt.setText(`Press SPACE to ${action} door`);
      interactionPrompt.setVisible(true);
    } else {
      interactionPrompt.setVisible(false);
    }
  }

  /**
   * Updates exit interaction - call this from scene update()
   */
  updateExitInteraction(): void {
    if (!this.exitInteractionConfig) return;

    const { player, playerController, interactionPrompt, exitArea, onExit } = this.exitInteractionConfig;

    const playerX = player.x;
    const playerY = player.y;
    const distance = Math.sqrt(
      (playerX - exitArea.x) ** 2 + (playerY - exitArea.y) ** 2
    );

    if (distance <= exitArea.range) {
      interactionPrompt.setText('Press SPACE to exit');
      interactionPrompt.setVisible(true);

      // Check if SPACE key was pressed
      if (playerController['keyboardHandler'].isSpaceJustPressed()) {
        onExit();
      }
    } else {
      interactionPrompt.setVisible(false);
    }
  }

  /**
   * Checks if player is walking through an open door
   */
  private isPlayerWalkingThroughDoor(
    doorEntityId: number,
    player: Phaser.GameObjects.Sprite,
    map: Phaser.Tilemaps.Tilemap,
    transform: MapTransform
  ): boolean {
    // Get door position and dimensions
    const doorX = PositionComponent.x[doorEntityId];
    const doorY = PositionComponent.y[doorEntityId];
    const doorWidth = DoorComponent.tileWidth[doorEntityId] * map.tileWidth;
    const doorHeight = DoorComponent.tileHeight[doorEntityId] * map.tileHeight;

    const scaledDoorWidth = doorWidth * transform.scale;
    const scaledDoorHeight = doorHeight * transform.scale;

    // Check if player is within the door area (with some tolerance)
    const threshold = Math.max(scaledDoorWidth, scaledDoorHeight) * 0.6; // 60% of door size
    const distanceX = Math.abs(player.x - doorX);
    const distanceY = Math.abs(player.y - doorY);

    // Player is walking through if they're close to the door center
    return distanceX < threshold && distanceY < threshold;
  }

  /**
   * Creates an interaction prompt UI element
   */
  static createInteractionPrompt(scene: Scene): Phaser.GameObjects.Text {
    const prompt = scene.add.text(GameConfig.UI.centerX, GameConfig.screenHeight - 100, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 },
      align: 'center',
    });
    prompt.setOrigin(0.5);
    prompt.setDepth(10000);
    prompt.setVisible(false);
    return prompt;
  }
}


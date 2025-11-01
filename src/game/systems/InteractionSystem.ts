import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { TownEnvironmentBuilder } from '../builders/TownEnvironmentBuilder';
import { DoorSystem } from './DoorSystem';

/**
 * System responsible for handling player interactions with doors
 */
export class InteractionSystem {
  private scene: Scene;
  private interactionPrompt: Phaser.GameObjects.Text | null = null;
  private nearbyInteractable: string | null = null;
  private nearbyDoorKey: string | null = null;

  // References to managers
  private townBuilder: TownEnvironmentBuilder;
  private doorSystem: DoorSystem | null = null;

  constructor(scene: Scene, townBuilder: TownEnvironmentBuilder) {
    this.scene = scene;
    this.townBuilder = townBuilder;
    this.createInteractionPrompt();
  }

  /**
   * Sets the door system for door interactions
   * @param doorSystem The door system instance
   */
  setDoorSystem(doorSystem: DoorSystem): void {
    this.doorSystem = doorSystem;
  }

  /**
   * Creates the interaction prompt text
   */
  private createInteractionPrompt(): void {
    this.interactionPrompt = this.scene.add
      .text(
        GameConfig.UI.centerX,
        GameConfig.INTERACTION.promptY,
        '',
        GameConfig.INTERACTION.promptStyle
      )
      .setOrigin(0.5)
      .setVisible(false);
  }

  /**
   * Checks for nearby interactable objects and updates the interaction prompt
   * @param playerX Player X position
   * @param playerY Player Y position
   */
  checkNearbyInteractables(playerX: number, playerY: number): void {
    const interactionDistance = GameConfig.INTERACTION.DISTANCE;
    let nearestObject = null;
    let nearestDistance = Infinity;
    let interactionText = '';
    let interactionType = '';

    // Check for nearby doors
    if (this.doorSystem) {
      const nearbyDoorKey = this.doorSystem.findNearestDoor(playerX, playerY, interactionDistance);

      if (nearbyDoorKey) {
        const buildingName = this.doorSystem.getDoorBuilding(nearbyDoorKey);
        const isDoorOpen = this.doorSystem.isDoorOpen(nearbyDoorKey);

        // Calculate door distance (using doorSystem's internal check)
        const doorDistance = 0; // Door is within range if found

        if (doorDistance < nearestDistance) {
          nearestDistance = doorDistance;
          nearestObject = `${buildingName} Door`;
          interactionText = `Press SPACE to ${isDoorOpen ? 'close' : 'open'} door`;
          interactionType = 'door';
          this.nearbyDoorKey = nearbyDoorKey;
        }
      } else {
        this.nearbyDoorKey = null;
      }
    }

    this.updateInteractionPrompt(nearestObject, nearestDistance, interactionText, interactionType);
  }

  /**
   * Updates the interaction prompt based on nearby objects
   */
  private updateInteractionPrompt(
    nearestObject: string | null,
    nearestDistance: number,
    interactionText: string,
    interactionType: string
  ): void {
    if (nearestObject && nearestDistance < GameConfig.INTERACTION.DISTANCE) {
      if (this.nearbyInteractable !== nearestObject) {
        this.nearbyInteractable = nearestObject;
        if (!this.interactionPrompt) {
          throw new Error('Interaction prompt not initialized. Cannot update interaction text.');
        }
        this.interactionPrompt.setText(interactionText);
        this.interactionPrompt.setVisible(true);
      }
    } else {
      this.clearInteraction();
    }
  }

  /**
   * Clears all interaction states
   */
  private clearInteraction(): void {
    if (this.nearbyInteractable !== null) {
      this.nearbyInteractable = null;
      this.nearbyDoorKey = null;
      if (!this.interactionPrompt) {
        throw new Error('Interaction prompt not initialized. Cannot clear interaction.');
      }
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Handles spacebar interactions with doors
   */
  handleSpacebarInteraction(): void {
    // Handle door interactions
    if (this.nearbyDoorKey && this.doorSystem) {
      this.doorSystem.toggleDoor(this.nearbyDoorKey);
    }
  }

  /**
   * Destroys the interaction system and cleans up resources
   */
  destroy(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
      this.interactionPrompt = null;
    }

    this.nearbyInteractable = null;
    this.nearbyDoorKey = null;
  }
}

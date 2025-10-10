import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameConfig } from '../config/GameConfig';
import { CollisionSystem } from './CollisionSystem';
import { TownEnvironmentBuilder } from '../builders/TownEnvironmentBuilder';
import { NPCManager } from '../managers/NPCManager';
import { DoorSystem } from './DoorSystem';

/**
 * System responsible for handling player interactions with NPCs, buildings, and doors
 */
export class InteractionSystem {
  private scene: Scene;
  private interactionPrompt: Phaser.GameObjects.Text | null = null;
  private nearbyInteractable: string | null = null;
  private nearbyNpcType: string | null = null;
  private nearbyBuildingEntry: string | null = null;
  private nearbyDoorKey: string | null = null;

  // References to managers
  private townBuilder: TownEnvironmentBuilder;
  private npcManager: NPCManager;
  private doorSystem: DoorSystem | null = null;

  constructor(scene: Scene, townBuilder: TownEnvironmentBuilder, npcManager: NPCManager) {
    this.scene = scene;
    this.townBuilder = townBuilder;
    this.npcManager = npcManager;
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

    // Check distance to NPCs
    const npcData = this.getNPCInteractionData();

    for (const npc of npcData) {
      const npcObj = this.npcManager.getNPC(npc.key);
      if (npcObj) {
        const distance = CollisionSystem.getDistance(playerX, playerY, npcObj.x, npcObj.y);

        if (distance < interactionDistance && distance < nearestDistance) {
          nearestDistance = distance;
          nearestObject = npc.name;
          interactionText = npc.text;
          interactionType = 'npc';
          this.nearbyNpcType = npc.npcType;
        }
      }
    }

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
          // Clear NPC interaction when door is closer
          this.nearbyNpcType = null;
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
      this.nearbyNpcType = null;
      this.nearbyDoorKey = null;
      if (!this.interactionPrompt) {
        throw new Error('Interaction prompt not initialized. Cannot clear interaction.');
      }
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Handles spacebar interactions with NPCs and doors
   */
  handleSpacebarInteraction(): void {
    // Handle door interactions (priority)
    if (this.nearbyDoorKey && this.doorSystem) {
      this.doorSystem.toggleDoor(this.nearbyDoorKey);
      return;
    }

    // Handle NPC interactions
    if (this.nearbyNpcType) {
      const npcData = this.npcManager.getNPCData(this.nearbyNpcType);
      if (npcData) {
        EventBus.emit('talk-to-npc', {
          npc: npcData.type,
          name: npcData.name,
          greeting: npcData.greeting,
          activity: npcData.activity,
        });
      }
    }
  }

  /**
   * Sets up click interactions for NPCs
   */
  setupClickInteractions(): void {
    this.setupNPCClickInteractions();
  }

  /**
   * Sets up NPC click interactions
   */
  private setupNPCClickInteractions(): void {
    // No NPCs defined, so no interactions to set up
  }


  /**
   * Gets NPC interaction data for interaction checking
   */
  private getNPCInteractionData(): Array<{
    key: string;
    name: string;
    text: string;
    npcType: string;
  }> {
    return [];
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
    this.nearbyNpcType = null;
    this.nearbyBuildingEntry = null;
    this.nearbyDoorKey = null;
  }
}

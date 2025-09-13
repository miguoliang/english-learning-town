import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameConfig } from '../config/GameConfig';
import { CollisionSystem } from './CollisionSystem';
import { TownEnvironmentBuilder } from '../builders/TownEnvironmentBuilder';
import { NPCManager } from '../managers/NPCManager';

/**
 * System responsible for handling player interactions with NPCs and buildings
 */
export class InteractionSystem {
  private scene: Scene;
  private interactionPrompt: Phaser.GameObjects.Text | null = null;
  private nearbyInteractable: string | null = null;
  private nearbyNpcType: string | null = null;
  private nearbyBuildingEntry: string | null = null;

  // References to managers
  private townBuilder: TownEnvironmentBuilder;
  private npcManager: NPCManager;

  constructor(scene: Scene, townBuilder: TownEnvironmentBuilder, npcManager: NPCManager) {
    this.scene = scene;
    this.townBuilder = townBuilder;
    this.npcManager = npcManager;
    this.createInteractionPrompt();
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

    // Check distance to building entry zones
    const buildingEntryData = this.getBuildingEntryData();

    for (const building of buildingEntryData) {
      const buildingObj = this.townBuilder.getBuilding(building.key);
      if (buildingObj) {
        const buildingSouthY = buildingObj.y + buildingObj.height / 2;
        const entryZoneDistance = CollisionSystem.getDistance(
          playerX,
          playerY,
          buildingObj.x,
          buildingSouthY
        );

        // Only allow entry from the south side
        const isOnSouthSide = CollisionSystem.isOnSouthSide(playerY, buildingObj.y);

        if (
          entryZoneDistance < interactionDistance &&
          entryZoneDistance < nearestDistance &&
          isOnSouthSide
        ) {
          nearestDistance = entryZoneDistance;
          nearestObject = building.name;
          interactionText = building.text;
          interactionType = 'building';
          this.nearbyBuildingEntry = building.sceneKey;
        }
      }
    }

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
          this.nearbyBuildingEntry = null; // Clear building entry when NPC is closer
        }
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

        // Clear the appropriate interaction type when switching
        if (interactionType === 'npc') {
          this.nearbyBuildingEntry = null;
        } else if (interactionType === 'building') {
          this.nearbyNpcType = null;
        }
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
      this.nearbyBuildingEntry = null;
      if (!this.interactionPrompt) {
        throw new Error('Interaction prompt not initialized. Cannot clear interaction.');
      }
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Handles spacebar interactions with NPCs and building entries
   */
  handleSpacebarInteraction(): void {
    // Handle building entry first (higher priority when both are available)
    if (this.nearbyBuildingEntry) {
      this.scene.scene.start(this.nearbyBuildingEntry);
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
   * Sets up click interactions for buildings and NPCs
   */
  setupClickInteractions(): void {
    this.setupBuildingClickInteractions();
    this.setupNPCClickInteractions();
  }

  /**
   * Sets up building click interactions
   */
  private setupBuildingClickInteractions(): void {
    // School interactions
    const school = this.townBuilder.getBuilding('school');
    if (school) {
      school.on('pointerdown', () => {
        EventBus.emit('enter-school', {
          location: 'school',
          npc: 'Ms. Smith',
          activity: 'grammar-lesson',
        });
      });
    }

    // Library interactions
    const library = this.townBuilder.getBuilding('library');
    if (library) {
      library.on('pointerdown', () => {
        EventBus.emit('enter-library', {
          location: 'library',
          npc: 'Mr. Johnson',
          activity: 'reading-comprehension',
        });
      });
    }

    // Cafe interactions
    const cafe = this.townBuilder.getBuilding('cafe');
    if (cafe) {
      cafe.on('pointerdown', () => {
        EventBus.emit('enter-cafe', {
          location: 'cafe',
          activity: 'conversation-practice',
        });
      });
    }

    // Shop interactions
    const shop = this.townBuilder.getBuilding('shop');
    if (shop) {
      shop.on('pointerdown', () => {
        EventBus.emit('enter-shop', {
          location: 'shop',
          npc: 'Mr. Brown',
          activity: 'vocabulary-shopping',
        });
      });
    }
  }

  /**
   * Sets up NPC click interactions
   */
  private setupNPCClickInteractions(): void {
    const teacher = this.npcManager.getNPC('teacher');
    if (teacher) {
      teacher.on('pointerdown', () => {
        const teacherData = this.npcManager.getNPCData('teacher');
        if (teacherData) {
          EventBus.emit('talk-to-npc', {
            npc: teacherData.type,
            name: teacherData.name,
            greeting: teacherData.greeting,
            activity: teacherData.activity,
          });
        }
      });
    }

    const librarian = this.npcManager.getNPC('librarian');
    if (librarian) {
      librarian.on('pointerdown', () => {
        const librarianData = this.npcManager.getNPCData('librarian');
        if (librarianData) {
          EventBus.emit('talk-to-npc', {
            npc: librarianData.type,
            name: librarianData.name,
            greeting: librarianData.greeting,
            activity: librarianData.activity,
          });
        }
      });
    }

    const shopkeeper = this.npcManager.getNPC('shopkeeper');
    if (shopkeeper) {
      shopkeeper.on('pointerdown', () => {
        const shopkeeperData = this.npcManager.getNPCData('shopkeeper');
        if (shopkeeperData) {
          EventBus.emit('talk-to-npc', {
            npc: shopkeeperData.type,
            name: shopkeeperData.name,
            greeting: shopkeeperData.greeting,
            activity: shopkeeperData.activity,
          });
        }
      });
    }
  }

  /**
   * Gets building entry data for interaction checking
   */
  private getBuildingEntryData(): Array<{
    key: 'school' | 'library' | 'cafe' | 'shop';
    name: string;
    text: string;
    sceneKey: string;
  }> {
    return [
      {
        key: 'school',
        name: 'School',
        text: 'Press SPACEBAR to enter School',
        sceneKey: 'SchoolInterior',
      },
      {
        key: 'library',
        name: 'Library',
        text: 'Press SPACEBAR to enter Library',
        sceneKey: 'LibraryInterior',
      },
      {
        key: 'cafe',
        name: 'Cafe',
        text: 'Press SPACEBAR to enter Cafe',
        sceneKey: 'CafeInterior',
      },
      {
        key: 'shop',
        name: 'Shop',
        text: 'Press SPACEBAR to enter Shop',
        sceneKey: 'ShopInterior',
      },
    ];
  }

  /**
   * Gets NPC interaction data for interaction checking
   */
  private getNPCInteractionData(): Array<{
    key: 'teacher' | 'librarian' | 'shopkeeper';
    name: string;
    text: string;
    npcType: string;
  }> {
    return [
      {
        key: 'teacher',
        name: 'Ms. Smith',
        text: 'Press SPACEBAR to talk to Ms. Smith',
        npcType: 'teacher',
      },
      {
        key: 'librarian',
        name: 'Mr. Johnson',
        text: 'Press SPACEBAR to talk to Mr. Johnson',
        npcType: 'librarian',
      },
      {
        key: 'shopkeeper',
        name: 'Mr. Brown',
        text: 'Press SPACEBAR to talk to Mr. Brown',
        npcType: 'shopkeeper',
      },
    ];
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
  }
}

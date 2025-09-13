import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

interface LearningProgress {
  grammar: number;
  vocabulary: number;
  reading: number;
  conversation: number;
}
import { BasePlayerController } from '../controllers/BasePlayerController';
import { TownEnvironmentBuilder } from '../builders/TownEnvironmentBuilder';
import { NPCManager } from '../managers/NPCManager';
import { InteractionSystem } from '../systems/InteractionSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { GameHUD } from '../ui/GameHUD';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  // Core systems and managers
  private playerController: BasePlayerController;
  private townBuilder: TownEnvironmentBuilder;
  private npcManager: NPCManager;
  private interactionSystem: InteractionSystem;
  private gameHUD: GameHUD;

  // Game objects for collision detection
  private buildings: (Phaser.GameObjects.Rectangle | null)[] = [];
  private npcs: (Phaser.GameObjects.Arc | null)[] = [];
  private fountain: Phaser.GameObjects.Arc | null = null;

  constructor() {
    super('Game');
  }

  create(data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    this.createSceneTitle();
    this.createInstructions();
    this.setupGameSystems();
    this.createPlayer(data?.exitBuilding);
    this.initializeHUD();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the main scene title
   */
  private createSceneTitle(): void {
    this.add
      .text(GameConfig.UI.centerX, 50, 'English Learning Town', GameConfig.textStyles.TITLE)
      .setOrigin(0.5);
  }

  /**
   * Creates the instruction text
   */
  private createInstructions(): void {
    this.add
      .text(
        GameConfig.UI.centerX,
        100,
        'Use Arrow Keys or WASD to move • Press SPACEBAR to enter buildings or talk to NPCs!',
        GameConfig.textStyles.INSTRUCTION
      )
      .setOrigin(0.5);
  }

  /**
   * Sets up all game systems and managers
   */
  private setupGameSystems(): void {
    // Initialize managers and builders
    this.townBuilder = new TownEnvironmentBuilder(this);
    this.npcManager = new NPCManager(this);
    this.playerController = new BasePlayerController(this);

    // Create town environment and NPCs
    const townData = this.townBuilder.createTownEnvironment();
    this.buildings = Object.values(townData.buildings).filter(
      (building): building is Phaser.GameObjects.Rectangle => building !== null
    );
    this.fountain = townData.fountain;

    const npcData = this.npcManager.createNPCs();
    this.npcs = Object.values(npcData);

    // Initialize interaction system
    this.interactionSystem = new InteractionSystem(this, this.townBuilder, this.npcManager);
    this.interactionSystem.setupClickInteractions();
  }

  /**
   * Creates the player sprite
   */
  private createPlayer(exitBuilding?: string): void {
    let playerPosition: { x: number; y: number } = { x: GameConfig.UI.centerX, y: 580 };

    if (exitBuilding) {
      playerPosition = this.playerController.positionPlayerFromBuilding(exitBuilding);
    }

    this.playerController.createPlayer(playerPosition.x, playerPosition.y, false);
  }

  /**
   * Initializes the HUD system and sets up progress update listeners
   */
  private initializeHUD(): void {
    // Create the HUD
    this.gameHUD = new GameHUD(this);

    // Set up event listeners for progress updates
    EventBus.on('update-learning-progress', (data: { skill: string; value: number }) => {
      if (this.gameHUD) {
        this.gameHUD.updateProgress(data.skill as keyof LearningProgress, data.value);
      }
    });

    // Set up event listener for bulk progress updates
    EventBus.on('update-all-progress', (progress: Partial<LearningProgress>) => {
      if (this.gameHUD) {
        this.gameHUD.updateAllProgress(progress);
      }
    });

    // Set up event listener for HUD notifications
    EventBus.on('show-progress-notification', (data: { message: string; duration?: number }) => {
      if (this.gameHUD) {
        this.gameHUD.showNotification(data.message, data.duration);
      }
    });
  }

  /**
   * Updates the game state every frame
   */
  update(time: number, delta: number): void {
    const playerPos = this.playerController.getPlayerPosition();

    // Handle player movement with collision detection
    this.playerController.updateDeltaMovement(delta, (x: number, y: number) =>
      CollisionSystem.checkCollisions(x, y, this.buildings, this.npcs, this.fountain)
    );

    // Check for nearby interactions
    this.interactionSystem.checkNearbyInteractables(playerPos.x, playerPos.y);

    // Handle spacebar interaction
    if (this.playerController.isSpaceJustPressed()) {
      this.interactionSystem.handleSpacebarInteraction();
    }
  }

  /**
   * Cleanup when scene changes
   */
  private cleanup(): void {
    if (this.playerController) {
      this.playerController.destroy();
    }
    if (this.interactionSystem) {
      this.interactionSystem.destroy();
    }
    if (this.gameHUD) {
      this.gameHUD.destroy();
    }

    // Clean up event listeners
    EventBus.removeListener('update-learning-progress');
    EventBus.removeListener('update-all-progress');
    EventBus.removeListener('show-progress-notification');
  }

  /**
   * Changes to the game over scene with cleanup
   */
  changeScene(): void {
    this.cleanup();
    this.scene.start('GameOver');
  }
}

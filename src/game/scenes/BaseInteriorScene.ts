import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';

/**
 * Base class for all interior scenes to eliminate code duplication
 */
export abstract class BaseInteriorScene extends Scene {
  protected camera: Phaser.Cameras.Scene2D.Camera;
  protected playerController: BasePlayerController;
  protected player: Phaser.Physics.Arcade.Image | null = null;
  protected exitZone: Phaser.GameObjects.Rectangle | null = null;
  protected interactionPrompt: Phaser.GameObjects.Text | null = null;
  protected nearExit: boolean = false;
  protected obstacles: Phaser.Physics.Arcade.StaticGroup | null = null;

  // Abstract properties that must be defined by subclasses
  protected abstract sceneBackgroundColor: number;
  protected abstract floorColor: number;
  protected abstract sceneTitle: string;
  protected abstract sceneIcon: string;
  protected abstract exitBuildingName: string;

  create(): void {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(this.sceneBackgroundColor);

    // Enable physics
    this.physics.world.setBounds(0, 0, GameConfig.screenWidth, GameConfig.screenHeight);

    // Create static group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Create the basic interior structure
    this.createBasicInterior();
    this.createExitZone();

    // Create player controller and player
    this.playerController = new BasePlayerController(this);
    this.player = this.playerController.createPlayer(
      GameConfig.UI.centerX,
      GameConfig.INTERIOR.playerStartY,
      true
    ) as Phaser.Physics.Arcade.Image;

    this.createInteractionPrompt();

    // Set up collision detection
    this.physics.add.collider(this.player, this.obstacles);

    // Create scene-specific elements
    this.createSceneElements();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the basic interior structure (floor, walls, title)
   */
  private createBasicInterior(): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. Make sure create() is called before createBasicInterior().'
      );
    }

    // Create floor
    this.add.rectangle(
      GameConfig.UI.centerX,
      GameConfig.UI.centerY,
      GameConfig.screenWidth,
      GameConfig.screenHeight,
      this.floorColor
    );

    // Create walls as physics obstacles
    this.obstacles.add(
      this.add.rectangle(
        GameConfig.UI.centerX,
        50,
        GameConfig.screenWidth,
        GameConfig.INTERIOR.wallThickness,
        GameConfig.COLORS.brownWall
      )
    ); // Top wall

    this.obstacles.add(
      this.add.rectangle(
        GameConfig.UI.centerX,
        718,
        GameConfig.screenWidth,
        GameConfig.INTERIOR.wallThickness,
        GameConfig.COLORS.brownWall
      )
    ); // Bottom wall

    this.obstacles.add(
      this.add.rectangle(
        50,
        GameConfig.UI.centerY,
        GameConfig.INTERIOR.wallThickness,
        GameConfig.screenHeight,
        GameConfig.COLORS.brownWall
      )
    ); // Left wall

    this.obstacles.add(
      this.add.rectangle(
        974,
        GameConfig.UI.centerY,
        GameConfig.INTERIOR.wallThickness,
        GameConfig.screenHeight,
        GameConfig.COLORS.brownWall
      )
    ); // Right wall

    // Scene title
    this.add
      .text(GameConfig.UI.centerX, 100, `${this.sceneIcon} ${this.sceneTitle}`, {
        fontFamily: 'Arial Black',
        fontSize: 32,
        color: GameConfig.COLORS.textDarkGreen,
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates the exit zone
   */
  private createExitZone(): void {
    this.exitZone = this.add.rectangle(
      GameConfig.INTERIOR.exitZone.x,
      GameConfig.INTERIOR.exitZone.y,
      GameConfig.INTERIOR.exitZone.width,
      GameConfig.INTERIOR.exitZone.height,
      GameConfig.INTERIOR.exitZone.color,
      GameConfig.INTERIOR.exitZone.alpha
    );

    this.add
      .text(GameConfig.INTERIOR.exitZone.x, GameConfig.INTERIOR.exitZone.y, '🚪\nEXIT', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates the interaction prompt text
   */
  private createInteractionPrompt(): void {
    this.interactionPrompt = this.add
      .text(GameConfig.UI.centerX, 600, '', GameConfig.INTERACTION.promptStyle)
      .setOrigin(0.5)
      .setVisible(false);
  }

  /**
   * Abstract method that subclasses must implement to create their specific elements
   */
  protected abstract createSceneElements(): void;

  /**
   * Main update loop
   */
  update(time: number, delta: number): void {
    this.handlePlayerMovement(delta);
    this.checkExitZone();
    this.handleSpacebarInteraction();
  }

  /**
   * Handles player movement within the interior
   */
  private handlePlayerMovement(): void {
    this.playerController.updatePhysicsMovement();
  }

  /**
   * Checks if player is near the exit zone
   */
  private checkExitZone(): void {
    if (!this.player || !this.exitZone) return;

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.exitZone.x,
      this.exitZone.y
    );

    if (distance < 80) {
      if (!this.nearExit) {
        this.nearExit = true;
        if (this.interactionPrompt) {
          this.interactionPrompt.setText(
            `Press SPACEBAR to exit ${this.exitBuildingName.toLowerCase()}`
          );
          this.interactionPrompt.setVisible(true);
        }
      }
    } else {
      if (this.nearExit) {
        this.nearExit = false;
        if (this.interactionPrompt) {
          this.interactionPrompt.setVisible(false);
        }
      }
    }
  }

  /**
   * Handles spacebar interaction for exiting
   */
  private handleSpacebarInteraction(): void {
    if (!this.nearExit) return;

    if (this.playerController.isSpaceJustPressed()) {
      // Return to main game scene, positioned outside building
      this.scene.start('Game', { exitBuilding: this.exitBuildingName.toLowerCase() });
    }
  }

  /**
   * Adds an obstacle to the physics group
   * @param obstacle The game object to add as an obstacle
   */
  protected addObstacle(obstacle: Phaser.GameObjects.GameObject): void {
    if (!this.obstacles) {
      throw new Error(
        'Obstacles group not initialized. Cannot add obstacle before scene creation is complete.'
      );
    }
    this.obstacles.add(obstacle);
  }

  /**
   * Creates a standard room element with collision
   * @param x X position
   * @param y Y position
   * @param width Width
   * @param height Height
   * @param color Color
   * @returns The created rectangle
   */
  protected createRoomElement(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): Phaser.GameObjects.Rectangle {
    const element = this.add.rectangle(x, y, width, height, color);
    this.addObstacle(element);
    return element;
  }

  /**
   * Creates a circular room element with collision
   * @param x X position
   * @param y Y position
   * @param radius Radius
   * @param color Color
   * @returns The created arc
   */
  protected createCircularRoomElement(
    x: number,
    y: number,
    radius: number,
    color: number
  ): Phaser.GameObjects.Arc {
    const element = this.add.arc(x, y, radius, 0, 360, false, color);
    this.addObstacle(element);
    return element;
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    if (this.playerController) {
      this.playerController.destroy();
    }
    // Parent Scene destroy is handled automatically by Phaser
  }
}

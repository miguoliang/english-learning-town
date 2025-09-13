import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BaseKeyboardHandler } from './BaseKeyboardHandler';

/**
 * Base player controller that handles player creation, movement, and positioning
 */
export class BasePlayerController {
  protected scene: Scene;
  protected player: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Image | null = null;
  protected keyboardHandler: BaseKeyboardHandler;

  constructor(scene: Scene) {
    this.scene = scene;
    this.keyboardHandler = new BaseKeyboardHandler(scene);
  }

  /**
   * Creates a player sprite at the specified position
   * @param x X position
   * @param y Y position
   * @param usePhysics Whether to use physics for the player
   * @returns The created player sprite
   */
  createPlayer(
    x: number,
    y: number,
    usePhysics: boolean = false
  ): Phaser.GameObjects.Image | Phaser.Physics.Arcade.Image {
    const spriteKey = 'character_player';

    if (usePhysics && this.scene.physics) {
      this.player = this.scene.physics.add.image(x, y, spriteKey);
      const physicsPlayer = this.player as Phaser.Physics.Arcade.Image;
      physicsPlayer.setCollideWorldBounds(true);

      if (!physicsPlayer.body) {
        throw new Error(
          'Physics body not created for player. Physics system may not be properly initialized.'
        );
      }

      physicsPlayer.body.setSize(this.player.width * 0.8, this.player.height * 0.8);
    } else {
      this.player = this.scene.add.image(x, y, spriteKey);
    }

    this.player.setScale(GameConfig.PLAYER.SCALE);
    // Remove tint since we want to show the natural sprite colors
    // this.player.setTint(GameConfig.PLAYER.TINT);

    return this.player;
  }

  /**
   * Positions player based on building exit
   * @param exitBuilding Building name to position player outside of
   */
  positionPlayerFromBuilding(exitBuilding: string): { x: number; y: number } {
    const buildingKey = exitBuilding.toUpperCase() as keyof typeof GameConfig.BUILDINGS;
    const building = GameConfig.BUILDINGS[buildingKey];

    if (building) {
      return {
        x: building.x,
        y: building.y + building.height / 2 + 40, // South side + padding
      };
    }

    // Default position
    return { x: GameConfig.UI.centerX, y: GameConfig.screenHeight * 0.76 };
  }

  /**
   * Handles physics-based player movement
   * @param speed Player movement speed
   */
  updatePhysicsMovement(speed: number = GameConfig.PLAYER.SPEED): void {
    if (!this.player || !this.scene.physics || !this.player.body) return;

    const { velocityX, velocityY } = this.keyboardHandler.getMovementInput();

    (this.player as Phaser.Physics.Arcade.Image).setVelocity(velocityX * speed, velocityY * speed);
  }

  /**
   * Handles delta-based player movement with collision checking
   * @param delta Time elapsed since last frame
   * @param checkCollisions Function to check collisions
   * @param speed Player movement speed
   */
  updateDeltaMovement(
    delta: number,
    checkCollisions: (x: number, y: number) => boolean,
    speed: number = GameConfig.PLAYER.SPEED
  ): void {
    if (!this.player) return;

    const { deltaX, deltaY } = this.keyboardHandler.getDeltaMovement(delta, speed);

    if (deltaX === 0 && deltaY === 0) return;

    const newX = Phaser.Math.Clamp(
      this.player.x + deltaX,
      GameConfig.PLAYER.collisionPadding,
      GameConfig.screenWidth - GameConfig.PLAYER.collisionPadding
    );
    const newY = Phaser.Math.Clamp(
      this.player.y + deltaY,
      GameConfig.PLAYER.collisionPadding,
      GameConfig.screenHeight - GameConfig.PLAYER.collisionPadding
    );

    // Check for collisions before moving
    if (!checkCollisions(newX, newY)) {
      this.player.setPosition(newX, newY);
    }
  }

  /**
   * Gets the player's current position
   * @returns Object with x and y coordinates
   */
  getPlayerPosition(): { x: number; y: number } {
    if (!this.player) return { x: 0, y: 0 };
    return { x: this.player.x, y: this.player.y };
  }

  /**
   * Gets the player bounds for collision detection
   * @returns Rectangle representing player bounds
   */
  getPlayerBounds(): Phaser.Geom.Rectangle {
    if (!this.player) {
      return new Phaser.Geom.Rectangle(0, 0, 0, 0);
    }

    return new Phaser.Geom.Rectangle(
      this.player.x - GameConfig.PLAYER.collisionPadding,
      this.player.y - GameConfig.PLAYER.collisionPadding,
      GameConfig.PLAYER.SIZE,
      GameConfig.PLAYER.SIZE
    );
  }

  /**
   * Checks if spacebar was just pressed
   * @returns True if spacebar was just pressed
   */
  isSpaceJustPressed(): boolean {
    return this.keyboardHandler.isSpaceJustPressed();
  }

  /**
   * Gets the player sprite reference
   * @returns The player sprite or null
   */
  getPlayer(): Phaser.GameObjects.Image | Phaser.Physics.Arcade.Image | null {
    return this.player;
  }

  /**
   * Destroys the player and cleans up resources
   */
  destroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.keyboardHandler.destroy();
  }
}

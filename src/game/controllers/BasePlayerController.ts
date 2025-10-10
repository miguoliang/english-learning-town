import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BaseKeyboardHandler } from './BaseKeyboardHandler';

/**
 * Base player controller that handles player creation, movement, and positioning
 */
export class BasePlayerController {
  protected scene: Scene;
  protected player: Phaser.GameObjects.Image | Phaser.Physics.Matter.Image | null = null;
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
  ): Phaser.GameObjects.Image | Phaser.Physics.Matter.Image {
    const spriteKey = 'character_player';

    if (usePhysics && this.scene.matter) {
      this.player = this.scene.matter.add.image(x, y, spriteKey);
      const physicsPlayer = this.player as Phaser.Physics.Matter.Image;

      if (!physicsPlayer.body) {
        throw new Error(
          'Physics body not created for player. Physics system may not be properly initialized.'
        );
      }

      // Configure Matter.js physics body
      physicsPlayer.setBody({
        type: 'rectangle',
        width: this.player.width * 0.8,
        height: this.player.height * 0.8,
      });
    } else {
      this.player = this.scene.add.image(x, y, spriteKey);
    }

    this.player.setScale(GameConfig.PLAYER.SCALE);
    this.player.setOrigin(0.5, 1); // Bottom-center origin for proper tile alignment
    // Remove tint since we want to show the natural sprite colors
    // this.player.setTint(GameConfig.PLAYER.TINT);

    return this.player;
  }

  /**
   * Handles physics-based player movement using Matter.js
   * @param speed Player movement speed
   */
  updatePhysicsMovement(speed: number = GameConfig.PLAYER.SPEED): void {
    if (!this.player || !this.scene.matter || !this.player.body) return;

    const { velocityX, velocityY } = this.keyboardHandler.getMovementInput();
    const isRunning = this.keyboardHandler.isShiftPressed() && (velocityX !== 0 || velocityY !== 0);

    // Apply running speed multiplier when running
    const effectiveSpeed = isRunning ? speed * GameConfig.PLAYER.RUN_SPEED_MULTIPLIER : speed;

    // Use Matter.js to set velocity
    const body = this.player.body as MatterJS.BodyType;
    this.scene.matter.setVelocity(body, velocityX * effectiveSpeed, velocityY * effectiveSpeed);
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
  getPlayer(): Phaser.GameObjects.Image | Phaser.Physics.Matter.Image | null {
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

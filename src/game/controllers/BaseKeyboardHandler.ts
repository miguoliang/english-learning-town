import { Scene } from 'phaser';

/**
 * Base keyboard handler that manages input for scenes
 */
export class BaseKeyboardHandler {
  private scene: Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  } | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupKeyboard();
  }

  /**
   * Sets up keyboard controls
   */
  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasdKeys = this.scene.input.keyboard.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  /**
   * Checks if movement keys are pressed and returns velocity
   * @returns Object with velocityX and velocityY
   */
  getMovementInput(): { velocityX: number; velocityY: number } {
    if (!this.cursors || !this.wasdKeys) {
      return { velocityX: 0, velocityY: 0 };
    }

    let velocityX = 0;
    let velocityY = 0;

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -1;
    }
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = 1;
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -1; // UP key = negative Y (screen coordinates)
    }
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = 1; // DOWN key = positive Y (screen coordinates)
    }

    // Note: Debug logging removed for production

    return { velocityX, velocityY };
  }

  /**
   * Checks if spacebar was just pressed
   * @returns True if spacebar was just pressed
   */
  isSpaceJustPressed(): boolean {
    return this.spaceKey ? Phaser.Input.Keyboard.JustDown(this.spaceKey) : false;
  }

  /**
   * Gets the current state of movement keys for delta-based movement
   * @param delta Time elapsed since last frame
   * @param speed Player speed
   * @returns Object with newX and newY offsets
   */
  getDeltaMovement(delta: number, speed: number): { deltaX: number; deltaY: number } {
    const { velocityX, velocityY } = this.getMovementInput();
    const deltaSeconds = delta / 1000;

    return {
      deltaX: velocityX * speed * deltaSeconds,
      deltaY: velocityY * speed * deltaSeconds,
    };
  }

  /**
   * Cleans up keyboard handlers
   */
  destroy(): void {
    // Keyboard keys are automatically cleaned up by Phaser when scene is destroyed
    this.cursors = null;
    this.wasdKeys = null;
    this.spaceKey = null;
  }
}

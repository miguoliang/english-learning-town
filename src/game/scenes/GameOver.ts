import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { CelebrationEffects } from '../ui/CelebrationEffects';

/**
 * Game Over scene showing completion message and celebration effects
 */
export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  private celebrationEffects: CelebrationEffects;

  constructor() {
    super('GameOver');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.successGreen);

    // Initialize celebration effects system
    this.celebrationEffects = new CelebrationEffects(this);

    this.createBackground();
    this.createUI();
    this.setupCelebrationEffects();
    this.setupInteraction();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the background image
   */
  private createBackground(): void {
    this.background = this.add.image(GameConfig.UI.centerX, GameConfig.UI.centerY, 'background');
    this.background.setAlpha(0.3);
  }

  /**
   * Creates all UI elements
   */
  private createUI(): void {
    // Congratulations text
    const congratsText = this.add
      .text(GameConfig.UI.centerX, 200, 'Congratulations! 🎉', {
        fontFamily: 'Arial Black',
        fontSize: GameConfig.UI.fontSizes.HUGE,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Learning completion text
    this.add
      .text(GameConfig.UI.centerX, 300, "You've made great progress\nin English Learning Town!", {
        fontFamily: 'Arial',
        fontSize: GameConfig.UI.fontSizes.LARGE,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Restart instruction
    this.add
      .text(
        GameConfig.UI.centerX,
        500,
        'Click anywhere to return to town\nand continue learning!',
        {
          fontFamily: 'Arial',
          fontSize: GameConfig.UI.fontSizes.MEDIUM,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Apply bounce effect to congratulations text
    this.celebrationEffects.createBounceEffect(congratsText);
  }

  /**
   * Sets up celebration effects
   */
  private setupCelebrationEffects(): void {
    // Create floating stars
    this.celebrationEffects.createFloatingStars(10, {
      x: 100,
      y: 400,
      width: 824,
      height: 300,
    });

    // Create confetti effect
    this.celebrationEffects.createConfettiEffect(5000);

    // Create particle explosion at center after delay
    this.time.delayedCall(1000, () => {
      this.celebrationEffects.createParticleExplosion(
        GameConfig.UI.centerX,
        GameConfig.UI.centerY,
        {
          count: 15,
          colors: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b],
          duration: 2500,
        }
      );
    });
  }

  /**
   * Sets up click interaction to restart
   */
  private setupInteraction(): void {
    this.input.once('pointerdown', () => {
      this.changeScene();
    });
  }

  /**
   * Changes to the main menu scene
   */
  changeScene(): void {
    this.scene.start('MainMenu');
  }
}

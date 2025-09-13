import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  completionText: Phaser.GameObjects.Text;
  congratsText: Phaser.GameObjects.Text;
  restartText: Phaser.GameObjects.Text;

  constructor() {
    super('GameOver');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x4caf50); // Green background for success

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.3);

    // Congratulations text
    this.congratsText = this.add
      .text(512, 200, 'Congratulations! 🎉', {
        fontFamily: 'Arial Black',
        fontSize: 48,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Learning completion text
    this.completionText = this.add
      .text(512, 300, "You've made great progress\nin English Learning Town!", {
        fontFamily: 'Arial',
        fontSize: 32,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Add some celebration elements
    this.createCelebrationEffects();

    // Restart instruction
    this.restartText = this.add
      .text(512, 500, 'Click anywhere to return to town\nand continue learning!', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Make scene clickable to restart
    this.input.once('pointerdown', () => {
      this.changeScene();
    });

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates celebration visual effects
   */
  private createCelebrationEffects(): void {
    // Create floating stars animation
    for (let i = 0; i < 10; i++) {
      const star = this.add.text(
        Phaser.Math.Between(100, 924),
        Phaser.Math.Between(400, 700),
        '⭐',
        { fontSize: '24px' }
      );

      // Animate stars floating up
      this.tweens.add({
        targets: star,
        y: star.y - 200,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        ease: 'Power2',
        repeat: -1,
      });
    }

    // Create title bounce effect
    this.tweens.add({
      targets: this.congratsText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  changeScene() {
    this.scene.start('MainMenu');
  }
}

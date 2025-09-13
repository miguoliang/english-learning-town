import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { GameConfig } from '../config/GameConfig';

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  logoTween: Phaser.Tweens.Tween | null;

  constructor() {
    super('MainMenu');
  }

  create() {
    const centerX = GameConfig.screenWidth / 2;
    const centerY = GameConfig.screenHeight / 2;

    this.background = this.add.image(centerX, centerY, 'background');

    // Scale background to fill screen
    const scaleX = GameConfig.screenWidth / this.background.width;
    const scaleY = GameConfig.screenHeight / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    this.logo = this.add.image(centerX, centerY - 100, 'logo').setDepth(100);

    this.title = this.add
      .text(centerX, centerY + 80, 'Welcome to English Learning Town!', {
        fontFamily: 'Arial Black',
        fontSize: Math.min(GameConfig.screenWidth / 20, 32),
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Add subtitle
    this.add
      .text(centerX, centerY + 140, 'Click to Enter the Town', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 30, 18),
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Make the scene clickable to enter the town
    this.input.once('pointerdown', () => {
      this.changeScene();
    });

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    this.scene.start('Game');
  }

  moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: GameConfig.screenWidth * 0.75, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: GameConfig.screenHeight * 0.1, duration: 1500, ease: 'Sine.easeOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (vueCallback) {
            vueCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
      });
    }
  }
}

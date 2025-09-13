import { Scene } from 'phaser';

/**
 * Celebration effects system for visual feedback and animations
 */
export class CelebrationEffects {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates floating stars animation effect
   * @param count Number of stars to create
   * @param containerBounds Optional bounds for star placement
   */
  createFloatingStars(
    count: number = 10,
    containerBounds?: { x: number; y: number; width: number; height: number }
  ): void {
    const bounds = containerBounds ?? {
      x: 100,
      y: 400,
      width: 824,
      height: 300,
    };

    for (let i = 0; i < count; i++) {
      const star = this.scene.add.text(
        Phaser.Math.Between(bounds.x, bounds.x + bounds.width),
        Phaser.Math.Between(bounds.y, bounds.y + bounds.height),
        '⭐',
        { fontSize: '24px' }
      );

      // Animate stars floating up
      this.scene.tweens.add({
        targets: star,
        y: star.y - 200,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        ease: 'Power2',
        repeat: -1,
      });
    }
  }

  /**
   * Creates a bounce effect on a target object
   * @param target The target game object to animate
   * @param scale Maximum scale multiplier
   * @param duration Animation duration in milliseconds
   */
  createBounceEffect(
    target: Phaser.GameObjects.GameObject,
    scale: number = 1.1,
    duration: number = 1000
  ): void {
    this.scene.tweens.add({
      targets: target,
      scaleX: scale,
      scaleY: scale,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Creates particle explosion effect at specified position
   * @param x X position
   * @param y Y position
   * @param particles Particle configuration
   */
  createParticleExplosion(
    x: number,
    y: number,
    particles: {
      count?: number;
      colors?: number[];
      size?: number;
      duration?: number;
    } = {}
  ): void {
    const config = {
      count: particles.count ?? 20,
      colors: particles.colors ?? [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff],
      size: particles.size ?? 8,
      duration: particles.duration ?? 2000,
    };

    for (let i = 0; i < config.count; i++) {
      const particle = this.scene.add.circle(
        x,
        y,
        config.size,
        config.colors[Math.floor(Math.random() * config.colors.length)]
      );

      const angle = (i / config.count) * Math.PI * 2;
      const velocity = 100 + Math.random() * 100;

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * velocity,
        y: y + Math.sin(angle) * velocity,
        alpha: 0,
        scale: 0,
        duration: config.duration,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Creates a pulsing glow effect around a target
   * @param target The target game object with bounds
   * @param glowColor Color of the glow effect
   * @param intensity Intensity of the glow (0-1)
   */
  createGlowEffect(
    target: Phaser.GameObjects.Components.GetBounds & Phaser.GameObjects.Components.Depth,
    glowColor: number = 0xffffff,
    intensity: number = 0.5
  ): void {
    // Create a larger circle behind the target for glow effect
    const bounds = target.getBounds();
    const glow = this.scene.add.circle(
      bounds.centerX,
      bounds.centerY,
      Math.max(bounds.width, bounds.height) * 0.7,
      glowColor,
      intensity
    );

    glow.setDepth(target.depth - 1);

    this.scene.tweens.add({
      targets: glow,
      alpha: intensity * 1.5,
      scale: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Creates a text popup effect
   * @param x X position
   * @param y Y position
   * @param text Text to display
   * @param style Text style options
   */
  createTextPopup(
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): void {
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      ...style,
    };

    const textObj = this.scene.add.text(x, y, text, defaultStyle).setOrigin(0.5);

    // Popup animation
    this.scene.tweens.add({
      targets: textObj,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Fade out after delay
    this.scene.tweens.add({
      targets: textObj,
      alpha: 0,
      y: textObj.y - 50,
      duration: 1000,
      delay: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => textObj.destroy(),
    });
  }

  /**
   * Creates confetti effect across the screen
   * @param duration Duration of the effect
   */
  createConfettiEffect(duration: number = 3000): void {
    const confettiColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = this.scene.add.rectangle(
        Math.random() * 1024,
        -20,
        8,
        8,
        confettiColors[Math.floor(Math.random() * confettiColors.length)]
      );

      confetti.setRotation(Math.random() * Math.PI * 2);

      this.scene.tweens.add({
        targets: confetti,
        y: 800,
        rotation: confetti.rotation + Math.PI * 4,
        duration: duration + Math.random() * 1000,
        ease: 'Power2.easeIn',
        onComplete: () => confetti.destroy(),
      });

      // Add horizontal drift
      this.scene.tweens.add({
        targets: confetti,
        x: confetti.x + (Math.random() - 0.5) * 200,
        duration: duration + Math.random() * 1000,
        ease: 'Sine.easeInOut',
      });
    }
  }
}

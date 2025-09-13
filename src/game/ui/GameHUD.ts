import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Interface for learning progress data
 */
interface LearningProgress {
  grammar: number;
  vocabulary: number;
  reading: number;
  conversation: number;
}

/**
 * Configuration for individual HUD elements
 */
interface HUDElement {
  key: keyof LearningProgress;
  label: string;
  icon: string;
  color: number;
  gradient: { start: number; end: number };
}

/**
 * Progress element structure with typed components
 */
interface ProgressElement {
  container: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  progressBg: Phaser.GameObjects.Graphics;
  progressFill: Phaser.GameObjects.Graphics;
  progressText: Phaser.GameObjects.Text;
  element: HUDElement;
}

/**
 * Modern in-game HUD system for displaying learning progress
 * Features a clean top-bar design with animated progress indicators
 */
export class GameHUD {
  private scene: Scene;
  private hudContainer: Phaser.GameObjects.Container;
  private progressElements: Map<keyof LearningProgress, ProgressElement> = new Map();
  private currentProgress: LearningProgress;
  private isVisible: boolean = true;

  // HUD Configuration
  private readonly hudHeight = 80;
  private readonly hudYPosition = 15;
  private readonly elementWidth = 180;
  private readonly elementHeight = 60;
  private readonly elementSpacing = 15;

  // Progress tracking elements configuration
  private readonly ELEMENTS: HUDElement[] = [
    {
      key: 'grammar',
      label: 'Grammar',
      icon: '📝',
      color: 0xff6b6b,
      gradient: { start: 0xff6b6b, end: 0xff5722 },
    },
    {
      key: 'vocabulary',
      label: 'Vocabulary',
      icon: '🛒',
      color: 0x4ecdc4,
      gradient: { start: 0x4ecdc4, end: 0x26a69a },
    },
    {
      key: 'reading',
      label: 'Reading',
      icon: '📚',
      color: 0x45b7d1,
      gradient: { start: 0x45b7d1, end: 0x2196f3 },
    },
    {
      key: 'conversation',
      label: 'Conversation',
      icon: '💬',
      color: 0x96ceb4,
      gradient: { start: 0x96ceb4, end: 0x4caf50 },
    },
  ];

  constructor(scene: Scene) {
    this.scene = scene;
    this.currentProgress = { grammar: 0, vocabulary: 0, reading: 0, conversation: 0 };
    this.createHUD();
  }

  /**
   * Creates the main HUD container and all progress elements
   */
  private createHUD(): void {
    // Create main container
    this.hudContainer = this.scene.add.container(0, 0);
    this.hudContainer.setDepth(1000); // Ensure HUD is always on top

    // Create semi-transparent background panel
    this.createHUDBackground();

    // Create progress elements for each skill
    this.createProgressElements();

    // Create toggle button (optional - for hiding/showing HUD)
    this.createToggleButton();
  }

  /**
   * Creates the background panel for the HUD
   */
  private createHUDBackground(): void {
    const totalWidth =
      (this.elementWidth + this.elementSpacing) * this.ELEMENTS.length - this.elementSpacing + 40;
    const centerX = GameConfig.screenWidth / 2;

    // Main background with glassmorphism effect
    const background = this.scene.add.graphics();
    background.fillStyle(0x1a1a1a, 0.7);
    background.fillRoundedRect(
      centerX - totalWidth / 2 - 20,
      this.hudYPosition,
      totalWidth,
      this.hudHeight,
      12
    );

    // Subtle border
    background.lineStyle(2, 0x4a90e2, 0.3);
    background.strokeRoundedRect(
      centerX - totalWidth / 2 - 20,
      this.hudYPosition,
      totalWidth,
      this.hudHeight,
      12
    );

    this.hudContainer.add(background);
  }

  /**
   * Creates individual progress elements for each learning skill
   */
  private createProgressElements(): void {
    const totalWidth =
      (this.elementWidth + this.elementSpacing) * this.ELEMENTS.length - this.elementSpacing;
    const startX = GameConfig.screenWidth / 2 - totalWidth / 2;
    const baseY = this.hudYPosition + this.hudHeight / 2;

    this.ELEMENTS.forEach((element, index) => {
      const x = startX + index * (this.elementWidth + this.elementSpacing);
      const progressElement = this.createSingleProgressElement(element, x, baseY);

      this.progressElements.set(element.key, progressElement);
      this.hudContainer.add(progressElement.container);
    });
  }

  /**
   * Creates a single progress element with icon, label, and progress bar
   */
  private createSingleProgressElement(element: HUDElement, x: number, y: number): ProgressElement {
    const container = this.scene.add.container(x, y);

    // Icon
    const icon = this.scene.add.text(x - this.elementWidth / 2 + 20, y - 15, element.icon, {
      fontSize: '20px',
    });

    // Label
    const label = this.scene.add.text(x - this.elementWidth / 2 + 45, y - 18, element.label, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Progress bar background
    const progressBg = this.scene.add.graphics();
    progressBg.fillStyle(0x333333, 0.8);
    progressBg.fillRoundedRect(x - this.elementWidth / 2 + 45, y, this.elementWidth - 70, 12, 6);

    // Progress bar fill
    const progressFill = this.scene.add.graphics();
    progressFill.fillStyle(element.color, 1.0);

    // Progress text
    const progressText = this.scene.add.text(x + this.elementWidth / 2 - 25, y - 8, '0%', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    return {
      container,
      icon,
      label,
      progressBg,
      progressFill,
      progressText,
      element,
    };
  }

  /**
   * Creates a toggle button to show/hide the HUD
   */
  private createToggleButton(): void {
    const toggleButton = this.scene.add
      .text(GameConfig.screenWidth - 40, this.hudYPosition + 10, '👁️', {
        fontSize: '20px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 8, y: 4 },
      })
      .setDepth(1001)
      .setInteractive()
      .on('pointerdown', () => this.toggleVisibility());

    // Add hover effect
    toggleButton
      .on('pointerover', () => {
        toggleButton.setScale(1.1);
      })
      .on('pointerout', () => {
        toggleButton.setScale(1);
      });
  }

  /**
   * Updates the progress for a specific skill
   * @param skill The skill to update
   * @param value The new progress value (0-100)
   */
  updateProgress(skill: keyof LearningProgress, value: number): void {
    // Clamp value between 0 and 100
    value = Math.max(0, Math.min(100, value));
    this.currentProgress[skill] = value;

    const progressElement = this.progressElements.get(skill);
    if (!progressElement) return;

    // Update progress bar with animation
    this.animateProgressBar(progressElement, value);

    // Update text
    progressElement.progressText.setText(`${value}%`);

    // Add celebration effect for milestones
    if (value > 0 && value % 25 === 0) {
      this.createMilestoneEffect(progressElement);
    }
  }

  /**
   * Animates the progress bar to the new value
   */
  private animateProgressBar(progressElement: ProgressElement, targetValue: number): void {
    const maxWidth = this.elementWidth - 70;
    const targetWidth = (targetValue / 100) * maxWidth;
    const x = progressElement.progressBg.x;
    const y = progressElement.progressBg.y;

    // Clear previous fill
    progressElement.progressFill.clear();

    // Create animated fill
    this.scene.tweens.add({
      targets: { width: 0 },
      width: targetWidth,
      duration: 800,
      ease: 'Power2',
      onUpdate: tween => {
        const currentWidth = tween.getValue();
        progressElement.progressFill.clear();
        progressElement.progressFill.fillStyle(progressElement.element.color, 1.0);
        progressElement.progressFill.fillRoundedRect(x, y, currentWidth, 12, 6);
      },
    });
  }

  /**
   * Creates milestone celebration effects
   */
  private createMilestoneEffect(progressElement: ProgressElement): void {
    // Create sparkle effect
    for (let i = 0; i < 5; i++) {
      const sparkle = this.scene.add
        .text(
          progressElement.container.x + Math.random() * 100 - 50,
          progressElement.container.y + Math.random() * 20 - 10,
          '✨',
          { fontSize: '16px' }
        )
        .setDepth(1002);

      this.scene.tweens.add({
        targets: sparkle,
        y: sparkle.y - 30,
        alpha: 0,
        scale: 1.5,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => sparkle.destroy(),
      });
    }

    // Pulse effect on the progress element
    this.scene.tweens.add({
      targets: progressElement.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * Toggles HUD visibility
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;

    this.scene.tweens.add({
      targets: this.hudContainer,
      alpha: this.isVisible ? 1 : 0.3,
      y: this.isVisible ? 0 : -20,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * Updates all progress values at once
   * @param progress New progress object
   */
  updateAllProgress(progress: Partial<LearningProgress>): void {
    Object.keys(progress).forEach(skill => {
      const value = progress[skill as keyof LearningProgress];
      if (value !== undefined) {
        this.updateProgress(skill as keyof LearningProgress, value);
      }
    });
  }

  /**
   * Gets current progress for all skills
   */
  getCurrentProgress(): LearningProgress {
    return { ...this.currentProgress };
  }

  /**
   * Shows a temporary notification in the HUD area
   * @param message The message to display
   * @param duration How long to show it (ms)
   */
  showNotification(message: string, duration: number = 3000): void {
    const notification = this.scene.add
      .text(GameConfig.screenWidth / 2, this.hudYPosition + this.hudHeight + 20, message, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setAlpha(0);

    // Animate in
    this.scene.tweens.add({
      targets: notification,
      alpha: 1,
      y: notification.y - 10,
      duration: 300,
      ease: 'Power2',
    });

    // Animate out after duration
    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: notification,
        alpha: 0,
        y: notification.y - 20,
        duration: 300,
        ease: 'Power2',
        onComplete: () => notification.destroy(),
      });
    });
  }

  /**
   * Destroys the HUD and cleans up resources
   */
  destroy(): void {
    if (this.hudContainer) {
      this.hudContainer.destroy();
    }
    this.progressElements.clear();
  }
}

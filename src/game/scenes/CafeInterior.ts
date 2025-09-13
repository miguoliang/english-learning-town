import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

/**
 * Cafe Interior Scene - Inside the cafe building
 */
export class CafeInterior extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey: Phaser.Input.Keyboard.Key;
  private player: Phaser.GameObjects.Image;
  private playerSpeed: number = 200;
  private exitZone: Phaser.GameObjects.Rectangle;
  private interactionPrompt: Phaser.GameObjects.Text;
  private nearExit: boolean = false;

  constructor() {
    super('CafeInterior');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xfff8dc); // Cornsilk background

    // Create floor with checkered pattern
    this.add.rectangle(512, 384, 1024, 768, 0xf5deb3); // Wheat colored floor

    // Create walls
    this.add.rectangle(512, 50, 1024, 100, 0x8b4513); // Brown walls
    this.add.rectangle(512, 718, 1024, 100, 0x8b4513);
    this.add.rectangle(50, 384, 100, 768, 0x8b4513);
    this.add.rectangle(974, 384, 100, 768, 0x8b4513);

    // Cafe title
    this.add
      .text(512, 100, '☕ CAFE INTERIOR', {
        fontFamily: 'Arial Black',
        fontSize: 32,
        color: '#2C5F41',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Add cafe elements
    this.createCafeElements();

    // Create exit zone
    this.exitZone = this.add.rectangle(512, 650, 100, 60, 0xff0000, 0.3);
    this.add
      .text(512, 650, '🚪\nEXIT', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    this.createPlayer();
    this.setupKeyboard();
    this.createInteractionPrompt();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates cafe elements like counter, tables, and decorations
   */
  private createCafeElements(): void {
    // Coffee counter
    this.add.rectangle(512, 200, 300, 80, 0x8b4513); // Brown counter
    this.add
      .text(512, 200, '☕ Coffee Bar ☕\n🥐 Pastries 🧁 Cakes', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Coffee machine
    this.add.rectangle(400, 180, 60, 40, 0x2f4f2f); // Dark green coffee machine
    this.add
      .text(400, 180, '☕', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);

    // Cash register
    this.add.rectangle(624, 180, 50, 30, 0x000000); // Black cash register
    this.add
      .text(624, 180, '💰', {
        fontFamily: 'Arial',
        fontSize: 20,
      })
      .setOrigin(0.5);

    // Cafe tables (round tables for 2-4 people)
    const tablePositions = [
      { x: 200, y: 350 },
      { x: 400, y: 350 },
      { x: 624, y: 350 },
      { x: 824, y: 350 },
      { x: 300, y: 500 },
      { x: 724, y: 500 }
    ];

    tablePositions.forEach(pos => {
      // Round table
      this.add.arc(pos.x, pos.y, 40, 0, 360, false, 0x8b4513);

      // Chairs around table
      this.add.arc(pos.x - 50, pos.y, 15, 0, 360, false, 0x654321); // Left
      this.add.arc(pos.x + 50, pos.y, 15, 0, 360, false, 0x654321); // Right
      this.add.arc(pos.x, pos.y - 50, 15, 0, 360, false, 0x654321); // Top
      this.add.arc(pos.x, pos.y + 50, 15, 0, 360, false, 0x654321); // Bottom

      // Coffee cups on some tables
      if (Math.random() > 0.5) {
        this.add
          .text(pos.x, pos.y, '☕', {
            fontFamily: 'Arial',
            fontSize: 16,
          })
          .setOrigin(0.5);
      }
    });

    // Cafe decorations
    this.add
      .text(200, 280, '🌱', { fontFamily: 'Arial', fontSize: 24 })
      .setOrigin(0.5); // Plant

    this.add
      .text(824, 280, '🎨', { fontFamily: 'Arial', fontSize: 24 })
      .setOrigin(0.5); // Art

    // Menu board
    this.add.rectangle(150, 200, 120, 100, 0x2f4f2f); // Dark green menu board
    this.add
      .text(150, 200, '📋 MENU\n☕ Coffee $3\n🥐 Croissant $2\n🧁 Muffin $2', {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Barista
    this.add
      .text(512, 250, '👩‍🍳\nBarista Sarah', {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private createPlayer(): void {
    this.player = this.add.image(512, 150, 'star');
    this.player.setScale(0.5);
    this.player.setTint(0x4169e1);
  }

  private setupKeyboard(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private createInteractionPrompt(): void {
    this.interactionPrompt = this.add
      .text(512, 600, '', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setVisible(false);
  }

  update(_time: number, delta: number): void {
    this.handlePlayerMovement(delta);
    this.checkExitZone();
    this.handleSpacebarInteraction();
  }

  private handlePlayerMovement(delta: number): void {
    if (!this.player || !this.cursors || !this.wasdKeys) return;

    const deltaSeconds = delta / 1000;
    let newX = this.player.x;
    let newY = this.player.y;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      newX -= this.playerSpeed * deltaSeconds;
    }
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      newX += this.playerSpeed * deltaSeconds;
    }
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      newY -= this.playerSpeed * deltaSeconds;
    }
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      newY += this.playerSpeed * deltaSeconds;
    }

    const padding = 25;
    newX = Phaser.Math.Clamp(newX, padding + 50, 1024 - padding - 50);
    newY = Phaser.Math.Clamp(newY, padding + 100, 768 - padding - 100);

    this.player.setPosition(newX, newY);
  }

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
        this.interactionPrompt.setText('Press SPACEBAR to exit cafe');
        this.interactionPrompt.setVisible(true);
      }
    } else {
      if (this.nearExit) {
        this.nearExit = false;
        this.interactionPrompt.setVisible(false);
      }
    }
  }

  private handleSpacebarInteraction(): void {
    if (!this.spaceKey || !this.nearExit) return;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start('Game');
    }
  }
}

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
  private player: Phaser.Physics.Arcade.Image;
  private playerSpeed: number = 200;
  private exitZone: Phaser.GameObjects.Rectangle;
  private interactionPrompt: Phaser.GameObjects.Text;
  private nearExit: boolean = false;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('CafeInterior');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xfff8dc); // Cornsilk background

    // Enable physics
    this.physics.world.setBounds(0, 0, 1024, 768);

    // Create static group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Create floor with checkered pattern
    this.add.rectangle(512, 384, 1024, 768, 0xf5deb3); // Wheat colored floor

    // Create walls as physics obstacles
    this.obstacles.add(this.add.rectangle(512, 50, 1024, 100, 0x8b4513)); // Brown walls
    this.obstacles.add(this.add.rectangle(512, 718, 1024, 100, 0x8b4513));
    this.obstacles.add(this.add.rectangle(50, 384, 100, 768, 0x8b4513));
    this.obstacles.add(this.add.rectangle(974, 384, 100, 768, 0x8b4513));

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

    // Set up collision detection
    this.physics.add.collider(this.player, this.obstacles);

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates cafe elements like counter, tables, and decorations
   */
  private createCafeElements(): void {
    // Coffee counter (with collision)
    const counter = this.add.rectangle(512, 200, 300, 80, 0x8b4513); // Brown counter
    this.obstacles.add(counter);
    this.add
      .text(512, 200, '☕ Coffee Bar ☕\n🥐 Pastries 🧁 Cakes', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Coffee machine (with collision)
    const coffeeMachine = this.add.rectangle(400, 180, 60, 40, 0x2f4f2f); // Dark green coffee machine
    this.obstacles.add(coffeeMachine);
    this.add
      .text(400, 180, '☕', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);

    // Cash register (with collision)
    const cashRegister = this.add.rectangle(624, 180, 50, 30, 0x000000); // Black cash register
    this.obstacles.add(cashRegister);
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
      // Round table (with collision)
      const table = this.add.arc(pos.x, pos.y, 40, 0, 360, false, 0x8b4513);
      this.obstacles.add(table);

      // Chairs around table (with collision)
      const leftChair = this.add.arc(pos.x - 50, pos.y, 15, 0, 360, false, 0x654321); // Left
      const rightChair = this.add.arc(pos.x + 50, pos.y, 15, 0, 360, false, 0x654321); // Right
      const topChair = this.add.arc(pos.x, pos.y - 50, 15, 0, 360, false, 0x654321); // Top
      const bottomChair = this.add.arc(pos.x, pos.y + 50, 15, 0, 360, false, 0x654321); // Bottom
      this.obstacles.add(leftChair);
      this.obstacles.add(rightChair);
      this.obstacles.add(topChair);
      this.obstacles.add(bottomChair);

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
    // Place player at the entrance (near the south door where they enter from main town)
    this.player = this.physics.add.image(512, 600, 'star');
    this.player.setScale(0.5);
    this.player.setTint(0x4169e1);
    this.player.setCollideWorldBounds(true);
    this.player.body!.setSize(this.player.width * 0.8, this.player.height * 0.8);
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

  private handlePlayerMovement(_delta: number): void {
    if (!this.player || !this.cursors || !this.wasdKeys) return;

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -this.playerSpeed;
    }
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = this.playerSpeed;
    }
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -this.playerSpeed;
    }
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = this.playerSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);
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

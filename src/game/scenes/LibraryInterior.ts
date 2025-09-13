import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

/**
 * Library Interior Scene - Inside the library building
 */
export class LibraryInterior extends Scene {
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
    super('LibraryInterior');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xf0f8ff); // Alice blue background

    // Enable physics
    this.physics.world.setBounds(0, 0, 1024, 768);

    // Create static group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Create floor
    this.add.rectangle(512, 384, 1024, 768, 0xd2b48c); // Tan floor

    // Create walls as physics obstacles
    this.obstacles.add(this.add.rectangle(512, 50, 1024, 100, 0x8b4513)); // Brown walls
    this.obstacles.add(this.add.rectangle(512, 718, 1024, 100, 0x8b4513));
    this.obstacles.add(this.add.rectangle(50, 384, 100, 768, 0x8b4513));
    this.obstacles.add(this.add.rectangle(974, 384, 100, 768, 0x8b4513));

    // Library title
    this.add
      .text(512, 100, '📚 LIBRARY INTERIOR', {
        fontFamily: 'Arial Black',
        fontSize: 32,
        color: '#2C5F41',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Add library elements
    this.createLibraryElements();

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
   * Creates library elements like bookshelves and reading tables
   */
  private createLibraryElements(): void {
    // Bookshelves along the walls (with collision)
    for (let i = 0; i < 6; i++) {
      const x = 150 + i * 120;
      const bookshelf = this.add.rectangle(x, 200, 80, 120, 0x654321); // Dark brown bookshelf
      this.obstacles.add(bookshelf);
      this.add
        .text(x, 200, '📖\n📗\n📘\n📙', {
          fontFamily: 'Arial',
          fontSize: 16,
          align: 'center',
        })
        .setOrigin(0.5);
    }

    // Reading tables in the center (with collision)
    for (let i = 0; i < 3; i++) {
      const x = 250 + i * 200;
      const y = 400;

      // Table (with collision)
      const table = this.add.rectangle(x, y, 120, 80, 0x8b4513);
      this.obstacles.add(table);

      // Chairs around table (with collision)
      const leftChair = this.add.rectangle(x - 50, y, 30, 30, 0x654321); // Left chair
      const rightChair = this.add.rectangle(x + 50, y, 30, 30, 0x654321); // Right chair
      const topChair = this.add.rectangle(x, y - 40, 30, 30, 0x654321); // Top chair
      const bottomChair = this.add.rectangle(x, y + 40, 30, 30, 0x654321); // Bottom chair
      this.obstacles.add(leftChair);
      this.obstacles.add(rightChair);
      this.obstacles.add(topChair);
      this.obstacles.add(bottomChair);

      // Books on table
      this.add
        .text(x, y, '📚', {
          fontFamily: 'Arial',
          fontSize: 20,
        })
        .setOrigin(0.5);
    }

    // Librarian desk (with collision)
    const librarianDesk = this.add.rectangle(512, 300, 120, 80, 0x8b4513);
    this.obstacles.add(librarianDesk);
    this.add
      .text(512, 300, '👨‍💼\nLibrarian', {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'center',
      })
      .setOrigin(0.5);

    // Information sign
    this.add
      .text(512, 500, '📖 Reading Corner 📖\nQuiet Study Area', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#2C5F41',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private createPlayer(): void {
    this.player = this.physics.add.image(512, 150, 'star');
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
        this.interactionPrompt.setText('Press SPACEBAR to exit library');
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

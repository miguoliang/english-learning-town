import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

/**
 * School Interior Scene - Inside the school building
 */
export class SchoolInterior extends Scene {
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
    super('SchoolInterior');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xf5f5dc); // Beige background for interior

    // Enable physics
    this.physics.world.setBounds(0, 0, 1024, 768);

    // Create static group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Create floor
    this.add.rectangle(512, 384, 1024, 768, 0xdeb887); // Burlywood floor

    // Create walls as physics obstacles
    this.obstacles.add(this.add.rectangle(512, 50, 1024, 100, 0x8b4513)); // Brown top wall
    this.obstacles.add(this.add.rectangle(512, 718, 1024, 100, 0x8b4513)); // Brown bottom wall
    this.obstacles.add(this.add.rectangle(50, 384, 100, 768, 0x8b4513)); // Brown left wall
    this.obstacles.add(this.add.rectangle(974, 384, 100, 768, 0x8b4513)); // Brown right wall

    // School interior decorations
    this.add
      .text(512, 100, '🏫 SCHOOL INTERIOR', {
        fontFamily: 'Arial Black',
        fontSize: 32,
        color: '#2C5F41',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Add classroom elements
    this.createClassroomElements();

    // Create exit zone (near the bottom/south of the interior)
    this.exitZone = this.add.rectangle(512, 650, 100, 60, 0xff0000, 0.3);
    this.add
      .text(512, 650, '🚪\nEXIT', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    // Create player at entrance (top of the room)
    this.createPlayer();
    this.setupKeyboard();
    this.createInteractionPrompt();

    // Set up collision detection
    this.physics.add.collider(this.player, this.obstacles);

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates classroom elements like desks and blackboard
   */
  private createClassroomElements(): void {
    // Blackboard (as collision object)
    const blackboard = this.add.rectangle(512, 200, 300, 100, 0x2f4f2f); // Dark green blackboard
    this.obstacles.add(blackboard);
    this.add
      .text(512, 200, 'Welcome to English Class!\n🅰️ Grammar Lessons 🅱️ Reading', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Student desks (rows)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 200 + col * 150;
        const y = 320 + row * 80;

        // Desk (with collision)
        const desk = this.add.rectangle(x, y, 60, 40, 0x8b4513); // Brown desk
        this.obstacles.add(desk);

        // Chair (with collision)
        const chair = this.add.rectangle(x, y + 30, 40, 20, 0x654321); // Darker brown chair
        this.obstacles.add(chair);
      }
    }

    // Teacher's desk (with collision)
    const teacherDesk = this.add.rectangle(512, 280, 100, 60, 0x8b4513);
    this.obstacles.add(teacherDesk);
    this.add
      .text(512, 280, '👩‍🏫', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);
  }

  /**
   * Creates the player sprite inside the school
   */
  private createPlayer(): void {
    // Place player at the entrance (near the south door where they enter from main town)
    this.player = this.physics.add.image(512, 600, 'star');
    this.player.setScale(0.5);
    this.player.setTint(0x4169e1); // Royal blue tint
    this.player.setCollideWorldBounds(true);
    this.player.body!.setSize(this.player.width * 0.8, this.player.height * 0.8);
  }

  /**
   * Sets up keyboard controls
   */
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

  /**
   * Creates the interaction prompt text
   */
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

  /**
   * Handles player movement within the school interior
   */
  private handlePlayerMovement(_delta: number): void {
    if (!this.player || !this.cursors || !this.wasdKeys) return;

    let velocityX = 0;
    let velocityY = 0;

    // Movement input
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

    // Set player velocity
    this.player.setVelocity(velocityX, velocityY);
  }

  /**
   * Checks if player is near the exit zone
   */
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
        this.interactionPrompt.setText('Press SPACEBAR to exit school');
        this.interactionPrompt.setVisible(true);
      }
    } else {
      if (this.nearExit) {
        this.nearExit = false;
        this.interactionPrompt.setVisible(false);
      }
    }
  }

  /**
   * Handles spacebar interaction for exiting
   */
  private handleSpacebarInteraction(): void {
    if (!this.spaceKey || !this.nearExit) return;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // Return to main game scene, positioned outside school
      this.scene.start('Game', { exitBuilding: 'school' });
    }
  }
}

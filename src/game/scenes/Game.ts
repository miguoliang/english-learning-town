import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  // Player
  private player: Phaser.GameObjects.Image;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey: Phaser.Input.Keyboard.Key;
  private playerSpeed: number = 200;

  // Interaction system
  private interactionPrompt: Phaser.GameObjects.Text;
  private nearbyInteractable: string | null = null;
  private nearbyNpcType: string | null = null;
  private nearbyBuildingEntry: string | null = null;

  // Town buildings
  private school: Phaser.GameObjects.Rectangle;
  private library: Phaser.GameObjects.Rectangle;
  private cafe: Phaser.GameObjects.Rectangle;
  private shop: Phaser.GameObjects.Rectangle;

  // NPCs
  private teacher: Phaser.GameObjects.Arc;
  private librarian: Phaser.GameObjects.Arc;
  private shopkeeper: Phaser.GameObjects.Arc;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x87ceeb); // Sky blue background

    // Create ground
    this.add.rectangle(512, 600, 1024, 336, 0x90ee90); // Light green ground

    // Create town title
    this.add
      .text(512, 50, 'English Learning Town', {
        fontFamily: 'Arial Black',
        fontSize: 48,
        color: '#2C5F41',
        stroke: '#ffffff',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Instructions
    this.add
      .text(512, 100, 'Use Arrow Keys or WASD to move • Press SPACEBAR to enter buildings or talk to NPCs!', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#2C5F41',
        align: 'center',
      })
      .setOrigin(0.5);

    this.createPlayer();
    this.createBuildings();
    this.createNPCs();
    this.setupInteractions();
    this.setupKeyboard();
    this.createInteractionPrompt();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the player sprite
   */
  private createPlayer(): void {
    // Create player sprite at the bottom center of the screen
    this.player = this.add.image(512, 550, 'star');
    this.player.setScale(0.5); // Make it smaller
    this.player.setTint(0x4169e1); // Royal blue tint to distinguish from other objects
  }

  /**
   * Sets up keyboard controls
   */
  private setupKeyboard(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add WASD keys for alternate movement
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };

    // Add spacebar for interactions
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  /**
   * Creates the interaction prompt text
   */
  private createInteractionPrompt(): void {
    this.interactionPrompt = this.add
      .text(512, 150, '', {
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

  /**
   * Updates the game state every frame
   */
  update(_time: number, delta: number): void {
    this.handlePlayerMovement(delta);
    this.checkNearbyInteractables();
    this.handleSpacebarInteraction();
  }

  /**
   * Handles player movement based on keyboard input
   * @param delta - Time elapsed since last frame in milliseconds
   */
  private handlePlayerMovement(delta: number): void {
    if (!this.player || !this.cursors || !this.wasdKeys) return;

    // Get current position
    const currentX = this.player.x;
    const currentY = this.player.y;

    // Calculate movement (delta is in milliseconds, so convert to seconds)
    const deltaSeconds = delta / 1000;
    let newX = currentX;
    let newY = currentY;

    // Check for movement input (arrow keys or WASD)
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

    // Clamp player within screen bounds
    const padding = 25; // Half of player sprite size
    newX = Phaser.Math.Clamp(newX, padding, 1024 - padding);
    newY = Phaser.Math.Clamp(newY, padding, 768 - padding);

    // Check for collisions before moving
    if (!this.checkCollisions(newX, newY)) {
      this.player.setPosition(newX, newY);
    }
  }

  /**
   * Checks if the player would collide with buildings or NPCs at the given position
   * @param x - The x coordinate to check
   * @param y - The y coordinate to check
   * @returns true if collision detected, false otherwise
   */
  private checkCollisions(x: number, y: number): boolean {
    const playerBounds = new Phaser.Geom.Rectangle(
      x - 25, // Player sprite half-width
      y - 25, // Player sprite half-height
      50,     // Player sprite width
      50      // Player sprite height
    );

    // Check collision with buildings
    const buildings = [this.school, this.library, this.cafe, this.shop];
    for (const building of buildings) {
      if (building) {
        const buildingBounds = new Phaser.Geom.Rectangle(
          building.x - building.width / 2,
          building.y - building.height / 2,
          building.width,
          building.height
        );

        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, buildingBounds)) {
          return true; // Collision detected
        }
      }
    }

    // Check collision with NPCs
    const npcs = [this.teacher, this.librarian, this.shopkeeper];
    for (const npc of npcs) {
      if (npc) {
        const npcBounds = new Phaser.Geom.Rectangle(
          npc.x - 30, // NPC radius + padding
          npc.y - 30,
          60,         // NPC diameter + padding
          60
        );

        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, npcBounds)) {
          return true; // Collision detected
        }
      }
    }

    return false; // No collision
  }

  /**
   * Checks for nearby interactable objects and updates the interaction prompt
   */
  private checkNearbyInteractables(): void {
    if (!this.player) return;

    const interactionDistance = 80; // Distance threshold for interaction
    const playerX = this.player.x;
    const playerY = this.player.y;
    let nearestObject = null;
    let nearestDistance = Infinity;
    let interactionText = '';
    let interactionType = '';

    // Check distance to building entry zones (south side of buildings)
    const buildingEntryData = [
      {
        obj: this.school,
        name: 'School',
        text: 'Press SPACEBAR to enter School',
        sceneKey: 'SchoolInterior'
      },
      {
        obj: this.library,
        name: 'Library',
        text: 'Press SPACEBAR to enter Library',
        sceneKey: 'LibraryInterior'
      },
      {
        obj: this.cafe,
        name: 'Cafe',
        text: 'Press SPACEBAR to enter Cafe',
        sceneKey: 'CafeInterior'
      },
      {
        obj: this.shop,
        name: 'Shop',
        text: 'Press SPACEBAR to enter Shop',
        sceneKey: 'ShopInterior'
      },
    ];

    for (const building of buildingEntryData) {
      if (building.obj) {
        // Check if player is near the south side of the building
        const buildingSouthY = building.obj.y + building.obj.height / 2;
        const entryZoneDistance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          building.obj.x,
          buildingSouthY
        );

        // Only allow entry from the south side (player must be below the building center)
        const isOnSouthSide = playerY > building.obj.y;

        if (entryZoneDistance < interactionDistance && entryZoneDistance < nearestDistance && isOnSouthSide) {
          nearestDistance = entryZoneDistance;
          nearestObject = building.name;
          interactionText = building.text;
          interactionType = 'building';
          this.nearbyBuildingEntry = building.sceneKey;
        }
      }
    }

    // Check distance to NPCs
    const npcData = [
      { obj: this.teacher, name: 'Ms. Smith', text: 'Press SPACEBAR to talk to Ms. Smith', npcType: 'teacher' },
      { obj: this.librarian, name: 'Mr. Johnson', text: 'Press SPACEBAR to talk to Mr. Johnson', npcType: 'librarian' },
      { obj: this.shopkeeper, name: 'Mr. Brown', text: 'Press SPACEBAR to talk to Mr. Brown', npcType: 'shopkeeper' },
    ];

    for (const npc of npcData) {
      if (npc.obj) {
        const distance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          npc.obj.x,
          npc.obj.y
        );

        if (distance < interactionDistance && distance < nearestDistance) {
          nearestDistance = distance;
          nearestObject = npc.name;
          interactionText = npc.text;
          interactionType = 'npc';
          this.nearbyNpcType = npc.npcType;
          this.nearbyBuildingEntry = null; // Clear building entry when NPC is closer
        }
      }
    }

    // Update interaction prompt and track interaction type
    if (nearestObject && nearestDistance < interactionDistance) {
      if (this.nearbyInteractable !== nearestObject) {
        this.nearbyInteractable = nearestObject;
        this.interactionPrompt.setText(interactionText);
        this.interactionPrompt.setVisible(true);

        // Clear the appropriate interaction type when switching
        if (interactionType === 'npc') {
          this.nearbyBuildingEntry = null;
        } else if (interactionType === 'building') {
          this.nearbyNpcType = null;
        }
      }
    } else {
      // Clear all interaction states
      if (this.nearbyInteractable !== null) {
        this.nearbyInteractable = null;
        this.nearbyNpcType = null;
        this.nearbyBuildingEntry = null;
        this.interactionPrompt.setVisible(false);
      }
    }
  }

  /**
   * Handles spacebar interactions with NPCs and building entries
   */
  private handleSpacebarInteraction(): void {
    if (!this.spaceKey) return;

    // Check if spacebar was just pressed (not held down)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // Handle building entry first (higher priority when both are available)
      if (this.nearbyBuildingEntry) {
        this.scene.start(this.nearbyBuildingEntry);
        return;
      }

      // Handle NPC interactions
      if (this.nearbyNpcType) {
        switch (this.nearbyNpcType) {
          case 'teacher':
            EventBus.emit('talk-to-npc', {
              npc: 'teacher',
              name: 'Ms. Smith',
              greeting: 'Hello! Ready to learn some grammar today?',
              activity: 'grammar-lesson',
            });
            break;
          case 'librarian':
            EventBus.emit('talk-to-npc', {
              npc: 'librarian',
              name: 'Mr. Johnson',
              greeting: "Welcome to the library! Let's improve your reading skills.",
              activity: 'reading-comprehension',
            });
            break;
          case 'shopkeeper':
            EventBus.emit('talk-to-npc', {
              npc: 'shopkeeper',
              name: 'Mr. Brown',
              greeting: "Welcome to my shop! Let's practice some shopping vocabulary.",
              activity: 'vocabulary-shopping',
            });
            break;
        }
      }
    }
  }

  /**
   * Creates the town buildings
   */
  private createBuildings(): void {
    // School (red brick building)
    this.school = this.add.rectangle(200, 300, 150, 120, 0xb22222);
    this.add
      .text(200, 300, '🏫\nSCHOOL', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Library (brown building)
    this.library = this.add.rectangle(400, 300, 150, 120, 0x8b4513);
    this.add
      .text(400, 300, '📚\nLIBRARY', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Cafe (orange building)
    this.cafe = this.add.rectangle(624, 300, 150, 120, 0xff8c00);
    this.add
      .text(624, 300, '☕\nCAFE', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Shop (purple building)
    this.shop = this.add.rectangle(824, 300, 150, 120, 0x9370db);
    this.add
      .text(824, 300, '🛒\nSHOP', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Make buildings interactive
    [this.school, this.library, this.cafe, this.shop].forEach(building => {
      building.setInteractive();
      building.on('pointerover', () => {
        building.setAlpha(0.8);
        this.input.setDefaultCursor('pointer');
      });
      building.on('pointerout', () => {
        building.setAlpha(1);
        this.input.setDefaultCursor('default');
      });
    });
  }

  /**
   * Creates NPCs (Non-Player Characters)
   */
  private createNPCs(): void {
    // Teacher NPC
    this.teacher = this.add.arc(200, 450, 25, 0, 360, false, 0xffb6c1);
    this.add
      .text(200, 450, '👩‍🏫', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);
    this.add
      .text(200, 490, 'Ms. Smith', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#2C5F41',
        align: 'center',
      })
      .setOrigin(0.5);

    // Librarian NPC
    this.librarian = this.add.arc(400, 450, 25, 0, 360, false, 0xdda0dd);
    this.add
      .text(400, 450, '👨‍💼', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);
    this.add
      .text(400, 490, 'Mr. Johnson', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#2C5F41',
        align: 'center',
      })
      .setOrigin(0.5);

    // Shopkeeper NPC
    this.shopkeeper = this.add.arc(824, 450, 25, 0, 360, false, 0xf0e68c);
    this.add
      .text(824, 450, '👨‍💼', {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);
    this.add
      .text(824, 490, 'Mr. Brown', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#2C5F41',
        align: 'center',
      })
      .setOrigin(0.5);

    // Make NPCs interactive
    [this.teacher, this.librarian, this.shopkeeper].forEach(npc => {
      npc.setInteractive();
      npc.on('pointerover', () => {
        npc.setAlpha(0.8);
        this.input.setDefaultCursor('pointer');
      });
      npc.on('pointerout', () => {
        npc.setAlpha(1);
        this.input.setDefaultCursor('default');
      });
    });
  }

  /**
   * Sets up click interactions for buildings and NPCs
   */
  private setupInteractions(): void {
    // School interactions
    this.school.on('pointerdown', () => {
      EventBus.emit('enter-school', {
        location: 'school',
        npc: 'Ms. Smith',
        activity: 'grammar-lesson',
      });
    });

    // Library interactions
    this.library.on('pointerdown', () => {
      EventBus.emit('enter-library', {
        location: 'library',
        npc: 'Mr. Johnson',
        activity: 'reading-comprehension',
      });
    });

    // Cafe interactions
    this.cafe.on('pointerdown', () => {
      EventBus.emit('enter-cafe', {
        location: 'cafe',
        activity: 'conversation-practice',
      });
    });

    // Shop interactions
    this.shop.on('pointerdown', () => {
      EventBus.emit('enter-shop', {
        location: 'shop',
        npc: 'Mr. Brown',
        activity: 'vocabulary-shopping',
      });
    });

    // NPC interactions
    this.teacher.on('pointerdown', () => {
      EventBus.emit('talk-to-npc', {
        npc: 'teacher',
        name: 'Ms. Smith',
        greeting: 'Hello! Ready to learn some grammar today?',
        activity: 'grammar-lesson',
      });
    });

    this.librarian.on('pointerdown', () => {
      EventBus.emit('talk-to-npc', {
        npc: 'librarian',
        name: 'Mr. Johnson',
        greeting: "Welcome to the library! Let's improve your reading skills.",
        activity: 'reading-comprehension',
      });
    });

    this.shopkeeper.on('pointerdown', () => {
      EventBus.emit('talk-to-npc', {
        npc: 'shopkeeper',
        name: 'Mr. Brown',
        greeting: "Welcome to my shop! Let's practice some shopping vocabulary.",
        activity: 'vocabulary-shopping',
      });
    });
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}

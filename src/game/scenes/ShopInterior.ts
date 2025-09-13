import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

/**
 * Shop Interior Scene - Inside the shop building
 */
export class ShopInterior extends Scene {
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
    super('ShopInterior');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xf0f0f0); // Light gray background

    // Enable physics
    this.physics.world.setBounds(0, 0, 1024, 768);

    // Create static group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Create floor
    this.add.rectangle(512, 384, 1024, 768, 0xe6e6fa); // Lavender floor

    // Create walls as physics obstacles
    this.obstacles.add(this.add.rectangle(512, 50, 1024, 100, 0x8b4513)); // Brown walls
    this.obstacles.add(this.add.rectangle(512, 718, 1024, 100, 0x8b4513));
    this.obstacles.add(this.add.rectangle(50, 384, 100, 768, 0x8b4513));
    this.obstacles.add(this.add.rectangle(974, 384, 100, 768, 0x8b4513));

    // Shop title
    this.add
      .text(512, 100, '🛒 SHOP INTERIOR', {
        fontFamily: 'Arial Black',
        fontSize: 32,
        color: '#2C5F41',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Add shop elements
    this.createShopElements();

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
   * Creates shop elements like shelves, checkout counter, and products
   */
  private createShopElements(): void {
    // Checkout counter (with collision)
    const checkoutCounter = this.add.rectangle(512, 180, 200, 60, 0x8b4513); // Brown counter
    this.obstacles.add(checkoutCounter);
    this.add
      .text(512, 180, '💳 CHECKOUT COUNTER 💳', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Cash register (with collision)
    const cashRegister = this.add.rectangle(512, 160, 60, 40, 0x000000); // Black cash register
    this.obstacles.add(cashRegister);
    this.add
      .text(512, 160, '🖥️', {
        fontFamily: 'Arial',
        fontSize: 20,
      })
      .setOrigin(0.5);

    // Shopping aisles with shelves
    const aisleData = [
      { x: 200, y: 300, items: ['🍎', '🍌', '🥕', '🥬'], category: 'Fruits & Vegetables' },
      { x: 400, y: 300, items: ['🍞', '🥖', '🧀', '🥛'], category: 'Dairy & Bread' },
      { x: 624, y: 300, items: ['📱', '💻', '⌚', '🎧'], category: 'Electronics' },
      { x: 824, y: 300, items: ['👕', '👖', '👟', '🧢'], category: 'Clothing' },
    ];

    aisleData.forEach(aisle => {
      // Shelf structure (with collision)
      const shelf = this.add.rectangle(aisle.x, aisle.y, 120, 100, 0x654321); // Dark brown shelf
      this.obstacles.add(shelf);

      // Category label
      this.add
        .text(aisle.x, aisle.y - 70, aisle.category, {
          fontFamily: 'Arial',
          fontSize: 12,
          color: '#000000',
          backgroundColor: '#ffffff',
          padding: { x: 5, y: 2 },
          align: 'center',
        })
        .setOrigin(0.5);

      // Items on shelf
      const itemsText = aisle.items.join(' ');
      this.add
        .text(aisle.x, aisle.y, itemsText, {
          fontFamily: 'Arial',
          fontSize: 20,
          align: 'center',
        })
        .setOrigin(0.5);

      // Price tags
      this.add
        .text(aisle.x, aisle.y + 40, '$2-$50', {
          fontFamily: 'Arial',
          fontSize: 12,
          color: '#ff0000',
          align: 'center',
        })
        .setOrigin(0.5);
    });

    // Shopping baskets area (with collision)
    const basketsArea = this.add.rectangle(150, 450, 80, 60, 0x8b4513);
    this.obstacles.add(basketsArea);
    this.add
      .text(150, 450, '🛒\nBaskets', {
        fontFamily: 'Arial',
        fontSize: 14,
        align: 'center',
      })
      .setOrigin(0.5);

    // Customer service desk (with collision)
    const serviceDesk = this.add.rectangle(824, 450, 120, 80, 0x8b4513);
    this.obstacles.add(serviceDesk);
    this.add
      .text(824, 450, '🏪\nCustomer\nService', {
        fontFamily: 'Arial',
        fontSize: 14,
        align: 'center',
      })
      .setOrigin(0.5);

    // Shopkeeper
    this.add
      .text(512, 230, '👨‍💼\nMr. Brown - Manager', {
        fontFamily: 'Arial',
        fontSize: 16,
        align: 'center',
      })
      .setOrigin(0.5);

    // Special offers sign
    this.add
      .text(400, 480, '🏷️ SPECIAL OFFERS 🏷️\nBuy 2 Get 1 Free!\nDaily Discounts Available', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#ff0000',
        backgroundColor: '#ffff00',
        padding: { x: 10, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Shopping carts
    this.add
      .text(700, 500, '🛒 🛒 🛒\nShopping Carts', {
        fontFamily: 'Arial',
        fontSize: 14,
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
        this.interactionPrompt.setText('Press SPACEBAR to exit shop');
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
      // Return to main game scene, positioned outside shop
      this.scene.start('Game', { exitBuilding: 'shop' });
    }
  }
}

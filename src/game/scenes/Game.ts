import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

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
      .text(512, 100, 'Click on buildings to explore and learn English!', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#2C5F41',
        align: 'center',
      })
      .setOrigin(0.5);

    this.createBuildings();
    this.createNPCs();
    this.setupInteractions();

    EventBus.emit('current-scene-ready', this);
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

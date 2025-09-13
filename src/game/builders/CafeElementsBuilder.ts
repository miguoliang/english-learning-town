import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating cafe-specific interior elements
 */
export class CafeElementsBuilder {
  private scene: Scene;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Scene, obstacles: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.obstacles = obstacles;
  }

  /**
   * Creates all cafe interior elements
   */
  createCafeElements(): void {
    this.createCoffeeCounter();
    this.createEquipment();
    this.createSeatingAreas();
    this.createDecorations();
    this.createMenuAndStaff();
  }

  /**
   * Creates the main coffee counter
   */
  private createCoffeeCounter(): void {
    this.createRoomElement(GameConfig.UI.centerX, 200, 300, 80, GameConfig.COLORS.brownWall);

    this.scene.add
      .text(GameConfig.UI.centerX, 200, '☕ Coffee Bar ☕\n🥐 Pastries 🧁 Cakes', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates coffee equipment and cash register
   */
  private createEquipment(): void {
    // Coffee machine
    this.createRoomElement(400, 180, 60, 40, 0x2f4f2f);
    this.scene.add.text(400, 180, '☕', { fontFamily: 'Arial', fontSize: 24 }).setOrigin(0.5);

    // Cash register
    this.createRoomElement(624, 180, 50, 30, 0x000000);
    this.scene.add.text(624, 180, '💰', { fontFamily: 'Arial', fontSize: 20 }).setOrigin(0.5);
  }

  /**
   * Creates seating areas with tables and chairs
   */
  private createSeatingAreas(): void {
    const tablePositions = [
      { x: 200, y: 350 },
      { x: 400, y: 350 },
      { x: 624, y: 350 },
      { x: 824, y: 350 },
      { x: 300, y: 500 },
      { x: 724, y: 500 },
    ];

    tablePositions.forEach(pos => {
      this.createTableWithChairs(pos.x, pos.y);
    });
  }

  /**
   * Creates a round table with surrounding chairs
   */
  private createTableWithChairs(x: number, y: number): void {
    // Round table
    this.createCircularRoomElement(x, y, 40, GameConfig.COLORS.brownWall);

    // Chairs around table
    const chairPositions = [
      { x: x - 50, y }, // Left
      { x: x + 50, y }, // Right
      { x, y: y - 50 }, // Top
      { x, y: y + 50 }, // Bottom
    ];

    chairPositions.forEach(chairPos => {
      this.createCircularRoomElement(chairPos.x, chairPos.y, 15, GameConfig.COLORS.darkBrown);
    });

    // Coffee cups on some tables (random)
    if (Math.random() > 0.5) {
      this.scene.add.text(x, y, '☕', { fontFamily: 'Arial', fontSize: 16 }).setOrigin(0.5);
    }
  }

  /**
   * Creates cafe decorations
   */
  private createDecorations(): void {
    // Plants and art
    this.scene.add.text(200, 280, '🌱', { fontFamily: 'Arial', fontSize: 24 }).setOrigin(0.5);
    this.scene.add.text(824, 280, '🎨', { fontFamily: 'Arial', fontSize: 24 }).setOrigin(0.5);
  }

  /**
   * Creates menu board and barista
   */
  private createMenuAndStaff(): void {
    // Menu board
    this.scene.add.rectangle(150, 200, 120, 100, 0x2f4f2f);
    this.scene.add
      .text(150, 200, '📋 MENU\n☕ Coffee $3\n🥐 Croissant $2\n🧁 Muffin $2', {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Barista
    this.scene.add
      .text(GameConfig.UI.centerX, 250, '👩‍🍳\nBarista Sarah', {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Helper method to create rectangular room elements with collision
   */
  private createRoomElement(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): Phaser.GameObjects.Rectangle {
    const element = this.scene.add.rectangle(x, y, width, height, color);
    this.obstacles.add(element);
    return element;
  }

  /**
   * Helper method to create circular room elements with collision
   */
  private createCircularRoomElement(
    x: number,
    y: number,
    radius: number,
    color: number
  ): Phaser.GameObjects.Arc {
    const element = this.scene.add.arc(x, y, radius, 0, 360, false, color);
    this.obstacles.add(element);
    return element;
  }
}

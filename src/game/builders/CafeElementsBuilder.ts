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
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.29,
      GameConfig.screenWidth * 0.25,
      GameConfig.screenHeight * 0.12,
      GameConfig.COLORS.brownWall
    );

    this.scene.add
      .text(
        GameConfig.UI.centerX,
        GameConfig.screenHeight * 0.29,
        '☕ Coffee Bar ☕\n🥐 Pastries 🧁 Cakes',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 50, 16),
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates coffee equipment and cash register
   */
  private createEquipment(): void {
    // Coffee machine
    this.createRoomElement(
      GameConfig.screenWidth * 0.33,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.05,
      GameConfig.screenHeight * 0.06,
      0x2f4f2f
    );
    this.scene.add
      .image(GameConfig.screenWidth * 0.33, GameConfig.screenHeight * 0.26, 'item_coffee')
      .setScale(0.8)
      .setOrigin(0.5);

    // Cash register
    this.createRoomElement(
      GameConfig.screenWidth * 0.52,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.04,
      GameConfig.screenHeight * 0.045,
      0x000000
    );
    this.scene.add
      .image(GameConfig.screenWidth * 0.52, GameConfig.screenHeight * 0.26, 'item_cash')
      .setScale(0.7)
      .setOrigin(0.5);
  }

  /**
   * Creates seating areas with tables and chairs
   */
  private createSeatingAreas(): void {
    const tablePositions = [
      { x: GameConfig.screenWidth * 0.17, y: GameConfig.screenHeight * 0.51 },
      { x: GameConfig.screenWidth * 0.33, y: GameConfig.screenHeight * 0.51 },
      { x: GameConfig.screenWidth * 0.52, y: GameConfig.screenHeight * 0.51 },
      { x: GameConfig.screenWidth * 0.69, y: GameConfig.screenHeight * 0.51 },
      { x: GameConfig.screenWidth * 0.25, y: GameConfig.screenHeight * 0.72 },
      { x: GameConfig.screenWidth * 0.6, y: GameConfig.screenHeight * 0.72 },
    ];

    tablePositions.forEach(pos => {
      this.createTableWithChairs(pos.x, pos.y);
    });
  }

  /**
   * Creates a round table with surrounding chairs
   */
  private createTableWithChairs(x: number, y: number): void {
    const tableRadius = Math.min(GameConfig.screenWidth * 0.033, 40);
    const chairRadius = Math.min(GameConfig.screenWidth * 0.0125, 15);
    const chairDistance = Math.min(GameConfig.screenWidth * 0.042, 50);

    // Round table
    this.createCircularRoomElement(x, y, tableRadius, GameConfig.COLORS.brownWall);

    // Chairs around table
    const chairPositions = [
      { x: x - chairDistance, y }, // Left
      { x: x + chairDistance, y }, // Right
      { x, y: y - chairDistance }, // Top
      { x, y: y + chairDistance }, // Bottom
    ];

    chairPositions.forEach(chairPos => {
      this.createCircularRoomElement(
        chairPos.x,
        chairPos.y,
        chairRadius,
        GameConfig.COLORS.darkBrown
      );
    });

    // Coffee cups on some tables (random)
    if (Math.random() > 0.5) {
      this.scene.add
        .image(x, y, 'item_coffee')
        .setScale(0.6)
        .setOrigin(0.5);
    }
  }

  /**
   * Creates cafe decorations
   */
  private createDecorations(): void {
    // Plants and art
    this.scene.add
      .image(GameConfig.screenWidth * 0.17, GameConfig.screenHeight * 0.41, 'item_plant')
      .setScale(0.8)
      .setOrigin(0.5);
    this.scene.add
      .image(GameConfig.screenWidth * 0.69, GameConfig.screenHeight * 0.41, 'item_art')
      .setScale(0.8)
      .setOrigin(0.5);
  }

  /**
   * Creates menu board and barista
   */
  private createMenuAndStaff(): void {
    // Menu board
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.125,
      GameConfig.screenHeight * 0.29,
      GameConfig.screenWidth * 0.1,
      GameConfig.screenHeight * 0.145,
      0x2f4f2f
    );
    this.scene.add
      .text(
        GameConfig.screenWidth * 0.125,
        GameConfig.screenHeight * 0.29,
        '📋 MENU\n☕ Coffee $3\n🥐 Croissant $2\n🧁 Muffin $2',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 70, 12),
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Barista
    this.scene.add
      .image(GameConfig.UI.centerX, GameConfig.screenHeight * 0.36, 'character_customer')
      .setScale(0.5)
      .setOrigin(0.5);

    this.scene.add
      .text(GameConfig.UI.centerX, GameConfig.screenHeight * 0.42, 'Barista Sarah', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 50, 14),
        align: 'center',
        color: GameConfig.COLORS.textDarkGreen,
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

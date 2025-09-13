import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating library-specific interior elements
 */
export class LibraryElementsBuilder {
  private scene: Scene;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Scene, obstacles: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.obstacles = obstacles;
  }

  /**
   * Creates all library interior elements
   */
  createLibraryElements(): void {
    this.createBookshelves();
    this.createReadingTables();
    this.createLibrarianDesk();
    this.createInformationSign();
  }

  /**
   * Creates bookshelves along the walls
   */
  private createBookshelves(): void {
    const shelfConfig = {
      count: 6,
      startX: 150,
      spacing: 120,
      y: 200,
      width: 80,
      height: 120,
    };

    for (let i = 0; i < shelfConfig.count; i++) {
      const x = shelfConfig.startX + i * shelfConfig.spacing;

      // Create bookshelf structure
      this.createRoomElement(
        x,
        shelfConfig.y,
        shelfConfig.width,
        shelfConfig.height,
        GameConfig.COLORS.darkBrown
      );

      // Add books to the shelf
      this.scene.add
        .text(x, shelfConfig.y, '📖\n📗\n📘\n📙', {
          fontFamily: 'Arial',
          fontSize: 16,
          align: 'center',
        })
        .setOrigin(0.5);
    }
  }

  /**
   * Creates reading tables with chairs in the center area
   */
  private createReadingTables(): void {
    const tableConfig = {
      count: 3,
      startX: 250,
      spacing: 200,
      y: 400,
      tableSize: { width: 120, height: 80 },
      chairSize: { width: 30, height: 30 },
      chairOffsets: [
        { x: -50, y: 0 }, // Left
        { x: 50, y: 0 }, // Right
        { x: 0, y: -40 }, // Top
        { x: 0, y: 40 }, // Bottom
      ],
    };

    for (let i = 0; i < tableConfig.count; i++) {
      const tableX = tableConfig.startX + i * tableConfig.spacing;
      const tableY = tableConfig.y;

      // Create table
      this.createRoomElement(
        tableX,
        tableY,
        tableConfig.tableSize.width,
        tableConfig.tableSize.height,
        GameConfig.COLORS.brownWall
      );

      // Create chairs around table
      tableConfig.chairOffsets.forEach(offset => {
        this.createRoomElement(
          tableX + offset.x,
          tableY + offset.y,
          tableConfig.chairSize.width,
          tableConfig.chairSize.height,
          GameConfig.COLORS.darkBrown
        );
      });

      // Add books on table
      this.scene.add
        .text(tableX, tableY, '📚', { fontFamily: 'Arial', fontSize: 20 })
        .setOrigin(0.5);
    }
  }

  /**
   * Creates the librarian's service desk
   */
  private createLibrarianDesk(): void {
    this.createRoomElement(GameConfig.UI.centerX, 300, 120, 80, GameConfig.COLORS.brownWall);

    this.scene.add
      .text(GameConfig.UI.centerX, 300, '👨‍💼\nLibrarian', {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Creates informational signage
   */
  private createInformationSign(): void {
    this.scene.add
      .text(GameConfig.UI.centerX, 500, '📖 Reading Corner 📖\nQuiet Study Area', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: GameConfig.COLORS.textDarkGreen,
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Helper method to create room elements with collision
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
}

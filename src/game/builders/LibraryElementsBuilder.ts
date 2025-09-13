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
      startX: GameConfig.screenWidth * 0.15,
      spacing: GameConfig.screenWidth * 0.12,
      y: GameConfig.screenHeight * 0.26,
      width: GameConfig.screenWidth * 0.08,
      height: GameConfig.screenHeight * 0.16,
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
      for (let j = 0; j < 4; j++) {
        this.scene.add
          .image(x, shelfConfig.y - 20 + j * 10, 'item_book')
          .setScale(0.4)
          .setOrigin(0.5);
      }
    }
  }

  /**
   * Creates reading tables with chairs in the center area
   */
  private createReadingTables(): void {
    const tableConfig = {
      count: 3,
      startX: GameConfig.screenWidth * 0.25,
      spacing: GameConfig.screenWidth * 0.2,
      y: GameConfig.screenHeight * 0.52,
      tableSize: {
        width: GameConfig.screenWidth * 0.12,
        height: GameConfig.screenHeight * 0.1,
      },
      chairSize: {
        width: GameConfig.screenWidth * 0.03,
        height: GameConfig.screenHeight * 0.04,
      },
      chairOffsets: [
        { x: -GameConfig.screenWidth * 0.05, y: 0 }, // Left
        { x: GameConfig.screenWidth * 0.05, y: 0 }, // Right
        { x: 0, y: -GameConfig.screenHeight * 0.05 }, // Top
        { x: 0, y: GameConfig.screenHeight * 0.05 }, // Bottom
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
      this.scene.add.image(tableX, tableY, 'item_book').setScale(0.6).setOrigin(0.5);
    }
  }

  /**
   * Creates the librarian's service desk
   */
  private createLibrarianDesk(): void {
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.39,
      GameConfig.screenWidth * 0.12,
      GameConfig.screenHeight * 0.1,
      GameConfig.COLORS.brownWall
    );

    this.scene.add
      .image(GameConfig.UI.centerX, GameConfig.screenHeight * 0.39, 'character_librarian')
      .setScale(0.5)
      .setOrigin(0.5);

    this.scene.add
      .text(GameConfig.UI.centerX, GameConfig.screenHeight * 0.45, 'Librarian', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 50, 14),
        align: 'center',
        color: GameConfig.COLORS.textDarkGreen,
      })
      .setOrigin(0.5);
  }

  /**
   * Creates informational signage
   */
  private createInformationSign(): void {
    this.scene.add
      .text(
        GameConfig.UI.centerX,
        GameConfig.screenHeight * 0.72,
        '📖 Reading Corner 📖\nQuiet Study Area',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 50, 16),
          color: GameConfig.COLORS.textDarkGreen,
          backgroundColor: '#ffffff',
          padding: { x: 10, y: 5 },
          align: 'center',
        }
      )
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

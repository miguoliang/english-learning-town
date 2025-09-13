import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating the town environment including buildings, roads, and decorations
 */
export class TownEnvironmentBuilder {
  private scene: Scene;
  private buildings: {
    school: Phaser.GameObjects.Rectangle | null;
    library: Phaser.GameObjects.Rectangle | null;
    cafe: Phaser.GameObjects.Rectangle | null;
    shop: Phaser.GameObjects.Rectangle | null;
  } = {
    school: null,
    library: null,
    cafe: null,
    shop: null,
  };
  private fountain: Phaser.GameObjects.Arc | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates the complete town environment
   * @returns Object containing all created buildings and fountain
   */
  createTownEnvironment(): {
    buildings: Record<string, Phaser.GameObjects.Rectangle | null>;
    fountain: Phaser.GameObjects.Arc | null;
  } {
    this.createGround();
    this.createTownRoads();
    this.createBuildings();
    this.setupBuildingInteractions();

    return {
      buildings: this.buildings,
      fountain: this.fountain,
    };
  }

  /**
   * Creates the ground/background
   */
  private createGround(): void {
    this.scene.add.rectangle(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.78, // 78% from top
      GameConfig.screenWidth,
      GameConfig.screenHeight * 0.44, // 44% of screen height
      GameConfig.COLORS.lightGreen
    );
  }

  /**
   * Creates town roads and pathways
   */
  private createTownRoads(): void {
    const centerX = GameConfig.UI.centerX;
    const centerY = GameConfig.UI.centerY;

    // Main horizontal road through town center
    this.scene.add.rectangle(
      centerX,
      centerY * 1.05,
      GameConfig.screenWidth,
      GameConfig.screenHeight * 0.1,
      0x696969
    );
    this.scene.add.rectangle(
      centerX,
      centerY * 1.05,
      GameConfig.screenWidth,
      GameConfig.screenHeight * 0.08,
      0x808080
    );

    // Main vertical road (town square access)
    this.scene.add.rectangle(
      centerX,
      centerY * 0.8,
      GameConfig.screenWidth * 0.08,
      GameConfig.screenHeight * 0.52,
      0x696969
    );
    this.scene.add.rectangle(
      centerX,
      centerY * 0.8,
      GameConfig.screenWidth * 0.06,
      GameConfig.screenHeight * 0.52,
      0x808080
    );

    // Road to school (upper left)
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.3,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.2,
      GameConfig.screenHeight * 0.05,
      0x696969
    );
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.3,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.18,
      GameConfig.screenHeight * 0.04,
      0x808080
    );

    // Road to library (upper right)
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.7,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.2,
      GameConfig.screenHeight * 0.05,
      0x696969
    );
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.7,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.18,
      GameConfig.screenHeight * 0.04,
      0x808080
    );

    this.createTownCenter();
    this.createStreetSigns();
    this.createWelcomeSign();
  }

  /**
   * Creates the town center with fountain
   */
  private createTownCenter(): void {
    const centerX = GameConfig.UI.centerX;
    const centerY = GameConfig.screenHeight * 0.42; // 42% from top

    // Town center fountain/plaza
    this.scene.add.circle(centerX, centerY, GameConfig.screenWidth * 0.05, 0x4169e1);
    this.scene.add.circle(centerX, centerY, GameConfig.screenWidth * 0.035, 0x87ceeb);
    this.fountain = this.scene.add.circle(
      centerX,
      centerY,
      GameConfig.screenWidth * 0.015,
      0x4682b4
    );

    this.scene.add
      .text(centerX, centerY, '⛲', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 25, 30),
      })
      .setOrigin(0.5);

    // Decorative trees and benches - positioned relative to center
    this.scene.add
      .text(
        centerX - GameConfig.screenWidth * 0.06,
        centerY - GameConfig.screenHeight * 0.05,
        '🌳',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 30, 24),
        }
      )
      .setOrigin(0.5);
    this.scene.add
      .text(
        centerX + GameConfig.screenWidth * 0.06,
        centerY - GameConfig.screenHeight * 0.05,
        '🌳',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 30, 24),
        }
      )
      .setOrigin(0.5);
    this.scene.add
      .text(
        centerX - GameConfig.screenWidth * 0.06,
        centerY + GameConfig.screenHeight * 0.05,
        '🪑',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 40, 16),
        }
      )
      .setOrigin(0.5);
    this.scene.add
      .text(
        centerX + GameConfig.screenWidth * 0.06,
        centerY + GameConfig.screenHeight * 0.05,
        '🪑',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 40, 16),
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates street signs
   */
  private createStreetSigns(): void {
    const centerY = GameConfig.screenHeight * 0.5;

    // Left sign
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.4,
      centerY,
      4,
      GameConfig.screenHeight * 0.05,
      GameConfig.COLORS.darkBrown
    );
    this.scene.add
      .text(GameConfig.screenWidth * 0.4, centerY - GameConfig.screenHeight * 0.02, '🏫←  →📚', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
        color: '#ffffff',
        backgroundColor: '#2f4f2f',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5);

    // Right sign
    this.scene.add.rectangle(
      GameConfig.screenWidth * 0.6,
      centerY,
      4,
      GameConfig.screenHeight * 0.05,
      GameConfig.COLORS.darkBrown
    );
    this.scene.add
      .text(GameConfig.screenWidth * 0.6, centerY - GameConfig.screenHeight * 0.02, '☕←  →🛒', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
        color: '#ffffff',
        backgroundColor: '#2f4f2f',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5);
  }

  /**
   * Creates welcome sign at town entrance
   */
  private createWelcomeSign(): void {
    this.scene.add.rectangle(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.81,
      GameConfig.screenWidth * 0.2,
      GameConfig.screenHeight * 0.05,
      0x8b4513
    );
    this.scene.add
      .text(
        GameConfig.UI.centerX,
        GameConfig.screenHeight * 0.81,
        '🎓 Welcome to English Learning Town 🎓',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 50, 14),
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates the town buildings
   */
  private createBuildings(): void {
    // School
    this.buildings.school = this.scene.add.rectangle(
      GameConfig.BUILDINGS.SCHOOL.x,
      GameConfig.BUILDINGS.SCHOOL.y,
      GameConfig.BUILDINGS.SCHOOL.width,
      GameConfig.BUILDINGS.SCHOOL.height,
      GameConfig.BUILDINGS.SCHOOL.color
    );
    this.addBuildingLabel(
      GameConfig.BUILDINGS.SCHOOL.x,
      GameConfig.BUILDINGS.SCHOOL.y,
      '🏫\nSCHOOL'
    );
    this.scene.add.rectangle(
      GameConfig.BUILDINGS.SCHOOL.x,
      GameConfig.BUILDINGS.SCHOOL.y + 70,
      180,
      20,
      GameConfig.COLORS.darkBrown
    );

    // Library
    this.buildings.library = this.scene.add.rectangle(
      GameConfig.BUILDINGS.LIBRARY.x,
      GameConfig.BUILDINGS.LIBRARY.y,
      GameConfig.BUILDINGS.LIBRARY.width,
      GameConfig.BUILDINGS.LIBRARY.height,
      GameConfig.BUILDINGS.LIBRARY.color
    );
    this.addBuildingLabel(
      GameConfig.BUILDINGS.LIBRARY.x,
      GameConfig.BUILDINGS.LIBRARY.y,
      '📚\nLIBRARY'
    );
    this.scene.add
      .text(GameConfig.BUILDINGS.LIBRARY.x, GameConfig.BUILDINGS.LIBRARY.y + 70, '🌺 🌻 🌺', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 50, 14),
      })
      .setOrigin(0.5);

    // Cafe
    this.buildings.cafe = this.scene.add.rectangle(
      GameConfig.BUILDINGS.CAFE.x,
      GameConfig.BUILDINGS.CAFE.y,
      GameConfig.BUILDINGS.CAFE.width,
      GameConfig.BUILDINGS.CAFE.height,
      GameConfig.BUILDINGS.CAFE.color
    );
    this.addBuildingLabel(GameConfig.BUILDINGS.CAFE.x, GameConfig.BUILDINGS.CAFE.y, '☕\nCAFE');
    this.addCafeDecorations();

    // Shop
    this.buildings.shop = this.scene.add.rectangle(
      GameConfig.BUILDINGS.SHOP.x,
      GameConfig.BUILDINGS.SHOP.y,
      GameConfig.BUILDINGS.SHOP.width,
      GameConfig.BUILDINGS.SHOP.height,
      GameConfig.BUILDINGS.SHOP.color
    );
    this.addBuildingLabel(GameConfig.BUILDINGS.SHOP.x, GameConfig.BUILDINGS.SHOP.y, '🛒\nSHOP');
    this.addShopDecorations();
  }

  /**
   * Adds a label to a building
   */
  private addBuildingLabel(x: number, y: number, text: string): void {
    this.scene.add.text(x, y, text, GameConfig.textStyles.buildingLabel).setOrigin(0.5);
  }

  /**
   * Adds decorations around the cafe
   */
  private addCafeDecorations(): void {
    this.scene.add
      .text(GameConfig.BUILDINGS.CAFE.x - 50, GameConfig.BUILDINGS.CAFE.y + 40, '🪑☕🪑', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
      })
      .setOrigin(0.5);
    this.scene.add
      .text(GameConfig.BUILDINGS.CAFE.x + 50, GameConfig.BUILDINGS.CAFE.y + 40, '🪑☕🪑', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
      })
      .setOrigin(0.5);
  }

  /**
   * Adds decorations around the shop
   */
  private addShopDecorations(): void {
    this.scene.add.rectangle(
      GameConfig.BUILDINGS.SHOP.x,
      GameConfig.BUILDINGS.SHOP.y + 60,
      120,
      30,
      0x2f4f2f
    );
    this.scene.add
      .text(GameConfig.BUILDINGS.SHOP.x, GameConfig.BUILDINGS.SHOP.y + 60, '🚗 🚙 🚗', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
      })
      .setOrigin(0.5);
  }

  /**
   * Sets up building interactions (hover effects)
   */
  private setupBuildingInteractions(): void {
    const buildings = [
      this.buildings.school,
      this.buildings.library,
      this.buildings.cafe,
      this.buildings.shop,
    ];

    buildings.forEach(building => {
      if (building) {
        building.setInteractive();
        building.on('pointerover', () => {
          building.setAlpha(0.8);
          this.scene.input.setDefaultCursor('pointer');
        });
        building.on('pointerout', () => {
          building.setAlpha(1);
          this.scene.input.setDefaultCursor('default');
        });
      }
    });
  }

  /**
   * Gets all buildings as an array for collision detection
   */
  getBuildingsArray(): (Phaser.GameObjects.Rectangle | null)[] {
    return [
      this.buildings.school,
      this.buildings.library,
      this.buildings.cafe,
      this.buildings.shop,
    ];
  }

  /**
   * Gets the fountain for collision detection
   */
  getFountain(): Phaser.GameObjects.Arc | null {
    return this.fountain;
  }

  /**
   * Gets specific building by name
   */
  getBuilding(name: keyof typeof this.buildings): Phaser.GameObjects.Rectangle | null {
    return this.buildings[name];
  }
}

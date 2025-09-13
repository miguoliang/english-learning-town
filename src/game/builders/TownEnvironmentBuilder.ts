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
      600,
      GameConfig.screenWidth,
      336,
      GameConfig.COLORS.lightGreen
    );
  }

  /**
   * Creates town roads and pathways
   */
  private createTownRoads(): void {
    // Main horizontal road through town center
    this.scene.add.rectangle(GameConfig.UI.centerX, 400, GameConfig.screenWidth, 80, 0x696969);
    this.scene.add.rectangle(GameConfig.UI.centerX, 400, GameConfig.screenWidth, 60, 0x808080);

    // Main vertical road (town square access)
    this.scene.add.rectangle(GameConfig.UI.centerX, 300, 80, 400, 0x696969);
    this.scene.add.rectangle(GameConfig.UI.centerX, 300, 60, 400, 0x808080);

    // Road to school (upper left)
    this.scene.add.rectangle(300, 200, 200, 40, 0x696969);
    this.scene.add.rectangle(300, 200, 180, 30, 0x808080);

    // Road to library (upper right)
    this.scene.add.rectangle(724, 200, 200, 40, 0x696969);
    this.scene.add.rectangle(724, 200, 180, 30, 0x808080);

    this.createTownCenter();
    this.createStreetSigns();
    this.createWelcomeSign();
  }

  /**
   * Creates the town center with fountain
   */
  private createTownCenter(): void {
    // Town center fountain/plaza
    this.scene.add.circle(GameConfig.UI.centerX, 320, 50, 0x4169e1);
    this.scene.add.circle(GameConfig.UI.centerX, 320, 35, 0x87ceeb);
    this.fountain = this.scene.add.circle(GameConfig.UI.centerX, 320, 15, 0x4682b4);

    this.scene.add
      .text(GameConfig.UI.centerX, 320, '⛲', {
        fontFamily: 'Arial',
        fontSize: 30,
      })
      .setOrigin(0.5);

    // Decorative trees and benches
    this.scene.add.text(450, 280, '🌳', { fontFamily: 'Arial', fontSize: 24 }).setOrigin(0.5);
    this.scene.add.text(574, 280, '🌳', { fontFamily: 'Arial', fontSize: 24 }).setOrigin(0.5);
    this.scene.add.text(450, 360, '🪑', { fontFamily: 'Arial', fontSize: 16 }).setOrigin(0.5);
    this.scene.add.text(574, 360, '🪑', { fontFamily: 'Arial', fontSize: 16 }).setOrigin(0.5);
  }

  /**
   * Creates street signs
   */
  private createStreetSigns(): void {
    // Left sign
    this.scene.add.rectangle(400, 380, 4, 40, GameConfig.COLORS.darkBrown);
    this.scene.add
      .text(400, 365, '🏫←  →📚', {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#ffffff',
        backgroundColor: '#2f4f2f',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5);

    // Right sign
    this.scene.add.rectangle(624, 380, 4, 40, GameConfig.COLORS.darkBrown);
    this.scene.add
      .text(624, 365, '☕←  →🛒', {
        fontFamily: 'Arial',
        fontSize: 12,
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
    this.scene.add.rectangle(GameConfig.UI.centerX, 620, 200, 40, 0x8b4513);
    this.scene.add
      .text(GameConfig.UI.centerX, 620, '🎓 Welcome to English Learning Town 🎓', {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#ffffff',
        align: 'center',
      })
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
      220,
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
      .text(GameConfig.BUILDINGS.LIBRARY.x, 220, '🌺 🌻 🌺', {
        fontFamily: 'Arial',
        fontSize: 14,
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
    this.scene.add.text(250, 540, '🪑☕🪑', { fontFamily: 'Arial', fontSize: 12 }).setOrigin(0.5);
    this.scene.add.text(350, 540, '🪑☕🪑', { fontFamily: 'Arial', fontSize: 12 }).setOrigin(0.5);
  }

  /**
   * Adds decorations around the shop
   */
  private addShopDecorations(): void {
    this.scene.add.rectangle(GameConfig.BUILDINGS.SHOP.x, 560, 120, 30, 0x2f4f2f);
    this.scene.add
      .text(GameConfig.BUILDINGS.SHOP.x, 560, '🚗 🚙 🚗', {
        fontFamily: 'Arial',
        fontSize: 12,
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

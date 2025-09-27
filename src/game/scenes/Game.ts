import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { CharacterManager } from '../managers/CharacterManager';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private characterManager: CharacterManager;

  constructor() {
    super('Game');
  }

  create(_data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    this.createSceneTitle();
    this.createTiledMap();
    this.createCharacters();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the main scene title
   */
  private createSceneTitle(): void {
    this.add
      .text(GameConfig.UI.centerX, 50, 'English Learning Town', GameConfig.textStyles.TITLE)
      .setOrigin(0.5);
  }


  /**
   * Creates and displays the Tiled map
   */
  private createTiledMap(): void {
    const map = this.make.tilemap({ key: 'town_map' });

    // Add tilesets - now they're embedded in the TMJ file
    const springTileset = map.addTilesetImage('spring');
    const dirtTileset = map.addTilesetImage('dirt');

    const allTilesets = [springTileset, dirtTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (allTilesets.length > 0) {
      // Create layers in proper order (only the layers that exist in the tilemap)
      const dustLayer = map.createLayer('Dust', allTilesets, 0, 0);
      const groundLayer = map.createLayer('Ground', allTilesets, 0, 0);

      // Scale and position the map
      const layers = [dustLayer, groundLayer].filter(Boolean);
      layers.forEach(layer => {
        if (layer) {
          const scaleX = GameConfig.screenWidth / (map.widthInPixels || 480);
          const scaleY = GameConfig.screenHeight / (map.heightInPixels || 320);
          const scale = Math.min(scaleX, scaleY, 2);
          layer.setScale(scale);

          const mapWidth = (map.widthInPixels || 480) * scale;
          const mapHeight = (map.heightInPixels || 320) * scale;
          layer.setPosition(
            (GameConfig.screenWidth - mapWidth) / 2,
            (GameConfig.screenHeight - mapHeight) / 2
          );
        }
      });
    }
  }

  /**
   * Creates and places characters in the town
   */
  private createCharacters(): void {
    // Initialize character manager
    this.characterManager = new CharacterManager(this);

    // Create NPCs at strategic locations
    // Teacher near school
    this.characterManager.createCharacter(
      'teacher',
      GameConfig.BUILDINGS.SCHOOL.x + 80,
      GameConfig.BUILDINGS.SCHOOL.y + 120,
      'down',
      3 // Larger scale for visibility
    );

    // Librarian near library
    this.characterManager.createCharacter(
      'librarian',
      GameConfig.BUILDINGS.LIBRARY.x - 80,
      GameConfig.BUILDINGS.LIBRARY.y + 120,
      'right',
      3
    );

    // Shopkeeper near shop
    this.characterManager.createCharacter(
      'shopkeeper',
      GameConfig.BUILDINGS.SHOP.x - 80,
      GameConfig.BUILDINGS.SHOP.y + 20,
      'left',
      3
    );

    // Student walking around
    this.characterManager.createCharacter(
      'student',
      GameConfig.UI.centerX - 100,
      GameConfig.UI.centerY + 50,
      'up',
      2.5
    );

    // Customer near cafe
    this.characterManager.createCharacter(
      'customer',
      GameConfig.BUILDINGS.CAFE.x + 100,
      GameConfig.BUILDINGS.CAFE.y + 20,
      'down',
      2.5
    );
  }

}

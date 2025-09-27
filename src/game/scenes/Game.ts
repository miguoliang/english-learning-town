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
    this.createPlayer();

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
   * Creates the player character at the center of the town map
   */
  private createPlayer(): void {
    // Initialize character manager
    this.characterManager = new CharacterManager(this);

    // Calculate the center of the map in world coordinates
    const map = this.cache.tilemap.get('town_map');
    if (map) {
      // Map dimensions: 32x24 tiles, 16x16 pixels per tile = 512x384 pixels
      const mapWidthInPixels = 32 * 16; // 512 pixels
      const mapHeightInPixels = 24 * 16; // 384 pixels

      // Calculate map center in map coordinates
      const mapCenterX = mapWidthInPixels / 2; // 256
      const mapCenterY = mapHeightInPixels / 2; // 192

      // Calculate the same scaling and positioning used for map layers
      const scaleX = GameConfig.screenWidth / mapWidthInPixels;
      const scaleY = GameConfig.screenHeight / mapHeightInPixels;
      const scale = Math.min(scaleX, scaleY, 2);

      const scaledMapWidth = mapWidthInPixels * scale;
      const scaledMapHeight = mapHeightInPixels * scale;
      const mapOffsetX = (GameConfig.screenWidth - scaledMapWidth) / 2;
      const mapOffsetY = (GameConfig.screenHeight - scaledMapHeight) / 2;

      // Transform map center to world coordinates
      const worldCenterX = mapOffsetX + (mapCenterX * scale);
      const worldCenterY = mapOffsetY + (mapCenterY * scale);

      // Create player at the calculated center position
      this.characterManager.createCharacter(
        'player',
        worldCenterX,
        worldCenterY,
        'down',
        3 // Good visibility scale
      );
    } else {
      // Fallback to screen center if map data is unavailable
      console.warn('Map data not available, using screen center for player position');
      this.characterManager.createCharacter(
        'player',
        GameConfig.UI.centerX,
        GameConfig.UI.centerY,
        'down',
        3
      );
    }
  }

}

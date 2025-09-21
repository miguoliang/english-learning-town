import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super('Game');
  }

  create(data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    this.createSceneTitle();
    this.createTiledMap();

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
    const grassProps = map.addTilesetImage('grass_props');
    const treeProps = map.addTilesetImage('tree_props');
    const flowerProps = map.addTilesetImage('flower_props');
    const pavementProps = map.addTilesetImage('pavement_props');
    const house = map.addTilesetImage('house');
    const waterTiles = map.addTilesetImage('water_tiles');
    const bridgeProps = map.addTilesetImage('bridge_props');

    const allTilesets = [springTileset, grassProps, treeProps, flowerProps, pavementProps, house, waterTiles, bridgeProps].filter(Boolean);

    if (allTilesets.length > 0) {
      // Create layers in proper order
      const groundLayer = map.createLayer('Ground', allTilesets, 0, 0);
      const decorationLayer = map.createLayer('Decoration', allTilesets, 0, 0);
      const structuresLayer = map.createLayer('Structures', allTilesets, 0, 0);

      // Scale and position the map
      const layers = [groundLayer, decorationLayer, structuresLayer].filter(Boolean);
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

}

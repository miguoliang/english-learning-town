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
    const winterTileset = map.addTilesetImage('winter');
    const stepsTileset = map.addTilesetImage('steps');

    if (winterTileset && stepsTileset) {
      const groundLayer = map.createLayer('Tile Layer 1', [winterTileset, stepsTileset], 0, 0);

      if (groundLayer) {
        const scaleX = GameConfig.screenWidth / (map.widthInPixels || 480);
        const scaleY = GameConfig.screenHeight / (map.heightInPixels || 320);
        const scale = Math.min(scaleX, scaleY, 2);
        groundLayer.setScale(scale);

        const mapWidth = (map.widthInPixels || 480) * scale;
        const mapHeight = (map.heightInPixels || 320) * scale;
        groundLayer.setPosition(
          (GameConfig.screenWidth - mapWidth) / 2,
          (GameConfig.screenHeight - mapHeight) / 2
        );
      }
    }
  }

}

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { CharacterManager } from '../managers/CharacterManager';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private playerController: BasePlayerController;
  private characterManager: CharacterManager;
  private player: Phaser.GameObjects.Sprite | null = null;
  private lastFacingDirection: 'up' | 'down' | 'left' | 'right' = 'down';

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
    // Initialize controllers
    this.playerController = new BasePlayerController(this);
    this.characterManager = new CharacterManager(this);

    // Calculate the center of the map in world coordinates
    const map = this.cache.tilemap.get('town_map');
    let worldCenterX: number, worldCenterY: number;

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
      worldCenterX = mapOffsetX + mapCenterX * scale;
      worldCenterY = mapOffsetY + mapCenterY * scale;
    } else {
      // Fallback to screen center if map data is unavailable
      console.warn('Map data not available, using screen center for player position');
      worldCenterX = GameConfig.UI.centerX;
      worldCenterY = GameConfig.UI.centerY;
    }

    // Create player sprite with animations using CharacterManager
    this.player = this.characterManager.createCharacter(
      'player',
      worldCenterX,
      worldCenterY,
      'down',
      3 // Good visibility scale
    );
  }

  /**
   * Update method called every frame to handle player movement
   * @param _time Current time
   * @param delta Time elapsed since last frame
   */
  update(_time: number, delta: number): void {
    this.updatePlayerMovement(delta);
  }

  /**
   * Handles player movement with keyboard controls
   * @param delta Time elapsed since last frame
   */
  private updatePlayerMovement(delta: number): void {
    if (!this.player || !this.playerController) return;

    const { deltaX, deltaY } = this.playerController['keyboardHandler'].getDeltaMovement(
      delta,
      GameConfig.PLAYER.SPEED
    );

    // Calculate new position with boundaries (only if moving)
    if (deltaX !== 0 || deltaY !== 0) {
      const newX = Phaser.Math.Clamp(
        this.player.x + deltaX,
        50, // Left boundary
        GameConfig.screenWidth - 50 // Right boundary
      );
      const newY = Phaser.Math.Clamp(
        this.player.y + deltaY,
        50, // Top boundary
        GameConfig.screenHeight - 50 // Bottom boundary
      );

      // Update player position
      this.player.setPosition(newX, newY);
    }

    // Always update animation (handles both moving and idle states)
    this.updatePlayerAnimation(deltaX, deltaY);
  }

  /**
   * Updates player animation based on movement direction
   * @param deltaX Horizontal movement delta
   * @param deltaY Vertical movement delta
   */
  private updatePlayerAnimation(deltaX: number, deltaY: number): void {
    if (!this.player || !this.characterManager) return;

    const isMoving = deltaX !== 0 || deltaY !== 0;
    const animationType = isMoving ? 'walk' : 'idle';

    if (isMoving) {
      // Determine primary direction based on larger movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement is primary
        if (deltaX > 0) {
          this.lastFacingDirection = 'right';
          this.characterManager.setCharacterFacing(this.player, 'right', animationType);
        } else {
          this.lastFacingDirection = 'left';
          this.characterManager.setCharacterFacing(this.player, 'left', animationType);
        }
      } else {
        // Vertical movement is primary
        if (deltaY > 0) {
          this.lastFacingDirection = 'down';
          this.characterManager.setCharacterFacing(this.player, 'down', animationType);
        } else {
          this.lastFacingDirection = 'up';
          this.characterManager.setCharacterFacing(this.player, 'up', animationType);
        }
      }
    } else {
      // Player stopped moving - switch to idle animation in last direction
      this.characterManager.setCharacterFacing(this.player, this.lastFacingDirection, 'idle');
    }
  }

  /**
   * Clean up resources when scene is destroyed
   */
  destroy(): void {
    if (this.playerController) {
      this.playerController.destroy();
    }
    if (this.characterManager) {
      this.characterManager.destroy();
    }
    // Note: Phaser Scene cleanup is handled automatically
  }
}

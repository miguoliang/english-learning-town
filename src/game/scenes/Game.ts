import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { CharacterManager } from '../managers/CharacterManager';
import { TilePropertyHelper } from '../utils/TilePropertyHelper';
import { DebugSystem } from '../systems/DebugSystem';
import { getCurrentDebugConfig } from '../config/DebugConfig';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private playerController: BasePlayerController;
  private characterManager: CharacterManager;
  private tilePropertyHelper: TilePropertyHelper;
  private debugSystem: DebugSystem;
  private player: Phaser.GameObjects.Sprite | null = null;
  private lastFacingDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  private currentAnimationType: 'walk' | 'run' | 'idle' = 'idle';
  private map: Phaser.Tilemaps.Tilemap | null = null;

  constructor() {
    super('Game');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
  }

  create(_data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    this.createSceneTitle();
    this.createTiledMap();
    this.createPlayer();

    // Initialize debug system
    if (this.map && this.player) {
      this.debugSystem.initialize(this.map, this.player, this.tilePropertyHelper);
    }

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
    this.map = this.make.tilemap({ key: 'town_map' });

    // Add tilesets - now they're embedded in the TMJ file
    const springTileset = this.map.addTilesetImage('spring');
    const dirtTileset = this.map.addTilesetImage('dirt');
    const waterTileset = this.map.addTilesetImage('water-spring-shallow-1');

    const allTilesets = [springTileset, dirtTileset, waterTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (allTilesets.length > 0) {
      // Create layers in proper order (only the layers that exist in the tilemap)
      const earthLayer = this.map.createLayer('Earth', allTilesets, 0, 0);
      const groundLayer = this.map.createLayer('Ground', allTilesets, 0, 0);
      const entityLayer = this.map.createLayer('Entity', allTilesets, 0, 0);

      // Scale and position the map
      const layers = [earthLayer, groundLayer, entityLayer].filter(Boolean);
      layers.forEach(layer => {
        if (layer) {
          const scaleX = GameConfig.screenWidth / (this.map!.widthInPixels || 480);
          const scaleY = GameConfig.screenHeight / (this.map!.heightInPixels || 320);
          const scale = Math.min(scaleX, scaleY, 2);
          layer.setScale(scale);

          const mapWidth = (this.map!.widthInPixels || 480) * scale;
          const mapHeight = (this.map!.heightInPixels || 320) * scale;
          layer.setPosition(
            (GameConfig.screenWidth - mapWidth) / 2,
            (GameConfig.screenHeight - mapHeight) / 2
          );
        }
      });
    }

    // Initialize tile property helper
    this.tilePropertyHelper = new TilePropertyHelper(this);
    this.tilePropertyHelper.setMap(this.map);
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
      // Get consistent map dimensions
      const mapWidthInPixels = this.map!.width * this.map!.tileWidth;
      const mapHeightInPixels = this.map!.height * this.map!.tileHeight;

      // Calculate map center in map coordinates
      const mapCenterX = mapWidthInPixels / 2;
      const mapCenterY = mapHeightInPixels / 2;

      // Calculate consistent scaling and positioning
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

      console.log(`🎮 Player spawn: Map center (${mapCenterX}, ${mapCenterY}) → World (${worldCenterX.toFixed(1)}, ${worldCenterY.toFixed(1)})`);
      console.log(`   Scale: ${scale.toFixed(2)}, Offset: (${mapOffsetX.toFixed(1)}, ${mapOffsetY.toFixed(1)})`);

      // Create player sprite with animations using CharacterManager
      // Use the same scale as the map for consistency
      this.player = this.characterManager.createCharacter(
        'player',
        worldCenterX,
        worldCenterY,
        'down',
        scale // Match map scale for coordinate system consistency
      );
    } else {
      // Fallback to screen center if map data is unavailable
      console.warn('Map data not available, using screen center for player position');
      worldCenterX = GameConfig.UI.centerX;
      worldCenterY = GameConfig.UI.centerY;

      // Create player sprite with fallback scale
      this.player = this.characterManager.createCharacter(
        'player',
        worldCenterX,
        worldCenterY,
        'down',
        2 // Fallback scale when map data is unavailable
      );
    }

    // Player creation complete
  }

  /**
   * Update method called every frame to handle player movement
   * @param _time - Current time
   * @param delta - Time elapsed since last frame
   */
  update(_time: number, delta: number): void {
    this.updatePlayerMovement(delta);
    this.debugSystem.update();
  }

  /**
   * Handles player movement with keyboard controls
   * @param delta - Time elapsed since last frame
   */
  private updatePlayerMovement(delta: number): void {
    if (!this.player || !this.playerController) return;

    const { deltaX, deltaY, isRunning } = this.playerController['keyboardHandler'].getDeltaMovement(
      delta,
      GameConfig.PLAYER.SPEED
    );

    // Calculate new position and check if it's walkable (only if moving)
    if (deltaX !== 0 || deltaY !== 0) {
      const newX = this.player.x + deltaX;
      const newY = this.player.y + deltaY;

      // Get tile coordinates for movement validation
      const { tileX, tileY } = this.tilePropertyHelper.worldToTileCoords(newX, newY);
      const currentTileCoords = this.tilePropertyHelper.worldToTileCoords(this.player.x, this.player.y);

      // Check if the new position is walkable using tile properties
      const isWalkable = this.tilePropertyHelper && this.tilePropertyHelper.isWorldPositionWalkable(newX, newY);

      // Log movement debugging through DebugSystem
      this.debugSystem.logMovement(deltaX, deltaY, currentTileCoords, { tileX, tileY }, isWalkable);

      if (isWalkable) {
        // Update player position only if the tile is walkable
        this.player.setPosition(newX, newY);
      }
    }

    // Always update animation (handles both moving and idle states)
    this.updatePlayerAnimation(deltaX, deltaY, isRunning);
  }


  /**
   * Updates player animation based on movement direction and Shift key state
   * Only updates animation when direction or type actually changes to prevent unnecessary calls
   * @param deltaX - Horizontal movement delta
   * @param deltaY - Vertical movement delta
   * @param isRunning - Whether the player is running (Shift key pressed)
   */
  private updatePlayerAnimation(deltaX: number, deltaY: number, isRunning: boolean): void {
    if (!this.player || !this.characterManager) return;

    const isMoving = deltaX !== 0 || deltaY !== 0;
    let animationType: 'walk' | 'run' | 'idle' = 'idle';
    let newDirection = this.lastFacingDirection;

    if (isMoving) {
      // Determine primary direction based on larger movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement is primary
        newDirection = deltaX > 0 ? 'right' : 'left';
      } else {
        // Vertical movement is primary
        newDirection = deltaY > 0 ? 'down' : 'up';
      }

      // Use running animation when Shift key is pressed, otherwise use walking
      animationType = isRunning ? 'run' : 'walk';
    }

    // Only update animation if direction or animation type changed
    const directionChanged = newDirection !== this.lastFacingDirection;
    const animationChanged = animationType !== this.currentAnimationType;

    if (directionChanged || animationChanged) {
      this.lastFacingDirection = newDirection;
      this.currentAnimationType = animationType;
      this.characterManager.setCharacterFacing(this.player, newDirection, animationType);
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
    if (this.debugSystem) {
      this.debugSystem.destroy();
    }
    // Note: Phaser Scene cleanup is handled automatically
  }
}

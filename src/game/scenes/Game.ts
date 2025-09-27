import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { CharacterManager } from '../managers/CharacterManager';
import { TilePropertyHelper } from '../utils/TilePropertyHelper';

/**
 * Main game scene showing the English Learning Town
 */
export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private playerController: BasePlayerController;
  private characterManager: CharacterManager;
  private tilePropertyHelper: TilePropertyHelper;
  private player: Phaser.GameObjects.Sprite | null = null;
  private lastFacingDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  private currentAnimationType: 'walk' | 'idle' = 'idle';
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private playerTileIndicator: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super('Game');
  }

  create(_data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    this.createSceneTitle();
    this.createTiledMap();
    this.createPlayer();

    // Test coordinate system alignment
    this.testCoordinateSystem();

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

    const allTilesets = [springTileset, dirtTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (allTilesets.length > 0) {
      // Create layers in proper order (only the layers that exist in the tilemap)
      const dustLayer = this.map.createLayer('Dust', allTilesets, 0, 0);
      const groundLayer = this.map.createLayer('Ground', allTilesets, 0, 0);

      // Scale and position the map
      const layers = [dustLayer, groundLayer].filter(Boolean);
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

    // Add debug grid overlay
    this.createDebugGrid();

    // Create player tile indicator
    this.playerTileIndicator = this.add.graphics();
  }

  /**
   * Creates a debug grid overlay to visualize tile boundaries
   */
  private createDebugGrid(): void {
    if (!this.map) return;

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xff0000, 0.5); // Red lines, 50% opacity

    // Use consistent map positioning and scaling calculations
    const mapWidthInPixels = this.map.width * this.map.tileWidth;
    const mapHeightInPixels = this.map.height * this.map.tileHeight;
    const scaleX = GameConfig.screenWidth / mapWidthInPixels;
    const scaleY = GameConfig.screenHeight / mapHeightInPixels;
    const scale = Math.min(scaleX, scaleY, 2);

    const scaledMapWidth = mapWidthInPixels * scale;
    const scaledMapHeight = mapHeightInPixels * scale;
    const mapOffsetX = (GameConfig.screenWidth - scaledMapWidth) / 2;
    const mapOffsetY = (GameConfig.screenHeight - scaledMapHeight) / 2;

    const scaledTileWidth = this.map.tileWidth * scale;
    const scaledTileHeight = this.map.tileHeight * scale;

    // Draw vertical lines
    for (let x = 0; x <= this.map.width; x++) {
      const worldX = mapOffsetX + x * scaledTileWidth;
      graphics.moveTo(worldX, mapOffsetY);
      graphics.lineTo(worldX, mapOffsetY + scaledMapHeight);
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.map.height; y++) {
      const worldY = mapOffsetY + y * scaledTileHeight;
      graphics.moveTo(mapOffsetX, worldY);
      graphics.lineTo(mapOffsetX + scaledMapWidth, worldY);
    }

    graphics.strokePath();

    // Add tile coordinate labels (every 4th tile to avoid clutter)
    const textStyle = {
      fontSize: '10px',
      color: '#ff0000',
      backgroundColor: '#ffffff',
      padding: { x: 2, y: 1 }
    };

    for (let x = 0; x < this.map.width; x += 4) {
      for (let y = 0; y < this.map.height; y += 4) {
        const worldX = mapOffsetX + (x + 0.5) * scaledTileWidth;
        const worldY = mapOffsetY + (y + 0.5) * scaledTileHeight;
        this.add.text(worldX, worldY, `${x},${y}`, textStyle).setOrigin(0.5);
      }
    }

    console.log(`🔲 Debug grid created:`);
    console.log(`  Map: ${this.map.width}x${this.map.height} tiles, ${mapWidthInPixels}x${mapHeightInPixels} pixels`);
    console.log(`  Map offset: (${mapOffsetX.toFixed(1)}, ${mapOffsetY.toFixed(1)})`);
    console.log(`  Map scale: ${scale.toFixed(2)}`);
    console.log(`  Scaled tile size: ${scaledTileWidth.toFixed(1)}x${scaledTileHeight.toFixed(1)}`);
    console.log(`  Scaled map size: ${scaledMapWidth.toFixed(1)}x${scaledMapHeight.toFixed(1)}`);
  }

  /**
   * Updates the visual indicator showing which tile the player is on
   */
  private updatePlayerTileIndicator(): void {
    if (!this.player || !this.playerTileIndicator || !this.map || !this.tilePropertyHelper) return;

    // Get player's tile coordinates using consistent coordinate conversion
    const { tileX, tileY } = this.tilePropertyHelper.worldToTileCoords(this.player.x, this.player.y);

    // Use the same scaling calculation as coordinate conversion
    const mapWidthInPixels = this.map.width * this.map.tileWidth;
    const mapHeightInPixels = this.map.height * this.map.tileHeight;
    const scaleX = GameConfig.screenWidth / mapWidthInPixels;
    const scaleY = GameConfig.screenHeight / mapHeightInPixels;
    const scale = Math.min(scaleX, scaleY, 2);

    const scaledMapWidth = mapWidthInPixels * scale;
    const scaledMapHeight = mapHeightInPixels * scale;
    const mapOffsetX = (GameConfig.screenWidth - scaledMapWidth) / 2;
    const mapOffsetY = (GameConfig.screenHeight - scaledMapHeight) / 2;

    const scaledTileWidth = this.map.tileWidth * scale;
    const scaledTileHeight = this.map.tileHeight * scale;

    // Clear previous indicator
    this.playerTileIndicator.clear();

    // Draw tile highlight at the correct position
    const tileWorldX = mapOffsetX + tileX * scaledTileWidth;
    const tileWorldY = mapOffsetY + tileY * scaledTileHeight;

    this.playerTileIndicator.lineStyle(2, 0x00ff00, 0.8); // Green outline
    this.playerTileIndicator.fillStyle(0x00ff00, 0.2); // Green fill with transparency
    this.playerTileIndicator.fillRect(tileWorldX, tileWorldY, scaledTileWidth, scaledTileHeight);
    this.playerTileIndicator.strokeRect(tileWorldX, tileWorldY, scaledTileWidth, scaledTileHeight);
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

    // Initialize tile indicator
    this.updatePlayerTileIndicator();
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

    // Calculate new position and check if it's walkable (only if moving)
    if (deltaX !== 0 || deltaY !== 0) {
      const newX = this.player.x + deltaX;
      const newY = this.player.y + deltaY;

      // Get tile coordinates for logging (using consistent method)
      const { tileX, tileY } = this.tilePropertyHelper.worldToTileCoords(newX, newY);
      const currentTileCoords = this.tilePropertyHelper.worldToTileCoords(this.player.x, this.player.y);

      // Check if the new position is walkable using tile properties
      const isWalkable = this.tilePropertyHelper && this.tilePropertyHelper.isWorldPositionWalkable(newX, newY);

      // Log movement judgment with axis verification
      console.log(`🏃 Movement: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)}) | ` +
        `Current: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}) [Tile: ${currentTileCoords.tileX}, ${currentTileCoords.tileY}] | ` +
        `Target: (${newX.toFixed(1)}, ${newY.toFixed(1)}) [Tile: ${tileX}, ${tileY}] | ` +
        `Walkable: ${isWalkable ? 'YES' : 'NO'}`);

      // Verify coordinate axes alignment
      if (deltaY > 0 && tileY <= currentTileCoords.tileY) {
        console.warn(`🚨 AXIS MISMATCH: Moving down (deltaY>0) but tile Y decreased or stayed same!`);
      }
      if (deltaY < 0 && tileY >= currentTileCoords.tileY) {
        console.warn(`🚨 AXIS MISMATCH: Moving up (deltaY<0) but tile Y increased or stayed same!`);
      }
      if (deltaX > 0 && tileX <= currentTileCoords.tileX) {
        console.warn(`🚨 AXIS MISMATCH: Moving right (deltaX>0) but tile X decreased or stayed same!`);
      }
      if (deltaX < 0 && tileX >= currentTileCoords.tileX) {
        console.warn(`🚨 AXIS MISMATCH: Moving left (deltaX<0) but tile X increased or stayed same!`);
      }

      if (isWalkable) {
        // Update player position only if the tile is walkable
        this.player.setPosition(newX, newY);
        console.log(`✓ Player moved to (${newX.toFixed(1)}, ${newY.toFixed(1)})`);

        // Update tile indicator
        this.updatePlayerTileIndicator();
      } else {
        // If not walkable, player stays in current position (collision)
        console.log(`✗ Movement blocked - tile not walkable`);
      }
    }

    // Always update animation (handles both moving and idle states)
    this.updatePlayerAnimation(deltaX, deltaY);
  }


  /**
   * Updates player animation based on movement direction
   * Only updates animation when direction or type actually changes to prevent unnecessary calls
   * @param deltaX Horizontal movement delta
   * @param deltaY Vertical movement delta
   */
  private updatePlayerAnimation(deltaX: number, deltaY: number): void {
    if (!this.player || !this.characterManager) return;

    const isMoving = deltaX !== 0 || deltaY !== 0;
    const animationType: 'walk' | 'idle' = isMoving ? 'walk' : 'idle';
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
   * Test coordinate system alignment between different components
   */
  private testCoordinateSystem(): void {
    if (!this.player || !this.tilePropertyHelper || !this.map) return;

    console.log('\n🧪 === COORDINATE SYSTEM TEST ===');

    // Test player starting position
    const playerX = this.player.x;
    const playerY = this.player.y;
    console.log(`Player position: (${playerX.toFixed(1)}, ${playerY.toFixed(1)})`);

    // Convert to tile coordinates
    const { tileX, tileY } = this.tilePropertyHelper.worldToTileCoords(playerX, playerY);
    console.log(`Player tile: [${tileX}, ${tileY}]`);

    // Convert back to world coordinates
    const { worldX, worldY } = this.tilePropertyHelper.tileToWorldCoords(tileX, tileY);
    console.log(`Tile back to world: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);

    // Test specific coordinate mappings
    console.log('\n📍 Testing key coordinate points:');
    this.testPoint(0, 0, 'Top-left corner');
    this.testPoint(15, 11, 'Map center');
    this.testPoint(31, 23, 'Bottom-right corner');

    console.log('\n🎯 Movement direction test:');
    console.log('Expected behavior:');
    console.log('  UP key    → velocityY=-1 → deltaY<0 → "up" animation');
    console.log('  DOWN key  → velocityY=+1 → deltaY>0 → "down" animation');
    console.log('  LEFT key  → velocityX=-1 → deltaX<0 → "left" animation');
    console.log('  RIGHT key → velocityX=+1 → deltaX>0 → "right" animation');

    console.log('=== COORDINATE SYSTEM TEST END ===\n');
  }

  /**
   * Test a specific coordinate point conversion
   */
  private testPoint(tileX: number, tileY: number, label: string): void {
    if (!this.tilePropertyHelper) return;

    const { worldX, worldY } = this.tilePropertyHelper.tileToWorldCoords(tileX, tileY);
    const { tileX: backX, tileY: backY } = this.tilePropertyHelper.worldToTileCoords(worldX, worldY);

    console.log(`  ${label}: Tile[${tileX},${tileY}] ↔ World(${worldX.toFixed(1)},${worldY.toFixed(1)}) ↔ Tile[${backX},${backY}]`);

    // Check for conversion accuracy
    if (Math.abs(tileX - backX) > 0.01 || Math.abs(tileY - backY) > 0.01) {
      console.warn(`    ⚠️ Conversion inaccuracy detected!`);
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

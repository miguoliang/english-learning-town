import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { TilePropertyHelper } from '../utils/TilePropertyHelper';

/**
 * Interface for debug visualization strategies
 */
interface DebugStrategy {
  /**
   * Initialize the debug strategy
   */
  initialize(): void;

  /**
   * Update the debug visualization
   */
  update(): void;

  /**
   * Clean up resources
   */
  destroy(): void;
}

/**
 * Debug grid visualization strategy
 */
class GridDebugStrategy implements DebugStrategy {
  private scene: Scene;
  private map: Phaser.Tilemaps.Tilemap;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Scene, map: Phaser.Tilemaps.Tilemap) {
    this.scene = scene;
    this.map = map;
  }

  initialize(): void {
    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(1, 0xff0000, 0.5); // Red lines, 50% opacity

    this.drawGrid();
    this.addCoordinateLabels();
  }

  private drawGrid(): void {
    if (!this.graphics) return;

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
      this.graphics.moveTo(worldX, mapOffsetY);
      this.graphics.lineTo(worldX, mapOffsetY + scaledMapHeight);
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.map.height; y++) {
      const worldY = mapOffsetY + y * scaledTileHeight;
      this.graphics.moveTo(mapOffsetX, worldY);
      this.graphics.lineTo(mapOffsetX + scaledMapWidth, worldY);
    }

    this.graphics.strokePath();
  }

  private addCoordinateLabels(): void {
    if (!this.graphics) return;

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

    // Add tile coordinate labels (every 4th tile to avoid clutter)
    const textStyle = {
      fontSize: '10px',
      color: '#ff0000',
      backgroundColor: '#ffffff',
      padding: { x: 2, y: 1 }
    };

    // Store text labels so we can destroy them later
    const labels: Phaser.GameObjects.Text[] = [];
    for (let x = 0; x < this.map.width; x += 4) {
      for (let y = 0; y < this.map.height; y += 4) {
        const worldX = mapOffsetX + (x + 0.5) * scaledTileWidth;
        const worldY = mapOffsetY + (y + 0.5) * scaledTileHeight;
        const label = this.scene.add.text(worldX, worldY, `${x},${y}`, textStyle).setOrigin(0.5);
        labels.push(label);
      }
    }
    
    // Store labels reference for cleanup
    this.labels = labels;
  }

  update(): void {
    // Grid is static, no updates needed
  }

  destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
    // Destroy coordinate labels
    this.labels.forEach(label => {
      if (label && label.active) {
        label.destroy();
      }
    });
    this.labels = [];
  }
}

/**
 * Player tile indicator debug strategy
 */
class TileIndicatorDebugStrategy implements DebugStrategy {
  private scene: Scene;
  private map: Phaser.Tilemaps.Tilemap;
  private player: Phaser.GameObjects.Sprite;
  private tilePropertyHelper: TilePropertyHelper;
  private indicator: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Scene,
    map: Phaser.Tilemaps.Tilemap,
    player: Phaser.GameObjects.Sprite,
    tilePropertyHelper: TilePropertyHelper
  ) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.tilePropertyHelper = tilePropertyHelper;
  }

  initialize(): void {
    this.indicator = this.scene.add.graphics();
  }

  update(): void {
    if (!this.indicator || !this.player || !this.player.active) return;

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
    this.indicator.clear();

    // Draw tile highlight at the correct position
    const tileWorldX = mapOffsetX + tileX * scaledTileWidth;
    const tileWorldY = mapOffsetY + tileY * scaledTileHeight;

    this.indicator.lineStyle(2, 0x00ff00, 0.8); // Green outline
    this.indicator.fillStyle(0x00ff00, 0.2); // Green fill with transparency
    this.indicator.fillRect(tileWorldX, tileWorldY, scaledTileWidth, scaledTileHeight);
    this.indicator.strokeRect(tileWorldX, tileWorldY, scaledTileWidth, scaledTileHeight);
  }

  destroy(): void {
    if (this.indicator) {
      this.indicator.destroy();
      this.indicator = null;
    }
  }
}

/**
 * Coordinate system testing debug strategy
 */
class CoordinateTestDebugStrategy implements DebugStrategy {
  private tilePropertyHelper: TilePropertyHelper;
  private map: Phaser.Tilemaps.Tilemap;
  private player: Phaser.GameObjects.Sprite;

  constructor(
    tilePropertyHelper: TilePropertyHelper,
    map: Phaser.Tilemaps.Tilemap,
    player: Phaser.GameObjects.Sprite
  ) {
    this.tilePropertyHelper = tilePropertyHelper;
    this.map = map;
    this.player = player;
  }

  initialize(): void {
    this.runCoordinateSystemTests();
  }

  private runCoordinateSystemTests(): void {
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

  private testPoint(tileX: number, tileY: number, label: string): void {
    const { worldX, worldY } = this.tilePropertyHelper.tileToWorldCoords(tileX, tileY);
    const { tileX: backX, tileY: backY } = this.tilePropertyHelper.worldToTileCoords(worldX, worldY);

    console.log(`  ${label}: Tile[${tileX},${tileY}] ↔ World(${worldX.toFixed(1)},${worldY.toFixed(1)}) ↔ Tile[${backX},${backY}]`);

    // Check for conversion accuracy
    if (Math.abs(tileX - backX) > 0.01 || Math.abs(tileY - backY) > 0.01) {
      console.warn(`    ⚠️ Conversion inaccuracy detected!`);
    }
  }

  update(): void {
    // Tests run once on initialization
  }

  destroy(): void {
    // No cleanup needed for coordinate tests
  }
}

/**
 * Debug system configuration
 */
export interface DebugConfig {
  /** Enable debug grid overlay */
  showGrid: boolean;
  /** Enable player tile indicator */
  showTileIndicator: boolean;
  /** Run coordinate system tests */
  testCoordinates: boolean;
  /** Enable movement debugging */
  debugMovement: boolean;
  /** Enable door interaction highlights */
  showDoorHighlights: boolean;
}

/**
 * Default debug configuration
 */
export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  showGrid: true,
  showTileIndicator: true,
  testCoordinates: true,
  debugMovement: false,
};

/**
 * Debug system facade that manages all debug functionality
 * Uses Strategy pattern for different debug visualizations
 */
export class DebugSystem {
  private scene: Scene;
  private config: DebugConfig;
  private strategies: DebugStrategy[] = [];
  private isInitialized = false;

  constructor(scene: Scene, config: DebugConfig = DEFAULT_DEBUG_CONFIG) {
    this.scene = scene;
    this.config = { ...config };
  }

  /**
   * Initialize the debug system with game components
   * @param map - The game map
   * @param player - The player sprite
   * @param tilePropertyHelper - Tile property helper instance
   */
  initialize(
    map: Phaser.Tilemaps.Tilemap,
    player: Phaser.GameObjects.Sprite,
    tilePropertyHelper: TilePropertyHelper
  ): void {
    // Clean up previous initialization if exists
    if (this.isInitialized) {
      this.destroy();
    }

    // Create debug strategies based on configuration
    if (this.config.showGrid) {
      const gridStrategy = new GridDebugStrategy(this.scene, map);
      this.strategies.push(gridStrategy);
    }

    if (this.config.showTileIndicator) {
      const tileStrategy = new TileIndicatorDebugStrategy(this.scene, map, player, tilePropertyHelper);
      this.strategies.push(tileStrategy);
    }

    if (this.config.testCoordinates) {
      const coordStrategy = new CoordinateTestDebugStrategy(tilePropertyHelper, map, player);
      this.strategies.push(coordStrategy);
    }

    // Initialize all strategies
    this.strategies.forEach(strategy => strategy.initialize());

    this.isInitialized = true;
  }

  /**
   * Update debug visualizations
   */
  update(): void {
    if (!this.isInitialized) return;

    this.strategies.forEach(strategy => strategy.update());
  }

  /**
   * Log movement debugging information
   * @param deltaX - Horizontal movement delta
   * @param deltaY - Vertical movement delta
   * @param currentCoords - Current tile coordinates
   * @param targetCoords - Target tile coordinates
   * @param isWalkable - Whether target position is walkable
   */
  logMovement(
    deltaX: number,
    deltaY: number,
    currentCoords: { tileX: number; tileY: number },
    targetCoords: { tileX: number; tileY: number },
    isWalkable: boolean
  ): void {
    if (!this.config.debugMovement) return;

    console.log(`🏃 Movement: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)}) | ` +
      `Current: [Tile: ${currentCoords.tileX}, ${currentCoords.tileY}] | ` +
      `Target: [Tile: ${targetCoords.tileX}, ${targetCoords.tileY}] | ` +
      `Walkable: ${isWalkable ? 'YES' : 'NO'}`);

    // Verify coordinate axes alignment
    if (deltaY > 0 && targetCoords.tileY <= currentCoords.tileY) {
      console.warn(`🚨 AXIS MISMATCH: Moving down (deltaY>0) but tile Y decreased or stayed same!`);
    }
    if (deltaY < 0 && targetCoords.tileY >= currentCoords.tileY) {
      console.warn(`🚨 AXIS MISMATCH: Moving up (deltaY<0) but tile Y increased or stayed same!`);
    }
    if (deltaX > 0 && targetCoords.tileX <= currentCoords.tileX) {
      console.warn(`🚨 AXIS MISMATCH: Moving right (deltaX>0) but tile X decreased or stayed same!`);
    }
    if (deltaX < 0 && targetCoords.tileX >= currentCoords.tileX) {
      console.warn(`🚨 AXIS MISMATCH: Moving left (deltaX<0) but tile X increased or stayed same!`);
    }
  }

  /**
   * Update debug configuration
   * @param newConfig - New debug configuration
   */
  updateConfig(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // If system is already initialized, we need to reinitialize with new config
    if (this.isInitialized) {
      this.destroy();
      this.isInitialized = false;
      // Note: caller needs to call initialize() again after config change
    }
  }

  /**
   * Clean up debug system resources
   */
  destroy(): void {
    this.strategies.forEach(strategy => strategy.destroy());
    this.strategies = [];
    this.isInitialized = false;
  }
}

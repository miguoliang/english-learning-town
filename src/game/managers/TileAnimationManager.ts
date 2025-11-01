import { Scene } from 'phaser';

/**
 * Animation data for a single tile
 */
interface TileAnimationData {
  tileX: number;
  tileY: number;
  layer: Phaser.Tilemaps.TilemapLayer;
  frames: Array<{ tileId: number; duration: number }>;
  currentFrameIndex: number;
  elapsedTime: number;
}

/**
 * Manages tile animations from Tiled tileset data
 */
export class TileAnimationManager {
  private scene: Scene;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private animatedTiles: TileAnimationData[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initializes tile animations for the specified map
   */
  initialize(map: Phaser.Tilemaps.Tilemap, mapKey: string, tilesetName: string, targetLayerName: string): void {
    this.map = map;

    // Get the target layer first
    const targetLayer = this.map.getLayer(targetLayerName)?.tilemapLayer;
    if (!targetLayer) {
      console.warn(`⚠️ TileAnimationManager: Layer "${targetLayerName}" not found`);
      return;
    }

    // Get the tilemap data from the tilemap cache
    const tilemapData = this.scene.cache.tilemap.get(mapKey);
    if (!tilemapData) {
      console.warn(`⚠️ TileAnimationManager: Tilemap data not found for key "${mapKey}"`);
      return;
    }

    // The actual map data is in the .data property
    const mapData = tilemapData.data;
    if (!mapData?.tilesets) {
      console.warn(`⚠️ TileAnimationManager: No tilesets found in map data`);
      return;
    }

    // Find the tileset that contains animation data
    const tileset = mapData.tilesets.find((t: any) => t.name === tilesetName);
    if (!tileset) {
      console.warn(`⚠️ TileAnimationManager: Tileset "${tilesetName}" not found`);
      return;
    }

    if (!tileset.tiles) {
      console.warn(`⚠️ TileAnimationManager: No tiles found in tileset "${tilesetName}"`);
      return;
    }

    let animatedTileCount = 0;

    // Process each tile with animation data
    tileset.tiles.forEach((tileData: any) => {
      if (tileData.animation && Array.isArray(tileData.animation) && tileData.animation.length > 0) {
        const globalTileId = tileData.id + tileset.firstgid;

        // Convert animation frames to our format
        // Tiled duration is in milliseconds, we'll use it directly for delta-based timing
        const animationFrames = tileData.animation.map((frame: any) => ({
          tileId: frame.tileid + tileset.firstgid,
          duration: frame.duration || 1000, // Default to 1 second if not specified
        }));

        // Apply animation to all instances of this tile
        const count = this.animateTilesWithId(globalTileId, animationFrames, targetLayerName);
        animatedTileCount += count;
      }
    });

    console.log(`✅ TileAnimationManager: Initialized ${animatedTileCount} animated tiles`);

    // If we have animated tiles, add update listener to scene
    if (this.animatedTiles.length > 0) {
      this.scene.events.on('update', this.updateAnimations, this);
    }
  }

  /**
   * Updates all tile animations based on elapsed time
   */
  updateAnimations(_time: number, delta: number): void {
    this.animatedTiles.forEach(animData => {
      animData.elapsedTime += delta;

      // Loop to advance multiple frames if enough time has elapsed
      // This handles cases where the game might have paused or had frame rate drops
      while (animData.elapsedTime >= animData.frames[animData.currentFrameIndex].duration) {
        // Subtract the current frame's duration from elapsed time
        animData.elapsedTime -= animData.frames[animData.currentFrameIndex].duration;

        // Move to next frame
        animData.currentFrameIndex = (animData.currentFrameIndex + 1) % animData.frames.length;

        // Update the tile
        const newFrame = animData.frames[animData.currentFrameIndex];
        const tile = animData.layer.getTileAt(animData.tileX, animData.tileY);

        if (tile) {
          // Use putTileAt to properly update the tile
          // Parameters: tileIndex, tileX, tileY
          animData.layer.putTileAt(newFrame.tileId, animData.tileX, animData.tileY);

          // Get the updated tile to verify it changed
          const updatedTile = animData.layer.getTileAt(animData.tileX, animData.tileY);
          if (updatedTile && updatedTile.index !== newFrame.tileId) {
            // If putTileAt didn't work, try direct assignment as fallback
            updatedTile.index = newFrame.tileId;
          }
        }
      }
    });
  }

  /**
   * Finds and animates all tiles with the specified ID in the target layer
   * @returns Number of tiles animated
   */
  private animateTilesWithId(
    tileId: number,
    frames: Array<{ tileId: number; duration: number }>,
    targetLayerName: string
  ): number {
    if (!this.map || frames.length === 0) return 0;

    // Get the target layer
    const targetLayer = this.map.getLayer(targetLayerName)?.tilemapLayer;
    if (!targetLayer) return 0;

    let count = 0;

    // Search for tiles with the specified ID in the target layer
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = targetLayer.getTileAt(x, y);

        if (tile && tile.index === tileId) {
          this.startTileAnimation(tile, frames, targetLayer);
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Starts the animation cycle for a specific tile
   */
  private startTileAnimation(
    tile: Phaser.Tilemaps.Tile,
    frames: Array<{ tileId: number; duration: number }>,
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Store animation data for update loop
    const animData: TileAnimationData = {
      tileX: tile.x,
      tileY: tile.y,
      layer: layer,
      frames: frames,
      currentFrameIndex: 0,
      elapsedTime: 0,
    };

    this.animatedTiles.push(animData);
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    this.scene.events.off('update', this.updateAnimations, this);
    this.animatedTiles = [];
  }
}


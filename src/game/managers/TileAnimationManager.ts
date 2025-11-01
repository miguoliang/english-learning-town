import { Scene } from 'phaser';

/**
 * Manages tile animations from Tiled tileset data
 */
export class TileAnimationManager {
  private scene: Scene;
  private map: Phaser.Tilemaps.Tilemap | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initializes tile animations for the specified map
   */
  initialize(map: Phaser.Tilemaps.Tilemap, tilesetName: string, targetLayerName: string): void {
    this.map = map;

    // Get the tilemap data from the tilemap cache
    const tilemapData = this.scene.cache.tilemap.get(map.key);
    if (!tilemapData) return;

    // The actual map data is in the .data property
    const mapData = tilemapData.data;
    if (!mapData?.tilesets) return;

    // Find the tileset that contains animation data
    const tileset = mapData.tilesets.find((t: any) => t.name === tilesetName);
    if (!tileset?.tiles) return;

    // Process each tile with animation data
    tileset.tiles.forEach((tileData: any) => {
      if (tileData.animation && Array.isArray(tileData.animation)) {
        const globalTileId = tileData.id + tileset.firstgid;

        // Convert animation frames to our format
        const animationFrames = tileData.animation.map((frame: any) => ({
          tileId: frame.tileid + tileset.firstgid,
          duration: frame.duration,
        }));

        // Apply animation to all instances of this tile
        this.animateTilesWithId(globalTileId, animationFrames, targetLayerName);
      }
    });
  }

  /**
   * Finds and animates all tiles with the specified ID in the target layer
   */
  private animateTilesWithId(
    tileId: number,
    frames: Array<{ tileId: number; duration: number }>,
    targetLayerName: string
  ): void {
    if (!this.map || frames.length === 0) return;

    // Get the target layer
    const targetLayer = this.map.getLayer(targetLayerName)?.tilemapLayer;
    if (!targetLayer) return;

    // Search for tiles with the specified ID in the target layer
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = targetLayer.getTileAt(x, y);

        if (tile && tile.index === tileId) {
          this.startTileAnimation(tile, frames);
        }
      }
    }
  }

  /**
   * Starts the animation cycle for a specific tile
   */
  private startTileAnimation(
    tile: Phaser.Tilemaps.Tile,
    frames: Array<{ tileId: number; duration: number }>
  ): void {
    let currentFrameIndex = 0;

    const animateFrame = () => {
      // Set the current frame
      const currentFrame = frames[currentFrameIndex];
      tile.index = currentFrame.tileId;

      // Move to next frame (loop back to 0 when reaching the end)
      currentFrameIndex = (currentFrameIndex + 1) % frames.length;

      // Schedule the next frame
      this.scene.time.delayedCall(currentFrame.duration, animateFrame);
    };

    // Start the animation
    animateFrame();
  }
}


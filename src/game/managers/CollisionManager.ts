import { Scene } from 'phaser';

/**
 * Manages collision body creation from tilemap collision shapes
 */
export class CollisionManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates Matter.js collision bodies for all collision shapes in the specified layers
   * @param map The tilemap
   * @param layers Layers to process for collision
   * @param mapKey The key used to load the tilemap from cache
   */
  createCollisionBodies(
    map: Phaser.Tilemaps.Tilemap,
    layers: Phaser.Tilemaps.TilemapLayer[],
    mapKey: string
  ): void {
    if (layers.length === 0) {
      console.warn('⚠️ No collision layers provided to CollisionManager');
      return;
    }

    let totalBodiesCreated = 0;

    // Get tilemap data from cache to access collision shapes
    const tilemapData = this.scene.cache.tilemap.get(mapKey);
    if (!tilemapData) {
      console.warn(`⚠️ Tilemap data not found in cache for key: ${mapKey}`);
      return;
    }
    const mapData = tilemapData.data;
    if (!mapData?.tilesets) {
      console.warn('⚠️ No tilesets found in map data');
      return;
    }

    // Build a map of tileset collision data: tilesetName -> { localId -> tileData }
    const tilesetCollisionData = new Map<string, Map<number, any>>();
    mapData.tilesets.forEach((tileset: any) => {
      const collisionMap = new Map<number, any>();
      if (tileset.tiles) {
        tileset.tiles.forEach((tileData: any) => {
          if (tileData.objectgroup && tileData.objectgroup.objects) {
            collisionMap.set(tileData.id, tileData);
          }
        });
      }
      tilesetCollisionData.set(tileset.name, collisionMap);
    });

    layers.forEach(layer => {
      if (!layer || !map) return;

      let bodiesCreated = 0;

      // Get layer position and scale (layers are already scaled and positioned by MapManager)
      const layerX = layer.x;
      const layerY = layer.y;
      const layerScaleX = layer.scaleX;
      const layerScaleY = layer.scaleY;

      // Iterate through all tiles in the layer
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tile = layer.getTileAt(x, y);

          if (tile && tile.index !== -1 && tile.tileset) {
            const tileset = tile.tileset;
            const localId = tile.index - tileset.firstgid;

            // Get collision data from cached map data
            const collisionMap = tilesetCollisionData.get(tileset.name);
            const tileData = collisionMap?.get(localId);

            // Check if this tile has collision shapes defined
            if (tileData && tileData.objectgroup && tileData.objectgroup.objects) {
              const objects = tileData.objectgroup.objects;

              // Create Matter.js bodies for each collision object
              objects.forEach((obj: any) => {
                const body = this.createCollisionBodyFromObject(
                  tile,
                  obj,
                  layer.name,
                  layerX,
                  layerY,
                  layerScaleX,
                  layerScaleY
                );
                if (body) {
                  bodiesCreated++;
                }
              });
            }
          }
        }
      }

      totalBodiesCreated += bodiesCreated;
    });
  }

  /**
   * Creates a single Matter.js collision body from a tile collision object
   */
  private createCollisionBodyFromObject(
    tile: Phaser.Tilemaps.Tile,
    obj: any,
    layerName: string,
    layerX: number,
    layerY: number,
    layerScaleX: number,
    layerScaleY: number
  ): MatterJS.BodyType | null {
    if (!obj.x || !obj.y || !obj.width || !obj.height) {
      return null;
    }

    // Handle tile flipping (Tiled uses flipped coordinates for collision shapes)
    const flippedHorizontally = tile.flipX;
    const flippedVertically = tile.flipY;

    // Calculate collision object position accounting for flips
    let objX = obj.x;
    let objY = obj.y;

    if (flippedHorizontally) {
      // Flip X coordinate: mirror around tile center
      objX = tile.width - obj.x - obj.width;
    }

    if (flippedVertically) {
      // Flip Y coordinate: mirror around tile center
      objY = tile.height - obj.y - obj.height;
    }

    // Calculate world position with scaling and offset
    // tile.pixelX and tile.pixelY are relative to the layer's origin (0,0)
    // We need to account for the layer's position and scale
    const tileWorldX = (tile.pixelX + objX + obj.width / 2) * layerScaleX + layerX;
    const tileWorldY = (tile.pixelY + objY + obj.height / 2) * layerScaleY + layerY;

    // Create a static rectangle body at the collision shape position
    const body = this.scene.matter.add.rectangle(
      tileWorldX,
      tileWorldY,
      obj.width * layerScaleX,
      obj.height * layerScaleY,
      {
        isStatic: true,
        friction: 0.1,
        restitution: 0, // No bouncing
        label: `tile_collision_${layerName}`,
      }
    );

    return body;
  }
}


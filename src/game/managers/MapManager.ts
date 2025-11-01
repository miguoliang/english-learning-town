import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { calculateMapTransform, MapTransform } from '../utils/PlayerUtils';

/**
 * Configuration for creating a tilemap
 */
export interface MapConfig {
  /** Map key from cache */
  mapKey: string;
  /** Tileset configurations - array of [tilesetName, imageKey] pairs */
  tilesets: Array<[string, string]>;
  /** Layer names to create */
  layerNames: string[];
  /** Depth configuration for layers */
  depthConfig?: Map<string, number | ((transform: MapTransform, depthOffset: number) => number)>;
  /** Which layers should be used for collision detection */
  collisionLayerNames?: string[];
  /** Depth offset for Y-based depth sorting */
  depthOffset?: number;
  /** Top offset in pixels (e.g., for title/HUD space) */
  topOffset?: number;
}

/**
 * Result of map creation
 */
export interface MapCreationResult {
  map: Phaser.Tilemaps.Tilemap;
  layers: Map<string, Phaser.Tilemaps.TilemapLayer>;
  collisionLayers: Phaser.Tilemaps.TilemapLayer[];
  transform: MapTransform;
}

/**
 * Manages tilemap creation, tileset loading, layer creation, and positioning
 */
export class MapManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates a tilemap with the specified configuration
   */
  createMap(config: MapConfig): MapCreationResult {
    const map = this.scene.make.tilemap({ key: config.mapKey });

    // Add tilesets
    const tilesets = config.tilesets
      .map(([tilesetName, imageKey]) => map.addTilesetImage(tilesetName, imageKey))
      .filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (tilesets.length === 0) {
      throw new Error(`No valid tilesets found for map: ${config.mapKey}`);
    }

    // Create layers
    const layers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
    for (const layerName of config.layerNames) {
      // Try to create layer with the exact name first
      let layer = map.createLayer(layerName, tilesets, 0, 0);
      
      // If not found and layer name contains '/', try finding it in the map's layer data
      if (!layer && layerName.includes('/')) {
        // Phaser might flatten nested groups, so search through all layers
        const allLayers = map.layers;
        const [groupName, actualLayerName] = layerName.split('/');
        
        // Try to find layer by searching through map data
        // First try the full path
        for (let i = 0; i < allLayers.length; i++) {
          const mapLayer = allLayers[i];
          if (mapLayer.name === layerName || mapLayer.name === actualLayerName) {
            layer = map.createLayer(mapLayer.name, tilesets, 0, 0);
            if (layer) break;
          }
        }
      }
      
      if (layer) {
        layers.set(layerName, layer);
      } else {
        console.warn(`⚠️ Failed to create layer: ${layerName}`);
      }
    }

    // Calculate map transform (with optional top offset for title/HUD space)
    const topOffset = config.topOffset ?? 0;
    const transform = calculateMapTransform(map, topOffset);

    // Set up depth sorting
    const depthOffset = config.depthOffset ?? 0;
    if (config.depthConfig) {
      for (const [layerName, depthValue] of config.depthConfig.entries()) {
        const layer = layers.get(layerName);
        if (layer) {
          const depth = typeof depthValue === 'function' 
            ? depthValue(transform, depthOffset)
            : depthValue;
          layer.setDepth(depth);
        }
      }
    }

    // Scale and position all layers
    layers.forEach(layer => {
      layer.setScale(transform.scale);
      layer.setPosition(transform.mapOffsetX, transform.mapOffsetY);
    });

    // Get collision layers
    const collisionLayerNames = config.collisionLayerNames ?? [];
    const collisionLayers = collisionLayerNames
      .map(name => {
        const layer = layers.get(name);
        if (!layer) {
          console.warn(`⚠️ Collision layer "${name}" not found in map`);
        }
        return layer;
      })
      .filter((layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null);


    return {
      map,
      layers,
      collisionLayers,
      transform,
    };
  }
}


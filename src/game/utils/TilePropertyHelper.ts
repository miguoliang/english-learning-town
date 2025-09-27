import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Interface for tile properties as defined in the TMJ file
 */
export interface TileProperties {
  /** Type of tile (e.g., "grass", "none") */
  type: string;
  /** Whether the tile can be walked on */
  walkable: boolean;
  /** Structure type (e.g., "corner", "edge", "fill", "junction", "diagonal") */
  structure?: string;
  /** Orientation (e.g., "top-left", "top", "center", "bottom-right") */
  orientation?: string;
  /** Variant (e.g., "basic", "variant1", "variant2") */
  variant?: string;
}

/**
 * Utility class for accessing tile properties from Tiled maps
 */
export class TilePropertyHelper {
  private map: Phaser.Tilemaps.Tilemap | null = null;

  constructor(_scene: Scene) {
    // Scene parameter kept for potential future use
  }

  /**
   * Gets consistent map scaling and positioning calculations
   * This ensures all coordinate conversions use the same values as Game.ts
   */
  private getMapTransform() {
    if (!this.map) {
      return null;
    }

    const mapWidthInPixels = this.map.width * this.map.tileWidth;
    const mapHeightInPixels = this.map.height * this.map.tileHeight;

    const screenWidth = GameConfig.screenWidth;
    const screenHeight = GameConfig.screenHeight;

    const scaleX = screenWidth / mapWidthInPixels;
    const scaleY = screenHeight / mapHeightInPixels;
    const scale = Math.min(scaleX, scaleY, 2);

    const scaledMapWidth = mapWidthInPixels * scale;
    const scaledMapHeight = mapHeightInPixels * scale;
    const mapOffsetX = (screenWidth - scaledMapWidth) / 2;
    const mapOffsetY = (screenHeight - scaledMapHeight) / 2;

    return {
      mapWidthInPixels,
      mapHeightInPixels,
      screenWidth,
      screenHeight,
      scale,
      scaledMapWidth,
      scaledMapHeight,
      mapOffsetX,
      mapOffsetY,
    };
  }

  /**
   * Sets the map reference for property lookups
   * @param map - The Phaser tilemap instance
   */
  setMap(map: Phaser.Tilemaps.Tilemap): void {
    this.map = map;
  }


  /**
   * Gets all tile properties at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @returns The tile properties or null if not found
   */
  getTileProperties(x: number, y: number, layerName: string = 'Ground'): TileProperties | null {
    if (!this.map) {
      return null;
    }

    // Check if coordinates are within bounds
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) {
      return null;
    }

    const layer = this.map.getLayer(layerName);
    if (!layer) {
      return null;
    }

    const tile = this.map.getTileAt(x, y, false, layerName);
    if (!tile) {
      return null;
    }

    // Try to get properties from the tile first (direct properties)
    if (tile.properties && Object.keys(tile.properties).length > 0) {
      return tile.properties as TileProperties;
    }

    // If no direct properties, try to get from tileset
    if (tile.tileset && tile.tileset.tileProperties) {
      // Calculate the local tile ID within the tileset
      const localTileId = tile.index - tile.tileset.firstgid;
      const tilesetProperties = (tile.tileset.tileProperties as any)[localTileId];

      if (tilesetProperties) {
        return tilesetProperties as TileProperties;
      }
    }

    return null;
  }

  /**
   * Gets a specific tile property value at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @param propertyName - Name of the property to retrieve
   * @returns The property value or null if not found
   */
  getTileProperty(
    x: number,
    y: number,
    layerName: string = 'Ground',
    propertyName: keyof TileProperties
  ): any {
    const properties = this.getTileProperties(x, y, layerName);
    return properties?.[propertyName] || null;
  }

  /**
   * Checks if a tile is walkable at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerNames - Name(s) of the layer(s) to check. Can be a single string or array of strings
   * @returns True if the tile is walkable in all specified layers, false otherwise
   */
  isTileWalkable(x: number, y: number, layerNames: string | string[] = 'Ground'): boolean {
    const layers = Array.isArray(layerNames) ? layerNames : [layerNames];

    return !layers.some(layerName => {
      const properties = this.getTileProperties(x, y, layerName);
      return properties && properties.walkable !== true;
    });
  }

  /**
   * Gets the tile type at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @returns The tile type string or null if not found
   */
  getTileType(x: number, y: number, layerName: string = 'Ground'): string | null {
    const properties = this.getTileProperties(x, y, layerName);
    return properties?.type || null;
  }

  /**
   * Gets the tile structure at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @returns The tile structure string or null if not found
   */
  getTileStructure(x: number, y: number, layerName: string = 'Ground'): string | null {
    const properties = this.getTileProperties(x, y, layerName);
    return properties?.structure || null;
  }

  /**
   * Gets the tile orientation at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @returns The tile orientation string or null if not found
   */
  getTileOrientation(x: number, y: number, layerName: string = 'Ground'): string | null {
    const properties = this.getTileProperties(x, y, layerName);
    return properties?.orientation || null;
  }

  /**
   * Gets the tile variant at the specified coordinates
   * @param x - X coordinate in tile units
   * @param y - Y coordinate in tile units
   * @param layerName - Name of the layer to check (default: 'Ground')
   * @returns The tile variant string or null if not found
   */
  getTileVariant(x: number, y: number, layerName: string = 'Ground'): string | null {
    const properties = this.getTileProperties(x, y, layerName);
    return properties?.variant || null;
  }

  /**
   * Converts world coordinates to tile coordinates
   * Uses consistent coordinate system: (0,0) at top-left, X right, Y down
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @returns Object with tileX and tileY coordinates
   */
  worldToTileCoords(worldX: number, worldY: number): { tileX: number; tileY: number } {
    const transform = this.getMapTransform();
    if (!transform) {
      return { tileX: 0, tileY: 0 };
    }

    const { scale, mapOffsetX, mapOffsetY } = transform;

    // Convert world coordinates to map local coordinates
    const mapLocalX = (worldX - mapOffsetX) / scale;
    const mapLocalY = (worldY - mapOffsetY) / scale;

    // Convert map local coordinates to tile coordinates
    const tileX = Math.floor(mapLocalX / this.map!.tileWidth);
    const tileY = Math.floor(mapLocalY / this.map!.tileHeight);

    // Clamp to valid bounds
    const clampedTileX = Math.max(0, Math.min(tileX, this.map!.width - 1));
    const clampedTileY = Math.max(0, Math.min(tileY, this.map!.height - 1));

    return { tileX: clampedTileX, tileY: clampedTileY };
  }


  /**
   * Converts tile coordinates to world coordinates
   * Uses consistent coordinate system: (0,0) at top-left, X right, Y down
   * Returns coordinates for sprite with bottom-center origin (0.5, 1)
   * @param tileX - Tile X coordinate
   * @param tileY - Tile Y coordinate
   * @returns Object with worldX and worldY coordinates
   */
  tileToWorldCoords(tileX: number, tileY: number): { worldX: number; worldY: number } {
    const transform = this.getMapTransform();
    if (!transform) {
      return { worldX: 0, worldY: 0 };
    }

    const { scale, mapOffsetX, mapOffsetY } = transform;

    // Convert tile coordinates to map local coordinates (center of tile)
    const mapLocalX = (tileX + 0.5) * this.map!.tileWidth;
    const mapLocalY = (tileY + 0.5) * this.map!.tileHeight;

    // Convert map local coordinates to world coordinates
    const worldX = mapLocalX * scale + mapOffsetX;
    const worldY = mapLocalY * scale + mapOffsetY;

    return { worldX, worldY };
  }

  /**
   * Checks if a world position is walkable by checking multiple layers
   * A position is walkable only if all layers allow it (no layer blocks it)
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @param layerNames - Optional array of layer names to check (default: ['Ground', 'Structure'])
   * @returns True if the position is walkable, false otherwise
   */
  isWorldPositionWalkable(worldX: number, worldY: number, layerNames: string[] = ['Ground', 'Structure']): boolean {
    const { tileX, tileY } = this.worldToTileCoords(worldX, worldY);
    return this.isTileWalkable(tileX, tileY, layerNames);
  }

  /**
   * Gets the map transform values for external use (e.g., by Game.ts)
   * This ensures consistent coordinate calculations across all components
   * @returns Map transform object or null if no map is set
   */
  getMapTransformValues() {
    return this.getMapTransform();
  }
}

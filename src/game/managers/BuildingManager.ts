import { Scene } from 'phaser';
import { IWorld } from 'bitecs';
import { EntityFactory, BuildingOptions } from '../ecs/EntityFactory';
import { BuildingType } from '../ecs/components/BuildingComponent';
import { BuildingSystem } from '../ecs/systems/BuildingSystem';
import { MapTransform } from '../utils/PlayerUtils';

/**
 * Configuration for building creation
 */
export interface BuildingCreationConfig {
  /** Map transform information */
  transform: MapTransform;
  /** Tile width in pixels */
  tileWidth: number;
  /** Tile height in pixels */
  tileHeight: number;
  /** Depth offset for Y-based depth sorting */
  depthOffset: number;
  /** Building configurations */
  buildings: Array<{
    name: string;
    centerTileX: number;
    centerTileY: number;
    width: number; // in tiles
    height: number; // in tiles
    buildingType: BuildingType;
    entranceTileX: number;
    entranceTileY: number;
    baseDepthRow: number; // Row number for depth calculation
  }>;
}

/**
 * Result of building creation
 */
export interface BuildingCreationResult {
  buildingEntities: Map<string, number>;
  doorToBuilding: Map<number, string>;
}

/**
 * Manages building and door entity creation
 */
export class BuildingManager {
  private scene: Scene;
  private ecsWorld: IWorld | null = null;
  private buildingSystem: BuildingSystem | null = null;

  constructor(scene: Scene, ecsWorld: IWorld, buildingSystem: BuildingSystem | null = null) {
    this.scene = scene;
    this.ecsWorld = ecsWorld;
    this.buildingSystem = buildingSystem;
  }

  /**
   * Creates building entities from configuration
   */
  createBuildings(config: BuildingCreationConfig): BuildingCreationResult {
    if (!this.ecsWorld) {
      throw new Error('ECS World not initialized');
    }

    const buildingEntities = new Map<string, number>();
    const doorToBuilding = new Map<number, string>();

    const { transform, tileWidth, tileHeight, depthOffset } = config;

    // Helper function to convert tile coords to world coords
    const tileToWorld = (tileX: number, tileY: number) => ({
      x: transform.mapOffsetX + (tileX * tileWidth + tileWidth / 2) * transform.scale,
      y: transform.mapOffsetY + (tileY * tileHeight + tileHeight / 2) * transform.scale,
    });

    // Create building entities
    for (const building of config.buildings) {
      const buildingConfig: BuildingOptions = {
        name: building.name,
        x: tileToWorld(building.centerTileX, building.centerTileY).x,
        y: tileToWorld(building.centerTileX, building.centerTileY).y,
        width: building.width * tileWidth * transform.scale,
        height: building.height * tileHeight * transform.scale,
        buildingType: building.buildingType,
        entranceX: tileToWorld(building.entranceTileX, building.entranceTileY).x,
        entranceY: tileToWorld(building.entranceTileX, building.entranceTileY).y,
        baseDepth: depthOffset + transform.mapOffsetY + (building.baseDepthRow * tileHeight * transform.scale),
      };

      const buildingEid = EntityFactory.createBuilding(this.ecsWorld, buildingConfig);
      buildingEntities.set(building.name, buildingEid);
    }

    // Log building system info for debugging
    if (this.buildingSystem) {
      this.buildingSystem.logBuildingsInfo(this.ecsWorld);
    }

    return {
      buildingEntities,
      doorToBuilding,
    };
  }

  /**
   * Creates door entities from Tiled object layer
   */
  createDoorsFromTiledLayer(
    map: Phaser.Tilemaps.Tilemap,
    buildingEntities: Map<string, number>,
    transform: MapTransform,
    tileWidth: number,
    tileHeight: number,
    buildingLayerMap: Map<string, string> // Map from building name to layer name
  ): Map<number, string> {
    if (!this.ecsWorld) {
      throw new Error('ECS World not initialized');
    }

    const doorToBuilding = new Map<number, string>();

    // Get the Interactables object layer
    const interactablesLayer = map.getObjectLayer('Interactables');
    if (!interactablesLayer) {
      console.warn('⚠️ No Interactables object layer found in tilemap');
      return doorToBuilding;
    }

    // Get building layers for door rendering
    const buildingLayers = new Map<string, Phaser.Tilemaps.TilemapLayer | undefined>();
    for (const [buildingName, layerName] of buildingLayerMap.entries()) {
      buildingLayers.set(buildingName, map.getLayer(layerName)?.tilemapLayer);
    }

    // Process each door object
    interactablesLayer.objects.forEach(obj => {
      if (obj.type === 'door' && obj.name) {
        const doorEid = this.createDoorFromTiledObject(
          obj,
          map,
          buildingEntities,
          buildingLayers,
          transform,
          tileWidth,
          tileHeight
        );

        if (doorEid !== null) {
          // Extract building name from door name (e.g., "home_door" -> "home")
          const buildingName = obj.name.replace('_door', '');
          doorToBuilding.set(doorEid, buildingName);
        }
      }
    });

    return doorToBuilding;
  }

  /**
   * Creates a door entity from a Tiled object
   */
  private createDoorFromTiledObject(
    obj: Phaser.Types.Tilemaps.TiledObject,
    map: Phaser.Tilemaps.Tilemap,
    buildingEntities: Map<string, number>,
    buildingLayers: Map<string, Phaser.Tilemaps.TilemapLayer | undefined>,
    transform: MapTransform,
    tileWidth: number,
    tileHeight: number
  ): number | null {
    if (!this.ecsWorld || !obj.x || !obj.y || !obj.width || !obj.height) {
      return null;
    }

    // Extract building name from door name (e.g., "home_door" -> "home")
    const buildingName = obj.name.replace('_door', '');
    const buildingEid = buildingEntities.get(buildingName) ?? 0;
    const layer = buildingLayers.get(buildingName);

    if (!layer) {
      console.warn(`⚠️ No building layer found for door: ${obj.name}`);
      return null;
    }

    // Convert Tiled object coordinates to world coordinates
    const worldX = transform.mapOffsetX + (obj.x + obj.width / 2) * transform.scale;
    const worldY = transform.mapOffsetY + (obj.y + obj.height / 2) * transform.scale;

    // Convert to tile coordinates for tilemap operations
    const tileX = Math.floor(obj.x / tileWidth);
    const tileY = Math.floor(obj.y / tileHeight);

    // Calculate door dimensions based on Tiled object size
    const tileWidthPixels = map.tileWidth;
    const tileHeightPixels = map.tileHeight;
    const doorTileWidth = Math.ceil(obj.width! / tileWidthPixels);
    const doorTileHeight = Math.ceil(obj.height! / tileHeightPixels);

    // Convert Tiled properties array to object for easier access
    const properties: Record<string, any> = {};
    if (obj.properties) {
      obj.properties.forEach((prop: any) => {
        properties[prop.name] = prop.value;
      });
    }

    const requiresKey = properties.requiresKey || false;
    const promptText = properties.promptText || `Press SPACE to enter ${buildingName}`;
    const interactionRange = properties.interactionRange || 32; // 2 tiles (16px each)

    // Parse tile arrays from properties or use defaults
    let closedTileIds: number[];
    let openTileIds: number[];

    if (properties.closedTileIds && properties.openTileIds) {
      // Custom tile arrays provided (support both arrays and comma-separated strings)
      if (typeof properties.closedTileIds === 'string') {
        closedTileIds = properties.closedTileIds.split(',').map((id: string) => parseInt(id.trim()));
      } else if (Array.isArray(properties.closedTileIds)) {
        closedTileIds = properties.closedTileIds;
      } else {
        closedTileIds = [properties.closedTileIds];
      }

      if (typeof properties.openTileIds === 'string') {
        openTileIds = properties.openTileIds.split(',').map((id: string) => parseInt(id.trim()));
      } else if (Array.isArray(properties.openTileIds)) {
        openTileIds = properties.openTileIds;
      } else {
        openTileIds = [properties.openTileIds];
      }
    } else {
      // Generate default tile arrays based on door size
      const baseClosed = properties.closedTileId || 221;
      const baseOpen = properties.openTileId || 222;

      closedTileIds = [];
      openTileIds = [];

      for (let y = 0; y < doorTileHeight; y++) {
        for (let x = 0; x < doorTileWidth; x++) {
          const offset = y * doorTileWidth + x;
          closedTileIds.push(baseClosed + offset);
          openTileIds.push(baseOpen + offset);
        }
      }
    }

    // Create door entity
    const doorEid = EntityFactory.createDoor(this.ecsWorld, {
      buildingEntityId: buildingEid,
      tileX,
      tileY,
      x: worldX,
      y: worldY,
      tileWidth: doorTileWidth,
      tileHeight: doorTileHeight,
      closedTileIds,
      openTileIds,
      layer,
      requiresKey,
      interactionRange,
      promptText,
    });

    return doorEid;
  }
}


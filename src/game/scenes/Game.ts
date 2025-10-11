import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { CharacterManager } from '../managers/CharacterManager';
import { TilePropertyHelper } from '../utils/TilePropertyHelper';
import { DebugSystem } from '../systems/DebugSystem';
import { getCurrentDebugConfig } from '../config/DebugConfig';
import { IWorld } from 'bitecs';
import { createECSWorld, resetECSWorld } from '../ecs/World';
import { EntityFactory, BuildingOptions } from '../ecs/EntityFactory';
import { depthSortingSystem } from '../ecs/systems/DepthSortingSystem';
import { DoorInteractionSystem } from '../ecs/systems/DoorInteractionSystem';
import { BuildingSystem } from '../ecs/systems/BuildingSystem';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { BuildingType } from '../ecs/components/BuildingComponent';
import { SpriteRegistry } from '../ecs/SpriteRegistry';

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
  private collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  /** Depth offset for Y-based depth sorting of player and buildings */
  private readonly DEPTH_OFFSET = 10000;

  /** ECS World for managing entities and components */
  private ecsWorld: IWorld | null = null;

  /** ECS entity ID for the player */
  private playerEntityId: number | null = null;

  /** ECS systems */
  private doorInteractionSystem: DoorInteractionSystem | null = null;
  private buildingSystem: BuildingSystem | null = null;

  /** Building entity IDs */
  private buildingEntities: Map<string, number> = new Map();

  /** Debug key for toggling door highlights */
  private doorDebugKey: Phaser.Input.Keyboard.Key | null = null;

  /** UI prompt for interactions */
  private interactionPrompt: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Game');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
  }

  create(_data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    // Initialize ECS World
    this.ecsWorld = createECSWorld();

    // Initialize ECS systems
    this.doorInteractionSystem = new DoorInteractionSystem(this);
    this.buildingSystem = new BuildingSystem(this);

    this.createSceneTitle();
    this.createTiledMap();
    this.createBuildings(); // Create building entities after map is ready
    this.createPlayer();

    // Enable door highlights for debugging (set to true to visualize)
    if (this.doorInteractionSystem) {
      this.doorInteractionSystem.setDebugHighlights(true);
    }

    // Set up keyboard shortcut to toggle door highlights (press 'D')
    if (this.input.keyboard) {
      this.doorDebugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    // Create interaction prompt UI
    this.interactionPrompt = this.add.text(GameConfig.UI.centerX, GameConfig.screenHeight - 100, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 },
      align: 'center',
    });
    this.interactionPrompt.setOrigin(0.5);
    this.interactionPrompt.setDepth(10000);
    this.interactionPrompt.setVisible(false);

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

    // Add tilesets - match the names from town.tmj
    const houseTileset = this.map.addTilesetImage('House', 'house');
    const dirtTileset = this.map.addTilesetImage('Dirt1', 'dirt1');
    const propsTileset = this.map.addTilesetImage('Props-All', 'props-all');

    const allTilesets = [houseTileset, dirtTileset, propsTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (allTilesets.length > 0) {
      // Create layers in proper order (use the actual layer names from town.tmj)
      const groundLayer = this.map.createLayer('Ground/Dirt', allTilesets, 0, 0);
      const homeHouseLayer = this.map.createLayer('Home/House', allTilesets, 0, 0);
      const homeDecoLayer = this.map.createLayer('Home/House Deco', allTilesets, 0, 0);
      const schoolHouseLayer = this.map.createLayer('School/House', allTilesets, 0, 0);
      const schoolDecoLayer = this.map.createLayer('School/House Deco', allTilesets, 0, 0);
      const shopHouseLayer = this.map.createLayer('Shop/House', allTilesets, 0, 0);
      const shopDecoLayer = this.map.createLayer('Shop/House Deco', allTilesets, 0, 0);
      const libraryHouseLayer = this.map.createLayer('Library/House', allTilesets, 0, 0);
      const libraryDecoLayer = this.map.createLayer('Library/House Deco', allTilesets, 0, 0);

      // Calculate scaling first so we can use it for depth calculations
      const scaleX = GameConfig.screenWidth / (this.map!.widthInPixels || 480);
      const scaleY = GameConfig.screenHeight / (this.map!.heightInPixels || 320);
      const scale = Math.min(scaleX, scaleY, 2);

      // Set up depth sorting for proper layering
      // Ground layer should be at the bottom
      groundLayer?.setDepth(0);

      // Building layers use a depth offset to work with player's Y-based depth
      // Set each building's depth based on the BOTTOM edge of the building
      // This is where the player would walk in front of the building
      const tileHeight = this.map.tileHeight; // 16 pixels
      const mapWidth = (this.map!.widthInPixels || 480) * scale;
      const mapOffsetX = (GameConfig.screenWidth - mapWidth) / 2;
      const mapOffsetY = (GameConfig.screenHeight - (this.map!.heightInPixels || 320) * scale) / 2;

      // Top buildings (Home at rows 2-5, Shop at rows 1-5) - bottom edge at row 5
      const topBuildingDepth = this.DEPTH_OFFSET + mapOffsetY + (5 * tileHeight * scale);
      homeHouseLayer?.setDepth(topBuildingDepth);
      homeDecoLayer?.setDepth(topBuildingDepth);
      shopHouseLayer?.setDepth(topBuildingDepth);
      shopDecoLayer?.setDepth(topBuildingDepth);

      // Bottom buildings (School at rows 15-19, Library deco at rows 18-19) - bottom edge at row 19
      const bottomBuildingDepth = this.DEPTH_OFFSET + mapOffsetY + (19 * tileHeight * scale);
      schoolHouseLayer?.setDepth(bottomBuildingDepth);
      schoolDecoLayer?.setDepth(bottomBuildingDepth);
      libraryHouseLayer?.setDepth(bottomBuildingDepth);
      libraryDecoLayer?.setDepth(bottomBuildingDepth);


      // Set up collision detection for building layers
      // Include both structure and decoration layers for collision
      const collisionLayers = [
        homeHouseLayer,
        homeDecoLayer,
        schoolHouseLayer,
        schoolDecoLayer,
        shopHouseLayer,
        shopDecoLayer,
        libraryHouseLayer,
        libraryDecoLayer
      ].filter(Boolean);

      // Store collision layers for later use
      this.collisionLayers = collisionLayers.filter((layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null);

      // Scale and position all layers
      const layers = [
        groundLayer,
        homeHouseLayer, homeDecoLayer,
        schoolHouseLayer, schoolDecoLayer,
        shopHouseLayer, shopDecoLayer,
        libraryHouseLayer, libraryDecoLayer
      ].filter(Boolean);
      layers.forEach(layer => {
        if (layer) {
          layer.setScale(scale);
          layer.setPosition(mapOffsetX, mapOffsetY);
        }
      });

      // Create Matter.js collision bodies AFTER scaling, with scaled coordinates
      collisionLayers.forEach(layer => {
        if (layer && this.map) {
          let bodiesCreated = 0;

          // Iterate through all tiles in the layer
          for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
              const tile = layer.getTileAt(x, y);

              if (tile && tile.index !== -1 && tile.tileset) {
                const tileset = tile.tileset;
                const localId = tile.index - tileset.firstgid;
                const tileData = (tileset.tileData as any)[localId];

                // Check if this tile has collision shapes defined
                if (tileData && tileData.objectgroup && tileData.objectgroup.objects) {
                  const objects = tileData.objectgroup.objects;

                  // Create Matter.js bodies for each collision object
                  objects.forEach((obj: any) => {
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
                    const tileWorldX = (tile.pixelX + objX + obj.width / 2) * scale + mapOffsetX;
                    const tileWorldY = (tile.pixelY + objY + obj.height / 2) * scale + mapOffsetY;

                    // Create a static rectangle body at the collision shape position
                    this.matter.add.rectangle(
                      tileWorldX,
                      tileWorldY,
                      obj.width * scale,
                      obj.height * scale,
                      {
                        isStatic: true,
                        friction: 0.1,
                        restitution: 0, // No bouncing
                        label: `tile_collision_${layer.name}`
                      }
                    );

                    bodiesCreated++;
                  });
                }
              }
            }
          }

          console.log(`✅ Created ${bodiesCreated} collision bodies for layer: ${layer.name}`);
        }
      });
    }

    // Initialize tile property helper
    this.tilePropertyHelper = new TilePropertyHelper(this);
    this.tilePropertyHelper.setMap(this.map);
  }

  /**
   * Creates building entities for all buildings in the town
   */
  private createBuildings(): void {
    if (!this.ecsWorld || !this.map) return;

    // Calculate map scaling and positioning (same as in createTiledMap)
    const mapWidthInPixels = this.map.width * this.map.tileWidth;
    const mapHeightInPixels = this.map.height * this.map.tileHeight;
    const scaleX = GameConfig.screenWidth / mapWidthInPixels;
    const scaleY = GameConfig.screenHeight / mapHeightInPixels;
    const scale = Math.min(scaleX, scaleY, 2);
    const scaledMapWidth = mapWidthInPixels * scale;
    const scaledMapHeight = mapHeightInPixels * scale;
    const mapOffsetX = (GameConfig.screenWidth - scaledMapWidth) / 2;
    const mapOffsetY = (GameConfig.screenHeight - scaledMapHeight) / 2;

    const tileWidth = this.map.tileWidth;
    const tileHeight = this.map.tileHeight;

    // Helper function to convert tile coords to world coords
    const tileToWorld = (tileX: number, tileY: number) => ({
      x: mapOffsetX + (tileX * tileWidth + tileWidth / 2) * scale,
      y: mapOffsetY + (tileY * tileHeight + tileHeight / 2) * scale,
    });

    // Define building configurations based on tilemap structure
    const buildingConfigs: BuildingOptions[] = [
      {
        name: 'home',
        x: tileToWorld(3, 3.5).x, // Center of home building (columns 1-5, rows 2-5)
        y: tileToWorld(3, 3.5).y,
        width: 5 * tileWidth * scale,
        height: 4 * tileHeight * scale,
        buildingType: BuildingType.RESIDENTIAL,
        entranceX: tileToWorld(3, 5).x,
        entranceY: tileToWorld(3, 5).y,
        baseDepth: this.DEPTH_OFFSET + mapOffsetY + (5 * tileHeight * scale),
      },
      {
        name: 'shop',
        x: tileToWorld(26, 3).x, // Center of shop building (columns 24-29, rows 1-5)
        y: tileToWorld(26, 3).y,
        width: 6 * tileWidth * scale,
        height: 5 * tileHeight * scale,
        buildingType: BuildingType.COMMERCIAL,
        entranceX: tileToWorld(26, 5).x,
        entranceY: tileToWorld(26, 5).y,
        baseDepth: this.DEPTH_OFFSET + mapOffsetY + (5 * tileHeight * scale),
      },
      {
        name: 'school',
        x: tileToWorld(3, 17).x, // Center of school building (columns 1-5, rows 15-19)
        y: tileToWorld(3, 17).y,
        width: 5 * tileWidth * scale,
        height: 5 * tileHeight * scale,
        buildingType: BuildingType.EDUCATIONAL,
        entranceX: tileToWorld(3, 19).x,
        entranceY: tileToWorld(3, 19).y,
        baseDepth: this.DEPTH_OFFSET + mapOffsetY + (19 * tileHeight * scale),
      },
      {
        name: 'library',
        x: tileToWorld(26, 17).x, // Center of library building (columns 24-29, rows 15-19)
        y: tileToWorld(26, 17).y,
        width: 6 * tileWidth * scale,
        height: 5 * tileHeight * scale,
        buildingType: BuildingType.PUBLIC,
        entranceX: tileToWorld(26, 19).x,
        entranceY: tileToWorld(26, 19).y,
        baseDepth: this.DEPTH_OFFSET + mapOffsetY + (19 * tileHeight * scale),
      },
    ];

    // Create building entities
    for (const config of buildingConfigs) {
      const buildingEid = EntityFactory.createBuilding(this.ecsWorld, config);
      this.buildingEntities.set(config.name, buildingEid);
    }

    // Create door entities for each building
    this.createDoors(scale, mapOffsetX, mapOffsetY, tileWidth, tileHeight);

    // Log building system info for debugging
    if (this.buildingSystem) {
      this.buildingSystem.logBuildingsInfo(this.ecsWorld);
    }
  }

  /**
   * Creates door entities from Tiled object layer
   */
  private createDoors(
    scale: number,
    mapOffsetX: number,
    mapOffsetY: number,
    tileWidth: number,
    tileHeight: number
  ): void {
    if (!this.ecsWorld || !this.map) return;

    // Get the Interactables object layer
    const interactablesLayer = this.map.getObjectLayer('Interactables');
    if (!interactablesLayer) {
      console.warn('⚠️ No Interactables object layer found in tilemap');
      return;
    }

    // Get building DECO layers for door rendering (doors are typically on decoration layers)
    const buildingLayers = new Map([
      ['home', this.map.getLayer('Home/House Deco')?.tilemapLayer],
      ['shop', this.map.getLayer('Shop/House Deco')?.tilemapLayer],
      ['school', this.map.getLayer('School/House Deco')?.tilemapLayer],
      ['library', this.map.getLayer('Library/House Deco')?.tilemapLayer],
    ]);

    console.log(`🚪 Loading doors from Interactables layer (${interactablesLayer.objects.length} objects)`);

    // Process each door object
    interactablesLayer.objects.forEach(obj => {
      if (obj.type === 'door' && obj.name) {
        this.createDoorFromTiledObject(obj, scale, mapOffsetX, mapOffsetY, tileWidth, tileHeight, buildingLayers);
      }
    });
  }

  /**
   * Creates a door entity from a Tiled object
   */
  private createDoorFromTiledObject(
    obj: Phaser.Types.Tilemaps.TiledObject,
    scale: number,
    mapOffsetX: number,
    mapOffsetY: number,
    tileWidth: number,
    tileHeight: number,
    buildingLayers: Map<string, Phaser.Tilemaps.TilemapLayer | undefined>
  ): void {
    if (!this.ecsWorld || !obj.x || !obj.y || !obj.width || !obj.height) return;

    // Extract building name from door name (e.g., "home_door" -> "home")
    const buildingName = obj.name.replace('_door', '');
    const buildingEid = this.buildingEntities.get(buildingName) ?? 0;
    const layer = buildingLayers.get(buildingName);

    if (!layer) {
      console.warn(`⚠️ No building layer found for door: ${obj.name}`);
      return;
    }

    // Convert Tiled object coordinates to world coordinates
    const worldX = mapOffsetX + (obj.x + obj.width / 2) * scale;
    const worldY = mapOffsetY + (obj.y + obj.height / 2) * scale;

    // Convert to tile coordinates for tilemap operations
    const tileX = Math.floor(obj.x / tileWidth);
    const tileY = Math.floor(obj.y / tileHeight);

    // Calculate door dimensions based on Tiled object size
    const tileWidth_pixels = this.map!.tileWidth;
    const tileHeight_pixels = this.map!.tileHeight;
    const doorTileWidth = Math.ceil(obj.width! / tileWidth_pixels);
    const doorTileHeight = Math.ceil(obj.height! / tileHeight_pixels);

    // Convert Tiled properties array to object for easier access
    const properties: Record<string, any> = {};
    if (obj.properties) {
      obj.properties.forEach((prop: any) => {
        properties[prop.name] = prop.value;
      });
    }

    const requiresKey = properties.requiresKey || false;
    const promptText = properties.promptText || `Press SPACE to enter ${buildingName}`;
    const interactionRange = properties.interactionRange || 80;

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
      // For 2x1 doors: [leftTile, rightTile]
      // For 1x1 doors: [singleTile]
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

    console.log(`🚪 Created door: ${obj.name} at (${tileX}, ${tileY}) (eid: ${doorEid})`);
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

      // Set initial depth based on Y position for proper layering with buildings
      // Use same depth offset as building layers for consistent sorting
      // Player depth will be updated each frame in the update loop
      this.player.setDepth(this.DEPTH_OFFSET + this.player.y);

      // Create ECS entity for player
      if (this.ecsWorld && this.player) {
        this.playerEntityId = EntityFactory.createPlayer(this.ecsWorld, {
          sprite: this.player,
          x: this.player.x,
          y: this.player.y,
          baseDepth: this.DEPTH_OFFSET
        });
      }

      // Add physics body to player for collision detection
      if (this.player) {
        // Scale collision box to match sprite scale
        const scaledCollisionWidth = GameConfig.PLAYER.COLLISION_WIDTH * scale;
        const scaledCollisionHeight = GameConfig.PLAYER.COLLISION_HEIGHT * scale;

        this.matter.add.gameObject(this.player, {
          shape: {
            type: 'rectangle',
            width: scaledCollisionWidth,
            height: scaledCollisionHeight
          },
          frictionAir: 0.5, // High air resistance for immediate stopping
          friction: 0.1,
          frictionStatic: 0,
          restitution: 0, // No bouncing off walls
          inertia: Infinity // Prevent rotation when colliding with corners
        });

        console.log(`🎮 Player physics body created at (${this.player.x}, ${this.player.y}) with collision box ${scaledCollisionWidth.toFixed(1)}x${scaledCollisionHeight.toFixed(1)} (scale: ${scale.toFixed(2)})`);

        // Collision layers were already converted in createTiledMap()
        console.log(`🎮 Using ${this.collisionLayers.length} collision layers for player physics`);
      }
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

      // Add physics body to player for collision detection (fallback)
      if (this.player) {
        // Scale collision box to match sprite scale (fallback uses scale = 2)
        const fallbackScale = 2;
        const scaledCollisionWidth = GameConfig.PLAYER.COLLISION_WIDTH * fallbackScale;
        const scaledCollisionHeight = GameConfig.PLAYER.COLLISION_HEIGHT * fallbackScale;

        this.matter.add.gameObject(this.player, {
          shape: {
            type: 'rectangle',
            width: scaledCollisionWidth,
            height: scaledCollisionHeight
          },
          frictionAir: 0.5, // High air resistance for immediate stopping
          friction: 0.1,
          frictionStatic: 0,
          restitution: 0, // No bouncing off walls
          inertia: Infinity // Prevent rotation when colliding with corners
        });

        // Collision layers were already converted in createTiledMap() (fallback path)
        console.log(`🎮 Using ${this.collisionLayers.length} collision layers for player physics (fallback)`);

        // Create ECS entity for player (fallback)
        if (this.ecsWorld && this.player) {
          this.playerEntityId = EntityFactory.createPlayer(this.ecsWorld, {
            sprite: this.player,
            x: this.player.x,
            y: this.player.y,
            baseDepth: this.DEPTH_OFFSET
          });
        }
      }
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
    this.updateECS();
    this.updateDoorInteractions();
    this.debugSystem.update();

    // Toggle door highlights with 'D' key
    if (this.doorInteractionSystem && this.doorDebugKey && Phaser.Input.Keyboard.JustDown(this.doorDebugKey)) {
      const currentState = (this.doorInteractionSystem as any).showDebugHighlights;
      this.doorInteractionSystem.setDebugHighlights(!currentState);
      console.log(`🚪 Door highlights ${!currentState ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Handles door interactions with the player
   */
  private updateDoorInteractions(): void {
    if (!this.doorInteractionSystem || !this.ecsWorld || !this.player || !this.playerController || !this.interactionPrompt) return;

    // Find nearest door to player
    const nearestDoor = this.doorInteractionSystem.findNearestDoor(
      this.ecsWorld,
      this.player.x,
      this.player.y
    );

    // Update interaction prompt
    if (nearestDoor !== null) {
      const isOpen = this.doorInteractionSystem.isDoorOpen(nearestDoor);
      const action = isOpen ? 'close' : 'open';
      this.interactionPrompt.setText(`Press SPACE to ${action} door`);
      this.interactionPrompt.setVisible(true);

      // Check if SPACE key was pressed
      if (this.playerController['keyboardHandler'].isSpaceJustPressed()) {
        this.doorInteractionSystem.toggleDoor(this.ecsWorld, nearestDoor);
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Updates the ECS world and runs all systems
   */
  private updateECS(): void {
    if (!this.ecsWorld || !this.player || this.playerEntityId === null) return;

    // Update player position in ECS
    PositionComponent.x[this.playerEntityId] = this.player.x;
    PositionComponent.y[this.playerEntityId] = this.player.y;

    // Run ECS systems
    depthSortingSystem(this.ecsWorld);

    // Update door interaction system
    if (this.doorInteractionSystem) {
      this.doorInteractionSystem.update(this.ecsWorld, this.player.x, this.player.y);
    }
  }


  /**
   * Handles player movement with keyboard controls using Matter.js physics
   * @param _delta - Time elapsed since last frame (unused for velocity-based movement)
   */
  private updatePlayerMovement(_delta: number): void {
    if (!this.player || !this.playerController) return;

    // Get player Matter.js physics body
    const playerBody = this.player.body as MatterJS.BodyType;
    if (!playerBody) return;

    // Get normalized movement input (-1, 0, or 1 for each axis)
    const { velocityX: dirX, velocityY: dirY } = this.playerController['keyboardHandler'].getMovementInput();
    const isRunning = this.playerController['keyboardHandler'].isShiftPressed() && (dirX !== 0 || dirY !== 0);

    // Calculate movement speed based on running state
    // Matter.js velocity is in pixels per frame (assuming 60 FPS), so divide by 60
    const baseSpeed = GameConfig.PLAYER.SPEED / 60;
    const speed = baseSpeed * (isRunning ? GameConfig.PLAYER.RUN_SPEED_MULTIPLIER : 1);

    // Calculate velocity for Matter.js (pixels per frame)
    // Normalize diagonal movement to prevent faster diagonal speed
    let velocityX = dirX * speed;
    let velocityY = dirY * speed;

    // When moving diagonally, normalize the velocity vector to maintain consistent speed
    if (dirX !== 0 && dirY !== 0) {
      const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
      velocityX = (dirX / magnitude) * speed;
      velocityY = (dirY / magnitude) * speed;
    }

    // Set player velocity for physics-based movement using Matter.js
    this.matter.setVelocity(playerBody, velocityX, velocityY);

    // Player depth is now handled by ECS DepthSortingSystem

    // Always update animation (handles both moving and idle states)
    this.updatePlayerAnimation(dirX, dirY, isRunning);
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
    // Clean up ECS systems
    if (this.doorInteractionSystem && this.ecsWorld) {
      this.doorInteractionSystem.cleanup(this.ecsWorld);
    }
    // Clean up ECS resources
    SpriteRegistry.clear();
    resetECSWorld();
    this.ecsWorld = null;
    this.playerEntityId = null;
    this.doorInteractionSystem = null;
    this.buildingSystem = null;
    this.buildingEntities.clear();
    // Note: Phaser Scene cleanup is handled automatically
  }
}

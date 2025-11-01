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
import { DoorInteractionSystem } from '../ecs/systems/DoorInteractionSystem';
import { BuildingSystem } from '../ecs/systems/BuildingSystem';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { BuildingType, BuildingComponent } from '../ecs/components/BuildingComponent';
import { DoorComponent } from '../ecs/components/DoorComponent';
import { SpriteRegistry } from '../ecs/SpriteRegistry';
import {
  calculateMapTransform,
  createPlayer,
  createPlayerState,
  updatePlayerMovement,
  updatePlayerAnimation,
  updateECS,
  type PlayerState,
} from '../utils/PlayerUtils';

/**
 * Main game scene showing the English Learning Town
 */
export class Town extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private playerController: BasePlayerController;
  private characterManager: CharacterManager;
  private tilePropertyHelper: TilePropertyHelper;
  private debugSystem: DebugSystem;
  private player: Phaser.GameObjects.Sprite | null = null;
  private playerState: PlayerState;
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

  /** Door entity IDs mapped to building names */
  private doorToBuilding: Map<number, string> = new Map();

  /** Debug key for toggling door highlights */
  private doorDebugKey: Phaser.Input.Keyboard.Key | null = null;

  /** UI prompt for interactions */
  private interactionPrompt: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Town');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
    this.playerState = createPlayerState();
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
    this.createPlayer(_data?.exitBuilding);

    // Enable door highlights based on debug configuration
    if (this.doorInteractionSystem) {
      const debugConfig = getCurrentDebugConfig();
      this.doorInteractionSystem.setDebugHighlights(debugConfig.showDoorHighlights);
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
      const groundDecoLayer = this.map.createLayer('Ground/Dirt Deco', allTilesets, 0, 0);
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
      groundDecoLayer?.setDepth(1); // Slightly above ground layer

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
        groundLayer, groundDecoLayer,
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

    // Initialize custom tile animations
    this.initializeTileAnimations();
  }

  /**
   * Initializes custom tile animations for animated tiles in the tilemap
   */
  private initializeTileAnimations(): void {
    if (!this.map) return;

    // Get the tilemap data from the tilemap cache
    const tilemapData = this.cache.tilemap.get('town_map');
    if (!tilemapData) return;

    // The actual map data is in the .data property
    const mapData = tilemapData.data;
    if (!mapData?.tilesets) return;

    // Find the Props-All tileset that contains animation data
    const propsTileset = mapData.tilesets.find((tileset: any) => tileset.name === 'Props-All');
    if (!propsTileset?.tiles) return;

    // Process each tile with animation data
    propsTileset.tiles.forEach((tileData: any) => {
      if (tileData.animation && Array.isArray(tileData.animation)) {
        const globalTileId = tileData.id + propsTileset.firstgid;

        // Convert animation frames to our format
        const animationFrames = tileData.animation.map((frame: any) => ({
          tileId: frame.tileid + propsTileset.firstgid,
          duration: frame.duration
        }));

        // Apply animation to all instances of this tile
        this.animateTilesWithId(globalTileId, animationFrames);
      }
    });
  }

  /**
   * Finds and animates all tiles with the specified ID across all layers
   */
  private animateTilesWithId(tileId: number, frames: Array<{ tileId: number, duration: number }>): void {
    if (!this.map || frames.length === 0) return;

    // Get the Dirt Deco layer specifically
    const dirtDecoLayer = this.map.getLayer('Ground/Dirt Deco')?.tilemapLayer;
    if (!dirtDecoLayer) return;

    // Search for tiles with the specified ID in the Dirt Deco layer
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = dirtDecoLayer.getTileAt(x, y);

        if (tile && tile.index === tileId) {
          this.startTileAnimation(tile, frames);
        }
      }
    }
  }

  /**
   * Starts the animation cycle for a specific tile
   */
  private startTileAnimation(tile: Phaser.Tilemaps.Tile, frames: Array<{ tileId: number, duration: number }>): void {
    let currentFrameIndex = 0;

    const animateFrame = () => {
      // Set the current frame
      const currentFrame = frames[currentFrameIndex];
      tile.index = currentFrame.tileId;

      // Move to next frame (loop back to 0 when reaching the end)
      currentFrameIndex = (currentFrameIndex + 1) % frames.length;

      // Schedule the next frame
      this.time.delayedCall(currentFrame.duration, animateFrame);
    };

    // Start the animation
    animateFrame();
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
    const interactionRange = properties.interactionRange || 40; // Unified range: ~2.5 tiles

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

    // Store door-to-building mapping for scene transitions
    this.doorToBuilding.set(doorEid, buildingName);

    console.log(`🚪 Created door: ${obj.name} at (${tileX}, ${tileY}) (eid: ${doorEid})`);
  }

  /**
   * Creates the player character at the center of the town map or at exit position
   */
  private createPlayer(exitBuilding?: string): void {
    // Initialize controllers
    this.playerController = new BasePlayerController(this);
    this.characterManager = new CharacterManager(this);

    // Calculate the center of the map in world coordinates
    const map = this.cache.tilemap.get('town_map');
    let worldCenterX: number, worldCenterY: number;
    let scale: number;

    if (map && this.map) {
      // Calculate consistent scaling and positioning
      const transform = calculateMapTransform(this.map);
      scale = transform.scale;

      // Check if player is exiting from a building
      if (exitBuilding === 'home' && this.buildingEntities.has('home')) {
        // Position player at home door exit (just outside the door)
        const homeBuildingEid = this.buildingEntities.get('home')!;
        const homeEntranceX = BuildingComponent.entranceX[homeBuildingEid];
        const homeEntranceY = BuildingComponent.entranceY[homeBuildingEid];

        // Position player slightly outside the door (below the entrance)
        worldCenterX = homeEntranceX;
        worldCenterY = homeEntranceY + 40; // Move player slightly forward from door

        console.log(`🚪 Player exiting from home, positioning at door exit (${worldCenterX.toFixed(1)}, ${worldCenterY.toFixed(1)})`);

        // Ensure home door is open when returning
        const homeDoorEid = BuildingComponent.doorEntityId[homeBuildingEid];
        if (homeDoorEid && this.doorInteractionSystem && this.ecsWorld) {
          if (!this.doorInteractionSystem.isDoorOpen(homeDoorEid)) {
            this.doorInteractionSystem.openDoor(homeDoorEid);
          }
        }
      } else {
        // Default to map center
        const mapCenterX = transform.mapWidthInPixels / 2;
        const mapCenterY = transform.mapHeightInPixels / 2;
        worldCenterX = transform.mapOffsetX + mapCenterX * scale;
        worldCenterY = transform.mapOffsetY + mapCenterY * scale;

        console.log(`🎮 Player spawn: Map center (${mapCenterX}, ${mapCenterY}) → World (${worldCenterX.toFixed(1)}, ${worldCenterY.toFixed(1)})`);
        console.log(`   Scale: ${scale.toFixed(2)}, Offset: (${transform.mapOffsetX.toFixed(1)}, ${transform.mapOffsetY.toFixed(1)})`);
      }

      // Create player using utility function
      if (this.ecsWorld) {
        const result = createPlayer({
          scene: this,
          world: this.ecsWorld,
          characterManager: this.characterManager,
          playerController: this.playerController,
          spawnX: worldCenterX,
          spawnY: worldCenterY,
          scale,
          depthOffset: this.DEPTH_OFFSET,
        });

        this.player = result.player;
        this.playerEntityId = result.playerEntityId;

        console.log(`🎮 Player physics body created at (${this.player.x}, ${this.player.y}) with collision box ${GameConfig.PLAYER.COLLISION_WIDTH * scale}x${GameConfig.PLAYER.COLLISION_HEIGHT * scale} (scale: ${scale.toFixed(2)})`);
        console.log(`🎮 Using ${this.collisionLayers.length} collision layers for player physics`);
      }
    } else {
      // Fallback to screen center if map data is unavailable
      console.warn('Map data not available, using screen center for player position');
      worldCenterX = GameConfig.UI.centerX;
      worldCenterY = GameConfig.UI.centerY;
      scale = 2;

      if (this.ecsWorld) {
        const result = createPlayer({
          scene: this,
          world: this.ecsWorld,
          characterManager: this.characterManager,
          playerController: this.playerController,
          spawnX: worldCenterX,
          spawnY: worldCenterY,
          scale,
          depthOffset: this.DEPTH_OFFSET,
        });

        this.player = result.player;
        this.playerEntityId = result.playerEntityId;

        console.log(`🎮 Using ${this.collisionLayers.length} collision layers for player physics (fallback)`);
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

    // Only update debug system if player exists
    if (this.player) {
      this.debugSystem.update();
    }

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
      const buildingName = this.doorToBuilding.get(nearestDoor);

      // Check if player is walking through an open door
      if (isOpen && this.isPlayerWalkingThroughDoor(nearestDoor)) {
        this.handleDoorTransition(nearestDoor, buildingName);
        return;
      }

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
   * Checks if player is walking through an open door
   */
  private isPlayerWalkingThroughDoor(doorEntityId: number): boolean {
    if (!this.ecsWorld || !this.player) return false;

    // Get door position and dimensions
    const doorX = PositionComponent.x[doorEntityId];
    const doorY = PositionComponent.y[doorEntityId];
    const doorWidth = DoorComponent.tileWidth[doorEntityId] * (this.map?.tileWidth || 16);
    const doorHeight = DoorComponent.tileHeight[doorEntityId] * (this.map?.tileHeight || 16);

    // Calculate map scale to determine door size in world coordinates
    const mapWidthInPixels = this.map!.width * this.map!.tileWidth;
    const mapHeightInPixels = this.map!.height * this.map!.tileHeight;
    const scaleX = GameConfig.screenWidth / mapWidthInPixels;
    const scaleY = GameConfig.screenHeight / mapHeightInPixels;
    const scale = Math.min(scaleX, scaleY, 2);
    const scaledDoorWidth = doorWidth * scale;
    const scaledDoorHeight = doorHeight * scale;

    // Check if player is within the door area (with some tolerance)
    const threshold = Math.max(scaledDoorWidth, scaledDoorHeight) * 0.6; // 60% of door size
    const distanceX = Math.abs(this.player.x - doorX);
    const distanceY = Math.abs(this.player.y - doorY);

    // Player is walking through if they're close to the door center
    return distanceX < threshold && distanceY < threshold;
  }

  /**
   * Handles transition to building interior scene
   */
  private handleDoorTransition(doorEntityId: number, buildingName?: string): void {
    if (!buildingName) return;

    // Only handle home transition for now
    if (buildingName === 'home') {
      const doorX = PositionComponent.x[doorEntityId];
      const doorY = PositionComponent.y[doorEntityId];

      // Calculate entrance position (slightly inside the door)
      const entranceX = doorX;
      const entranceY = doorY + 30; // Move player slightly forward from door

      console.log(`🚪 Transitioning to Home scene from door at (${doorX}, ${doorY})`);
      this.scene.start('Home', {
        exitBuilding: 'home',
        entranceX: entranceX,
        entranceY: entranceY,
      });
    }
  }

  /**
   * Updates the ECS world and runs all systems
   */
  private updateECS(): void {
    if (!this.ecsWorld || !this.player || this.playerEntityId === null) return;

    updateECS({
      world: this.ecsWorld,
      player: this.player,
      playerEntityId: this.playerEntityId,
    });

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

    const { dirX, dirY, isRunning } = updatePlayerMovement({
      player: this.player,
      playerController: this.playerController,
      matter: this.matter,
    });

    // Always update animation (handles both moving and idle states)
    updatePlayerAnimation({
      player: this.player,
      characterManager: this.characterManager,
      deltaX: dirX,
      deltaY: dirY,
      isRunning,
      playerState: this.playerState,
    });
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

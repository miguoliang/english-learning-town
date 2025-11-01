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
import { DoorInteractionSystem } from '../ecs/systems/DoorInteractionSystem';
import { BuildingSystem } from '../ecs/systems/BuildingSystem';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { BuildingComponent, BuildingType } from '../ecs/components/BuildingComponent';
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
import { MapManager } from '../managers/MapManager';
import { CollisionManager } from '../managers/CollisionManager';
import { TileAnimationManager } from '../managers/TileAnimationManager';
import { BuildingManager } from '../managers/BuildingManager';
import { InteractionManager } from '../managers/InteractionManager';
import { setupPlayerCamera } from '../utils/CameraUtils';

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

  /** Managers */
  private mapManager: MapManager;
  private collisionManager: CollisionManager;
  private tileAnimationManager: TileAnimationManager;
  private buildingManager: BuildingManager;
  private interactionManager: InteractionManager;

  /** Map transform for calculations */
  private mapTransform: ReturnType<typeof calculateMapTransform> | null = null;

  constructor() {
    super('Town');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
    this.playerState = createPlayerState();
    this.mapManager = new MapManager(this);
    this.collisionManager = new CollisionManager(this);
    this.tileAnimationManager = new TileAnimationManager(this);
    this.interactionManager = new InteractionManager(this);
  }

  create(_data?: { exitBuilding?: string }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    // Initialize ECS World
    this.ecsWorld = createECSWorld();

    // Initialize ECS systems
    this.doorInteractionSystem = new DoorInteractionSystem(this);
    this.buildingSystem = new BuildingSystem(this);
    this.buildingManager = new BuildingManager(this, this.ecsWorld, this.buildingSystem);

    this.createTiledMap();
    this.createBuildings();
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
    this.interactionPrompt = InteractionManager.createInteractionPrompt(this);

    // Setup interaction manager AFTER player and doors are created
    this.setupInteractionManager();

    // Initialize debug system
    if (this.map && this.player && this.mapTransform) {
      this.debugSystem.initialize(this.map, this.mapTransform, this.player, this.tilePropertyHelper);
    }

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates and displays the Tiled map
   */
  private createTiledMap(): void {
    const tileHeight = 16; // Tile height in pixels

    // Define depth configuration for layers
    const depthConfig = new Map<string, number | ((transform: any, depthOffset: number) => number)>();

    // Ground layers
    depthConfig.set('Ground/Dirt', 0);
    depthConfig.set('Ground/Dirt Deco', 1);

    // Building layers - use functions to calculate based on transform
    depthConfig.set('Home/House', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (5 * tileHeight * transform.scale);
    });
    depthConfig.set('Home/House Deco', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (5 * tileHeight * transform.scale);
    });
    depthConfig.set('Shop/House', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (5 * tileHeight * transform.scale);
    });
    depthConfig.set('Shop/House Deco', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (5 * tileHeight * transform.scale);
    });
    depthConfig.set('School/House', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (19 * tileHeight * transform.scale);
    });
    depthConfig.set('School/House Deco', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (19 * tileHeight * transform.scale);
    });
    depthConfig.set('Library/House', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (19 * tileHeight * transform.scale);
    });
    depthConfig.set('Library/House Deco', (transform, depthOffset) => {
      return depthOffset + transform.mapOffsetY + (19 * tileHeight * transform.scale);
    });

    // Create map using MapManager
    const mapResult = this.mapManager.createMap({
      mapKey: 'town_map',
      tilesets: [
        ['House', 'house'],
        ['Dirt1', 'dirt1'],
        ['Props-All', 'props-all'],
      ],
      layerNames: [
        'Ground/Dirt',
        'Ground/Dirt Deco',
        'Home/House',
        'Home/House Deco',
        'School/House',
        'School/House Deco',
        'Shop/House',
        'Shop/House Deco',
        'Library/House',
        'Library/House Deco',
      ],
      depthConfig,
      collisionLayerNames: [
        'Home/House',
        'Home/House Deco',
        'School/House',
        'School/House Deco',
        'Shop/House',
        'Shop/House Deco',
        'Library/House',
        'Library/House Deco',
      ],
      depthOffset: this.DEPTH_OFFSET,
      topOffset: 0,
    });

    this.map = mapResult.map;
    this.collisionLayers = mapResult.collisionLayers;
    this.mapTransform = mapResult.transform;

    // Camera bounds will be set when player is created (after map transform is available)

    // Create collision bodies
    this.collisionManager.createCollisionBodies(this.map, this.collisionLayers, 'town_map');

    // Initialize tile property helper
    this.tilePropertyHelper = new TilePropertyHelper(this);
    this.tilePropertyHelper.setMap(this.map, this.mapTransform);

    // Initialize tile animations
    this.tileAnimationManager.initialize(this.map, 'town_map', 'Props-All', 'Ground/Dirt Deco');
  }

  /**
   * Creates building entities for all buildings in the town
   */
  private createBuildings(): void {
    if (!this.ecsWorld || !this.map || !this.mapTransform) return;

    const buildingConfig = {
      transform: this.mapTransform,
      tileWidth: this.map.tileWidth,
      tileHeight: this.map.tileHeight,
      depthOffset: this.DEPTH_OFFSET,
      buildings: [
        {
          name: 'home',
          centerTileX: 3,
          centerTileY: 3.5,
          width: 5,
          height: 4,
          buildingType: BuildingType.RESIDENTIAL,
          entranceTileX: 3,
          entranceTileY: 5,
          baseDepthRow: 5,
        },
        {
          name: 'shop',
          centerTileX: 26,
          centerTileY: 3,
          width: 6,
          height: 5,
          buildingType: BuildingType.COMMERCIAL,
          entranceTileX: 26,
          entranceTileY: 5,
          baseDepthRow: 5,
        },
        {
          name: 'school',
          centerTileX: 3,
          centerTileY: 17,
          width: 5,
          height: 5,
          buildingType: BuildingType.EDUCATIONAL,
          entranceTileX: 3,
          entranceTileY: 19,
          baseDepthRow: 19,
        },
        {
          name: 'library',
          centerTileX: 26,
          centerTileY: 17,
          width: 6,
          height: 5,
          buildingType: BuildingType.PUBLIC,
          entranceTileX: 26,
          entranceTileY: 19,
          baseDepthRow: 19,
        },
      ],
    };

    const result = this.buildingManager.createBuildings(buildingConfig);
    this.buildingEntities = result.buildingEntities;

    // Create doors from Tiled object layer
    const buildingLayerMap = new Map([
      ['home', 'Home/House Deco'],
      ['shop', 'Shop/House Deco'],
      ['school', 'School/House Deco'],
      ['library', 'Library/House Deco'],
    ]);

    this.doorToBuilding = this.buildingManager.createDoorsFromTiledLayer(
      this.map,
      this.buildingEntities,
      this.mapTransform,
      this.map.tileWidth,
      this.map.tileHeight,
      buildingLayerMap
    );
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

    if (map && this.map && this.mapTransform) {
      scale = this.mapTransform.scale;

      // Check if player is exiting from a building
      if (exitBuilding === 'home' && this.buildingEntities.has('home')) {
        // Position player at home door exit (just outside the door)
        const homeBuildingEid = this.buildingEntities.get('home')!;
        const homeEntranceX = BuildingComponent.entranceX[homeBuildingEid];
        const homeEntranceY = BuildingComponent.entranceY[homeBuildingEid];

        // Position player slightly outside the door (below the entrance)
        worldCenterX = homeEntranceX;
        worldCenterY = homeEntranceY + 40; // Move player slightly forward from door

        // Ensure home door is open when returning
        const homeDoorEid = BuildingComponent.doorEntityId[homeBuildingEid];
        if (homeDoorEid && this.doorInteractionSystem && this.ecsWorld) {
          if (!this.doorInteractionSystem.isDoorOpen(homeDoorEid)) {
            this.doorInteractionSystem.openDoor(homeDoorEid);
          }
        }
      } else {
        // Default to map center
        const mapCenterX = this.mapTransform.mapWidthInPixels / 2;
        const mapCenterY = this.mapTransform.mapHeightInPixels / 2;
        worldCenterX = this.mapTransform.mapOffsetX + mapCenterX * scale;
        worldCenterY = this.mapTransform.mapOffsetY + mapCenterY * scale;
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

        // Setup camera to follow player after player is created
        if (this.mapTransform && this.player) {
          setupPlayerCamera(this.camera, this.mapTransform, this.player);
        } else {
          console.warn('⚠️ Town scene: Cannot setup camera - missing mapTransform or player');
          if (!this.mapTransform) console.warn('   - mapTransform is missing');
          if (!this.player) console.warn('   - player is missing');
        }
      }
    } else {
      // This should never happen if map is created correctly
      // Fail fast with clear error message
      const missing: string[] = [];
      if (!map) missing.push('tilemap cache');
      if (!this.map) missing.push('this.map');
      if (!this.mapTransform) missing.push('this.mapTransform');

      console.error(`❌ CRITICAL: Cannot create player - map data unavailable!`);
      console.error(`   Missing: ${missing.join(', ')}`);
      console.error(`   This indicates the map was not created properly. Check createTiledMap().`);
      throw new Error(`Cannot create player: Map data unavailable. Missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Sets up the interaction manager after all components are ready
   */
  private setupInteractionManager(): void {
    if (!this.doorInteractionSystem || !this.ecsWorld || !this.player || !this.playerController || !this.interactionPrompt || !this.map || !this.mapTransform) {
      console.warn('⚠️ Cannot setup interaction manager - missing required components');
      return;
    }
    this.interactionManager.setupDoorInteractions({
      doorInteractionSystem: this.doorInteractionSystem,
      ecsWorld: this.ecsWorld,
      player: this.player,
      playerController: this.playerController,
      interactionPrompt: this.interactionPrompt,
      doorToBuilding: this.doorToBuilding,
      map: this.map,
      transform: this.mapTransform,
      onTransition: (doorEntityId, buildingName) => this.handleDoorTransition(doorEntityId, buildingName),
    });
  }

  /**
   * Handles transition to building interior scene
   */
  private handleDoorTransition(doorEntityId: number, buildingName: string): void {
    // Only handle home transition for now
    if (buildingName === 'home') {
      const doorX = PositionComponent.x[doorEntityId];
      const doorY = PositionComponent.y[doorEntityId];

      // Calculate entrance position (slightly inside the door)
      const entranceX = doorX;
      const entranceY = doorY + 30; // Move player slightly forward from door

      this.scene.start('Home', {
        exitBuilding: 'home',
        entranceX: entranceX,
        entranceY: entranceY,
      });
    }
  }

  /**
   * Update method called every frame to handle player movement
   */
  update(_time: number, delta: number): void {
    this.updatePlayerMovement(delta);
    this.updateECS();
    this.interactionManager.updateDoorInteractions();

    // Only update debug system if player exists
    if (this.player) {
      this.debugSystem.update();
    }

    // Toggle door highlights with 'D' key
    if (this.doorInteractionSystem && this.doorDebugKey && Phaser.Input.Keyboard.JustDown(this.doorDebugKey)) {
      const currentState = (this.doorInteractionSystem as any).showDebugHighlights;
      this.doorInteractionSystem.setDebugHighlights(!currentState);
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
  }
}

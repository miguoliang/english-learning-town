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
import { InteractionManager } from '../managers/InteractionManager';
import { setupPlayerCamera } from '../utils/CameraUtils';

/**
 * Scene data interface for Home scene
 */
interface HomeSceneData {
  exitBuilding?: string;
  entranceX?: number;
  entranceY?: number;
}

/**
 * Home interior scene
 */
export class Home extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private playerController: BasePlayerController;
  private characterManager: CharacterManager;
  private tilePropertyHelper: TilePropertyHelper;
  private debugSystem: DebugSystem;
  private player: Phaser.GameObjects.Sprite | null = null;
  private playerState: PlayerState;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  /** Depth offset for Y-based depth sorting of player */
  private readonly DEPTH_OFFSET = 10000;

  /** ECS World for managing entities and components */
  private ecsWorld: IWorld | null = null;

  /** ECS entity ID for the player */
  private playerEntityId: number | null = null;

  /** UI prompt for interactions */
  private interactionPrompt: Phaser.GameObjects.Text | null = null;

  /** Exit area position and interaction range */
  private exitArea: { x: number; y: number; range: number } | null = null;

  /** Managers */
  private mapManager: MapManager;
  private collisionManager: CollisionManager;
  private interactionManager: InteractionManager;

  /** Map transform for calculations */
  private mapTransform: ReturnType<typeof calculateMapTransform> | null = null;

  constructor() {
    super('Home');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
    this.playerState = createPlayerState();
    this.mapManager = new MapManager(this);
    this.collisionManager = new CollisionManager(this);
    this.interactionManager = new InteractionManager(this);
  }

  create(data?: HomeSceneData) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    // Initialize ECS World
    this.ecsWorld = createECSWorld();

    this.createTiledMap();
    this.createPlayer(data);
    this.createExitArea();

    // Create interaction prompt UI
    this.interactionPrompt = InteractionManager.createInteractionPrompt(this);

    // Setup exit interaction
    if (this.player && this.playerController && this.interactionPrompt && this.exitArea) {
      this.interactionManager.setupExitInteraction({
        player: this.player,
        playerController: this.playerController,
        interactionPrompt: this.interactionPrompt,
        exitArea: this.exitArea,
        onExit: () => this.exitToTown(),
      });
    }

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

    // Create map using MapManager
    const mapResult = this.mapManager.createMap({
      mapKey: 'home_map',
      tilesets: [
        ['floor-all', 'floor-all'],
        ['interior-props-all', 'interior-props-all'],
      ],
      layerNames: ['Floor', 'Props'],
      depthConfig: new Map([
        ['Floor', 0],
        ['Props', 1],
      ]),
      collisionLayerNames: ['Props'],
      depthOffset: this.DEPTH_OFFSET,
      topOffset: 0,
    });

    this.map = mapResult.map;
    this.collisionLayers = mapResult.collisionLayers;
    this.mapTransform = mapResult.transform;

    // Camera bounds will be set when player is created (after map transform is available)

    // Create collision bodies
    this.collisionManager.createCollisionBodies(this.map, this.collisionLayers, 'home_map');

    // Initialize tile property helper
    this.tilePropertyHelper = new TilePropertyHelper(this);
    this.tilePropertyHelper.setMap(this.map, this.mapTransform);
  }

  /**
   * Creates the player character at the entrance position or map center
   */
  private createPlayer(data?: HomeSceneData): void {
    // Initialize controllers
    this.playerController = new BasePlayerController(this);
    this.characterManager = new CharacterManager(this);

    const map = this.cache.tilemap.get('home_map');
    let spawnX: number, spawnY: number;
    let scale: number;

    if (map && this.map && this.mapTransform) {
      scale = this.mapTransform.scale;

      // Use entrance position from scene data if provided, otherwise use map center
      if (data?.entranceX !== undefined && data?.entranceY !== undefined) {
        // Entrance position is already in world coordinates from Town scene
        spawnX = data.entranceX;
        spawnY = data.entranceY;
      } else {
        // Default to bottom center of map (entrance area)
        const mapCenterX = this.mapTransform.mapWidthInPixels / 2;
        const mapCenterY = this.mapTransform.mapHeightInPixels * 0.8; // Near bottom for entrance
        spawnX = this.mapTransform.mapOffsetX + mapCenterX * scale;
        spawnY = this.mapTransform.mapOffsetY + mapCenterY * scale;
      }

      // Create player using utility function
      if (this.ecsWorld) {
        const result = createPlayer({
          scene: this,
          world: this.ecsWorld,
          characterManager: this.characterManager,
          playerController: this.playerController,
          spawnX,
          spawnY,
          scale,
          depthOffset: this.DEPTH_OFFSET,
        });

        this.player = result.player;
        this.playerEntityId = result.playerEntityId;

        // Setup camera to follow player after player is created
        if (this.mapTransform && this.player) {
          setupPlayerCamera(this.camera, this.mapTransform, this.player);
        } else {
          console.warn('⚠️ Home scene: Cannot setup camera - missing mapTransform or player');
          if (!this.mapTransform) console.warn('   - mapTransform is missing');
          if (!this.player) console.warn('   - player is missing');
        }

        // Setup exit interaction after player is created
        if (this.playerController && this.interactionPrompt && this.exitArea) {
          this.interactionManager.setupExitInteraction({
            player: this.player,
            playerController: this.playerController,
            interactionPrompt: this.interactionPrompt,
            exitArea: this.exitArea,
            onExit: () => this.exitToTown(),
          });
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
   * Creates the exit area near the entrance
   */
  private createExitArea(): void {
    if (!this.map || !this.mapTransform) return;

    // Exit area at bottom center of map (entrance area)
    const exitX = this.mapTransform.mapOffsetX + (this.mapTransform.mapWidthInPixels / 2) * this.mapTransform.scale;
    const exitY = this.mapTransform.mapOffsetY + (this.mapTransform.mapHeightInPixels * 0.85) * this.mapTransform.scale; // Near bottom

    this.exitArea = {
      x: exitX,
      y: exitY,
      range: 60 * this.mapTransform.scale, // Interaction range scaled to map
    };
  }

  /**
   * Update method called every frame to handle player movement and exit interaction
   */
  update(_time: number, delta: number): void {
    this.updatePlayerMovement(delta);
    this.updateECS();
    this.interactionManager.updateExitInteraction();

    // Only update debug system if player exists
    if (this.player) {
      this.debugSystem.update();
    }
  }

  /**
   * Transitions back to the Town scene
   */
  private exitToTown(): void {
    this.scene.start('Town', { exitBuilding: 'home' });
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
    // Clean up ECS resources
    SpriteRegistry.clear();
    resetECSWorld();
    this.ecsWorld = null;
    this.playerEntityId = null;
  }
}

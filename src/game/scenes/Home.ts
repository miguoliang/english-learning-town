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

  constructor() {
    super('Home');
    this.debugSystem = new DebugSystem(this, getCurrentDebugConfig());
    this.playerState = createPlayerState();
  }

  create(data?: HomeSceneData) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(GameConfig.COLORS.skyBlue);

    // Initialize ECS World
    this.ecsWorld = createECSWorld();

    this.createSceneTitle();
    this.createTiledMap();
    this.createPlayer(data);
    this.createExitArea();

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
   * Creates the scene title
   */
  private createSceneTitle(): void {
    this.add
      .text(GameConfig.UI.centerX, 50, 'Home', GameConfig.textStyles.TITLE)
      .setOrigin(0.5);
  }

  /**
   * Creates and displays the Tiled map
   */
  private createTiledMap(): void {
    this.map = this.make.tilemap({ key: 'home_map' });

    // Add tilesets - match the names from home.tmj
    const floorTileset = this.map.addTilesetImage('floor-all', 'floor-all');
    const interiorPropsTileset = this.map.addTilesetImage('interior-props-all', 'interior-props-all');

    const allTilesets = [floorTileset, interiorPropsTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    if (allTilesets.length > 0) {
      // Create layers in proper order (use the actual layer names from home.tmj)
      const floorLayer = this.map.createLayer('Floor', allTilesets, 0, 0);
      const propsLayer = this.map.createLayer('Props', allTilesets, 0, 0);

      // Calculate map transform
      const transform = calculateMapTransform(this.map);

      // Set up depth sorting
      floorLayer?.setDepth(0);
      propsLayer?.setDepth(1);

      // Set up collision detection for props layer
      const collisionLayers = [propsLayer].filter(Boolean);
      this.collisionLayers = collisionLayers.filter((layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null);

      // Scale and position all layers
      const layers = [floorLayer, propsLayer].filter(Boolean);

      layers.forEach(layer => {
        if (layer) {
          layer.setScale(transform.scale);
          layer.setPosition(transform.mapOffsetX, transform.mapOffsetY);
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
                    // Handle tile flipping
                    const flippedHorizontally = tile.flipX;
                    const flippedVertically = tile.flipY;

                    let objX = obj.x;
                    let objY = obj.y;

                    if (flippedHorizontally) {
                      objX = tile.width - obj.x - obj.width;
                    }

                    if (flippedVertically) {
                      objY = tile.height - obj.y - obj.height;
                    }

                    // Calculate world position with scaling and offset
                    const tileWorldX = (tile.pixelX + objX + obj.width / 2) * transform.scale + transform.mapOffsetX;
                    const tileWorldY = (tile.pixelY + objY + obj.height / 2) * transform.scale + transform.mapOffsetY;

                    // Create a static rectangle body at the collision shape position
                    this.matter.add.rectangle(
                      tileWorldX,
                      tileWorldY,
                      obj.width * transform.scale,
                      obj.height * transform.scale,
                      {
                        isStatic: true,
                        friction: 0.1,
                        restitution: 0,
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
   * Creates the player character at the entrance position or map center
   */
  private createPlayer(data?: HomeSceneData): void {
    // Initialize controllers
    this.playerController = new BasePlayerController(this);
    this.characterManager = new CharacterManager(this);

    const map = this.cache.tilemap.get('home_map');
    let spawnX: number, spawnY: number;
    let scale: number;

    if (map && this.map) {
      // Calculate consistent scaling and positioning
      const transform = calculateMapTransform(this.map);
      scale = transform.scale;

      // Use entrance position from scene data if provided, otherwise use map center
      if (data?.entranceX !== undefined && data?.entranceY !== undefined) {
        // Entrance position is already in world coordinates from Town scene
        spawnX = data.entranceX;
        spawnY = data.entranceY;
      } else {
        // Default to bottom center of map (entrance area)
        const mapCenterX = transform.mapWidthInPixels / 2;
        const mapCenterY = transform.mapHeightInPixels * 0.8; // Near bottom for entrance
        spawnX = transform.mapOffsetX + mapCenterX * scale;
        spawnY = transform.mapOffsetY + mapCenterY * scale;
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
        console.log(`🎮 Player created in Home scene at (${this.player.x}, ${this.player.y})`);
      }
    } else {
      // Fallback to screen center
      console.warn('Home map data not available, using screen center for player position');
      spawnX = GameConfig.UI.centerX;
      spawnY = GameConfig.UI.centerY;
      scale = 2;

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
      }
    }
  }

  /**
   * Creates the exit area near the entrance
   */
  private createExitArea(): void {
    if (!this.map || !this.player) return;

    const transform = calculateMapTransform(this.map);

    // Exit area at bottom center of map (entrance area)
    const exitX = transform.mapOffsetX + (transform.mapWidthInPixels / 2) * transform.scale;
    const exitY = transform.mapOffsetY + (transform.mapHeightInPixels * 0.85) * transform.scale; // Near bottom

    this.exitArea = {
      x: exitX,
      y: exitY,
      range: 60 * transform.scale // Interaction range scaled to map
    };

    console.log(`🚪 Exit area created at (${exitX}, ${exitY}) with range ${this.exitArea.range}`);
  }

  /**
   * Update method called every frame to handle player movement and exit interaction
   */
  update(_time: number, delta: number): void {
    this.updatePlayerMovement(delta);
    this.updateECS();
    this.updateExitInteraction();

    // Only update debug system if player exists
    if (this.player) {
      this.debugSystem.update();
    }
  }

  /**
   * Handles exit interaction
   */
  private updateExitInteraction(): void {
    if (!this.player || !this.playerController || !this.interactionPrompt || !this.exitArea) return;

    const playerX = this.player.x;
    const playerY = this.player.y;
    const distance = Math.sqrt(
      (playerX - this.exitArea.x) ** 2 + (playerY - this.exitArea.y) ** 2
    );

    if (distance <= this.exitArea.range) {
      this.interactionPrompt.setText('Press SPACE to exit');
      this.interactionPrompt.setVisible(true);

      // Check if SPACE key was pressed
      if (this.playerController['keyboardHandler'].isSpaceJustPressed()) {
        this.exitToTown();
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Transitions back to the Town scene
   */
  private exitToTown(): void {
    console.log('🚪 Exiting home, returning to town');
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
    // Note: Phaser Scene cleanup is handled automatically
  }
}


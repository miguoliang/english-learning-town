import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BasePlayerController } from '../controllers/BasePlayerController';
import { CharacterManager } from '../managers/CharacterManager';
import { IWorld } from 'bitecs';
import { EntityFactory } from '../ecs/EntityFactory';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { depthSortingSystem } from '../ecs/systems/DepthSortingSystem';

/**
 * Map transform information for coordinate conversions
 */
export interface MapTransform {
  scale: number;
  mapOffsetX: number;
  mapOffsetY: number;
  mapWidthInPixels: number;
  mapHeightInPixels: number;
  scaledMapWidth: number;
  scaledMapHeight: number;
}

/**
 * Calculate map scaling and positioning transform
 * @param map The tilemap to calculate transform for
 * @param topOffset Optional offset from top of screen (e.g., for title/HUD space)
 */
export function calculateMapTransform(map: Phaser.Tilemaps.Tilemap, topOffset: number = 0): MapTransform {
  const mapWidthInPixels = map.width * map.tileWidth;
  const mapHeightInPixels = map.height * map.tileHeight;

  // Calculate available height (screen height minus top offset)
  const availableHeight = GameConfig.screenHeight - topOffset;
  
  // Calculate scale to fill screen width exactly
  // Screen width equals browser client area, so scale should fill it precisely
  const scale = GameConfig.screenWidth / mapWidthInPixels;

  const scaledMapWidth = mapWidthInPixels * scale;
  const scaledMapHeight = mapHeightInPixels * scale;
  
  // Map fills width exactly, so offset should be 0
  const mapOffsetX = 0;
  
  // Position map below the top offset, center vertically in available space
  const mapOffsetY = topOffset + Math.max(0, (availableHeight - scaledMapHeight) / 2);

  return {
    scale,
    mapOffsetX,
    mapOffsetY,
    mapWidthInPixels,
    mapHeightInPixels,
    scaledMapWidth,
    scaledMapHeight,
  };
}

/**
 * Player state interface for managing player state across scenes
 */
export interface PlayerState {
  lastFacingDirection: 'up' | 'down' | 'left' | 'right';
  currentAnimationType: 'walk' | 'run' | 'idle';
}

/**
 * Initialize player state with default values
 */
export function createPlayerState(): PlayerState {
  return {
    lastFacingDirection: 'down',
    currentAnimationType: 'idle',
  };
}

/**
 * Configuration for creating a player
 */
export interface PlayerCreationConfig {
  scene: Scene;
  world: IWorld;
  characterManager: CharacterManager;
  playerController: BasePlayerController;
  spawnX: number;
  spawnY: number;
  scale: number;
  depthOffset: number;
}

/**
 * Result of player creation
 */
export interface PlayerCreationResult {
  player: Phaser.GameObjects.Sprite;
  playerEntityId: number;
}

/**
 * Creates a player character with physics body and ECS entity
 */
export function createPlayer(config: PlayerCreationConfig): PlayerCreationResult {
  const {
    scene,
    world,
    characterManager,
    spawnX,
    spawnY,
    scale,
    depthOffset,
  } = config;

  // Create player sprite with animations using CharacterManager
  const player = characterManager.createCharacter(
    'player',
    spawnX,
    spawnY,
    'down',
    scale
  );

  // Set initial depth based on Y position
  player.setDepth(depthOffset + player.y);

  // Create ECS entity for player
  const playerEntityId = EntityFactory.createPlayer(world, {
    sprite: player,
    x: player.x,
    y: player.y,
    baseDepth: depthOffset,
  });

  // Add physics body to player for collision detection
  const scaledCollisionWidth = GameConfig.PLAYER.COLLISION_WIDTH * scale;
  const scaledCollisionHeight = GameConfig.PLAYER.COLLISION_HEIGHT * scale;

  scene.matter.add.gameObject(player, {
    shape: {
      type: 'rectangle',
      width: scaledCollisionWidth,
      height: scaledCollisionHeight,
    },
    frictionAir: 0.5, // High air resistance for immediate stopping
    friction: 0.1,
    frictionStatic: 0,
    restitution: 0, // No bouncing off walls
    inertia: Infinity, // Prevent rotation when colliding with corners
  });

  return {
    player,
    playerEntityId,
  };
}

/**
 * Configuration for player movement update
 */
export interface PlayerMovementConfig {
  player: Phaser.GameObjects.Sprite;
  playerController: BasePlayerController;
  matter: Phaser.Physics.Matter.MatterPhysics;
}

/**
 * Updates player movement with keyboard controls using Matter.js physics
 */
export function updatePlayerMovement(config: PlayerMovementConfig): {
  dirX: number;
  dirY: number;
  isRunning: boolean;
} {
  const { player, playerController, matter } = config;

  // Get player Matter.js physics body
  const playerBody = player.body as MatterJS.BodyType;
  if (!playerBody) {
    return { dirX: 0, dirY: 0, isRunning: false };
  }

  // Get normalized movement input (-1, 0, or 1 for each axis)
  const { velocityX: dirX, velocityY: dirY } = playerController['keyboardHandler'].getMovementInput();
  const isRunning = playerController['keyboardHandler'].isShiftPressed() && (dirX !== 0 || dirY !== 0);

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
  matter.setVelocity(playerBody, velocityX, velocityY);

  return { dirX, dirY, isRunning };
}

/**
 * Configuration for updating player animation
 */
export interface PlayerAnimationConfig {
  player: Phaser.GameObjects.Sprite;
  characterManager: CharacterManager;
  deltaX: number;
  deltaY: number;
  isRunning: boolean;
  playerState: PlayerState;
}

/**
 * Updates player animation based on movement direction and Shift key state
 * Only updates animation when direction or type actually changes to prevent unnecessary calls
 */
export function updatePlayerAnimation(config: PlayerAnimationConfig): void {
  const { player, characterManager, deltaX, deltaY, isRunning, playerState } = config;

  if (!player || !characterManager) return;

  const isMoving = deltaX !== 0 || deltaY !== 0;
  let animationType: 'walk' | 'run' | 'idle' = 'idle';
  let newDirection = playerState.lastFacingDirection;

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
  const directionChanged = newDirection !== playerState.lastFacingDirection;
  const animationChanged = animationType !== playerState.currentAnimationType;

  if (directionChanged || animationChanged) {
    playerState.lastFacingDirection = newDirection;
    playerState.currentAnimationType = animationType;
    characterManager.setCharacterFacing(player, newDirection, animationType);
  }
}

/**
 * Configuration for updating ECS world
 */
export interface ECSUpdateConfig {
  world: IWorld;
  player: Phaser.GameObjects.Sprite;
  playerEntityId: number;
}

/**
 * Updates the ECS world and runs all systems
 */
export function updateECS(config: ECSUpdateConfig): void {
  const { world, player, playerEntityId } = config;

  if (!world || !player || playerEntityId === null) return;

  // Update player position in ECS
  PositionComponent.x[playerEntityId] = player.x;
  PositionComponent.y[playerEntityId] = player.y;

  // Run ECS systems
  depthSortingSystem(world);
}


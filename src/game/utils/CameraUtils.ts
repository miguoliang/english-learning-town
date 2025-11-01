import { MapTransform } from './PlayerUtils';

/**
 * Configuration for camera following
 */
export interface CameraFollowConfig {
  /** Camera to configure */
  camera: Phaser.Cameras.Scene2D.Camera;
  /** Map transform for bounds calculation */
  mapTransform: MapTransform;
  /** Whether to enable smooth following (default: true) */
  smoothFollow?: boolean;
  /** Deadzone size - camera won't move until player leaves this zone (default: 0.1 = 10% of screen) */
  deadzone?: number;
  /** Camera lerp factor for smooth following (default: 0.1) */
  lerp?: number;
}

/**
 * Setup camera bounds and following for a map
 * @param config Camera configuration
 */
export function setupCameraBounds(config: CameraFollowConfig): void {
  const { camera, mapTransform } = config;

  // Phaser camera bounds define where the camera scroll position (scrollX, scrollY) can be
  // The scroll position is the top-left corner of what the camera sees
  // The bounds rectangle defines the area where scrollX/scrollY can be positioned

  // Map layers are positioned at (mapOffsetX, mapOffsetY) in world coordinates
  // Camera scroll must be constrained to show only the map area
  // For maps larger than screen, camera can scroll; Phaser handles viewport constraints automatically

  // Set bounds to the map's world position and size
  // This ensures the camera can only scroll within the map area
  camera.setBounds(
    mapTransform.mapOffsetX,
    mapTransform.mapOffsetY,
    mapTransform.scaledMapWidth,
    mapTransform.scaledMapHeight
  );
}

/**
 * Setup camera to follow a game object with smooth movement
 * @param config Camera configuration
 * @param target The game object to follow
 */
export function setupCameraFollowing(
  config: CameraFollowConfig,
  target: Phaser.GameObjects.GameObject
): void {
  const {
    camera,
    smoothFollow = true,
    lerp = 0.1,
  } = config;

  // Note: camera.centerOn is called in setupPlayerCamera before this function
  // So we don't need to call it again here

  if (smoothFollow) {
    // For immediate following, use no deadzone and fast lerp
    // This keeps the player centered on screen as soon as possible
    camera.setDeadzone(0, 0);

    // Use high lerp value (close to 1.0) for fast response
    // This makes the camera follow almost immediately
    const fastLerp = Math.min(lerp * 3, 0.95); // Scale lerp up but cap at 0.95 for smoothness

    // Start following with fast lerp to keep player centered
    // Parameters: target, roundPixels, lerpX, lerpY
    camera.startFollow(target, true, fastLerp, fastLerp);

    // Set roundPixels for crisp rendering
    camera.setRoundPixels(true);
  } else {
    // Simple follow without smoothing - always keeps target centered
    camera.startFollow(target);
  }
}

/**
 * Setup camera to follow the player with optimal settings for top-down games
 * @param camera The camera to configure
 * @param mapTransform Map transform for bounds
 * @param player The player sprite to follow
 */
export function setupPlayerCamera(
  camera: Phaser.Cameras.Scene2D.Camera,
  mapTransform: MapTransform,
  player: Phaser.GameObjects.Sprite
): void {
  if (!camera) {
    console.error('❌ Camera is null or undefined!');
    return;
  }

  if (!mapTransform) {
    console.error('❌ MapTransform is null or undefined!');
    return;
  }

  if (!player) {
    console.error('❌ Player is null or undefined!');
    return;
  }

  // Set camera bounds first (before following)
  setupCameraBounds({ camera, mapTransform });

  // Immediately center camera on player
  // This sets scrollX = player.x - camera.width/2 and scrollY = player.y - camera.height/2
  camera.centerOn(player.x, player.y);

  // Setup following to keep player centered on screen immediately
  // No deadzone (0,0) means camera moves immediately when player moves
  // High lerp value ensures fast response to keep player centered
  setupCameraFollowing(
    {
      camera,
      mapTransform,
      smoothFollow: true,
      deadzone: 0, // No deadzone - camera moves immediately
      lerp: 0.2, // Higher lerp for faster response (will be scaled up)
    },
    player
  );
}

/**
 * Make a game object fixed on screen (doesn't scroll with camera)
 * Useful for UI elements like titles, HUD, etc.
 * @param gameObject The game object to fix
 */
export function setFixedOnScreen(gameObject: Phaser.GameObjects.GameObject): void {
  // setScrollFactor is available on most Phaser game objects
  if ('setScrollFactor' in gameObject && typeof (gameObject as any).setScrollFactor === 'function') {
    (gameObject as any).setScrollFactor(0);
  }
}


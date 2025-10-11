import { defineComponent, Types } from 'bitecs';

/**
 * Component that links an entity to Phaser game objects
 * Stores a reference ID that maps to actual Phaser objects
 */
export const SpriteComponent = defineComponent({
  /**
   * Reference ID to the Phaser sprite/layer
   * We store an ID instead of the actual object reference
   * The actual object is stored in a Map outside ECS
   */
  spriteId: Types.ui32,
  /** Type of sprite: 0 = Sprite, 1 = TilemapLayer */
  spriteType: Types.ui8,
});

/**
 * Sprite type constants
 */
export const SpriteType = {
  SPRITE: 0,
  TILEMAP_LAYER: 1,
} as const;

/**
 * Default values for SpriteComponent
 */
export const SpriteDefaults = {
  spriteId: 0,
  spriteType: SpriteType.SPRITE,
};


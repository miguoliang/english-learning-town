import { defineComponent, Types } from 'bitecs';

/**
 * Component for door entities
 * Handles door state, tile rendering, and building association
 */
export const DoorComponent = defineComponent({
  /** Parent building entity ID */
  buildingEntityId: Types.eid,
  /** Is the door currently open? 1 = open, 0 = closed */
  isOpen: Types.ui8,
  /** Base tile X coordinate in the tilemap (top-left tile for multi-tile doors) */
  tileX: Types.ui16,
  /** Base tile Y coordinate in the tilemap (top-left tile for multi-tile doors) */
  tileY: Types.ui16,
  /** Width in tiles (how many tiles wide the door is) */
  tileWidth: Types.ui8,
  /** Height in tiles (how many tiles tall the door is) */
  tileHeight: Types.ui8,
  /** Requires key to open? 1 = yes, 0 = no */
  requiresKey: Types.ui8,
  /** Layer index reference (stored as number ID) */
  layerIndex: Types.ui8,
});

/**
 * Default values for door component
 */
export const DoorDefaults = {
  buildingEntityId: 0,
  isOpen: 0,
  tileX: 0,
  tileY: 0,
  tileWidth: 1,
  tileHeight: 1,
  requiresKey: 0,
  layerIndex: 0,
} as const;

/**
 * Registry to map door entities to their tilemap layers
 * Since we can't store objects in ECS components
 */
export const DoorLayerRegistry = new Map<number, Phaser.Tilemaps.TilemapLayer>();

/**
 * Registry to map door entities to their collision bodies
 */
export const DoorCollisionRegistry = new Map<number, MatterJS.BodyType>();

/**
 * Registry to store closed tile IDs for each door entity
 * For multi-tile doors, this contains all tile IDs in row-major order
 */
export const DoorClosedTilesRegistry = new Map<number, number[]>();

/**
 * Registry to store open tile IDs for each door entity
 * For multi-tile doors, this contains all tile IDs in row-major order
 */
export const DoorOpenTilesRegistry = new Map<number, number[]>();


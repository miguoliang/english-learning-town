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
  /** Tile X coordinate in the tilemap */
  tileX: Types.ui16,
  /** Tile Y coordinate in the tilemap */
  tileY: Types.ui16,
  /** Global tile ID for closed door appearance */
  closedTileId: Types.ui16,
  /** Global tile ID for open door appearance */
  openTileId: Types.ui16,
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
  closedTileId: 0,
  openTileId: 0,
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


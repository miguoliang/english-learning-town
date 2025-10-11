import { defineComponent, Types } from 'bitecs';

/**
 * Building types for categorization
 */
export enum BuildingType {
  RESIDENTIAL = 0,
  EDUCATIONAL = 1,
  COMMERCIAL = 2,
  PUBLIC = 3,
}

/**
 * Component for building entities
 * Stores metadata about buildings in the game world
 */
export const BuildingComponent = defineComponent({
  /** Building type (residential, educational, etc.) */
  buildingType: Types.ui8,
  /** Entrance X position in world coordinates */
  entranceX: Types.f32,
  /** Entrance Y position in world coordinates */
  entranceY: Types.f32,
  /** Is the building locked? 1 = locked, 0 = unlocked */
  isLocked: Types.ui8,
  /** Has the player visited this building? 1 = yes, 0 = no */
  hasBeenVisited: Types.ui8,
  /** Reference to door entity ID (0 if no door) */
  doorEntityId: Types.eid,
});

/**
 * Default values for building component
 */
export const BuildingDefaults = {
  buildingType: BuildingType.RESIDENTIAL,
  entranceX: 0,
  entranceY: 0,
  isLocked: 0,
  hasBeenVisited: 0,
  doorEntityId: 0,
} as const;

/**
 * String names for buildings (stored separately as ECS uses numbers)
 */
export const BuildingNames = new Map<number, string>();

/**
 * Scene keys for building interiors (stored separately)
 */
export const BuildingSceneKeys = new Map<number, string>();


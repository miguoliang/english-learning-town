import { defineComponent, Types } from 'bitecs';

/**
 * Component for entities with world position
 * Stores X and Y coordinates in world space
 */
export const PositionComponent = defineComponent({
  /** X coordinate in world space */
  x: Types.f32,
  /** Y coordinate in world space */
  y: Types.f32,
});

/**
 * Default values for PositionComponent
 */
export const PositionDefaults = {
  x: 0,
  y: 0,
};


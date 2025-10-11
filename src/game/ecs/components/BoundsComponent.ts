import { defineComponent, Types } from 'bitecs';

/**
 * Component for entities with spatial bounds
 * Used for collision detection, transparency triggers, etc.
 */
export const BoundsComponent = defineComponent({
  /** Minimum X coordinate in world space */
  minX: Types.f32,
  /** Maximum X coordinate in world space */
  maxX: Types.f32,
  /** Minimum Y coordinate in world space */
  minY: Types.f32,
  /** Maximum Y coordinate in world space */
  maxY: Types.f32,
});

/**
 * Default values for BoundsComponent
 */
export const BoundsDefaults = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
};


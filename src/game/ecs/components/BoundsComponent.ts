import { defineComponent, Types } from 'bitecs';

/**
 * Component for storing bounds/collision information for entities
 * Used for buildings, interactable objects, and collision detection
 */
export const BoundsComponent = defineComponent({
  /** Width of the bounds in pixels */
  width: Types.f32,
  /** Height of the bounds in pixels */
  height: Types.f32,
  /** X offset from entity position (for non-centered bounds) */
  offsetX: Types.f32,
  /** Y offset from entity position (for non-centered bounds) */
  offsetY: Types.f32,
});

/**
 * Default values for bounds component
 */
export const BoundsDefaults = {
  width: 32,
  height: 32,
  offsetX: 0,
  offsetY: 0,
} as const;

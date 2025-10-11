import { defineComponent, Types } from 'bitecs';

/**
 * Component for entities that need depth sorting
 * Used for proper layering of sprites based on Y position
 */
export const DepthComponent = defineComponent({
  /** Base depth offset for this entity */
  baseDepth: Types.f32,
  /** Whether to use Y-based depth sorting */
  usesYSorting: Types.ui8,
  /** Current computed depth value */
  currentDepth: Types.f32,
});

/**
 * Default values for DepthComponent
 */
export const DepthDefaults = {
  baseDepth: 10000,
  usesYSorting: 1,
  currentDepth: 10000,
};


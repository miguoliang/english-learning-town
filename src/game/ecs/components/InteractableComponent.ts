import { defineComponent, Types } from 'bitecs';

/**
 * Interaction types for different entity behaviors
 */
export enum InteractionType {
  DOOR = 0,
  NPC = 1,
  ITEM = 2,
  SIGN = 3,
  CHEST = 4,
  QUEST_OBJECT = 5,
}

/**
 * Component for entities that can be interacted with
 * Used for doors, NPCs, items, signs, etc.
 */
export const InteractableComponent = defineComponent({
  /** Type of interaction (door, npc, item, etc.) */
  interactionType: Types.ui8,
  /** Interaction range in pixels */
  interactionRange: Types.f32,
  /** Is this interactable currently active? 1 = yes, 0 = no */
  isActive: Types.ui8,
  /** Is player currently in range? 1 = yes, 0 = no (updated by system) */
  playerInRange: Types.ui8,
  /** Cooldown timer (in frames) before can interact again */
  cooldown: Types.ui16,
});

/**
 * Default values for interactable component
 */
export const InteractableDefaults = {
  interactionType: InteractionType.DOOR,
  interactionRange: 32, // 2 tiles (16px each)
  isActive: 1,
  playerInRange: 0,
  cooldown: 0,
} as const;

/**
 * Registry to store prompt text for interactables
 * Since we can't store strings in ECS components
 */
export const InteractablePromptRegistry = new Map<number, string>();


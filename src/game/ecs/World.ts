import { createWorld, IWorld } from 'bitecs';

/**
 * ECS World instance for managing all entities and systems
 * This is the central registry for the Entity Component System
 */
let ecsWorld: IWorld | null = null;

/**
 * Creates and initializes the ECS world
 * Should be called once during game initialization
 * @returns The created ECS world instance
 */
export const createECSWorld = (): IWorld => {
  ecsWorld = createWorld();
  return ecsWorld;
};

/**
 * Gets the current ECS world instance
 * @returns The current ECS world or null if not initialized
 */
export const getECSWorld = (): IWorld | null => {
  return ecsWorld;
};

/**
 * Resets the ECS world (useful for scene transitions or cleanup)
 */
export const resetECSWorld = (): void => {
  ecsWorld = null;
};


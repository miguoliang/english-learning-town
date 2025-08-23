/**
 * ECS Core - Modular Core Organization
 *
 * Core ECS architecture organized by responsibility:
 * - types: Entity, Component, System interfaces
 * - componentManager: Component data management and queries
 * - world: Main ECS coordinator and lifecycle management
 */

// Core type definitions
export type { EntityId, Entity, Component, System } from "./types";

// Component management
export { ComponentManager } from "./componentManager";

// World coordination
export { World } from "./world";

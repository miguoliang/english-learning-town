/**
 * @fileoverview Foundation types - Basic geometric types and branded identifiers
 * @module @english-learning-town/types/foundation
 * @version 1.0.0
 *
 * @description
 * Core foundation types used throughout the English Learning Town game.
 * Includes geometric primitives, branded identifier types for type safety,
 * and common utility types.
 *
 * @example
 * ```typescript
 * import { Position, createPlayerId, Bounds } from '@english-learning-town/types';
 *
 * const playerPos: Position = { x: 100, y: 200 };
 * const playerId = createPlayerId('player-123');
 * const area: Bounds = { x: 0, y: 0, width: 800, height: 600 };
 * ```
 */

// ============================================
// GEOMETRIC TYPES
// ============================================

/**
 * @interface Position
 * @description Represents a 2D coordinate position in the game world
 * @example
 * ```typescript
 * const playerPosition: Position = { x: 100, y: 200 };
 * ```
 */
export interface Position {
  /** Horizontal coordinate */
  x: number;
  /** Vertical coordinate */
  y: number;
}

/**
 * @interface Size
 * @description Represents width and height dimensions
 * @example
 * ```typescript
 * const screenSize: Size = { width: 1920, height: 1080 };
 * ```
 */
export interface Size {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * @interface Bounds
 * @description Combines position and size to define a rectangular area
 * @extends Position
 * @extends Size
 * @example
 * ```typescript
 * const gameArea: Bounds = { x: 0, y: 0, width: 800, height: 600 };
 * ```
 */
export interface Bounds extends Position, Size {}

/**
 * @interface Vector2D
 * @description 2D vector with optional magnitude and angle properties
 * @extends Position
 * @example
 * ```typescript
 * const velocity: Vector2D = { x: 5, y: 3, magnitude: 5.83, angle: 0.54 };
 * ```
 */
export interface Vector2D extends Position {
  /** Vector magnitude/length (optional) */
  magnitude?: number;
  /** Vector angle in radians (optional) */
  angle?: number;
}

/**
 * @typedef {Bounds} Rectangle
 * @description Alias for Bounds - represents a rectangular area
 * @example
 * ```typescript
 * const collisionBox: Rectangle = { x: 10, y: 10, width: 50, height: 30 };
 * ```
 */
export type Rectangle = Bounds;

/**
 * @interface Circle
 * @description Represents a circular area with center position and radius
 * @extends Position
 * @example
 * ```typescript
 * const detectionRange: Circle = { x: 100, y: 200, radius: 50 };
 * ```
 */
export interface Circle extends Position {
  /** Circle radius in pixels */
  radius: number;
}

// ============================================
// BRANDED IDENTIFIER TYPES
// ============================================

/**
 * @description Branded string types for compile-time type safety
 * These prevent mixing up different types of IDs accidentally
 */

/** @typedef {string} PlayerId - Unique identifier for a player */
export type PlayerId = string & { __brand: 'PlayerId' };

/** @typedef {string} CharacterId - Unique identifier for a character/NPC */
export type CharacterId = string & { __brand: 'CharacterId' };

/** @typedef {string} DialogueId - Unique identifier for a dialogue tree */
export type DialogueId = string & { __brand: 'DialogueId' };

/** @typedef {string} QuestId - Unique identifier for a quest */
export type QuestId = string & { __brand: 'QuestId' };

/** @typedef {string} ItemId - Unique identifier for an item */
export type ItemId = string & { __brand: 'ItemId' };

/** @typedef {string} LocationId - Unique identifier for a location */
export type LocationId = string & { __brand: 'LocationId' };

/** @typedef {string} SystemId - Unique identifier for a game system */
export type SystemId = string & { __brand: 'SystemId' };

/**
 * @description Utility functions for creating branded identifier types
 * These functions provide type-safe creation of branded string types
 */

/**
 * @function createPlayerId
 * @description Creates a branded PlayerId from a string
 * @param {string} id - The string identifier
 * @returns {PlayerId} Branded player identifier
 * @example
 * ```typescript
 * const playerId = createPlayerId('player-123');
 * ```
 */
export const createPlayerId = (id: string): PlayerId => id as PlayerId;

/**
 * @function createCharacterId
 * @description Creates a branded CharacterId from a string
 * @param {string} id - The string identifier
 * @returns {CharacterId} Branded character identifier
 */
export const createCharacterId = (id: string): CharacterId => id as CharacterId;

/**
 * @function createDialogueId
 * @description Creates a branded DialogueId from a string
 * @param {string} id - The string identifier
 * @returns {DialogueId} Branded dialogue identifier
 */
export const createDialogueId = (id: string): DialogueId => id as DialogueId;

/**
 * @function createQuestId
 * @description Creates a branded QuestId from a string
 * @param {string} id - The string identifier
 * @returns {QuestId} Branded quest identifier
 */
export const createQuestId = (id: string): QuestId => id as QuestId;

/**
 * @function createItemId
 * @description Creates a branded ItemId from a string
 * @param {string} id - The string identifier
 * @returns {ItemId} Branded item identifier
 */
export const createItemId = (id: string): ItemId => id as ItemId;

/**
 * @function createLocationId
 * @description Creates a branded LocationId from a string
 * @param {string} id - The string identifier
 * @returns {LocationId} Branded location identifier
 */
export const createLocationId = (id: string): LocationId => id as LocationId;

/**
 * @function createSystemId
 * @description Creates a branded SystemId from a string
 * @param {string} id - The string identifier
 * @returns {SystemId} Branded system identifier
 */
export const createSystemId = (id: string): SystemId => id as SystemId;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * @typedef {T | null} Nullable
 * @template T
 * @description Utility type that allows a type to be null
 * @example
 * ```typescript
 * const userName: Nullable<string> = null; // or "John"
 * ```
 */
export type Nullable<T> = T | null;

/**
 * @typedef {T | undefined} Optional
 * @template T
 * @description Utility type that allows a type to be undefined
 * @example
 * ```typescript
 * const userId: Optional<string> = undefined; // or "123"
 * ```
 */
export type Optional<T> = T | undefined;

/**
 * @typedef {Object} DeepPartial
 * @template T
 * @description Utility type that makes all properties in T optional recursively
 * @example
 * ```typescript
 * const partialPlayer: DeepPartial<Player> = { name: "John" }; // all other props optional
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

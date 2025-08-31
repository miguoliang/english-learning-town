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

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export interface Vector2D extends Position {
  magnitude?: number;
  angle?: number;
}

export type Rectangle = Bounds;

export interface Circle extends Position {
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

// Utility functions for creating branded types
export const createPlayerId = (id: string): PlayerId => id as PlayerId;
export const createCharacterId = (id: string): CharacterId => id as CharacterId;
export const createDialogueId = (id: string): DialogueId => id as DialogueId;
export const createQuestId = (id: string): QuestId => id as QuestId;
export const createItemId = (id: string): ItemId => id as ItemId;
export const createLocationId = (id: string): LocationId => id as LocationId;
export const createSystemId = (id: string): SystemId => id as SystemId;

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * @fileoverview API and engine interface types - Response formats and engine interfaces
 * @module @english-learning-town/types/api
 * @version 1.0.0
 *
 * @description
 * Type definitions for API responses and game engine interfaces.
 * Includes standardized response formats and core engine contracts.
 *
 * @example
 * ```typescript
 * import { ApiResponse, GameEngine } from '@english-learning-town/types';
 *
 * const response: ApiResponse<string> = {
 *   success: true,
 *   data: 'Hello World',
 *   timestamp: new Date()
 * };
 * ```
 */

/**
 * @interface ApiResponse
 * @template T
 * @description Standardized API response format
 * @example
 * ```typescript
 * // Success response
 * const successResponse: ApiResponse<Player> = {
 *   success: true,
 *   data: playerData,
 *   timestamp: new Date()
 * };
 *
 * // Error response
 * const errorResponse: ApiResponse<never> = {
 *   success: false,
 *   error: 'Player not found',
 *   timestamp: new Date()
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** Whether the API call was successful */
  success: boolean;
  /** Response data (only present on success) */
  data?: T;
  /** Error message (only present on failure) */
  error?: string;
  /** When the response was generated */
  timestamp: Date;
}

/**
 * @interface GameEngine
 * @description Core game engine interface for lifecycle management
 * @example
 * ```typescript
 * class MyGameEngine implements GameEngine {
 *   async initialize() {
 *     // Setup game systems
 *   }
 *
 *   start() {
 *     // Begin game loop
 *   }
 *
 *   update(deltaTime: number) {
 *     // Update game state
 *   }
 * }
 * ```
 */
export interface GameEngine {
  /** Initialize the game engine and all systems */
  initialize(): Promise<void>;
  /** Start the game loop */
  start(): void;
  /** Pause the game loop */
  pause(): void;
  /** Resume the game loop after pause */
  resume(): void;
  /** Stop the game loop and cleanup */
  stop(): void;
  /** Update game state with delta time in milliseconds */
  update(deltaTime: number): void;
  /** Render the current game state */
  render(): void;
}

/**
 * @interface GameSystem
 * @description Interface for individual game systems within the engine
 * @example
 * ```typescript
 * class RenderSystem implements GameSystem {
 *   name = 'RenderSystem';
 *   priority = 100;
 *
 *   async initialize() {
 *     // Setup rendering
 *   }
 *
 *   update(deltaTime: number) {
 *     // Render frame
 *   }
 *
 *   cleanup() {
 *     // Cleanup resources
 *   }
 * }
 * ```
 */
export interface GameSystem {
  /** Human-readable name of the system */
  name: string;
  /** Execution priority (lower numbers run first) */
  priority: number;
  /** Initialize the system */
  initialize(): Promise<void>;
  /** Update the system with delta time in milliseconds */
  update(deltaTime: number): void;
  /** Clean up system resources */
  cleanup(): void;
}

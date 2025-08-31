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

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// ============================================
// GAME ENGINE INTERFACE TYPES
// ============================================

export interface GameEngine {
  initialize(): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  update(deltaTime: number): void;
  render(): void;
}

export interface GameSystem {
  name: string;
  priority: number;
  initialize(): Promise<void>;
  update(deltaTime: number): void;
  cleanup(): void;
}

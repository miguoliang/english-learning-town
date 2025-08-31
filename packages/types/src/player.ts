/**
 * @fileoverview Player types - Player character, stats, preferences, and achievements
 * @module @english-learning-town/types/player
 * @version 1.0.0
 *
 * @description
 * Type definitions for the player character system including player data,
 * statistics, preferences, achievements, and progression mechanics.
 *
 * @example
 * ```typescript
 * import { Player, PlayerStats, Achievement } from '@english-learning-town/types';
 *
 * const playerStats: PlayerStats = {
 *   health: 100,
 *   vocabulary: 75,
 *   pronunciation: 60
 * };
 * ```
 */

import type { Position, PlayerId, QuestId, LocationId } from './foundation';
import type { Item } from './game-content';

// ============================================
// PLAYER TYPES
// ============================================

/**
 * @interface Player
 * @description Complete player character data including stats, progress, and preferences
 * @example
 * ```typescript
 * const player: Player = {
 *   id: createPlayerId('player-1'),
 *   name: 'Alex',
 *   level: 5,
 *   experience: 1250,
 *   position: { x: 100, y: 200 },
 *   // ... other properties
 * };
 * ```
 */
export interface Player {
  /** Unique player identifier */
  id: PlayerId;
  /** Player's display name */
  name: string;
  /** Current player level */
  level: number;
  /** Total experience points earned */
  experience: number;
  /** Current position in the game world */
  position: Position;
  /** Items currently in the player's inventory */
  inventory: Item[];
  /** List of completed quest IDs */
  completedQuests: QuestId[];
  /** List of currently active quest IDs */
  activeQuests: QuestId[];
  /** Current location where the player is situated */
  currentLocation: LocationId;
  /** Player's skill and health statistics */
  stats: PlayerStats;
  /** Player's game preferences and settings */
  preferences: PlayerPreferences;
  /** Unlocked achievements */
  achievements: Achievement[];
  /** Timestamp when the player account was created */
  createdAt: Date;
  /** Timestamp of the player's last activity */
  lastActive: Date;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  vocabulary: number;
  pronunciation: number;
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}

export interface PlayerPreferences {
  language: string;
  difficulty: QuestDifficulty;
  autoSave: boolean;
  notificationsEnabled: boolean;
  speechRecognitionEnabled: boolean;
  subtitlesEnabled: boolean;
  voiceVolume: number;
  effectsVolume: number;
  musicVolume: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: ItemRarity;
  category: AchievementCategory;
}

export enum AchievementCategory {
  PROGRESS = 'progress',
  SOCIAL = 'social',
  LEARNING = 'learning',
  EXPLORATION = 'exploration',
  CHALLENGE = 'challenge',
}

// Re-export enums needed by player types
export enum QuestDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

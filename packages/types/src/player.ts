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

/**
 * @interface PlayerStats
 * @description Player's health and skill statistics
 * @example
 * ```typescript
 * const stats: PlayerStats = {
 *   health: 85,
 *   maxHealth: 100,
 *   vocabulary: 65,
 *   pronunciation: 70
 * };
 * ```
 */
export interface PlayerStats {
  /** Current health points */
  health: number;
  /** Maximum health points */
  maxHealth: number;
  /** Current energy points */
  energy: number;
  /** Maximum energy points */
  maxEnergy: number;
  /** Vocabulary skill level (0-100) */
  vocabulary: number;
  /** Pronunciation skill level (0-100) */
  pronunciation: number;
  /** Listening skill level (0-100) */
  listening: number;
  /** Speaking skill level (0-100) */
  speaking: number;
  /** Reading skill level (0-100) */
  reading: number;
  /** Writing skill level (0-100) */
  writing: number;
}

/**
 * @interface PlayerPreferences
 * @description Player's game settings and preferences
 * @example
 * ```typescript
 * const preferences: PlayerPreferences = {
 *   language: 'en-US',
 *   difficulty: QuestDifficulty.INTERMEDIATE,
 *   autoSave: true,
 *   voiceVolume: 0.8
 * };
 * ```
 */
export interface PlayerPreferences {
  /** Player's preferred language code (e.g., 'en-US') */
  language: string;
  /** Preferred quest difficulty level */
  difficulty: QuestDifficulty;
  /** Whether auto-save is enabled */
  autoSave: boolean;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Whether speech recognition is enabled */
  speechRecognitionEnabled: boolean;
  /** Whether subtitles are shown */
  subtitlesEnabled: boolean;
  /** Voice audio volume (0-1) */
  voiceVolume: number;
  /** Sound effects volume (0-1) */
  effectsVolume: number;
  /** Background music volume (0-1) */
  musicVolume: number;
}

/**
 * @interface Achievement
 * @description Represents a player achievement or badge
 * @example
 * ```typescript
 * const achievement: Achievement = {
 *   id: 'first-quest',
 *   name: 'First Steps',
 *   description: 'Complete your first quest',
 *   rarity: ItemRarity.COMMON,
 *   category: AchievementCategory.PROGRESS
 * };
 * ```
 */
export interface Achievement {
  /** Unique achievement identifier */
  id: string;
  /** Display name of the achievement */
  name: string;
  /** Achievement description */
  description: string;
  /** Icon URL or identifier */
  icon: string;
  /** Date when the achievement was unlocked */
  unlockedAt: Date;
  /** Rarity level of the achievement */
  rarity: ItemRarity;
  /** Category that the achievement belongs to */
  category: AchievementCategory;
}

/**
 * @enum {string} AchievementCategory
 * @description Categories for organizing different types of achievements
 * @example
 * ```typescript
 * const category = AchievementCategory.LEARNING;
 * ```
 */
export enum AchievementCategory {
  /** Achievements related to game progression */
  PROGRESS = 'progress',
  /** Achievements related to social interactions */
  SOCIAL = 'social',
  /** Achievements related to learning milestones */
  LEARNING = 'learning',
  /** Achievements related to world exploration */
  EXPLORATION = 'exploration',
  /** Achievements related to difficult challenges */
  CHALLENGE = 'challenge',
}

/**
 * @enum {string} QuestDifficulty
 * @description Difficulty levels for quests and game content
 * @example
 * ```typescript
 * const difficulty = QuestDifficulty.INTERMEDIATE;
 * ```
 */
export enum QuestDifficulty {
  /** Suitable for new players */
  BEGINNER = 'beginner',
  /** Moderate difficulty level */
  INTERMEDIATE = 'intermediate',
  /** Challenging content for experienced players */
  ADVANCED = 'advanced',
}

/**
 * @enum {string} ItemRarity
 * @description Rarity levels for items and achievements
 * @example
 * ```typescript
 * const rarity = ItemRarity.RARE;
 * ```
 */
export enum ItemRarity {
  /** Basic, easily obtainable items */
  COMMON = 'common',
  /** Somewhat rare items */
  UNCOMMON = 'uncommon',
  /** Rare items with special value */
  RARE = 'rare',
  /** Very rare, high-value items */
  EPIC = 'epic',
  /** Extremely rare, unique items */
  LEGENDARY = 'legendary',
}

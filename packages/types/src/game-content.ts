/**
 * @fileoverview Game content types - Characters, quests, items, and locations
 * @module @english-learning-town/types/game-content
 * @version 1.0.0
 *
 * @description
 * Type definitions for game content including NPCs, quests, items, and world locations.
 * These types define the core gameplay elements and their interactions.
 *
 * @example
 * ```typescript
 * import { Character, Quest, Item, Location } from '@english-learning-town/types';
 *
 * const npc: Character = {
 *   id: createCharacterId('teacher-mary'),
 *   name: 'Teacher Mary',
 *   personality: { friendly: 8, helpful: 9 }
 * };
 * ```
 */

import type {
  Position,
  Rectangle,
  Bounds,
  CharacterId,
  QuestId,
  LocationId,
  DialogueId,
} from './foundation';
import type { QuestDifficulty, ItemRarity } from './player';
import type { DialogueCondition } from './dialogue';

// ============================================
// CHARACTER TYPES
// ============================================

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  sprite: string;
  position: Position;
  dialogues: DialogueId[];
  quests?: QuestId[];
  personality: CharacterPersonality;
  currentLocation: LocationId;
  movementPattern?: MovementPattern;
  interactionRadius: number;
  isActive: boolean;
  voiceProfile?: VoiceProfile;
}

export interface MovementPattern {
  type: MovementType;
  speed: number;
  waypoints?: Position[];
  bounds?: Rectangle;
  pauseDuration?: number;
}

export enum MovementType {
  STATIC = 'static',
  PATROL = 'patrol',
  WANDER = 'wander',
  FOLLOW_PLAYER = 'follow_player',
  SCRIPTED = 'scripted',
}

export interface VoiceProfile {
  pitch: number;
  speed: number;
  voice: string;
  accent?: string;
}

export interface CharacterPersonality {
  friendly: number; // 0-10
  helpful: number; // 0-10
  patience: number; // 0-10
  enthusiasm: number; // 0-10
}

// ============================================
// QUEST TYPES
// ============================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  difficulty: QuestDifficulty;
  category: QuestCategory;
  estimatedTime: number; // minutes
}

export enum QuestCategory {
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  CONVERSATION = 'conversation',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
}

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string;
  currentProgress: number;
  requiredProgress: number;
  completed: boolean;
}

export enum ObjectiveType {
  SPEAK_WORD = 'speak_word',
  SPEAK_PHRASE = 'speak_phrase',
  FIND_ITEM = 'find_item',
  TALK_TO_CHARACTER = 'talk_to_character',
  VISIT_LOCATION = 'visit_location',
  COLLECT_ITEMS = 'collect_items',
}

export interface QuestReward {
  type: RewardType;
  amount: number;
  itemId?: string;
}

export enum RewardType {
  EXPERIENCE = 'experience',
  ITEM = 'item',
  CURRENCY = 'currency',
}

// ============================================
// LOCATION TYPES
// ============================================

export interface Location {
  id: string;
  name: string;
  description: string;
  background: string;
  music?: string;
  bounds: Bounds;
  characters: string[];
  items: string[];
  connectedLocations: LocationConnection[];
  ambientSounds?: string[];
}

export interface LocationConnection {
  locationId: string;
  position: Position;
  requirements?: DialogueCondition[];
}

// ============================================
// ITEM TYPES
// ============================================

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
  maxStack?: number;
  effects?: ItemEffect[];
}

export enum ItemType {
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  COLLECTIBLE = 'collectible',
  QUEST_ITEM = 'quest_item',
}

export interface ItemEffect {
  type: EffectType;
  value: number;
  duration?: number; // seconds
}

export enum EffectType {
  HEAL = 'heal',
  ENERGY_RESTORE = 'energy_restore',
  STAT_BOOST = 'stat_boost',
  EXPERIENCE_BONUS = 'experience_bonus',
}

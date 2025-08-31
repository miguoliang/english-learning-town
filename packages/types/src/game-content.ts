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

/**
 * @interface Character
 * @description Represents an NPC character in the game world
 * @example
 * ```typescript
 * const teacher: Character = {
 *   id: createCharacterId('teacher-mary'),
 *   name: 'Teacher Mary',
 *   description: 'A friendly English teacher',
 *   personality: { friendly: 9, helpful: 8, patience: 7, enthusiasm: 8 }
 * };
 * ```
 */
export interface Character {
  /** Unique character identifier */
  id: CharacterId;
  /** Character's display name */
  name: string;
  /** Character description */
  description: string;
  /** Sprite/image identifier for rendering */
  sprite: string;
  /** Current position in the game world */
  position: Position;
  /** List of available dialogue trees */
  dialogues: DialogueId[];
  /** Optional quests that this character offers */
  quests?: QuestId[];
  /** Character's personality traits */
  personality: CharacterPersonality;
  /** Current location where the character is situated */
  currentLocation: LocationId;
  /** Optional movement behavior pattern */
  movementPattern?: MovementPattern;
  /** Radius within which players can interact */
  interactionRadius: number;
  /** Whether the character is currently active in the world */
  isActive: boolean;
  /** Optional voice settings for speech synthesis */
  voiceProfile?: VoiceProfile;
}

/**
 * @interface MovementPattern
 * @description Defines how a character moves in the game world
 * @example
 * ```typescript
 * const patrol: MovementPattern = {
 *   type: MovementType.PATROL,
 *   speed: 2,
 *   waypoints: [{ x: 100, y: 100 }, { x: 200, y: 100 }]
 * };
 * ```
 */
export interface MovementPattern {
  /** Type of movement behavior */
  type: MovementType;
  /** Movement speed in pixels per second */
  speed: number;
  /** Optional waypoints for patrol/scripted movement */
  waypoints?: Position[];
  /** Optional bounds to restrict movement area */
  bounds?: Rectangle;
  /** Optional pause duration at waypoints (milliseconds) */
  pauseDuration?: number;
}

/**
 * @enum {string} MovementType
 * @description Different types of character movement patterns
 * @example
 * ```typescript
 * const movementType = MovementType.PATROL;
 * ```
 */
export enum MovementType {
  /** Character stays in one place */
  STATIC = 'static',
  /** Character moves between predefined waypoints */
  PATROL = 'patrol',
  /** Character moves randomly within bounds */
  WANDER = 'wander',
  /** Character follows the player */
  FOLLOW_PLAYER = 'follow_player',
  /** Character follows a predefined script */
  SCRIPTED = 'scripted',
}

/**
 * @interface VoiceProfile
 * @description Configuration for character voice synthesis
 * @example
 * ```typescript
 * const voice: VoiceProfile = {
 *   pitch: 1.2,
 *   speed: 1.0,
 *   voice: 'female-teacher',
 *   accent: 'american'
 * };
 * ```
 */
export interface VoiceProfile {
  /** Voice pitch multiplier (1.0 = normal) */
  pitch: number;
  /** Speaking speed multiplier (1.0 = normal) */
  speed: number;
  /** Voice identifier for text-to-speech */
  voice: string;
  /** Optional accent identifier */
  accent?: string;
}

/**
 * @interface CharacterPersonality
 * @description Character personality traits that affect interactions
 * @example
 * ```typescript
 * const personality: CharacterPersonality = {
 *   friendly: 8,
 *   helpful: 9,
 *   patience: 6,
 *   enthusiasm: 7
 * };
 * ```
 */
export interface CharacterPersonality {
  /** How friendly the character is (0-10) */
  friendly: number;
  /** How helpful the character is (0-10) */
  helpful: number;
  /** Character's patience level (0-10) */
  patience: number;
  /** Character's enthusiasm level (0-10) */
  enthusiasm: number;
}

// ============================================
// QUEST TYPES
// ============================================

/**
 * @interface Quest
 * @description Represents a learning quest or mission
 * @example
 * ```typescript
 * const quest: Quest = {
 *   id: 'greetings-quest',
 *   title: 'Learn Basic Greetings',
 *   description: 'Practice common English greetings',
 *   difficulty: QuestDifficulty.BEGINNER,
 *   category: QuestCategory.VOCABULARY,
 *   estimatedTime: 15
 * };
 * ```
 */
export interface Quest {
  /** Unique quest identifier */
  id: string;
  /** Quest title displayed to players */
  title: string;
  /** Detailed quest description */
  description: string;
  /** List of objectives to complete */
  objectives: QuestObjective[];
  /** Rewards given upon completion */
  rewards: QuestReward[];
  /** Required completed quests or conditions */
  prerequisites: string[];
  /** Quest difficulty level */
  difficulty: QuestDifficulty;
  /** Learning category this quest belongs to */
  category: QuestCategory;
  /** Estimated completion time in minutes */
  estimatedTime: number;
}

/**
 * @enum {string} QuestCategory
 * @description Categories for organizing learning quests
 * @example
 * ```typescript
 * const category = QuestCategory.PRONUNCIATION;
 * ```
 */
export enum QuestCategory {
  /** Vocabulary learning quests */
  VOCABULARY = 'vocabulary',
  /** Pronunciation practice quests */
  PRONUNCIATION = 'pronunciation',
  /** Conversation skills quests */
  CONVERSATION = 'conversation',
  /** Grammar learning quests */
  GRAMMAR = 'grammar',
  /** Listening comprehension quests */
  LISTENING = 'listening',
}

/**
 * @interface QuestObjective
 * @description Individual objective within a quest
 * @example
 * ```typescript
 * const objective: QuestObjective = {
 *   id: 'speak-hello',
 *   type: ObjectiveType.SPEAK_WORD,
 *   description: 'Say "hello" correctly',
 *   target: 'hello',
 *   currentProgress: 0,
 *   requiredProgress: 1,
 *   completed: false
 * };
 * ```
 */
export interface QuestObjective {
  /** Unique objective identifier */
  id: string;
  /** Type of objective action required */
  type: ObjectiveType;
  /** Human-readable description */
  description: string;
  /** Target of the objective (word, character, location, etc.) */
  target: string;
  /** Current progress towards completion */
  currentProgress: number;
  /** Required progress to complete the objective */
  requiredProgress: number;
  /** Whether the objective has been completed */
  completed: boolean;
}

/**
 * @enum {string} ObjectiveType
 * @description Different types of quest objectives
 * @example
 * ```typescript
 * const objectiveType = ObjectiveType.SPEAK_WORD;
 * ```
 */
export enum ObjectiveType {
  /** Speak a specific word correctly */
  SPEAK_WORD = 'speak_word',
  /** Speak a specific phrase correctly */
  SPEAK_PHRASE = 'speak_phrase',
  /** Find and collect a specific item */
  FIND_ITEM = 'find_item',
  /** Have a conversation with an NPC */
  TALK_TO_CHARACTER = 'talk_to_character',
  /** Visit a specific location */
  VISIT_LOCATION = 'visit_location',
  /** Collect a certain number of items */
  COLLECT_ITEMS = 'collect_items',
}

/**
 * @interface QuestReward
 * @description Reward given for completing a quest
 * @example
 * ```typescript
 * const reward: QuestReward = {
 *   type: RewardType.EXPERIENCE,
 *   amount: 100
 * };
 * ```
 */
export interface QuestReward {
  /** Type of reward */
  type: RewardType;
  /** Amount of the reward */
  amount: number;
  /** Optional item ID if reward type is ITEM */
  itemId?: string;
}

/**
 * @enum {string} RewardType
 * @description Types of rewards that can be given
 * @example
 * ```typescript
 * const rewardType = RewardType.EXPERIENCE;
 * ```
 */
export enum RewardType {
  /** Experience points reward */
  EXPERIENCE = 'experience',
  /** Physical item reward */
  ITEM = 'item',
  /** In-game currency reward */
  CURRENCY = 'currency',
}

// ============================================
// LOCATION TYPES
// ============================================

/**
 * @interface Location
 * @description Represents a location or area in the game world
 * @example
 * ```typescript
 * const classroom: Location = {
 *   id: 'classroom-1',
 *   name: 'English Classroom',
 *   description: 'A bright classroom with desks and a whiteboard',
 *   background: 'classroom.jpg',
 *   bounds: { x: 0, y: 0, width: 800, height: 600 },
 *   characters: ['teacher-mary'],
 *   items: ['textbook', 'pencil']
 * };
 * ```
 */
export interface Location {
  /** Unique location identifier */
  id: string;
  /** Display name of the location */
  name: string;
  /** Description of the location */
  description: string;
  /** Background image/sprite identifier */
  background: string;
  /** Optional background music identifier */
  music?: string;
  /** Physical bounds of the location */
  bounds: Bounds;
  /** List of character IDs present in this location */
  characters: string[];
  /** List of item IDs available in this location */
  items: string[];
  /** Connections to other locations */
  connectedLocations: LocationConnection[];
  /** Optional ambient sound effect identifiers */
  ambientSounds?: string[];
}

/**
 * @interface LocationConnection
 * @description Connection between two locations
 * @example
 * ```typescript
 * const connection: LocationConnection = {
 *   locationId: 'library',
 *   position: { x: 750, y: 300 },
 *   requirements: [{ type: 'quest_completed', target: 'intro-quest' }]
 * };
 * ```
 */
export interface LocationConnection {
  /** ID of the connected location */
  locationId: string;
  /** Position of the connection point/door */
  position: Position;
  /** Optional requirements to access this connection */
  requirements?: DialogueCondition[];
}

// ============================================
// ITEM TYPES
// ============================================

/**
 * @interface Item
 * @description Represents an item that can be collected or used
 * @example
 * ```typescript
 * const textbook: Item = {
 *   id: 'english-textbook',
 *   name: 'English Textbook',
 *   description: 'A comprehensive English learning book',
 *   icon: 'textbook.png',
 *   type: ItemType.TOOL,
 *   rarity: ItemRarity.COMMON,
 *   value: 50,
 *   stackable: false
 * };
 * ```
 */
export interface Item {
  /** Unique item identifier */
  id: string;
  /** Display name of the item */
  name: string;
  /** Item description */
  description: string;
  /** Icon/sprite identifier for rendering */
  icon: string;
  /** Category/type of the item */
  type: ItemType;
  /** Rarity level of the item */
  rarity: ItemRarity;
  /** Value/worth of the item */
  value: number;
  /** Whether multiple items can be stacked */
  stackable: boolean;
  /** Maximum stack size (if stackable) */
  maxStack?: number;
  /** Optional effects when using the item */
  effects?: ItemEffect[];
}

/**
 * @enum {string} ItemType
 * @description Categories for different types of items
 * @example
 * ```typescript
 * const itemType = ItemType.CONSUMABLE;
 * ```
 */
export enum ItemType {
  /** Items that can be consumed/used up */
  CONSUMABLE = 'consumable',
  /** Tools that aid in learning or gameplay */
  TOOL = 'tool',
  /** Items collected for achievements or trading */
  COLLECTIBLE = 'collectible',
  /** Special items required for specific quests */
  QUEST_ITEM = 'quest_item',
}

/**
 * @interface ItemEffect
 * @description Effect applied when using an item
 * @example
 * ```typescript
 * const healingEffect: ItemEffect = {
 *   type: EffectType.HEAL,
 *   value: 25,
 *   duration: 0 // instant effect
 * };
 * ```
 */
export interface ItemEffect {
  /** Type of effect */
  type: EffectType;
  /** Magnitude of the effect */
  value: number;
  /** Duration of the effect in seconds (0 for instant) */
  duration?: number;
}

/**
 * @enum {string} EffectType
 * @description Types of effects that items can provide
 * @example
 * ```typescript
 * const effectType = EffectType.HEAL;
 * ```
 */
export enum EffectType {
  /** Restores health points */
  HEAL = 'heal',
  /** Restores energy points */
  ENERGY_RESTORE = 'energy_restore',
  /** Temporarily boosts a player stat */
  STAT_BOOST = 'stat_boost',
  /** Provides experience point bonus */
  EXPERIENCE_BONUS = 'experience_bonus',
}

/**
 * @fileoverview Dialogue system types - Conversations, conditions, and actions
 * @module @english-learning-town/types/dialogue
 * @version 1.0.0
 *
 * @description
 * Type definitions for the dialogue system including conversation trees,
 * conditional logic, actions, and interactive speech challenges.
 *
 * @example
 * ```typescript
 * import { Dialogue, DialogueNode, DialogueCondition } from '@english-learning-town/types';
 *
 * const dialogueNode: DialogueNode = {
 *   id: 'greeting-1',
 *   speaker: 'Teacher Mary',
 *   text: 'Hello! Ready for your English lesson?'
 * };
 * ```
 */

import type { QuestDifficulty } from './player';
import type { SpeechChallenge } from './speech';

// ============================================
// DIALOGUE SYSTEM TYPES
// ============================================

/**
 * @interface Dialogue
 * @description Complete dialogue tree for a character conversation
 * @example
 * ```typescript
 * const dialogue: Dialogue = {
 *   id: 'teacher-greeting',
 *   characterId: 'teacher-mary',
 *   nodes: [greetingNode, responseNode],
 *   metadata: { tags: ['greeting'], difficulty: QuestDifficulty.BEGINNER }
 * };
 * ```
 */
export interface Dialogue {
  /** Unique dialogue identifier */
  id: string;
  /** ID of the character this dialogue belongs to */
  characterId: string;
  /** Array of dialogue nodes that make up the conversation tree */
  nodes: DialogueNode[];
  /** Additional metadata about the dialogue */
  metadata: DialogueMetadata;
}

/**
 * @interface DialogueNode
 * @description Individual node in a dialogue conversation tree
 * @example
 * ```typescript
 * const node: DialogueNode = {
 *   id: 'greeting-1',
 *   speaker: 'Teacher Mary',
 *   text: 'Hello! How are you today?',
 *   options: [{ id: 'response-1', text: 'I\'m fine, thank you!', nextNodeId: 'follow-up' }]
 * };
 * ```
 */
export interface DialogueNode {
  /** Unique node identifier within the dialogue */
  id: string;
  /** Name of the character speaking */
  speaker: string;
  /** Text content of what the speaker says */
  text: string;
  /** Optional audio file URL for voice acting */
  audioUrl?: string;
  /** Optional response options for the player */
  options?: DialogueOption[];
  /** Optional conditions that must be met to show this node */
  conditions?: DialogueCondition[];
  /** Optional actions to execute when this node is displayed */
  actions?: DialogueAction[];
  /** Optional speech challenge for pronunciation practice */
  speechChallenge?: SpeechChallenge;
}

/**
 * @interface DialogueOption
 * @description Player response option in a dialogue
 * @example
 * ```typescript
 * const option: DialogueOption = {
 *   id: 'polite-response',
 *   text: 'Thank you for the lesson!',
 *   nextNodeId: 'teacher-pleased',
 *   speechRequired: true
 * };
 * ```
 */
export interface DialogueOption {
  /** Unique option identifier */
  id: string;
  /** Text shown to the player for this option */
  text: string;
  /** ID of the next dialogue node to show */
  nextNodeId: string;
  /** Optional requirements to show this option */
  requirements?: DialogueCondition[];
  /** Whether the player must speak this response aloud */
  speechRequired?: boolean;
}

/**
 * @interface DialogueCondition
 * @description Condition that must be met for dialogue elements to appear
 * @example
 * ```typescript
 * const condition: DialogueCondition = {
 *   type: ConditionType.QUEST_COMPLETED,
 *   target: 'intro-quest',
 *   operator: ComparisonOperator.EQUALS,
 *   value: true
 * };
 * ```
 */
export interface DialogueCondition {
  /** Type of condition to check */
  type: ConditionType;
  /** Target of the condition (quest ID, item ID, etc.) */
  target: string;
  /** Comparison operator to use */
  operator: ComparisonOperator;
  /** Value to compare against */
  value: any;
}

/**
 * @enum {string} ConditionType
 * @description Types of conditions that can be checked in dialogues
 * @example
 * ```typescript
 * const conditionType = ConditionType.QUEST_COMPLETED;
 * ```
 */
export enum ConditionType {
  /** Check if a specific quest has been completed */
  QUEST_COMPLETED = 'quest_completed',
  /** Check if a specific item is in the player's inventory */
  ITEM_IN_INVENTORY = 'item_in_inventory',
  /** Check if the player meets a level requirement */
  LEVEL_REQUIREMENT = 'level_requirement',
  /** Check if the player meets a stat requirement */
  STAT_REQUIREMENT = 'stat_requirement',
}

/**
 * @enum {string} ComparisonOperator
 * @description Operators for comparing values in conditions
 * @example
 * ```typescript
 * const operator = ComparisonOperator.GREATER_THAN;
 * ```
 */
export enum ComparisonOperator {
  /** Check for exact equality */
  EQUALS = 'equals',
  /** Check if value is greater than target */
  GREATER_THAN = 'greater_than',
  /** Check if value is less than target */
  LESS_THAN = 'less_than',
  /** Check if value contains target (for arrays/strings) */
  CONTAINS = 'contains',
}

/**
 * @interface DialogueAction
 * @description Action to execute when a dialogue node is triggered
 * @example
 * ```typescript
 * const action: DialogueAction = {
 *   type: ActionType.GIVE_ITEM,
 *   target: 'textbook',
 *   value: 1
 * };
 * ```
 */
export interface DialogueAction {
  /** Type of action to perform */
  type: ActionType;
  /** Target of the action (item ID, quest ID, etc.) */
  target: string;
  /** Value or amount for the action */
  value: any;
}

/**
 * @enum {string} ActionType
 * @description Types of actions that can be performed in dialogues
 * @example
 * ```typescript
 * const actionType = ActionType.START_QUEST;
 * ```
 */
export enum ActionType {
  /** Give an item to the player */
  GIVE_ITEM = 'give_item',
  /** Remove an item from the player's inventory */
  REMOVE_ITEM = 'remove_item',
  /** Start a new quest for the player */
  START_QUEST = 'start_quest',
  /** Mark a quest as completed */
  COMPLETE_QUEST = 'complete_quest',
  /** Modify a player stat (health, skills, etc.) */
  MODIFY_STAT = 'modify_stat',
}

/**
 * @interface DialogueMetadata
 * @description Additional metadata about a dialogue for organization and filtering
 * @example
 * ```typescript
 * const metadata: DialogueMetadata = {
 *   tags: ['greeting', 'introduction'],
 *   difficulty: QuestDifficulty.BEGINNER,
 *   estimatedDuration: 5,
 *   learningFocus: ['vocabulary', 'pronunciation']
 * };
 * ```
 */
export interface DialogueMetadata {
  /** Tags for categorizing the dialogue */
  tags: string[];
  /** Difficulty level of the dialogue */
  difficulty: QuestDifficulty;
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Learning areas this dialogue focuses on */
  learningFocus: string[];
}

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

export interface Dialogue {
  id: string;
  characterId: string;
  nodes: DialogueNode[];
  metadata: DialogueMetadata;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  audioUrl?: string;
  options?: DialogueOption[];
  conditions?: DialogueCondition[];
  actions?: DialogueAction[];
  speechChallenge?: SpeechChallenge;
}

export interface DialogueOption {
  id: string;
  text: string;
  nextNodeId: string;
  requirements?: DialogueCondition[];
  speechRequired?: boolean;
}

export interface DialogueCondition {
  type: ConditionType;
  target: string;
  operator: ComparisonOperator;
  value: any;
}

export enum ConditionType {
  QUEST_COMPLETED = 'quest_completed',
  ITEM_IN_INVENTORY = 'item_in_inventory',
  LEVEL_REQUIREMENT = 'level_requirement',
  STAT_REQUIREMENT = 'stat_requirement',
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
}

export interface DialogueAction {
  type: ActionType;
  target: string;
  value: any;
}

export enum ActionType {
  GIVE_ITEM = 'give_item',
  REMOVE_ITEM = 'remove_item',
  START_QUEST = 'start_quest',
  COMPLETE_QUEST = 'complete_quest',
  MODIFY_STAT = 'modify_stat',
}

export interface DialogueMetadata {
  tags: string[];
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  learningFocus: string[];
}

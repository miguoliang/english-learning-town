// Game Types - Converted from Godot GDScript

export const QuestType = {
  CONVERSATION: 'CONVERSATION',
  DELIVERY: 'DELIVERY', 
  SHOPPING: 'SHOPPING',
  EXPLORATION: 'EXPLORATION',
  COLLECTION: 'COLLECTION',
  LEARNING: 'LEARNING'
} as const;

export type QuestType = typeof QuestType[keyof typeof QuestType];

export const LearningCategory = {
  VOCABULARY: 'VOCABULARY',
  GRAMMAR: 'GRAMMAR',
  SPEAKING: 'SPEAKING',
  LISTENING: 'LISTENING',
  READING: 'READING',
  WRITING: 'WRITING',
  PRONUNCIATION: 'PRONUNCIATION'
} as const;

export type LearningCategory = typeof LearningCategory[keyof typeof LearningCategory];

export const QuestStatus = {
  NOT_STARTED: 'NOT_STARTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  TURNED_IN: 'TURNED_IN'
} as const;

export type QuestStatus = typeof QuestStatus[keyof typeof QuestStatus];

export const ObjectiveType = {
  TALK_TO_NPC: 'TALK_TO_NPC',
  GO_TO_LOCATION: 'GO_TO_LOCATION',
  COLLECT_ITEM: 'COLLECT_ITEM',
  BUY_ITEM: 'BUY_ITEM',
  DELIVER_ITEM: 'DELIVER_ITEM',
  USE_VOCABULARY: 'USE_VOCABULARY',
  COMPLETE_DIALOGUE: 'COMPLETE_DIALOGUE',
  LEARN_GRAMMAR: 'LEARN_GRAMMAR',
  READ_TEXT: 'READ_TEXT',
  WRITE_TEXT: 'WRITE_TEXT'
} as const;

export type ObjectiveType = typeof ObjectiveType[keyof typeof ObjectiveType];

export interface QuestObjective {
  id: string;
  description: string;
  shortDescription?: string;
  hint?: string;
  objectiveType: ObjectiveType;
  targetId: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isOptional: boolean;
  requiredPhrases: string[];
  vocabularyToUse: string[];
}

export interface QuestData {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  questType: QuestType;
  learningCategory: LearningCategory;
  requiredLevel: number;
  prerequisiteQuests: string[];
  targetNpcId?: string;
  targetLocation?: string;
  objectives: QuestObjective[];
  currentObjectiveIndex: number;
  status: QuestStatus;
  isMainQuest: boolean;
  isDailyQuest: boolean;
  experienceReward: number;
  moneyReward: number;
  vocabularyRewards: string[];
  itemRewards: string[];
  newVocabulary: string[];
  grammarFocus: string[];
  dialoguePractice: string[];
}

export interface PlayerData {
  id: string;
  name: string;
  level: number;
  experience: number;
  money: number;
  currentLocation?: string;
  completedQuests: string[];
  activeQuests: string[];
  knownVocabulary: string[];
  unlockedAreas: string[];
}

export interface NPCData {
  id: string;
  name: string;
  description: string;
  location: string;
  dialogueTrees: DialogueEntry[];
  questsOffered: string[];
  shopItems?: ShopItem[];
}

export interface DialogueEntry {
  id: string;
  speakerName: string;
  text: string;
  responses?: DialogueResponse[];
  vocabularyHighlights?: string[];
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueResponse {
  id: string;
  text: string;
  nextDialogueId?: string;
  requiredVocabulary?: string[];
  effects?: DialogueEffect[];
  conditions?: DialogueCondition[];
}

export interface DialogueCondition {
  type: 'quest_completed' | 'has_item' | 'level_requirement' | 'vocabulary_known';
  value: string | number;
  operator?: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface DialogueEffect {
  type: 'complete_objective' | 'start_quest' | 'add_item' | 'add_experience' | 'learn_vocabulary';
  value: string | number;
  data?: any;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  requiredLevel?: number;
}

export interface GameState {
  currentScene: string;
  isInDialogue: boolean;
  isPaused: boolean;
  player: PlayerData;
  currentQuest?: QuestData;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'quest_started' | 'quest_completed' | 'objective_completed' | 'experience_gained' | 'level_up';
  title: string;
  message: string;
  duration: number;
  progress?: number;
  timestamp: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameSettings {
  volume: number;
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
  autoSaveEnabled: boolean;
  tutorialEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}
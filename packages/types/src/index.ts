// Core Game Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

// Player Types
export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  position: Position;
  inventory: Item[];
  completedQuests: string[];
  activeQuests: string[];
  currentLocation: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  vocabulary: number;
  pronunciation: number;
}

// Game Content Types
export interface Character {
  id: string;
  name: string;
  description: string;
  sprite: string;
  position: Position;
  dialogues: string[];
  quests?: string[];
  personality: CharacterPersonality;
}

export interface CharacterPersonality {
  friendly: number; // 0-10
  helpful: number; // 0-10
  patience: number; // 0-10
  enthusiasm: number; // 0-10
}

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

export enum QuestDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum QuestCategory {
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  CONVERSATION = 'conversation',
  GRAMMAR = 'grammar',
  LISTENING = 'listening'
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
  COLLECT_ITEMS = 'collect_items'
}

export interface QuestReward {
  type: RewardType;
  amount: number;
  itemId?: string;
}

export enum RewardType {
  EXPERIENCE = 'experience',
  ITEM = 'item',
  CURRENCY = 'currency'
}

// Dialogue System Types
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
  STAT_REQUIREMENT = 'stat_requirement'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains'
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
  MODIFY_STAT = 'modify_stat'
}

export interface DialogueMetadata {
  tags: string[];
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  learningFocus: string[];
}

// Speech Recognition Types
export interface SpeechChallenge {
  id: string;
  type: SpeechChallengeType;
  targetText: string;
  phonetics?: string;
  hints: string[];
  maxAttempts: number;
  timeLimit?: number; // seconds
  successThreshold: number; // 0-100 confidence score
}

export enum SpeechChallengeType {
  WORD_PRONUNCIATION = 'word_pronunciation',
  PHRASE_REPETITION = 'phrase_repetition',
  FREE_RESPONSE = 'free_response',
  READING_ALOUD = 'reading_aloud'
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: SpeechAlternative[];
  timestamp: Date;
  duration: number;
}

export interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
}

// Game World Types
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
  QUEST_ITEM = 'quest_item'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
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
  EXPERIENCE_BONUS = 'experience_bonus'
}

// Game State Management Types
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentDialogue: string | null;
  currentLocation: string;
  gameTime: GameTime;
  settings: GameSettings;
  debug: DebugState;
}

export interface GameTime {
  totalPlayTime: number; // milliseconds
  sessionStartTime: Date;
  lastSaveTime: Date;
}

export interface GameSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  voiceVolume: number; // 0-1
  speechRecognition: SpeechRecognitionConfig;
  graphics: GraphicsSettings;
  accessibility: AccessibilitySettings;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  fullscreen: boolean;
  vsync: boolean;
  particleEffects: boolean;
}

export interface AccessibilitySettings {
  subtitles: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
}

export interface DebugState {
  showFPS: boolean;
  showCollisionBoxes: boolean;
  showDialogueDebug: boolean;
  godMode: boolean;
  unlockAllLocations: boolean;
}

// Event System Types
export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: Date;
  data: Record<string, any>;
}

export enum GameEventType {
  PLAYER_MOVED = 'player_moved',
  DIALOGUE_STARTED = 'dialogue_started',
  DIALOGUE_ENDED = 'dialogue_ended',
  QUEST_STARTED = 'quest_started',
  QUEST_COMPLETED = 'quest_completed',
  ITEM_COLLECTED = 'item_collected',
  SPEECH_RECOGNITION_SUCCESS = 'speech_recognition_success',
  SPEECH_RECOGNITION_FAILED = 'speech_recognition_failed',
  LEVEL_UP = 'level_up',
  LOCATION_CHANGED = 'location_changed'
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  currentTask: string;
  error: string | null;
}

// Game Engine Types
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
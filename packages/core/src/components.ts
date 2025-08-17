/**
 * ECS Component Definitions
 * Components are pure data containers with no logic
 */

import type { Component } from './core';

// ========== SPATIAL COMPONENTS ==========

export interface PositionComponent extends Component {
  readonly type: 'position';
  x: number;
  y: number;
}

export interface SizeComponent extends Component {
  readonly type: 'size';
  width: number;
  height: number;
}

// ========== PHYSICS COMPONENTS ==========

export interface CollisionComponent extends Component {
  readonly type: 'collision';
  isWalkable: boolean;
  blocksMovement?: boolean;
}

export interface VelocityComponent extends Component {
  readonly type: 'velocity';
  x: number;
  y: number;
  maxSpeed?: number;
}

// ========== VISUAL COMPONENTS ==========

export interface RenderableComponent extends Component {
  readonly type: 'renderable';
  renderType: 'emoji' | 'sprite' | 'shape' | 'custom';
  icon?: string;
  sprite?: string;
  backgroundColor?: string;
  zIndex?: number;
  visible?: boolean;
}

// ========== INTERACTION COMPONENTS ==========

export interface InteractiveComponent extends Component {
  readonly type: 'interactive';
  interactionType: 'dialogue' | 'building-entrance' | 'scene-transition' | 'learning' | 'quest';
  
  // Dialogue interactions
  dialogueId?: string;
  
  // Building entrance interactions
  entrances?: Array<{
    id: string;
    position: { x: number; y: number };
    direction: 'north' | 'south' | 'east' | 'west';
    targetScene: string;
  }>;
  
  // Scene transition interactions
  targetScene?: string;
  targetPosition?: { x: number; y: number };
  
  // Learning activity interactions
  activityId?: string;
  
  // Quest interactions
  questId?: string;
  
  // Interaction conditions
  requiresAdjacency?: boolean;
  interactionRange?: number;
  
  // Interaction zones - cells where player can stand to interact
  interactionZones?: Array<{
    x: number;
    y: number;
    // Relative to the entity's position
    isRelative?: boolean;
  }>;
}

export interface InputComponent extends Component {
  readonly type: 'input';
  controllable: boolean;
  inputType: 'player' | 'ai' | 'scripted';
}

// ========== GAME-SPECIFIC COMPONENTS ==========

export interface PlayerComponent extends Component {
  readonly type: 'player';
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
}

export interface NPCComponent extends Component {
  readonly type: 'npc';
  name: string;
  role: string;
  personality?: string;
  currentDialogue?: string;
}

export interface BuildingComponent extends Component {
  readonly type: 'building';
  name: string;
  buildingType: 'educational' | 'commercial' | 'residential' | 'social' | 'storage';
  description?: string;
}

export interface FurnitureComponent extends Component {
  readonly type: 'furniture';
  name: string;
  furnitureType: 'desk' | 'chair' | 'blackboard' | 'bookshelf' | 'storage' | 'teaching-aid';
  usable?: boolean;
}

export interface DecorationComponent extends Component {
  readonly type: 'decoration';
  decorationType: 'plant' | 'sign' | 'statue' | 'fountain';
  category: string; // 'tree', 'flower', 'bush', 'grass', etc.
  seasonal?: boolean;
}

// ========== ANIMATION COMPONENTS ==========

export interface AnimationComponent extends Component {
  readonly type: 'animation';
  currentAnimation: string;
  animations: Record<string, {
    frames: string[];
    duration: number;
    loop?: boolean;
  }>;
  isPlaying: boolean;
  currentFrame: number;
  lastFrameTime: number;
}

export interface MovementAnimationComponent extends Component {
  readonly type: 'movement-animation';
  isMoving: boolean;
  direction: 'north' | 'south' | 'east' | 'west' | null;
  walkCycle?: {
    frames: string[];
    speed: number;
  };
}

// ========== GAMEPLAY COMPONENTS ==========

export interface HealthComponent extends Component {
  readonly type: 'health';
  current: number;
  max: number;
  regenerationRate?: number;
  invulnerable?: boolean;
}

export interface StatsComponent extends Component {
  readonly type: 'stats';
  strength: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
}

export interface InventoryComponent extends Component {
  readonly type: 'inventory';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    type: string;
  }>;
  maxSlots: number;
  weight: number;
  maxWeight: number;
}

// ========== AI COMPONENTS ==========

export interface AIComponent extends Component {
  readonly type: 'ai';
  behaviorType: 'idle' | 'patrol' | 'chase' | 'flee' | 'guard' | 'follow' | 'custom';
  state: string;
  target?: string; // Entity ID
  patrolPoints?: Array<{ x: number; y: number }>;
  currentPatrolIndex?: number;
  detectionRange: number;
  speed: number;
  lastDecisionTime: number;
  decisionCooldown: number;
}

export interface StateComponent extends Component {
  readonly type: 'state';
  currentState: string;
  previousState?: string;
  stateData: Record<string, any>;
  transitions: Record<string, string[]>; // state -> allowed next states
}

// ========== AUDIO COMPONENTS ==========

export interface AudioComponent extends Component {
  readonly type: 'audio';
  soundId: string;
  volume: number;
  loop: boolean;
  isPlaying: boolean;
  startTime?: number;
  endTime?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioListenerComponent extends Component {
  readonly type: 'audio-listener';
  range: number;
  volume: number;
  isActive: boolean;
}

// ========== PHYSICS COMPONENTS ==========

export interface PhysicsComponent extends Component {
  readonly type: 'physics';
  mass: number;
  friction: number;
  restitution: number; // bounciness
  isStatic: boolean;
  gravityScale: number;
  linearDamping: number;
  angularDamping: number;
}

export interface ForceComponent extends Component {
  readonly type: 'force';
  forces: Array<{
    x: number;
    y: number;
    duration: number;
    type: 'impulse' | 'continuous';
  }>;
}

// ========== QUEST COMPONENTS ==========

export interface QuestGiverComponent extends Component {
  readonly type: 'quest-giver';
  availableQuests: string[];
  completedQuests: string[];
  currentQuest?: string;
}

export interface QuestObjectiveComponent extends Component {
  readonly type: 'quest-objective';
  questId: string;
  objectiveId: string;
  isCompleted: boolean;
  targetEntityId?: string;
}

// ========== UTILITY COMPONENTS ==========

export interface TimerComponent extends Component {
  readonly type: 'timer';
  duration: number;
  elapsed: number;
  isActive: boolean;
  repeat: boolean;
  onComplete?: string; // Event to emit
}

export interface TagComponent extends Component {
  readonly type: 'tag';
  tags: string[];
}

// ========== LEARNING COMPONENTS ==========

export interface LearningComponent extends Component {
  readonly type: 'learning';
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabularyWords?: string[];
  grammarPoints?: string[];
  skills?: string[];
}

export interface ProgressComponent extends Component {
  readonly type: 'progress';
  entityType: 'player' | 'lesson' | 'activity';
  currentValue: number;
  maxValue: number;
  category: string;
}

// ========== COMPONENT FACTORY FUNCTIONS ==========

export const createPositionComponent = (x: number, y: number): PositionComponent => ({
  type: 'position',
  x,
  y
});

export const createSizeComponent = (width: number, height: number): SizeComponent => ({
  type: 'size',
  width,
  height
});

export const createCollisionComponent = (isWalkable: boolean, blocksMovement = !isWalkable): CollisionComponent => ({
  type: 'collision',
  isWalkable,
  blocksMovement
});

export const createRenderableComponent = (
  renderType: RenderableComponent['renderType'],
  options: Partial<Omit<RenderableComponent, 'type' | 'renderType'>> = {}
): RenderableComponent => {
  const component: RenderableComponent = {
    type: 'renderable',
    renderType,
    visible: options.visible !== false, // Default to true unless explicitly false
    zIndex: options.zIndex || 1
  };
  
  if (options.icon !== undefined) component.icon = options.icon;
  if (options.sprite !== undefined) component.sprite = options.sprite;
  if (options.backgroundColor !== undefined) component.backgroundColor = options.backgroundColor;
  
  return component;
};

export const createInteractiveComponent = (
  interactionType: InteractiveComponent['interactionType'],
  options: Partial<Omit<InteractiveComponent, 'type' | 'interactionType'>> = {}
): InteractiveComponent => ({
  type: 'interactive',
  interactionType,
  requiresAdjacency: true,
  interactionRange: 1,
  ...options
});

export const createPlayerComponent = (name: string): PlayerComponent => ({
  type: 'player',
  name,
  level: 1,
  experience: 0,
  health: 100,
  maxHealth: 100
});

export const createNPCComponent = (name: string, role: string): NPCComponent => ({
  type: 'npc',
  name,
  role
});

export const createVelocityComponent = (x = 0, y = 0, maxSpeed = 5): VelocityComponent => ({
  type: 'velocity',
  x,
  y,
  maxSpeed
});

export const createAnimationComponent = (
  currentAnimation: string,
  animations: AnimationComponent['animations']
): AnimationComponent => ({
  type: 'animation',
  currentAnimation,
  animations,
  isPlaying: true,
  currentFrame: 0,
  lastFrameTime: 0
});

export const createMovementAnimationComponent = (): MovementAnimationComponent => ({
  type: 'movement-animation',
  direction: 'south',
  isMoving: false
});

export const createInputComponent = (inputType: 'player' | 'ai' | 'scripted' = 'player', controllable = true): InputComponent => ({
  type: 'input',
  inputType,
  controllable
});

export const createFurnitureComponent = (
  name: string, 
  furnitureType: FurnitureComponent['furnitureType'],
  usable = false
): FurnitureComponent => ({
  type: 'furniture',
  name,
  furnitureType,
  usable
});

export const createDecorationComponent = (
  decorationType: DecorationComponent['decorationType'],
  category: string,
  seasonal = false
): DecorationComponent => ({
  type: 'decoration',
  decorationType,
  category,
  seasonal
});

export const createBuildingComponent = (
  name: string, 
  buildingType: BuildingComponent['buildingType']
): BuildingComponent => ({
  type: 'building',
  name,
  buildingType
});

// ========== NEW COMPONENT FACTORIES ==========

export const createHealthComponent = (
  current: number,
  max: number,
  regenerationRate = 0,
  invulnerable = false
): HealthComponent => ({
  type: 'health',
  current,
  max,
  regenerationRate,
  invulnerable
});

export const createStatsComponent = (
  strength: number,
  defense: number,
  speed: number,
  intelligence: number,
  luck: number
): StatsComponent => ({
  type: 'stats',
  strength,
  defense,
  speed,
  intelligence,
  luck
});

export const createInventoryComponent = (
  maxSlots = 20,
  maxWeight = 100
): InventoryComponent => ({
  type: 'inventory',
  items: [],
  maxSlots,
  weight: 0,
  maxWeight
});

export const createAIComponent = (
  behaviorType: AIComponent['behaviorType'],
  detectionRange = 5,
  speed = 1
): AIComponent => ({
  type: 'ai',
  behaviorType,
  state: 'idle',
  detectionRange,
  speed,
  lastDecisionTime: 0,
  decisionCooldown: 1000
});

export const createStateComponent = (
  initialState: string,
  stateData: Record<string, any> = {},
  transitions: Record<string, string[]> = {}
): StateComponent => ({
  type: 'state',
  currentState: initialState,
  stateData,
  transitions
});

export const createAudioComponent = (
  soundId: string,
  volume = 1,
  loop = false
): AudioComponent => ({
  type: 'audio',
  soundId,
  volume,
  loop,
  isPlaying: false
});

export const createAudioListenerComponent = (
  range = 10,
  volume = 1,
  isActive = true
): AudioListenerComponent => ({
  type: 'audio-listener',
  range,
  volume,
  isActive
});

export const createPhysicsComponent = (
  mass = 1,
  friction = 0.5,
  restitution = 0.2,
  isStatic = false
): PhysicsComponent => ({
  type: 'physics',
  mass,
  friction,
  restitution,
  isStatic,
  gravityScale: 1,
  linearDamping: 0.1,
  angularDamping: 0.1
});

export const createForceComponent = (): ForceComponent => ({
  type: 'force',
  forces: []
});

export const createTimerComponent = (
  duration: number,
  repeat = false,
  onComplete?: string
): TimerComponent => ({
  type: 'timer',
  duration,
  elapsed: 0,
  isActive: false,
  repeat,
  ...(onComplete !== undefined && { onComplete })
});

export const createTagComponent = (tags: string[] = []): TagComponent => ({
  type: 'tag',
  tags: [...tags]
});

// ========== COMPONENT TYPE GUARDS ==========

export const isPositionComponent = (component: Component): component is PositionComponent => 
  component.type === 'position';

export const isSizeComponent = (component: Component): component is SizeComponent => 
  component.type === 'size';

export const isCollisionComponent = (component: Component): component is CollisionComponent => 
  component.type === 'collision';

export const isRenderableComponent = (component: Component): component is RenderableComponent => 
  component.type === 'renderable';

export const isInteractiveComponent = (component: Component): component is InteractiveComponent => 
  component.type === 'interactive';

export const isPlayerComponent = (component: Component): component is PlayerComponent => 
  component.type === 'player';

export const isNPCComponent = (component: Component): component is NPCComponent => 
  component.type === 'npc';

export const isBuildingComponent = (component: Component): component is BuildingComponent => 
  component.type === 'building';

// ========== COMPONENT UTILITIES ==========

/**
 * Get all component types that an entity should have based on its archetype
 */
export const getArchetypeComponents = (archetype: string): readonly string[] => {
  const archetypes: Record<string, readonly string[]> = {
    'player': ['position', 'size', 'collision', 'renderable', 'input', 'player', 'velocity'] as const,
    'npc': ['position', 'size', 'collision', 'renderable', 'npc', 'interactive'] as const,
    'building': ['position', 'size', 'collision', 'renderable', 'building', 'interactive'] as const,
    'furniture': ['position', 'size', 'collision', 'renderable', 'furniture'] as const,
    'decoration': ['position', 'size', 'collision', 'renderable', 'decoration'] as const,
    'quest-giver': ['position', 'size', 'collision', 'renderable', 'npc', 'interactive', 'quest-giver'] as const
  };
  
  return archetypes[archetype] || [];
};
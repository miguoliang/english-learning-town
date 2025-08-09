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
): RenderableComponent => ({
  type: 'renderable',
  renderType,
  visible: options.visible !== false, // Default to true unless explicitly false
  zIndex: options.zIndex || 1,
  icon: options.icon,
  sprite: options.sprite,
  backgroundColor: options.backgroundColor
});

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

export const createBuildingComponent = (
  name: string, 
  buildingType: BuildingComponent['buildingType']
): BuildingComponent => ({
  type: 'building',
  name,
  buildingType
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
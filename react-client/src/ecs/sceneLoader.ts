/**
 * Scene Loader - Data-driven scene creation from JSON configurations
 */

import type { World } from './core';
import {
  createPositionComponent,
  createSizeComponent,
  createCollisionComponent,
  createRenderableComponent,
  createInteractiveComponent,
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent
} from './components';
import type {
  PositionComponent,
  SizeComponent,
  FurnitureComponent,
  DecorationComponent,
  VelocityComponent,
  InputComponent
} from './components';

// Scene configuration interfaces
export interface SceneEntityData {
  id: string;
  components: {
    position?: { x: number | string; y: number | string };
    size?: { width: number; height: number };
    collision?: { isWalkable: boolean; blocksMovement?: boolean };
    renderable?: {
      type: 'emoji' | 'sprite' | 'shape' | 'custom';
      icon?: string;
      sprite?: string;
      backgroundColor?: string;
      zIndex?: number;
      visible?: boolean;
    };
    interactive?: {
      type: 'dialogue' | 'building-entrance' | 'scene-transition' | 'learning' | 'quest';
      dialogueId?: string;
      entrances?: Array<{
        id: string;
        position: { x: number; y: number };
        direction: 'north' | 'south' | 'east' | 'west';
        targetScene: string;
      }>;
      targetScene?: string;
      targetPosition?: { x: number; y: number };
      activityId?: string;
      questId?: string;
      requiresAdjacency?: boolean;
      interactionRange?: number;
    };
    player?: {
      name: string;
      level?: number;
      experience?: number;
      health?: number;
      maxHealth?: number;
    };
    npc?: {
      name: string;
      role: string;
      personality?: string;
      currentDialogue?: string;
    };
    building?: {
      name: string;
      type: 'educational' | 'commercial' | 'residential' | 'social' | 'storage';
      description?: string;
    };
    furniture?: {
      name: string;
      type: 'desk' | 'chair' | 'blackboard' | 'bookshelf' | 'storage' | 'teaching-aid';
      usable?: boolean;
    };
    decoration?: {
      type: 'plant' | 'sign' | 'statue' | 'fountain';
      category: string;
      seasonal?: boolean;
    };
  };
}

export interface SceneData {
  id: string;
  name: string;
  description: string;
  gridSettings: {
    cellSize: number;
  };
  entities: SceneEntityData[];
}

export class SceneLoader {
  private world: World;

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Load a scene from JSON configuration
   */
  async loadScene(sceneData: SceneData): Promise<void> {
    console.log('🗺️ Loading scene:', sceneData.name, 'with', sceneData.entities.length, 'entities');
    
    // Clear existing entities (optional - you might want to keep some)
    const existingEntities = this.world.getAllEntities();
    for (const entity of existingEntities) {
      this.world.removeEntity(entity.id);
    }

    // Create entities from scene data
    for (const entityData of sceneData.entities) {
      await this.createEntityFromData(entityData);
      console.log('✨ Created entity:', entityData.id);
    }

    console.log('🌍 Scene loaded with', this.world.getAllEntities().length, 'total entities');
    this.world.getEventBus().emit('scene:loaded', { sceneId: sceneData.id, sceneName: sceneData.name });
  }

  /**
   * Load a scene from JSON file
   */
  async loadSceneFromFile(scenePath: string): Promise<void> {
    try {
      const response = await fetch(scenePath);
      if (!response.ok) {
        throw new Error(`Failed to load scene: ${response.statusText}`);
      }
      
      const sceneData: SceneData = await response.json();
      await this.loadScene(sceneData);
    } catch (error) {
      console.error('Error loading scene:', error);
      throw error;
    }
  }

  /**
   * Create an entity from JSON data
   */
  private async createEntityFromData(entityData: SceneEntityData): Promise<void> {
    const entity = this.world.createEntity(entityData.id);

    // Create components based on entity data
    for (const [componentType, componentData] of Object.entries(entityData.components)) {
      switch (componentType) {
        case 'position':
          if (componentData) {
            const posData = componentData as NonNullable<SceneEntityData['components']['position']>;
            const x = this.evaluatePosition(posData.x);
            const y = this.evaluatePosition(posData.y);
            this.world.addComponent(entity.id, createPositionComponent(x, y));
          }
          break;

        case 'size':
          if (componentData) {
            const sizeData = componentData as NonNullable<SceneEntityData['components']['size']>;
            this.world.addComponent(entity.id, createSizeComponent(sizeData.width, sizeData.height));
          }
          break;

        case 'collision':
          if (componentData) {
            const collisionData = componentData as NonNullable<SceneEntityData['components']['collision']>;
            this.world.addComponent(entity.id, createCollisionComponent(
              collisionData.isWalkable,
              collisionData.blocksMovement
            ));
          }
          break;

        case 'renderable':
          if (componentData) {
            const renderData = componentData as NonNullable<SceneEntityData['components']['renderable']>;
            this.world.addComponent(entity.id, createRenderableComponent(renderData.type, {
              icon: renderData.icon,
              sprite: renderData.sprite,
              backgroundColor: renderData.backgroundColor,
              zIndex: renderData.zIndex,
              visible: renderData.visible
            }));
          }
          break;

        case 'interactive':
          if (componentData) {
            const interactData = componentData as NonNullable<SceneEntityData['components']['interactive']>;
            this.world.addComponent(entity.id, createInteractiveComponent(interactData.type, {
              dialogueId: interactData.dialogueId,
              entrances: interactData.entrances,
              targetScene: interactData.targetScene,
              targetPosition: interactData.targetPosition,
              activityId: interactData.activityId,
              questId: interactData.questId,
              requiresAdjacency: interactData.requiresAdjacency,
              interactionRange: interactData.interactionRange
            }));
          }
          break;

        case 'player':
          if (componentData) {
            const playerData = componentData as NonNullable<SceneEntityData['components']['player']>;
            this.world.addComponent(entity.id, createPlayerComponent(playerData.name));
            
            // Add player-specific components
            this.world.addComponent(entity.id, {
              type: 'velocity',
              x: 0,
              y: 0,
              maxSpeed: 5
            } as VelocityComponent);
            
            this.world.addComponent(entity.id, {
              type: 'input',
              controllable: true,
              inputType: 'player'
            } as InputComponent);
          }
          break;

        case 'npc':
          if (componentData) {
            const npcData = componentData as NonNullable<SceneEntityData['components']['npc']>;
            this.world.addComponent(entity.id, createNPCComponent(npcData.name, npcData.role));
          }
          break;

        case 'building':
          if (componentData) {
            const buildingData = componentData as NonNullable<SceneEntityData['components']['building']>;
            this.world.addComponent(entity.id, createBuildingComponent(buildingData.name, buildingData.type));
          }
          break;

        case 'furniture':
          if (componentData) {
            const furnitureData = componentData as NonNullable<SceneEntityData['components']['furniture']>;
            this.world.addComponent(entity.id, {
              type: 'furniture',
              name: furnitureData.name,
              furnitureType: furnitureData.type,
              usable: furnitureData.usable
            } as FurnitureComponent);
          }
          break;

        case 'decoration':
          if (componentData) {
            const decorationData = componentData as NonNullable<SceneEntityData['components']['decoration']>;
            this.world.addComponent(entity.id, {
              type: 'decoration',
              decorationType: decorationData.type,
              category: decorationData.category,
              seasonal: decorationData.seasonal
            } as DecorationComponent);
          }
          break;
      }
    }
  }

  /**
   * Evaluate position expressions like "gridWidth - 8"
   * Safer alternative to eval for simple math expressions
   */
  private evaluatePosition(position: number | string): number {
    if (typeof position === 'number') {
      return position;
    }

    // Handle dynamic positioning expressions
    const cellSize = 40; // Should come from scene config
    const gridWidth = Math.floor(window.innerWidth / cellSize);
    const gridHeight = Math.floor(window.innerHeight / cellSize);

    try {
      // Simple expression evaluator for basic math operations
      if (position === 'gridWidth - 8') {
        return gridWidth - 8;
      } else if (position === 'gridWidth - 7') {
        return gridWidth - 7;
      } else if (position === 'gridWidth - 6') {
        return gridWidth - 6;
      } else if (position === 'gridHeight - 4') {
        return gridHeight - 4;
      }
      
      // Fallback: try to parse as number
      const numValue = parseInt(position.toString(), 10);
      if (!isNaN(numValue)) {
        return numValue;
      }
      
      console.warn(`Unsupported position expression: ${position}, using 0`);
      return 0;
    } catch (error) {
      console.warn(`Error evaluating position expression: ${position}, using 0`, error);
      return 0;
    }
  }

  /**
   * Add a player entity to the current scene
   */
  addPlayer(playerId: string, position: { x: number; y: number }, name: string = 'Player'): void {
    const entity = this.world.createEntity(playerId);
    
    this.world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    this.world.addComponent(entity.id, createSizeComponent(1, 1));
    this.world.addComponent(entity.id, createCollisionComponent(false, true));
    this.world.addComponent(entity.id, createRenderableComponent('emoji', { icon: '🚶', zIndex: 10 }));
    this.world.addComponent(entity.id, createPlayerComponent(name));
    
    this.world.addComponent(entity.id, {
      type: 'velocity',
      x: 0,
      y: 0,
      maxSpeed: 5
    } as VelocityComponent);
    
    this.world.addComponent(entity.id, {
      type: 'input',
      controllable: true,
      inputType: 'player'
    } as InputComponent);
  }

  /**
   * Get scene bounds for camera/viewport management
   */
  getSceneBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const entities = this.world.getAllEntities();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const entity of entities) {
      const position = this.world.getComponent<PositionComponent>(entity.id, 'position');
      const size = this.world.getComponent<SizeComponent>(entity.id, 'size');
      
      if (position && size) {
        minX = Math.min(minX, position.x);
        minY = Math.min(minY, position.y);
        maxX = Math.max(maxX, position.x + size.width);
        maxY = Math.max(maxY, position.y + size.height);
      }
    }

    return { minX, minY, maxX, maxY };
  }
}
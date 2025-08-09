/**
 * ECS Systems - Logic that operates on entities with specific components
 */

import type { System, Entity, ComponentManager } from './core';
import type { Emitter, ECSEvents } from './events';
import type {
  PositionComponent,
  SizeComponent,
  VelocityComponent,
  CollisionComponent,
  RenderableComponent,
  InteractiveComponent,
  InputComponent,
  AnimationComponent,
  MovementAnimationComponent
} from './components';
import { gameConfig, getPlayerSpeed } from '../config/gameConfig';
import { ECSEventTypes } from './events';

// ========== COLLISION SYSTEM ==========

export class CollisionSystem implements System {
  readonly name = 'CollisionSystem';
  readonly requiredComponents = ['position', 'size', 'collision'] as const;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    // Collision system is primarily used by other systems for collision queries
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  /**
   * Check if an entity can move to a specific position
   */
  canMoveTo(entityId: string, x: number, y: number, entities: Entity[], components: ComponentManager): boolean {
    const entitySize = components.getComponent<SizeComponent>(entityId, 'size');
    if (!entitySize) {
      console.warn(`🚫 CollisionSystem: Entity ${entityId} has no size component`);
      return false;
    }

    // Check collision with all other entities
    for (const otherEntity of entities) {
      if (otherEntity.id === entityId) continue;
      
      const otherPosition = components.getComponent<PositionComponent>(otherEntity.id, 'position');
      const otherSize = components.getComponent<SizeComponent>(otherEntity.id, 'size');
      const otherCollision = components.getComponent<CollisionComponent>(otherEntity.id, 'collision');
      
      if (!otherPosition || !otherSize || !otherCollision) continue;
      
      // Skip walkable entities
      if (otherCollision.isWalkable) continue;
      
      // Check for overlap
      if (this.isOverlapping(
        { x, y, width: entitySize.width, height: entitySize.height },
        { x: otherPosition.x, y: otherPosition.y, width: otherSize.width, height: otherSize.height }
      )) {
        console.log(`🚫 Collision detected: ${entityId} cannot move to (${x}, ${y}) - blocked by ${otherEntity.id} at (${otherPosition.x}, ${otherPosition.y})`);
        return false;
      }
    }
    
    return true;
  }

  private isOverlapping(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
}

// ========== MOVEMENT SYSTEM ==========

export class MovementSystem implements System {
  readonly name = 'MovementSystem';
  readonly requiredComponents = ['position', 'velocity'] as const;

  constructor(private collisionSystem: CollisionSystem) {}

  update(entities: Entity[], components: ComponentManager, deltaTime: number, events: Emitter<ECSEvents>): void {
    const movingEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of movingEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      
      if (!position || !velocity) continue;
      
      this.updateEntityPosition(entityId, position, velocity, deltaTime, entities, components, events);
    }
  }

  private updateEntityPosition(
    entityId: string,
    position: PositionComponent,
    velocity: VelocityComponent,
    deltaTime: number,
    entities: Entity[],
    components: ComponentManager,
    events: Emitter<ECSEvents>
  ): void {
    // Calculate new position
    const deltaSeconds = deltaTime / 1000;
    const newX = position.x + velocity.x * deltaSeconds;
    const newY = position.y + velocity.y * deltaSeconds;
    
    // Check collision before moving
    if (this.collisionSystem.canMoveTo(entityId, newX, newY, entities, components)) {
      this.moveEntity(entityId, position, newX, newY, events);
    } else {
      this.handleCollision(entityId, velocity, newX, newY, events);
    }
  }

  private moveEntity(
    entityId: string,
    position: PositionComponent,
    newX: number,
    newY: number,
    events: Emitter<ECSEvents>
  ): void {
    const oldX = position.x;
    const oldY = position.y;
    position.x = newX;
    position.y = newY;
    
    // Only emit if position actually changed
    if (oldX !== newX || oldY !== newY) {
              events.emit(ECSEventTypes.ENTITY_MOVED, { entityId, oldPosition: { x: oldX, y: oldY }, newPosition: { x: newX, y: newY } });
    }
  }

  private handleCollision(
    entityId: string,
    velocity: VelocityComponent,
    blockedX: number,
    blockedY: number,
    events: Emitter<ECSEvents>
  ): void {
    // Stop velocity if collision detected
    velocity.x = 0;
    velocity.y = 0;
    events.emit(ECSEventTypes.ENTITY_COLLISION, { entityId, blockedPosition: { x: blockedX, y: blockedY } });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}

// ========== KEYBOARD INPUT SYSTEM ==========

export class KeyboardInputSystem implements System {
  readonly name = 'KeyboardInputSystem';
  readonly requiredComponents = ['input', 'position'] as const;

  private inputState = new Map<string, boolean>();
  private lastKeyState = new Map<string, boolean>();
  private isInitialized = false;

  constructor(private collisionSystem: CollisionSystem) {}

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    // Initialize event listeners once
    if (!this.isInitialized) {
      this.setupEventListeners(events);
      this.isInitialized = true;
    }
    
    const controllableEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of controllableEntities) {
      const inputComponent = components.getComponent<InputComponent>(entityId, 'input');
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      
      if (!inputComponent || !position || !inputComponent.controllable) continue;
      
      // Handle player input - grid-based movement
      if (inputComponent.inputType === 'player') {
        this.handleGridMovement(entityId, position, components, events);
      }
    }
    
    // Update last key state for next frame
    this.lastKeyState.clear();
    this.inputState.forEach((pressed, key) => {
      this.lastKeyState.set(key, pressed);
    });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private handleGridMovement(
    entityId: string, 
    position: PositionComponent, 
    components: ComponentManager, 
    events: Emitter<ECSEvents>
  ): void {
    // Check for key press (not held) to move one cell at a time
    const isNewKeyPress = (key: string): boolean => {
      return this.inputState.get(key) === true && this.lastKeyState.get(key) !== true;
    };
    
    let newX = position.x;
    let newY = position.y;
    let moved = false;
    
    // Only move on new key press, not while held
    if (isNewKeyPress('ArrowUp') || isNewKeyPress('KeyW')) {
      newY = position.y - 1;
      moved = true;
    } else if (isNewKeyPress('ArrowDown') || isNewKeyPress('KeyS')) {
      newY = position.y + 1;
      moved = true;
    } else if (isNewKeyPress('ArrowLeft') || isNewKeyPress('KeyA')) {
      newX = position.x - 1;
      moved = true;
    } else if (isNewKeyPress('ArrowRight') || isNewKeyPress('KeyD')) {
      newX = position.x + 1;
      moved = true;
    }
    
    if (moved) {
      // Get all entities for collision checking
      const allEntities = this.getAllEntitiesFromComponentManager(components);
      
      // Use injected CollisionSystem to check if movement is valid
      if (this.collisionSystem.canMoveTo(entityId, newX, newY, allEntities, components)) {
        // Move directly - no velocity needed for grid movement
        const oldX = position.x;
        const oldY = position.y;
        position.x = newX;
        position.y = newY;
        
        // Emit movement event
        events.emit(ECSEventTypes.ENTITY_MOVED, { 
          entityId, 
          oldPosition: { x: oldX, y: oldY }, 
          newPosition: { x: newX, y: newY } 
        });
        
        console.log(`🎮 Player moved from (${oldX}, ${oldY}) to (${newX}, ${newY})`);
      } else {
        // Emit collision event if movement is blocked
        events.emit(ECSEventTypes.ENTITY_COLLISION, { 
          entityId, 
          blockedPosition: { x: newX, y: newY } 
        });
        
        console.log(`🚫 Movement blocked at (${newX}, ${newY}) - collision detected`);
      }
    }
  }

  private getAllEntitiesFromComponentManager(components: ComponentManager): Entity[] {
    // Get all entity IDs with any component
    const allEntityIds = new Set<string>();
    
    // Common component types to find all entities
    const componentTypes = ['position', 'size', 'collision', 'renderable', 'player', 'npc', 'building'];
    
    for (const componentType of componentTypes) {
      const entityIds = components.getEntitiesWithComponent(componentType);
      entityIds.forEach(id => allEntityIds.add(id));
    }
    
    // Convert to Entity objects
    return Array.from(allEntityIds).map(id => ({ id }));
  }
  


  // Event listener setup
  private setupEventListeners(events: Emitter<ECSEvents>): void {
    events.on(ECSEventTypes.INPUT_KEY_PRESSED, (data) => {
      this.setKeyPressed(data.key, true);
    });

    events.on(ECSEventTypes.INPUT_KEY_RELEASED, (data) => {
      this.setKeyPressed(data.key, false);
    });
  }

  // Public methods for input handling
  setKeyPressed(key: string, pressed: boolean): void {
    this.inputState.set(key, pressed);
  }
}

// ========== MOUSE INPUT SYSTEM ==========

export class MouseInputSystem implements System {
  readonly name = 'MouseInputSystem';
  readonly requiredComponents = ['player', 'position', 'velocity'] as const;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    // Mouse input system is event-driven, no regular update needed
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  handleMouseClick(x: number, y: number, _entities: Entity[], components: ComponentManager, events: Emitter<ECSEvents>): void {
    // Find player entity
    const playerEntities = components.getEntitiesWithComponent('player');
    if (playerEntities.length === 0) return;
    
    const playerId = playerEntities[0];
    const playerPosition = components.getComponent<PositionComponent>(playerId, 'position');
    if (!playerPosition) return;
    
    // Calculate direction to click position
    const dx = x - playerPosition.x;
    const dy = y - playerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const velocity = components.getComponent<VelocityComponent>(playerId, 'velocity');
      if (velocity) {
        const speed = velocity.maxSpeed || getPlayerSpeed();
        velocity.x = (dx / distance) * speed;
        velocity.y = (dy / distance) * speed;
        
        events.emit('player:move-to', { targetX: x, targetY: y });
      }
    }
  }
}

// ========== INTERACTION SYSTEM ==========

export class InteractionSystem implements System {
  readonly name = 'InteractionSystem';
  readonly requiredComponents = ['position', 'interactive'] as const;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    // This system is primarily event-driven, so update does minimal work
    // Most interaction logic happens in response to input events
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  // Handle interaction attempts
  handleInteraction(initiatorId: string, targetId: string, components: ComponentManager, events: Emitter<ECSEvents>): void {
    const initiatorPos = components.getComponent<PositionComponent>(initiatorId, 'position');
    const targetPos = components.getComponent<PositionComponent>(targetId, 'position');
    const targetInteractive = components.getComponent<InteractiveComponent>(targetId, 'interactive');
    
    if (!initiatorPos || !targetPos || !targetInteractive) return;
    
    // Check if entities are close enough to interact
    const distance = this.calculateDistance(initiatorPos, targetPos);
    const maxRange = targetInteractive.interactionRange || 1;
    
    if (distance > maxRange) {
      events.emit('interaction:out-of-range', { initiatorId, targetId, distance, maxRange });
      return;
    }
    
    // Handle different interaction types
    switch (targetInteractive.interactionType) {
      case 'dialogue':
        if (targetInteractive.dialogueId) {
          events.emit('dialogue:start', { 
            initiatorId, 
            targetId, 
            dialogueId: targetInteractive.dialogueId 
          });
        }
        break;
        
      case 'building-entrance':
        if (targetInteractive.entrances) {
          // Find the closest entrance
          const closestEntrance = this.findClosestEntrance(initiatorPos, targetPos, targetInteractive.entrances);
          if (closestEntrance) {
            events.emit('scene:transition', {
              from: initiatorId,
              to: closestEntrance.targetScene,
              entrance: closestEntrance
            });
          }
        }
        break;
        
      case 'scene-transition':
        if (targetInteractive.targetScene) {
          events.emit('scene:transition', {
            from: initiatorId,
            to: targetInteractive.targetScene,
            targetPosition: targetInteractive.targetPosition
          });
        }
        break;
        
      case 'learning':
        if (targetInteractive.activityId) {
          events.emit('learning:start', {
            initiatorId,
            targetId,
            activityId: targetInteractive.activityId
          });
        }
        break;
        
      case 'quest':
        if (targetInteractive.questId) {
          events.emit('quest:interact', {
            initiatorId,
            targetId,
            questId: targetInteractive.questId
          });
        }
        break;
    }
    
    events.emit('interaction:completed', { initiatorId, targetId, type: targetInteractive.interactionType });
  }

  private calculateDistance(pos1: PositionComponent, pos2: PositionComponent | { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findClosestEntrance(
    playerPos: PositionComponent,
    buildingPos: PositionComponent,
    entrances: NonNullable<InteractiveComponent['entrances']>
  ) {
    let closest = entrances[0];
    let minDistance = Infinity;
    
    for (const entrance of entrances) {
      const entranceWorldPos = {
        x: buildingPos.x + entrance.position.x,
        y: buildingPos.y + entrance.position.y
      };
      
      const distance = this.calculateDistance(playerPos, entranceWorldPos);
      if (distance < minDistance) {
        minDistance = distance;
        closest = entrance;
      }
    }
    
    return closest;
  }
}

// ========== RENDER SYSTEM ==========

export class RenderSystem implements System {
  readonly name = 'RenderSystem';
  readonly requiredComponents = ['position', 'size', 'renderable'] as const;

  private renderableEntities: Array<{
    id: string;
    position: PositionComponent;
    size: SizeComponent;
    renderable: RenderableComponent;
  }> = [];
  
  private isInitialized = false;
  private components: ComponentManager | null = null;
  private eventBus: Emitter<ECSEvents> | null = null;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    // Initialize event-driven system only once
    if (!this.isInitialized) {
      this.components = components;
      this.eventBus = events;
      this.setupEventListeners(events);
      this.isInitialized = true;
      
      // Initial render
      this.triggerRender('initial-load');
    }
    
    // RenderSystem is now purely event-driven - no regular updates needed
  }

  private setupEventListeners(events: Emitter<ECSEvents>): void {
    // Use type-safe mitt emitter directly

    // Listen for events that should trigger re-rendering
    events.on(ECSEventTypes.ENTITY_MOVED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        console.log('🎨 RenderSystem: Entity moved, triggering render');
      }
      this.triggerRender('entity-moved');
    });

    events.on(ECSEventTypes.ENTITY_ADDED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        console.log('🎨 RenderSystem: Entity added, triggering render');
      }
      this.triggerRender('entity-added');
    });

    events.on(ECSEventTypes.ENTITY_REMOVED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        console.log('🎨 RenderSystem: Entity removed, triggering render');
      }
      this.triggerRender('entity-removed');
    });

    events.on(ECSEventTypes.COMPONENT_ADDED, (data) => {
      // Only re-render if it's a visual component
      if (['position', 'size', 'renderable'].includes(data.componentType)) {
        if (gameConfig.debug.showSystemLogs) {
          console.log('🎨 RenderSystem: Visual component added, triggering render');
        }
        this.triggerRender('component-added');
      }
    });

    events.on(ECSEventTypes.COMPONENT_REMOVED, (data) => {
      // Only re-render if it's a visual component
      if (['position', 'size', 'renderable'].includes(data.componentType)) {
        if (gameConfig.debug.showSystemLogs) {
          console.log('🎨 RenderSystem: Visual component removed, triggering render');
        }
        this.triggerRender('component-removed');
      }
    });

    events.on(ECSEventTypes.SCENE_LOADED, (_data) => {
      if (gameConfig.debug.showSystemLogs) {
        console.log('🎨 RenderSystem: Scene loaded, triggering render');
      }
      this.triggerRender('scene-loaded');
    });
  }

  private triggerRender(reason: string): void {
    if (!this.components || !this.eventBus) return;

    // Collect renderable entities
    this.renderableEntities = [];
    const renderableEntityIds = this.components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of renderableEntityIds) {
      const position = this.components.getComponent<PositionComponent>(entityId, 'position');
      const size = this.components.getComponent<SizeComponent>(entityId, 'size');
      const renderable = this.components.getComponent<RenderableComponent>(entityId, 'renderable');
      
      if (position && size && renderable && renderable.visible !== false) {
        this.renderableEntities.push({
          id: entityId,
          position,
          size,
          renderable
        });
      }
    }
    
    // Sort by z-index
    this.renderableEntities.sort((a, b) => (a.renderable.zIndex || 0) - (b.renderable.zIndex || 0));
    
    if (gameConfig.debug.showSystemLogs) {
      console.log(`🎨 RenderSystem: Rendering ${this.renderableEntities.length} entities (reason: ${reason})`);
    }
    
    this.eventBus.emit(ECSEventTypes.RENDER_FRAME_READY, { 
      entities: this.renderableEntities,
      reason 
    });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  getRenderableEntities() {
    return [...this.renderableEntities];
  }
}

// ========== ANIMATION SYSTEM ==========

export class AnimationSystem implements System {
  readonly name = 'AnimationSystem';
  readonly requiredComponents = ['renderable', 'animation'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    const animatedEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of animatedEntities) {
      const animation = components.getComponent<AnimationComponent>(entityId, 'animation');
      const renderable = components.getComponent<RenderableComponent>(entityId, 'renderable');
      
      if (!animation || !renderable || !animation.isPlaying) continue;
      
      const currentAnimData = animation.animations[animation.currentAnimation];
      if (!currentAnimData) continue;
      
      // Update animation frame
      const now = Date.now();
      const frameTime = currentAnimData.duration / currentAnimData.frames.length;
      
      if (now - animation.lastFrameTime >= frameTime) {
        animation.currentFrame = (animation.currentFrame + 1) % currentAnimData.frames.length;
        animation.lastFrameTime = now;
        
        // Update renderable icon
        if (renderable.renderType === 'emoji') {
          renderable.icon = currentAnimData.frames[animation.currentFrame];
        }
        
        // Check if animation completed
        if (!currentAnimData.loop && animation.currentFrame === currentAnimData.frames.length - 1) {
          animation.isPlaying = false;
          events.emit('animation:completed', { entityId, animationName: animation.currentAnimation });
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}

// ========== MOVEMENT ANIMATION SYSTEM ==========

export class MovementAnimationSystem implements System {
  readonly name = 'MovementAnimationSystem';
  readonly requiredComponents = ['velocity', 'movement-animation', 'renderable'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    const animatedEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of animatedEntities) {
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      const movementAnim = components.getComponent<MovementAnimationComponent>(entityId, 'movement-animation');
      const renderable = components.getComponent<RenderableComponent>(entityId, 'renderable');
      
      if (!velocity || !movementAnim || !renderable) continue;
      
      const isCurrentlyMoving = velocity.x !== 0 || velocity.y !== 0;
      
      // Update movement state
      if (isCurrentlyMoving !== movementAnim.isMoving) {
        movementAnim.isMoving = isCurrentlyMoving;
        
        if (isCurrentlyMoving) {
          // Determine direction
          if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
            movementAnim.direction = velocity.x > 0 ? 'east' : 'west';
          } else {
            movementAnim.direction = velocity.y > 0 ? 'south' : 'north';
          }
          
          events.emit('movement-animation:started', { entityId, direction: movementAnim.direction });
        } else {
          movementAnim.direction = null;
          events.emit('movement-animation:stopped', { entityId });
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}
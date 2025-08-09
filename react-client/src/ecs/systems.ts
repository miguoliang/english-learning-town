/**
 * ECS Systems - Logic that operates on entities with specific components
 */

import type { System, Entity, ComponentManager, EventBus } from './core';
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

// ========== COLLISION SYSTEM ==========

export class CollisionSystem implements System {
  readonly name = 'CollisionSystem';
  readonly requiredComponents = ['position', 'size', 'collision'] as const;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: EventBus): void {
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
    if (!entitySize) return false;

    // Check collision with all other entities
    for (const otherEntity of entities) {
      if (otherEntity.id === entityId) continue;
      
      const otherPosition = components.getComponent<PositionComponent>(otherEntity.id, 'position');
      const otherSize = components.getComponent<SizeComponent>(otherEntity.id, 'size');
      const otherCollision = components.getComponent<CollisionComponent>(otherEntity.id, 'collision');
      
      if (!otherPosition || !otherSize || !otherCollision) continue;
      if (otherCollision.isWalkable) continue;
      
      // Check for overlap
      if (this.isOverlapping(
        { x, y, width: entitySize.width, height: entitySize.height },
        { x: otherPosition.x, y: otherPosition.y, width: otherSize.width, height: otherSize.height }
      )) {
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

  private collisionSystem = new CollisionSystem();

  update(entities: Entity[], components: ComponentManager, deltaTime: number, events: EventBus): void {
    const movingEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of movingEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      
      if (!position || !velocity) continue;
      
      // Apply velocity to position
      const deltaSeconds = deltaTime / 1000;
      const newX = position.x + velocity.x * deltaSeconds;
      const newY = position.y + velocity.y * deltaSeconds;
      
      // Check collision before moving
      if (this.collisionSystem.canMoveTo(entityId, newX, newY, entities, components)) {
        position.x = newX;
        position.y = newY;
        
        // Emit movement event
        events.emit('entity:moved', { entityId, newPosition: { x: newX, y: newY } });
      } else {
        // Stop velocity if collision detected
        velocity.x = 0;
        velocity.y = 0;
        events.emit('entity:collision', { entityId, blockedPosition: { x: newX, y: newY } });
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}

// ========== KEYBOARD INPUT SYSTEM ==========

export class KeyboardInputSystem implements System {
  readonly name = 'KeyboardInputSystem';
  readonly requiredComponents = ['input', 'velocity'] as const;

  private inputState = new Map<string, boolean>();

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, _events: EventBus): void {
    const controllableEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of controllableEntities) {
      const inputComponent = components.getComponent<InputComponent>(entityId, 'input');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      
      if (!inputComponent || !velocity || !inputComponent.controllable) continue;
      
      // Handle player input
      if (inputComponent.inputType === 'player') {
        this.handlePlayerInput(velocity);
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private handlePlayerInput(velocity: VelocityComponent): void {
    const speed = velocity.maxSpeed || 5;
    velocity.x = 0;
    velocity.y = 0;
    
    if (this.inputState.get('ArrowUp') || this.inputState.get('KeyW')) {
      velocity.y = -speed;
    }
    if (this.inputState.get('ArrowDown') || this.inputState.get('KeyS')) {
      velocity.y = speed;
    }
    if (this.inputState.get('ArrowLeft') || this.inputState.get('KeyA')) {
      velocity.x = -speed;
    }
    if (this.inputState.get('ArrowRight') || this.inputState.get('KeyD')) {
      velocity.x = speed;
    }
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

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: EventBus): void {
    // Mouse input system is event-driven, no regular update needed
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  handleMouseClick(x: number, y: number, _entities: Entity[], components: ComponentManager, events: EventBus): void {
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
        const speed = velocity.maxSpeed || 5;
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

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: EventBus): void {
    // This system is primarily event-driven, so update does minimal work
    // Most interaction logic happens in response to input events
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  // Handle interaction attempts
  handleInteraction(initiatorId: string, targetId: string, components: ComponentManager, events: EventBus): void {
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

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: EventBus): void {
    // Collect renderable entities and sort by z-index
    this.renderableEntities = [];
    
    const renderableEntityIds = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of renderableEntityIds) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const size = components.getComponent<SizeComponent>(entityId, 'size');
      const renderable = components.getComponent<RenderableComponent>(entityId, 'renderable');
      
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
    
    events.emit('render:frame-ready', { entities: this.renderableEntities });
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

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: EventBus): void {
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

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: EventBus): void {
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
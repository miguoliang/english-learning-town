/**
 * MovementSystem - Handles entity movement based on velocity
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  VelocityComponent
} from '../components';
import { ECSEventTypes } from '../events';
import { CollisionSystem } from './CollisionSystem';

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

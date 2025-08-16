/**
 * CollisionSystem - Handles collision detection and validation
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  SizeComponent,
  CollisionComponent
} from '../components';
import { logger } from '../../utils/logger';

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
      logger.warn(`CollisionSystem: Entity ${entityId} has no size component`);
      return false;
    }

    // Check collision with all other entities
    for (const otherEntity of entities) {
      if (otherEntity.id === entityId) continue;
      
      const otherPosition = components.getComponent<PositionComponent>(otherEntity.id, 'position');
      const otherSize = components.getComponent<SizeComponent>(otherEntity.id, 'size');
      const otherCollision = components.getComponent<CollisionComponent>(otherEntity.id, 'collision');
      
      if (!otherPosition || !otherSize || !otherCollision) continue;

      // Skip entities that are walkable
      if (otherCollision.isWalkable) continue;

      // Check if the proposed position would overlap with this entity
      if (this.wouldCollide(x, y, entitySize.width, entitySize.height, 
                           otherPosition.x, otherPosition.y, otherSize.width, otherSize.height)) {
        logger.ecs(`Collision detected: ${entityId} cannot move to (${x}, ${y}) - blocked by ${otherEntity.id}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Check if two rectangles would overlap
   */
  private wouldCollide(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * Get all entities that collide with a given position and size
   */
  getCollidingEntities(
    x: number, y: number, width: number, height: number,
    entities: Entity[], components: ComponentManager,
    excludeEntityId?: string
  ): Entity[] {
    const collidingEntities: Entity[] = [];

    for (const entity of entities) {
      if (excludeEntityId && entity.id === excludeEntityId) continue;
      
      const position = components.getComponent<PositionComponent>(entity.id, 'position');
      const size = components.getComponent<SizeComponent>(entity.id, 'size');
      const collision = components.getComponent<CollisionComponent>(entity.id, 'collision');
      
      if (!position || !size || !collision) continue;

      if (this.wouldCollide(x, y, width, height, 
                           position.x, position.y, size.width, size.height)) {
        collidingEntities.push(entity);
      }
    }

    return collidingEntities;
  }
}

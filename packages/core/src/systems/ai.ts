/**
 * AI System - Artificial Intelligence and NPC Behavior
 * Handles NPC artificial intelligence, pathfinding, and behavioral patterns
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  VelocityComponent,
  AIComponent
} from '../components';

/**
 * AI System - Handles NPC artificial intelligence and behavior
 */
export class AISystem implements System {
  readonly name = 'AISystem';
  readonly requiredComponents = ['position', 'ai', 'velocity'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    const aiEntities = components.getEntitiesWithComponents(this.requiredComponents);
    const currentTime = Date.now();

    for (const entityId of aiEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const ai = components.getComponent<AIComponent>(entityId, 'ai');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');

      if (!position || !ai || !velocity) continue;

      // Check if enough time has passed for next decision
      if (currentTime - ai.lastDecisionTime < ai.decisionCooldown) continue;

      this.updateAIBehavior(entityId, position, ai, velocity, _entities, components, _events);
      ai.lastDecisionTime = currentTime;
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private updateAIBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager,
    _events: Emitter<ECSEvents>
  ): void {
    switch (ai.behaviorType) {
      case 'idle':
        this.handleIdleBehavior(velocity);
        break;
      case 'patrol':
        this.handlePatrolBehavior(position, ai, velocity);
        break;
      case 'chase':
        this.handleChaseBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'flee':
        this.handleFleeBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'guard':
        this.handleGuardBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'follow':
        this.handleFollowBehavior(entityId, position, ai, velocity, entities, components);
        break;
    }
  }

  private handleIdleBehavior(velocity: VelocityComponent): void {
    velocity.x = 0;
    velocity.y = 0;
  }

  private handlePatrolBehavior(position: PositionComponent, ai: AIComponent, velocity: VelocityComponent): void {
    if (!ai.patrolPoints || ai.patrolPoints.length === 0) {
      this.handleIdleBehavior(velocity);
      return;
    }

    const currentIndex = ai.currentPatrolIndex || 0;
    const targetPoint = ai.patrolPoints[currentIndex];
    const distance = Math.sqrt(
      Math.pow(targetPoint.x - position.x, 2) + Math.pow(targetPoint.y - position.y, 2)
    );

    if (distance < 1) {
      // Reached patrol point, move to next
      ai.currentPatrolIndex = (currentIndex + 1) % ai.patrolPoints.length;
    } else {
      // Move towards current patrol point
      const direction = {
        x: (targetPoint.x - position.x) / distance,
        y: (targetPoint.y - position.y) / distance
      };
      velocity.x = direction.x * ai.speed;
      velocity.y = direction.y * ai.speed;
    }
  }

  private handleChaseBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const target = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (target) {
      ai.target = target.id;
      const targetPos = components.getComponent<PositionComponent>(target.id, 'position');
      if (targetPos) {
        const distance = Math.sqrt(
          Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
        );
        
        if (distance > 0.5) {
          const direction = {
            x: (targetPos.x - position.x) / distance,
            y: (targetPos.y - position.y) / distance
          };
          velocity.x = direction.x * ai.speed;
          velocity.y = direction.y * ai.speed;
        }
      }
    } else {
      delete ai.target;
      this.handleIdleBehavior(velocity);
    }
  }

  private handleFleeBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const threat = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (threat) {
      const threatPos = components.getComponent<PositionComponent>(threat.id, 'position');
      if (threatPos) {
        const distance = Math.sqrt(
          Math.pow(threatPos.x - position.x, 2) + Math.pow(threatPos.y - position.y, 2)
        );
        
        // Flee in opposite direction
        const direction = {
          x: (position.x - threatPos.x) / distance,
          y: (position.y - threatPos.y) / distance
        };
        velocity.x = direction.x * ai.speed;
        velocity.y = direction.y * ai.speed;
      }
    } else {
      this.handleIdleBehavior(velocity);
    }
  }

  private handleGuardBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const intruder = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (intruder) {
      // Switch to chase behavior temporarily
      ai.state = 'alerting';
      this.handleChaseBehavior(entityId, position, ai, velocity, entities, components);
    } else {
      ai.state = 'guarding';
      this.handleIdleBehavior(velocity);
    }
  }

  private handleFollowBehavior(
    _entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    _entities: Entity[],
    components: ComponentManager
  ): void {
    if (ai.target) {
      const targetPos = components.getComponent<PositionComponent>(ai.target, 'position');
      if (targetPos) {
        const distance = Math.sqrt(
          Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
        );
        
        // Follow at a distance
        if (distance > 3) {
          const direction = {
            x: (targetPos.x - position.x) / distance,
            y: (targetPos.y - position.y) / distance
          };
          velocity.x = direction.x * ai.speed;
          velocity.y = direction.y * ai.speed;
        } else {
          this.handleIdleBehavior(velocity);
        }
      }
    }
  }

  private findNearestTarget(
    entityId: string,
    position: PositionComponent,
    range: number,
    entities: Entity[],
    components: ComponentManager,
    targetType: string
  ): Entity | null {
    let nearestTarget: Entity | null = null;
    let nearestDistance = range;

    for (const entity of entities) {
      if (entity.id === entityId) continue;
      
      // Check if entity has the target component type
      if (!components.hasComponent(entity.id, targetType)) continue;
      
      const targetPos = components.getComponent<PositionComponent>(entity.id, 'position');
      if (!targetPos) continue;

      const distance = Math.sqrt(
        Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = entity;
      }
    }

    return nearestTarget;
  }
}
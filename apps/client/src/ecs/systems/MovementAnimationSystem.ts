/**
 * MovementAnimationSystem - Handles movement-based animation state changes
 */

import type { 
  System, 
  Entity, 
  ComponentManager,
  Emitter,
  ECSEvents,
  VelocityComponent,
  MovementAnimationComponent,
  RenderableComponent
} from '@elt/core';

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

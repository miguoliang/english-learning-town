/**
 * Physics System - Advanced Physics Simulation
 * Handles forces, gravity, collision, and physics-based movement
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  VelocityComponent,
  PhysicsComponent,
  ForceComponent
} from '../components';

/**
 * Physics System - Handles advanced physics simulation
 */
export class PhysicsSystem implements System {
  readonly name = 'PhysicsSystem';
  readonly requiredComponents = ['position', 'velocity', 'physics'] as const;

  update(_entities: Entity[], components: ComponentManager, deltaTime: number, _events: Emitter<ECSEvents>): void {
    const physicsEntities = components.getEntitiesWithComponents(this.requiredComponents);
    const dt = deltaTime / 1000; // Convert to seconds

    for (const entityId of physicsEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      const physics = components.getComponent<PhysicsComponent>(entityId, 'physics');

      if (!position || !velocity || !physics) continue;
      if (physics.isStatic) continue;

      this.applyPhysics(entityId, position, velocity, physics, dt, components);
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private applyPhysics(
    entityId: string,
    position: PositionComponent,
    velocity: VelocityComponent,
    physics: PhysicsComponent,
    deltaTime: number,
    components: ComponentManager
  ): void {
    // Apply gravity
    if (physics.gravityScale > 0) {
      velocity.y += 9.81 * physics.gravityScale * deltaTime;
    }

    // Apply forces
    const force = components.getComponent<ForceComponent>(entityId, 'force');
    if (force) {
      for (let i = force.forces.length - 1; i >= 0; i--) {
        const f = force.forces[i];
        
        // Apply force based on mass (F = ma, so a = F/m)
        velocity.x += (f.x / physics.mass) * deltaTime;
        velocity.y += (f.y / physics.mass) * deltaTime;

        // Update force duration
        f.duration -= deltaTime * 1000; // Convert back to milliseconds
        
        // Remove expired forces
        if (f.duration <= 0 && f.type === 'impulse') {
          force.forces.splice(i, 1);
        }
      }
    }

    // Apply damping
    velocity.x *= (1 - physics.linearDamping * deltaTime);
    velocity.y *= (1 - physics.linearDamping * deltaTime);

    // Apply friction when on ground
    if (Math.abs(velocity.y) < 0.1) {
      velocity.x *= (1 - physics.friction * deltaTime);
    }

    // Update position
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
  }

  addForce(entityId: string, forceX: number, forceY: number, duration: number, type: 'impulse' | 'continuous', components: ComponentManager): void {
    let force = components.getComponent<ForceComponent>(entityId, 'force');
    
    if (!force) {
      // Create force component if it doesn't exist
      const newForce: ForceComponent = {
        type: 'force',
        forces: []
      };
      components.addComponent(entityId, newForce);
      force = newForce;
    }

    force.forces.push({
      x: forceX,
      y: forceY,
      duration,
      type
    });
  }
}
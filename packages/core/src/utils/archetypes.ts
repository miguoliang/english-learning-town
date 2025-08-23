/**
 * Entity Archetypes - Predefined entity creation patterns
 * Factory functions for common game entity types
 */

import type { World, Entity } from "../core";
import {
  createPositionComponent,
  createSizeComponent,
  createVelocityComponent,
  createCollisionComponent,
  createRenderableComponent,
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent,
  createInteractiveComponent,
  createInputComponent,
  createHealthComponent,
  createAIComponent,
  createMovementAnimationComponent,
  createPhysicsComponent,
  createAudioComponent,
} from "../components";

/**
 * Predefined entity archetypes for common game objects
 */
export class EntityArchetypes {
  static createPlayer(
    world: World,
    id: string,
    position: { x: number; y: number },
    name = "Player",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(1, 1));
    world.addComponent(entity.id, createVelocityComponent(0, 0, 5));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon: "🧑", zIndex: 10 }),
    );
    world.addComponent(entity.id, createPlayerComponent(name));
    world.addComponent(entity.id, createInputComponent("player", true));
    world.addComponent(entity.id, createHealthComponent(100, 100, 1));
    world.addComponent(entity.id, createMovementAnimationComponent());

    return entity;
  }

  static createNPC(
    world: World,
    id: string,
    position: { x: number; y: number },
    name: string,
    role: string,
    icon = "🧝",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(1, 1));
    world.addComponent(entity.id, createVelocityComponent(0, 0, 2));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon, zIndex: 5 }),
    );
    world.addComponent(entity.id, createNPCComponent(name, role));
    world.addComponent(
      entity.id,
      createInteractiveComponent("dialogue", { requiresAdjacency: true }),
    );
    world.addComponent(entity.id, createHealthComponent(50, 50));
    world.addComponent(entity.id, createAIComponent("idle", 3, 1));

    return entity;
  }

  static createBuilding(
    world: World,
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number },
    name: string,
    buildingType:
      | "educational"
      | "commercial"
      | "residential"
      | "social"
      | "storage",
    icon = "🏢",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(size.width, size.height));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon, zIndex: 1 }),
    );
    world.addComponent(entity.id, createBuildingComponent(name, buildingType));
    world.addComponent(
      entity.id,
      createInteractiveComponent("building-entrance", {
        requiresAdjacency: true,
        interactionRange: 2,
      }),
    );

    return entity;
  }

  static createProjectile(
    world: World,
    id: string,
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    icon = "💥",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(0.3, 0.3));
    world.addComponent(
      entity.id,
      createVelocityComponent(velocity.x, velocity.y, 20),
    );
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon, zIndex: 8 }),
    );
    world.addComponent(entity.id, createPhysicsComponent(0.1, 0, 0.8, false));

    return entity;
  }

  static createPickup(
    world: World,
    id: string,
    position: { x: number; y: number },
    _itemType: string,
    icon = "💎",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(0.5, 0.5));
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon, zIndex: 3 }),
    );
    world.addComponent(
      entity.id,
      createInteractiveComponent("quest", {
        requiresAdjacency: false,
        interactionRange: 1.5,
      }),
    );

    return entity;
  }

  static createParticle(
    world: World,
    id: string,
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    _lifetime: number,
    icon = "✨",
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(0.2, 0.2));
    world.addComponent(
      entity.id,
      createVelocityComponent(velocity.x, velocity.y, 10),
    );
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon, zIndex: 9 }),
    );
    world.addComponent(
      entity.id,
      createPhysicsComponent(0.01, 0.1, 0.3, false),
    );

    return entity;
  }

  static createSoundSource(
    world: World,
    id: string,
    position: { x: number; y: number },
    soundId: string,
    _range = 10,
  ): Entity {
    const entity = world.createEntity(id);

    world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    world.addComponent(entity.id, createSizeComponent(0.1, 0.1));
    world.addComponent(entity.id, createAudioComponent(soundId, 1, true));

    return entity;
  }
}

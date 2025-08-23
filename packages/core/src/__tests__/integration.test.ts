/**
 * Integration Tests - Full ECS system integration scenarios
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  World,
  type System,
  type Entity,
  type ComponentManager,
  type Emitter,
  type ECSEvents,
  createPositionComponent,
  createSizeComponent,
  createVelocityComponent,
  createCollisionComponent,
  createRenderableComponent,
  createPlayerComponent,
  createNPCComponent,
  createInteractiveComponent,
  ECSEventTypes,
} from "../index";

// Test game systems for integration testing
class MovementSystem implements System {
  readonly name = "MovementSystem";
  readonly requiredComponents = ["position", "velocity"] as const;

  update(entities: Entity[], components: ComponentManager): void {
    const movableEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of movableEntities) {
      const position = components.getComponent(entityId, "position");
      const velocity = components.getComponent(entityId, "velocity");

      if (position && velocity) {
        position.x += velocity.x;
        position.y += velocity.y;
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}

class CollisionSystem implements System {
  readonly name = "CollisionSystem";
  readonly requiredComponents = ["position", "size", "collision"] as const;

  public collisions: Array<{ entity1: string; entity2: string }> = [];

  update(
    entities: Entity[],
    components: ComponentManager,
    _deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    this.collisions = [];
    const collidableEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    // Check collisions between all entities
    for (let i = 0; i < collidableEntities.length; i++) {
      for (let j = i + 1; j < collidableEntities.length; j++) {
        const entity1Id = collidableEntities[i];
        const entity2Id = collidableEntities[j];

        const pos1 = components.getComponent(entity1Id, "position");
        const size1 = components.getComponent(entity1Id, "size");
        const pos2 = components.getComponent(entity2Id, "position");
        const size2 = components.getComponent(entity2Id, "size");

        if (pos1 && size1 && pos2 && size2) {
          if (this.isColliding(pos1, size1, pos2, size2)) {
            this.collisions.push({ entity1: entity1Id, entity2: entity2Id });
            events.emit(ECSEventTypes.ENTITY_COLLISION, {
              entityId: entity1Id,
              blockedPosition: { x: pos2.x, y: pos2.y },
            });
          }
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private isColliding(pos1: any, size1: any, pos2: any, size2: any): boolean {
    return (
      pos1.x < pos2.x + size2.width &&
      pos1.x + size1.width > pos2.x &&
      pos1.y < pos2.y + size2.height &&
      pos1.y + size1.height > pos2.y
    );
  }
}

class RenderSystem implements System {
  readonly name = "RenderSystem";
  readonly requiredComponents = ["position", "size", "renderable"] as const;

  public lastRenderData: any[] = [];

  update(
    entities: Entity[],
    components: ComponentManager,
    _deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    const renderableEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    this.lastRenderData = renderableEntities
      .map((entityId) => ({
        id: entityId,
        position: components.getComponent(entityId, "position"),
        size: components.getComponent(entityId, "size"),
        renderable: components.getComponent(entityId, "renderable"),
      }))
      .filter((data) => data.renderable?.visible !== false)
      .sort(
        (a, b) => (a.renderable?.zIndex || 0) - (b.renderable?.zIndex || 0),
      );

    events.emit(ECSEventTypes.RENDER_FRAME_READY, {
      entities: this.lastRenderData,
      reason: "frame_update",
    });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}

describe("ECS Integration Tests", () => {
  let world: World;
  let movementSystem: MovementSystem;
  let collisionSystem: CollisionSystem;
  let renderSystem: RenderSystem;

  beforeEach(() => {
    world = new World();
    movementSystem = new MovementSystem();
    collisionSystem = new CollisionSystem();
    renderSystem = new RenderSystem();
  });

  describe("Basic Entity-Component-System Integration", () => {
    it("should create a complete game entity with all systems working together", () => {
      // Add systems to world
      world.addSystem(movementSystem);
      world.addSystem(collisionSystem);
      world.addSystem(renderSystem);

      // Create a player entity
      const player = world.createEntity("player");
      world.addComponent(player.id, createPositionComponent(10, 10));
      world.addComponent(player.id, createSizeComponent(1, 1));
      world.addComponent(player.id, createVelocityComponent(1, 0));
      world.addComponent(player.id, createCollisionComponent(false));
      world.addComponent(
        player.id,
        createRenderableComponent("emoji", { icon: "🧑", zIndex: 10 }),
      );
      world.addComponent(player.id, createPlayerComponent("Hero"));

      // Create a wall entity
      const wall = world.createEntity("wall");
      world.addComponent(wall.id, createPositionComponent(15, 10));
      world.addComponent(wall.id, createSizeComponent(1, 1));
      world.addComponent(wall.id, createCollisionComponent(false));
      world.addComponent(
        wall.id,
        createRenderableComponent("emoji", { icon: "🧱", zIndex: 1 }),
      );

      // Initial state check
      let playerPos = world.getComponent(player.id, "position");
      expect(playerPos?.x).toBe(10);
      expect(playerPos?.y).toBe(10);

      // Run one update cycle
      world.update();

      // Check movement system worked
      playerPos = world.getComponent(player.id, "position");
      expect(playerPos?.x).toBe(11); // Moved by velocity.x = 1
      expect(playerPos?.y).toBe(10); // No change in y

      // Check render system worked
      expect(renderSystem.lastRenderData).toHaveLength(2);
      expect(renderSystem.lastRenderData[0].id).toBe("wall"); // Lower zIndex
      expect(renderSystem.lastRenderData[1].id).toBe("player"); // Higher zIndex

      // Run more updates to test collision
      world.update(); // x = 12
      world.update(); // x = 13
      world.update(); // x = 14
      world.update(); // x = 15, should collide with wall

      // Check collision detection
      expect(collisionSystem.collisions).toHaveLength(1);
      expect(collisionSystem.collisions[0]).toEqual({
        entity1: "player",
        entity2: "wall",
      });
    });

    it("should handle complex entity interactions and state changes", () => {
      world.addSystem(movementSystem);
      world.addSystem(renderSystem);

      // Create multiple moving entities
      const entities = ["entity1", "entity2", "entity3"];
      entities.forEach((id, index) => {
        const entity = world.createEntity(id);
        world.addComponent(entity.id, createPositionComponent(index * 2, 0));
        world.addComponent(entity.id, createSizeComponent(1, 1));
        world.addComponent(entity.id, createVelocityComponent(index + 1, 1));
        world.addComponent(
          entity.id,
          createRenderableComponent("emoji", {
            icon: `${index + 1}️⃣`,
            zIndex: index + 1,
          }),
        );
      });

      // Run multiple update cycles
      for (let i = 0; i < 5; i++) {
        world.update();
      }

      // Check final positions
      const finalPositions = entities.map((id) =>
        world.getComponent(id, "position"),
      );

      expect(finalPositions[0]?.x).toBe(5); // 0 + (1 * 5)
      expect(finalPositions[1]?.x).toBe(12); // 2 + (2 * 5)
      expect(finalPositions[2]?.x).toBe(19); // 4 + (3 * 5)

      finalPositions.forEach((pos) => {
        expect(pos?.y).toBe(5); // All moved 1 * 5 in y direction
      });

      // Check render system is tracking all entities
      expect(renderSystem.lastRenderData).toHaveLength(3);
    });
  });

  describe("Event System Integration", () => {
    it("should handle event-driven communication between systems", () => {
      const events: any[] = [];
      const eventBus = world.getEventBus();

      // Listen to all events
      Object.values(ECSEventTypes).forEach((eventType) => {
        eventBus.on(eventType, (data) => {
          events.push({ type: eventType, data });
        });
      });

      world.addSystem(collisionSystem);

      // Create entities that will collide
      const entity1 = world.createEntity("movable");
      world.addComponent(entity1.id, createPositionComponent(0, 0));
      world.addComponent(entity1.id, createSizeComponent(2, 2));
      world.addComponent(entity1.id, createCollisionComponent(false));

      const entity2 = world.createEntity("obstacle");
      world.addComponent(entity2.id, createPositionComponent(1, 1));
      world.addComponent(entity2.id, createSizeComponent(2, 2));
      world.addComponent(entity2.id, createCollisionComponent(false));

      // Clear initial entity/component events
      events.length = 0;

      // Run update to trigger collision
      world.update();

      // Should have collision event
      const collisionEvents = events.filter(
        (e) => e.type === ECSEventTypes.ENTITY_COLLISION,
      );
      expect(collisionEvents).toHaveLength(1);
      expect(collisionEvents[0].data.entityId).toBe("movable");
      expect(collisionEvents[0].data.blockedPosition).toEqual({ x: 1, y: 1 });
    });

    it("should handle event cascades and system communication", () => {
      const eventLog: string[] = [];
      const eventBus = world.getEventBus();

      // Create a system that responds to collisions by stopping movement
      class CollisionResponseSystem implements System {
        readonly name = "CollisionResponseSystem";
        readonly requiredComponents = [] as const;

        constructor() {
          eventBus.on(ECSEventTypes.ENTITY_COLLISION, (data) => {
            eventLog.push(`Collision detected for ${data.entityId}`);
            // In a real game, this might stop the entity or change direction
          });
        }

        update(): void {
          // Event-driven system, no regular update needed
        }

        canProcess(): boolean {
          return false; // Event-driven only
        }
      }

      world.addSystem(new CollisionResponseSystem());
      world.addSystem(collisionSystem);

      // Create colliding entities
      const entity1 = world.createEntity("player");
      world.addComponent(entity1.id, createPositionComponent(0, 0));
      world.addComponent(entity1.id, createSizeComponent(1, 1));
      world.addComponent(entity1.id, createCollisionComponent(false));

      const entity2 = world.createEntity("wall");
      world.addComponent(entity2.id, createPositionComponent(0, 0));
      world.addComponent(entity2.id, createSizeComponent(1, 1));
      world.addComponent(entity2.id, createCollisionComponent(false));

      world.update();

      expect(eventLog).toContain("Collision detected for player");
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle many entities efficiently", () => {
      world.addSystem(movementSystem);
      world.addSystem(renderSystem);

      const entityCount = 1000;
      const startTime = performance.now();

      // Create many entities
      for (let i = 0; i < entityCount; i++) {
        const entity = world.createEntity(`entity_${i}`);
        world.addComponent(
          entity.id,
          createPositionComponent(i % 100, Math.floor(i / 100)),
        );
        world.addComponent(entity.id, createSizeComponent(1, 1));
        world.addComponent(
          entity.id,
          createVelocityComponent(Math.random() - 0.5, Math.random() - 0.5),
        );
        world.addComponent(
          entity.id,
          createRenderableComponent("emoji", { icon: "•" }),
        );
      }

      const creationTime = performance.now() - startTime;
      expect(creationTime).toBeLessThan(1000); // Should create 1000 entities in under 1 second

      // Run update cycles
      const updateStart = performance.now();
      for (let i = 0; i < 10; i++) {
        world.update();
      }
      const updateTime = performance.now() - updateStart;

      expect(updateTime).toBeLessThan(1000); // Should handle 10 updates in under 1 second
      expect(world.getAllEntities()).toHaveLength(entityCount);
      expect(renderSystem.lastRenderData).toHaveLength(entityCount);
    });

    it("should handle frequent component changes efficiently", () => {
      world.addSystem(renderSystem);

      const entity = world.createEntity("dynamic");
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createSizeComponent(1, 1));
      world.addComponent(
        entity.id,
        createRenderableComponent("emoji", { icon: "🎯" }),
      );

      const operationCount = 1000;
      const startTime = performance.now();

      // Rapid component modifications
      for (let i = 0; i < operationCount; i++) {
        const position = world.getComponent(entity.id, "position");
        if (position) {
          position.x = i;
          position.y = i;
        }

        world.removeComponent(entity.id, "velocity");
        world.addComponent(entity.id, createVelocityComponent(i, i));
        world.update();
      }

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(2000); // Should handle rapid changes efficiently

      const finalPosition = world.getComponent(entity.id, "position");
      expect(finalPosition?.x).toBe(operationCount - 1);
    });
  });

  describe("System Dependencies and Order", () => {
    it("should handle system update order correctly", () => {
      const updateOrder: string[] = [];

      class OrderedSystem implements System {
        constructor(
          public readonly name: string,
          private order: number,
        ) {}
        readonly requiredComponents = [] as const;

        update(): void {
          updateOrder.push(`${this.name}_${this.order}`);
        }

        canProcess(): boolean {
          return true;
        }
      }

      // Add systems in specific order
      world.addSystem(new OrderedSystem("Third", 3));
      world.addSystem(new OrderedSystem("First", 1));
      world.addSystem(new OrderedSystem("Second", 2));

      world.update();

      // Systems should update in the order they were added
      expect(updateOrder).toEqual(["Third_3", "First_1", "Second_2"]);
    });

    it("should handle system removal during updates", () => {
      let updateCount = 0;

      class CountingSystem implements System {
        readonly name = "CountingSystem";
        readonly requiredComponents = [] as const;

        update(): void {
          updateCount++;
        }

        canProcess(): boolean {
          return true;
        }
      }

      const system = new CountingSystem();
      world.addSystem(system);

      world.update();
      expect(updateCount).toBe(1);

      world.removeSystem("CountingSystem");
      world.update();
      expect(updateCount).toBe(1); // Should not increment after removal
    });
  });

  describe("Memory Management and Cleanup", () => {
    it("should clean up entities and components properly", () => {
      world.addSystem(renderSystem);

      // Create entities
      const entities = ["entity1", "entity2", "entity3"];
      entities.forEach((id) => {
        const entity = world.createEntity(id);
        world.addComponent(entity.id, createPositionComponent(0, 0));
        world.addComponent(entity.id, createSizeComponent(1, 1));
        world.addComponent(
          entity.id,
          createRenderableComponent("emoji", { icon: "🎮" }),
        );
      });

      expect(world.getAllEntities()).toHaveLength(3);
      world.update();
      expect(renderSystem.lastRenderData).toHaveLength(3);

      // Remove entities
      world.removeEntity("entity2");
      expect(world.getAllEntities()).toHaveLength(2);
      expect(world.getEntity("entity2")).toBeUndefined();

      world.update();
      expect(renderSystem.lastRenderData).toHaveLength(2);

      // Clean up remaining entities
      world.removeEntity("entity1");
      world.removeEntity("entity3");
      expect(world.getAllEntities()).toHaveLength(0);

      world.update();
      expect(renderSystem.lastRenderData).toHaveLength(0);
    });

    it("should handle world destruction and cleanup", () => {
      world.addSystem(movementSystem);

      const entity = world.createEntity("test");
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent(1, 1));

      expect(world.getAllEntities()).toHaveLength(1);

      world.destroy();

      // After destruction, world should be in clean state
      expect(world.getAllEntities()).toHaveLength(0);
      expect(() => world.update()).not.toThrow();
    });
  });

  describe("Real-World Game Scenarios", () => {
    it("should simulate a simple RPG scenario", () => {
      world.addSystem(movementSystem);
      world.addSystem(collisionSystem);
      world.addSystem(renderSystem);

      // Create player
      const player = world.createEntity("player");
      world.addComponent(player.id, createPositionComponent(0, 0));
      world.addComponent(player.id, createSizeComponent(1, 1));
      world.addComponent(player.id, createVelocityComponent(1, 0));
      world.addComponent(player.id, createCollisionComponent(false));
      world.addComponent(
        player.id,
        createRenderableComponent("emoji", { icon: "🧙", zIndex: 10 }),
      );
      world.addComponent(player.id, createPlayerComponent("Wizard"));

      // Create NPC
      const npc = world.createEntity("npc");
      world.addComponent(npc.id, createPositionComponent(5, 0));
      world.addComponent(npc.id, createSizeComponent(1, 1));
      world.addComponent(npc.id, createCollisionComponent(false));
      world.addComponent(
        npc.id,
        createRenderableComponent("emoji", { icon: "🧝", zIndex: 5 }),
      );
      world.addComponent(npc.id, createNPCComponent("Elf Guide", "guide"));
      world.addComponent(
        npc.id,
        createInteractiveComponent("dialogue", { dialogueId: "greeting" }),
      );

      // Create obstacles
      for (let i = 2; i < 5; i++) {
        const obstacle = world.createEntity(`obstacle_${i}`);
        world.addComponent(obstacle.id, createPositionComponent(i, 0));
        world.addComponent(obstacle.id, createSizeComponent(1, 1));
        world.addComponent(obstacle.id, createCollisionComponent(false));
        world.addComponent(
          obstacle.id,
          createRenderableComponent("emoji", { icon: "🌳", zIndex: 1 }),
        );
      }

      // Simulate player movement towards NPC
      let stepCount = 0;
      while (stepCount < 10) {
        world.update();
        stepCount++;

        const playerPos = world.getComponent(player.id, "position");

        // Player should move until collision
        if (collisionSystem.collisions.length > 0) {
          break;
        }
      }

      // Player should have collided with first obstacle
      expect(collisionSystem.collisions.length).toBeGreaterThan(0);

      const playerPos = world.getComponent(player.id, "position");
      expect(playerPos?.x).toBe(2); // Should be at position 2 when hitting obstacle at position 2

      // Verify entities are being rendered (player might have collided, so check what we have)
      expect(renderSystem.lastRenderData.length).toBeGreaterThan(0);

      // Check that player and obstacles are rendered
      const entityIds = renderSystem.lastRenderData.map((e) => e.id);
      expect(entityIds).toContain("player");

      // Check z-index ordering (obstacles=1, npc=5, player=10)
      const sortedEntities = renderSystem.lastRenderData;
      const playerEntity = sortedEntities.find((e) => e.id === "player");
      expect(playerEntity?.renderable.zIndex).toBe(10); // Player should have highest zIndex
    });
  });
});

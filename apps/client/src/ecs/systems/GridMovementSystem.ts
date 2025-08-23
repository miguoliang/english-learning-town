/**
 * GridMovementSystem - Handles discrete grid-based player movement
 */

import type {
  System,
  Entity,
  ComponentManager,
  Emitter,
  ECSEvents,
  PositionComponent,
} from "@elt/core";
import { ECSEventTypes } from "@elt/core";
import { CollisionSystem } from "./CollisionSystem";

export class GridMovementSystem implements System {
  readonly name = "GridMovementSystem";
  readonly requiredComponents = [] as const; // Event-driven system, no specific component requirements

  private isInitialized = false;

  constructor(private collisionSystem: CollisionSystem) {
    // Validate dependencies
    if (!this.collisionSystem) {
      throw new Error("GridMovementSystem requires CollisionSystem dependency");
    }
  }

  update(
    _entities: Entity[],
    components: ComponentManager,
    _deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    // Initialize event listeners once
    if (!this.isInitialized) {
      this.setupEventListeners(events, components);
      this.isInitialized = true;
    }

    // This system is now purely event-driven, no regular updates needed
  }

  canProcess(_entity: Entity, _components: ComponentManager): boolean {
    return true; // Event-driven system doesn't process specific entities
  }

  private setupEventListeners(
    events: Emitter<ECSEvents>,
    components: ComponentManager,
  ): void {
    // Listen for specific movement keys
    events.on(ECSEventTypes.INPUT_KEY_DOWN, (data) => {
      this.handleMovementKey(data.key, components, events);
    });
  }

  private handleMovementKey(
    key: string,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): void {
    // Only handle movement keys
    const movementKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ];
    if (!movementKeys.includes(key)) return;

    // Find the player entity
    const playerEntities = components.getEntitiesWithComponent("player");
    if (playerEntities.length === 0) return;

    const playerId = playerEntities[0];
    const position = components.getComponent<PositionComponent>(
      playerId,
      "position",
    );
    if (!position) return;

    // Handle movement directly based on the key that was pressed
    this.handleGridMovementForKey(playerId, position, key, components, events);
  }

  private handleGridMovementForKey(
    entityId: string,
    position: PositionComponent,
    key: string,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): void {
    let newX = position.x;
    let newY = position.y;

    // Determine movement direction based on the specific key pressed
    switch (key) {
      case "ArrowUp":
      case "KeyW":
        newY = position.y - 1;
        break;
      case "ArrowDown":
      case "KeyS":
        newY = position.y + 1;
        break;
      case "ArrowLeft":
      case "KeyA":
        newX = position.x - 1;
        break;
      case "ArrowRight":
      case "KeyD":
        newX = position.x + 1;
        break;
      default:
        return; // Should not happen since we filter keys, but safety check
    }

    // Get all entities for collision checking
    const allEntities = this.getAllEntitiesFromComponentManager(components);

    // Use injected CollisionSystem to check if movement is valid
    if (
      this.collisionSystem.canMoveTo(
        entityId,
        newX,
        newY,
        allEntities,
        components,
      )
    ) {
      // Move directly - no velocity needed for grid movement
      const oldX = position.x;
      const oldY = position.y;
      position.x = newX;
      position.y = newY;

      // Emit movement event
      events.emit(ECSEventTypes.ENTITY_MOVED, {
        entityId,
        oldPosition: { x: oldX, y: oldY },
        newPosition: { x: newX, y: newY },
      });

      // Movement successful
    } else {
      // Emit collision event if movement is blocked
      events.emit(ECSEventTypes.ENTITY_COLLISION, {
        entityId,
        blockedPosition: { x: newX, y: newY },
      });

      // Movement blocked by collision
    }
  }

  private getAllEntitiesFromComponentManager(
    components: ComponentManager,
  ): Entity[] {
    // Get all entity IDs with any component
    const allEntityIds = new Set<string>();

    // Common component types to find all entities
    const componentTypes = [
      "position",
      "size",
      "collision",
      "renderable",
      "player",
      "npc",
      "building",
    ];

    for (const componentType of componentTypes) {
      const entityIds = components.getEntitiesWithComponent(componentType);
      entityIds.forEach((id) => allEntityIds.add(id));
    }

    // Convert to Entity objects
    return Array.from(allEntityIds).map((id) => ({ id }));
  }
}

/**
 * MouseInputSystem - Handles mouse click interactions
 */

import type {
  System,
  Entity,
  ComponentManager,
  Emitter,
  ECSEvents,
  PositionComponent,
  VelocityComponent,
} from "@elt/core";
import { getPlayerSpeed } from "../../config/gameConfig";

export class MouseInputSystem implements System {
  readonly name = "MouseInputSystem";
  readonly requiredComponents = ["player", "position", "velocity"] as const;

  update(
    _entities: Entity[],
    _components: ComponentManager,
    _deltaTime: number,
    _events: Emitter<ECSEvents>,
  ): void {
    // Mouse input system is event-driven, no regular update needed
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  handleMouseClick(
    x: number,
    y: number,
    _entities: Entity[],
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): void {
    // Find player entity
    const playerEntities = components.getEntitiesWithComponent("player");
    if (playerEntities.length === 0) return;

    const playerId = playerEntities[0];
    const playerPosition = components.getComponent<PositionComponent>(
      playerId,
      "position",
    );
    if (!playerPosition) return;

    // Calculate direction to click position
    const dx = x - playerPosition.x;
    const dy = y - playerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const velocity = components.getComponent<VelocityComponent>(
        playerId,
        "velocity",
      );
      if (velocity) {
        const speed = velocity.maxSpeed || getPlayerSpeed();
        velocity.x = (dx / distance) * speed;
        velocity.y = (dy / distance) * speed;

        events.emit("player:move-to", { targetX: x, targetY: y });
      }
    }
  }
}

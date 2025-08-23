/**
 * InteractionSystem - Handles various types of entity interactions
 */

import type {
  System,
  Entity,
  Emitter,
  ECSEvents,
  PositionComponent,
  InteractiveComponent,
} from "@elt/core";
import { ComponentManager } from "@elt/core";
import { ECSEventTypes } from "@elt/core";

export class InteractionSystem implements System {
  readonly name = "InteractionSystem";
  readonly requiredComponents = ["position", "interactive"] as const;

  private isInitialized = false;

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

    // This system is primarily event-driven, so update does minimal work
    // Most interaction logic happens in response to input events
  }

  private setupEventListeners(
    events: Emitter<ECSEvents>,
    components: ComponentManager,
  ): void {
    // Listen for player interaction events
    events.on(ECSEventTypes.PLAYER_INTERACTION, (data) => {
      this.handleInteraction(
        data.initiatorId,
        data.targetEntityId,
        components,
        events,
      );
    });
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  // Handle interaction attempts
  handleInteraction(
    initiatorId: string,
    targetId: string,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): void {
    const initiatorPos = components.getComponent<PositionComponent>(
      initiatorId,
      "position",
    );
    const targetPos = components.getComponent<PositionComponent>(
      targetId,
      "position",
    );
    const targetInteractive = components.getComponent<InteractiveComponent>(
      targetId,
      "interactive",
    );

    if (!initiatorPos || !targetPos || !targetInteractive) return;

    // Check if entities are close enough to interact
    const distance = this.calculateDistance(initiatorPos, targetPos);
    const maxRange = targetInteractive.interactionRange || 1;

    if (distance > maxRange) {
      events.emit("interaction:out-of-range", {
        initiatorId,
        targetId,
        distance,
        maxRange,
      });
      return;
    }

    // Handle different interaction types
    switch (targetInteractive.interactionType) {
      case "dialogue":
        if (targetInteractive.dialogueId) {
          events.emit("dialogue:start", {
            initiatorId,
            targetId,
            dialogueId: targetInteractive.dialogueId,
          });
        }
        break;

      case "building-entrance":
        if (targetInteractive.entrances) {
          // Find the closest entrance
          const closestEntrance = this.findClosestEntrance(
            initiatorPos,
            targetPos,
            targetInteractive.entrances,
          );
          if (closestEntrance) {
            events.emit("scene:transition", {
              from: initiatorId,
              to: closestEntrance.targetScene,
              entrance: closestEntrance,
            });
          }
        }
        break;

      case "scene-transition":
        if (targetInteractive.targetScene) {
          events.emit("scene:transition", {
            from: initiatorId,
            to: targetInteractive.targetScene,
            ...(targetInteractive.targetPosition !== undefined && {
              targetPosition: targetInteractive.targetPosition,
            }),
          });
        }
        break;

      case "learning":
        if (targetInteractive.activityId) {
          events.emit("learning:start", {
            initiatorId,
            targetId,
            activityId: targetInteractive.activityId,
          });
        }
        break;

      case "quest":
        if (targetInteractive.questId) {
          events.emit("quest:interact", {
            initiatorId,
            targetId,
            questId: targetInteractive.questId,
          });
        }
        break;
    }

    events.emit("interaction:completed", {
      initiatorId,
      targetId,
      type: targetInteractive.interactionType,
    });
  }

  private calculateDistance(
    pos1: PositionComponent,
    pos2: PositionComponent | { x: number; y: number },
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findClosestEntrance(
    playerPos: PositionComponent,
    buildingPos: PositionComponent,
    entrances: NonNullable<InteractiveComponent["entrances"]>,
  ) {
    let closest = entrances[0];
    let minDistance = Infinity;

    for (const entrance of entrances) {
      const entranceWorldPos = {
        x: buildingPos.x + entrance.position.x,
        y: buildingPos.y + entrance.position.y,
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

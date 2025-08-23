/**
 * Utility Systems - Timer, Health, and State Management
 * General-purpose systems for common gameplay mechanics
 */

import type { System, Entity, ComponentManager } from "../core";
import type { Emitter, ECSEvents } from "../events";
import type {
  TimerComponent,
  HealthComponent,
  StateComponent,
} from "../components";

/**
 * Timer System - Handles timer components and events
 */
export class TimerSystem implements System {
  readonly name = "TimerSystem";
  readonly requiredComponents = ["timer"] as const;

  update(
    _entities: Entity[],
    components: ComponentManager,
    deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    const timerEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of timerEntities) {
      const timer = components.getComponent<TimerComponent>(entityId, "timer");
      if (!timer || !timer.isActive) continue;

      timer.elapsed += deltaTime;

      if (timer.elapsed >= timer.duration) {
        // Timer completed
        if (timer.onComplete) {
          events.emit(timer.onComplete as keyof ECSEvents, { entityId } as any);
        }

        if (timer.repeat) {
          timer.elapsed = 0; // Reset for next cycle
        } else {
          timer.isActive = false;
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  startTimer(entityId: string, components: ComponentManager): void {
    const timer = components.getComponent<TimerComponent>(entityId, "timer");
    if (timer) {
      timer.isActive = true;
      timer.elapsed = 0;
    }
  }

  stopTimer(entityId: string, components: ComponentManager): void {
    const timer = components.getComponent<TimerComponent>(entityId, "timer");
    if (timer) {
      timer.isActive = false;
    }
  }
}

/**
 * Health System - Handles health, damage, and regeneration
 */
export class HealthSystem implements System {
  readonly name = "HealthSystem";
  readonly requiredComponents = ["health"] as const;

  update(
    _entities: Entity[],
    components: ComponentManager,
    deltaTime: number,
    events: Emitter<ECSEvents>,
  ): void {
    const healthEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of healthEntities) {
      const health = components.getComponent<HealthComponent>(
        entityId,
        "health",
      );
      if (!health) continue;

      // Apply regeneration
      if (
        health.regenerationRate &&
        health.regenerationRate > 0 &&
        health.current < health.max
      ) {
        health.current = Math.min(
          health.max,
          health.current + (health.regenerationRate * deltaTime) / 1000,
        );
      }

      // Check for death
      if (health.current <= 0) {
        events.emit("entity:death" as keyof ECSEvents, { entityId } as any);
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  damage(
    entityId: string,
    amount: number,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): boolean {
    const health = components.getComponent<HealthComponent>(entityId, "health");
    if (!health || health.invulnerable) return false;

    health.current = Math.max(0, health.current - amount);
    events.emit(
      "entity:damage" as keyof ECSEvents,
      { entityId, amount, newHealth: health.current } as any,
    );

    return true;
  }

  heal(
    entityId: string,
    amount: number,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): boolean {
    const health = components.getComponent<HealthComponent>(entityId, "health");
    if (!health) return false;

    const oldHealth = health.current;
    health.current = Math.min(health.max, health.current + amount);
    const actualHealing = health.current - oldHealth;

    if (actualHealing > 0) {
      events.emit(
        "entity:heal" as keyof ECSEvents,
        { entityId, amount: actualHealing, newHealth: health.current } as any,
      );
      return true;
    }

    return false;
  }
}

/**
 * State Machine System - Handles state transitions and behaviors
 */
export class StateMachineSystem implements System {
  readonly name = "StateMachineSystem";
  readonly requiredComponents = ["state"] as const;

  update(
    _entities: Entity[],
    components: ComponentManager,
    _deltaTime: number,
    _events: Emitter<ECSEvents>,
  ): void {
    const stateEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of stateEntities) {
      const state = components.getComponent<StateComponent>(entityId, "state");
      if (!state) continue;

      // State-specific logic can be added here
      // For now, this system just manages state data
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  changeState(
    entityId: string,
    newState: string,
    components: ComponentManager,
    events: Emitter<ECSEvents>,
  ): boolean {
    const state = components.getComponent<StateComponent>(entityId, "state");
    if (!state) return false;

    // Check if transition is allowed
    const allowedTransitions = state.transitions[state.currentState];
    if (allowedTransitions && !allowedTransitions.includes(newState)) {
      return false; // Transition not allowed
    }

    const oldState = state.currentState;
    state.previousState = oldState;
    state.currentState = newState;

    events.emit(
      "state:changed" as keyof ECSEvents,
      {
        entityId,
        oldState,
        newState,
      } as any,
    );

    return true;
  }

  getState(entityId: string, components: ComponentManager): string | null {
    const state = components.getComponent<StateComponent>(entityId, "state");
    return state ? state.currentState : null;
  }

  canTransitionTo(
    entityId: string,
    newState: string,
    components: ComponentManager,
  ): boolean {
    const state = components.getComponent<StateComponent>(entityId, "state");
    if (!state) return false;

    const allowedTransitions = state.transitions[state.currentState];
    return !allowedTransitions || allowedTransitions.includes(newState);
  }
}

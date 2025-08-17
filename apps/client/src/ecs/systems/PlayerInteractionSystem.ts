/**
 * PlayerInteractionSystem - Handles spacebar-triggered player interactions
 */

import type { 
  System, 
  Entity, 
  ComponentManager,
  Emitter,
  ECSEvents,
  PositionComponent
} from '@elt/core';
import { ECSEventTypes } from '@elt/core';
import { InputStateSystem } from './InputStateSystem';
import { InteractionZoneSystem } from './InteractionZoneSystem';
import { logger } from '../../utils/logger';

export class PlayerInteractionSystem implements System {
  readonly name = 'PlayerInteractionSystem';
  readonly requiredComponents = ['player', 'position'] as const;

  private isInitialized = false;

  constructor(
    private inputStateSystem: InputStateSystem,
    private interactionZoneSystem: InteractionZoneSystem
  ) {
    // Validate dependencies
    if (!this.inputStateSystem || !this.interactionZoneSystem) {
      throw new Error('PlayerInteractionSystem requires InputStateSystem and InteractionZoneSystem dependencies');
    }
  }

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: Emitter<ECSEvents>): void {
    // Initialize event listeners once
    if (!this.isInitialized) {
      this.setupEventListeners(events, components);
      this.isInitialized = true;
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private setupEventListeners(events: Emitter<ECSEvents>, components: ComponentManager): void {
    // Listen for spacebar presses
    events.on(ECSEventTypes.INPUT_KEY_DOWN, (data) => {
      if (data.key === 'Space') {
        this.handleInteractionInput(components, events);
      }
    });
  }

  private handleInteractionInput(components: ComponentManager, events: Emitter<ECSEvents>): void {
    // Find the player entity
    const playerEntities = components.getEntitiesWithComponent('player');
    if (playerEntities.length === 0) return;

    const playerId = playerEntities[0];
    const playerPosition = components.getComponent<PositionComponent>(playerId, 'position');
    if (!playerPosition) return;

    logger.ecs(`Player pressed spacebar at position (${playerPosition.x}, ${playerPosition.y})`);
    
    // Use InteractionZoneSystem to find interactable entities
    const interactableEntities = this.interactionZoneSystem.findInteractableEntities(playerPosition, components);
    
    if (interactableEntities.length > 0) {
      // Take the first interactable entity (could be enhanced to prioritize by distance)
      const targetEntityId = interactableEntities[0];
      
      logger.ecs(`Player can interact with ${targetEntityId}`);
      
      // Emit interaction event
      events.emit(ECSEventTypes.PLAYER_INTERACTION, { 
        initiatorId: playerId,
        targetEntityId 
      });
    } else {
      logger.ecs(`No interactive entities in range at (${playerPosition.x}, ${playerPosition.y})`);
    }
  }
}

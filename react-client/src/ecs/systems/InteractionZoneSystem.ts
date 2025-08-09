/**
 * InteractionZoneSystem - Manages interaction zone detection and validation
 */

import type { System, Entity, ComponentManager } from '../core';
import type { Emitter, ECSEvents } from '../events';
import type {
  PositionComponent,
  InteractiveComponent
} from '../components';

export class InteractionZoneSystem implements System {
  readonly name = 'InteractionZoneSystem';
  readonly requiredComponents = ['position', 'interactive'] as const;

  update(_entities: Entity[], _components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    // This system is primarily a utility for other systems
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  /**
   * Check if a player is in an interaction zone for a given entity
   */
  isPlayerInInteractionZone(
    playerPosition: PositionComponent,
    entityPosition: PositionComponent,
    interactive: InteractiveComponent
  ): boolean {
    // If entity has defined interaction zones, use those
    if (interactive.interactionZones && interactive.interactionZones.length > 0) {
      for (const zone of interactive.interactionZones) {
        const zoneX = zone.isRelative !== false ? entityPosition.x + zone.x : zone.x;
        const zoneY = zone.isRelative !== false ? entityPosition.y + zone.y : zone.y;
        
        if (playerPosition.x === zoneX && playerPosition.y === zoneY) {
          return true;
        }
      }
      return false;
    }
    
    // Fallback: use adjacency (default behavior for entities without defined zones)
    const dx = Math.abs(playerPosition.x - entityPosition.x);
    const dy = Math.abs(playerPosition.y - entityPosition.y);
    const maxRange = interactive.interactionRange || 1;
    
    // Check if player is adjacent (within range)
    return dx <= maxRange && dy <= maxRange && (dx + dy) > 0; // > 0 ensures not same position
  }

  /**
   * Find all interactive entities that the player can interact with from their current position
   */
  findInteractableEntities(
    playerPosition: PositionComponent,
    components: ComponentManager
  ): string[] {
    const interactableEntities: string[] = [];
    const interactiveEntityIds = components.getEntitiesWithComponent('interactive');
    
    for (const entityId of interactiveEntityIds) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const interactive = components.getComponent<InteractiveComponent>(entityId, 'interactive');
      
      if (!position || !interactive) continue;
      
      if (this.isPlayerInInteractionZone(playerPosition, position, interactive)) {
        interactableEntities.push(entityId);
      }
    }
    
    return interactableEntities;
  }
}

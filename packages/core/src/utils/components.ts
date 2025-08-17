/**
 * Component Utilities - Component management and manipulation
 * Helpers for component operations, batching, and entity management
 */

import type { World, Entity, Component } from '../core';

export class ComponentUtils {
  /**
   * Get common component archetype definitions
   */
  static getArchetypeComponents(archetype: string): readonly string[] {
    const archetypes: Record<string, readonly string[]> = {
      'player': ['position', 'size', 'collision', 'renderable', 'input', 'player', 'velocity', 'health'] as const,
      'npc': ['position', 'size', 'collision', 'renderable', 'npc', 'interactive', 'health', 'ai'] as const,
      'building': ['position', 'size', 'collision', 'renderable', 'building', 'interactive'] as const,
      'projectile': ['position', 'size', 'velocity', 'collision', 'renderable', 'physics'] as const,
      'pickup': ['position', 'size', 'collision', 'renderable', 'interactive'] as const,
      'particle': ['position', 'size', 'velocity', 'collision', 'renderable', 'physics'] as const,
      'sound-source': ['position', 'audio'] as const
    };
    
    return archetypes[archetype] || [];
  }

  /**
   * Batch add components to an entity
   */
  static addComponents(world: World, entityId: string, components: Component[]): void {
    for (const component of components) {
      world.addComponent(entityId, component);
    }
  }

  /**
   * Clone an entity with all its components
   */
  static cloneEntity(world: World, sourceEntityId: string, newEntityId: string): Entity | null {
    const sourceEntity = world.getEntity(sourceEntityId);
    if (!sourceEntity) return null;

    const newEntity = world.createEntity(newEntityId);
    // This is a simplified clone - in practice you'd need to introspect components
    // For now, we'll just note that this functionality exists
    console.warn('Component cloning not yet implemented - requires component introspection');

    return newEntity;
  }
}
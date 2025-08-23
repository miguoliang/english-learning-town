/**
 * Component Manager - Component data management and queries
 *
 * Manages all component data and provides efficient access to components by type and entity.
 * Handles component storage, retrieval, and entity queries.
 */

import type { EntityId, Component } from "./types";

/**
 * ComponentManager - Manages all component data
 * Provides efficient access to components by type and entity
 */
export class ComponentManager {
  private components = new Map<string, Map<EntityId, Component>>();

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    if (!this.components.has(component.type)) {
      this.components.set(component.type, new Map());
    }

    this.components.get(component.type)!.set(entityId, component);
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: string): void {
    const componentMap = this.components.get(componentType);
    if (componentMap) {
      componentMap.delete(entityId);
    }
  }

  /**
   * Get a specific component from an entity
   */
  getComponent<T extends Component>(
    entityId: EntityId,
    componentType: string,
  ): T | undefined {
    const componentMap = this.components.get(componentType);
    return componentMap?.get(entityId) as T | undefined;
  }

  /**
   * Check if entity has a specific component
   */
  hasComponent(entityId: EntityId, componentType: string): boolean {
    const componentMap = this.components.get(componentType);
    return componentMap?.has(entityId) ?? false;
  }

  /**
   * Check if entity has all required components
   */
  hasAllComponents(
    entityId: EntityId,
    componentTypes: readonly string[],
  ): boolean {
    return componentTypes.every((type) => this.hasComponent(entityId, type));
  }

  /**
   * Get all entities with a specific component type
   */
  getEntitiesWithComponent(componentType: string): EntityId[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.keys()) : [];
  }

  /**
   * Get all entities with all specified component types
   */
  getEntitiesWithComponents(componentTypes: readonly string[]): EntityId[] {
    if (componentTypes.length === 0) return [];

    // Start with entities that have the first component type
    let entities = this.getEntitiesWithComponent(componentTypes[0]);

    // Filter to only entities that have all required components
    for (let i = 1; i < componentTypes.length; i++) {
      const componentType = componentTypes[i];
      entities = entities.filter((entityId) =>
        this.hasComponent(entityId, componentType),
      );
    }

    return entities;
  }

  /**
   * Remove all components for an entity (entity cleanup)
   */
  removeEntity(entityId: EntityId): void {
    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
  }
}

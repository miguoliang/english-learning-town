/**
 * Pure ECS Entity system for English Learning Town
 * Entities are pure ID containers with no data or logic
 * Manages unique entity IDs and lifecycle for the ECS architecture
 *
 * @fileoverview Entity management system for ECS architecture
 * @author English Learning Town Team
 * @version 1.0.0
 */

import { eventBus, CoreEvents } from './EventBus';
import { LoggerFactory } from '@english-learning-town/logger';

/**
 * Unique identifier for entities in the ECS system
 * @typedef {number} EntityId
 */
export type EntityId = number;

/**
 * Entity represents a unique game object with an ID.
 * In ECS architecture, entities are just unique identifiers - all data is stored in components.
 *
 * @class Entity
 * @example
 * ```typescript
 * const entity = new Entity(123);
 * console.log(entity.id); // 123
 * console.log(entity.isActive()); // true
 *
 * entity.deactivate();
 * console.log(entity.isActive()); // false
 * ```
 */
export class Entity {
  /**
   * Unique identifier for this entity
   * @readonly
   * @type {EntityId}
   */
  readonly id: EntityId;

  /**
   * Whether this entity is currently active
   * @private
   * @type {boolean}
   */
  private active = true;

  /**
   * Creates a new Entity instance
   * @param {EntityId} id - Unique identifier for the entity
   * @throws {Error} If id is not a valid positive integer
   */
  constructor(id: EntityId) {
    this.id = id;
  }

  /**
   * Check if entity is currently active
   * @returns {boolean} True if entity is active, false otherwise
   * @example
   * ```typescript
   * const entity = new Entity(1);
   * console.log(entity.isActive()); // true
   *
   * entity.deactivate();
   * console.log(entity.isActive()); // false
   * ```
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the entity (marks it for removal)
   * Deactivated entities will be cleaned up by the EntityManager
   * @returns {void}
   * @example
   * ```typescript
   * const entity = new Entity(1);
   * entity.deactivate();
   * console.log(entity.isActive()); // false
   * ```
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Reactivate a previously deactivated entity
   * @returns {void}
   * @example
   * ```typescript
   * const entity = new Entity(1);
   * entity.deactivate();
   * entity.reactivate();
   * console.log(entity.isActive()); // true
   * ```
   */
  reactivate(): void {
    this.active = true;
  }
}

/**
 * EntityManager handles entity creation, destruction, and lifecycle.
 * Provides unique ID generation, entity tracking, and memory management.
 *
 * @class EntityManager
 * @example
 * ```typescript
 * const entityManager = new EntityManager(50000);
 *
 * // Create entities
 * const entity1 = entityManager.createEntity();
 * const entity2 = entityManager.createEntity();
 *
 * // Check entities
 * console.log(entityManager.getEntityCount()); // 2
 * console.log(entityManager.hasEntity(entity1.id)); // true
 *
 * // Destroy entity
 * entityManager.destroyEntity(entity1.id);
 * console.log(entityManager.getEntityCount()); // 1
 * ```
 */
export class EntityManager {
  /**
   * Logger instance for debugging and monitoring
   * @private
   * @type {Logger}
   */
  private logger = LoggerFactory.getLogger('EntityManager');

  /**
   * Map of active entities by ID
   * @private
   * @type {Map<EntityId, Entity>}
   */
  private entities: Map<EntityId, Entity> = new Map();

  /**
   * Next available entity ID
   * @private
   * @type {EntityId}
   */
  private nextEntityId: EntityId = 1;

  /**
   * Pool of recycled entity IDs for reuse
   * @private
   * @type {EntityId[]}
   */
  private recycledIds: EntityId[] = [];

  /**
   * Maximum number of entities allowed
   * @private
   * @type {number}
   */
  private maxEntities: number;

  /**
   * Creates a new EntityManager instance
   * @param {number} [maxEntities=100000] - Maximum number of entities allowed
   * @example
   * ```typescript
   * const entityManager = new EntityManager(50000);
   * ```
   */
  constructor(maxEntities = 100000) {
    this.maxEntities = maxEntities;
  }

  /**
   * Create a new entity with a unique ID
   * @returns {Entity} The newly created entity
   * @throws {Error} If maximum number of entities is reached
   * @example
   * ```typescript
   * const entity = entityManager.createEntity();
   * console.log(entity.id); // 1 (or next available ID)
   * console.log(entity.isActive()); // true
   * ```
   */
  createEntity(): Entity {
    if (this.entities.size >= this.maxEntities) {
      throw new Error(
        `Maximum number of entities reached: ${this.maxEntities}`
      );
    }

    // Try to reuse a recycled ID first
    const id = this.recycledIds.pop() || this.generateNextId();
    const entity = new Entity(id);

    this.entities.set(id, entity);

    this.logger.debug(`Created entity ${id}`, 'EntityManager');

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Entity created: ${id}`,
      system: 'EntityManager',
      data: { entityId: id, totalEntities: this.entities.size },
    });

    return entity;
  }

  /**
   * Destroy an entity and recycle its ID for future use
   * @param {EntityId} entityId - ID of the entity to destroy
   * @returns {boolean} True if entity was destroyed, false if entity didn't exist
   * @example
   * ```typescript
   * const entity = entityManager.createEntity();
   * const success = entityManager.destroyEntity(entity.id);
   * console.log(success); // true
   *
   * const failedDestroy = entityManager.destroyEntity(999);
   * console.log(failedDestroy); // false (entity doesn't exist)
   * ```
   */
  destroyEntity(entityId: EntityId): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) {
      this.logger.warn(
        `Attempted to destroy non-existent entity: ${entityId}`,
        'EntityManager'
      );
      return false;
    }

    // Deactivate the entity first
    entity.deactivate();

    // Remove from active entities
    this.entities.delete(entityId);

    // Recycle the ID for future use
    this.recycledIds.push(entityId);

    this.logger.debug(`Destroyed entity ${entityId}`, 'EntityManager');

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'debug',
      message: `Entity destroyed: ${entityId}`,
      system: 'EntityManager',
      data: {
        entityId,
        totalEntities: this.entities.size,
        recycledIds: this.recycledIds.length,
      },
    });

    return true;
  }

  /**
   * Get an entity by ID
   * @param {EntityId} entityId - ID of the entity to retrieve
   * @returns {Entity | undefined} The entity if found, undefined otherwise
   * @example
   * ```typescript
   * const entity = entityManager.createEntity();
   * const retrieved = entityManager.getEntity(entity.id);
   * console.log(retrieved?.id === entity.id); // true
   *
   * const notFound = entityManager.getEntity(999);
   * console.log(notFound); // undefined
   * ```
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Check if an entity exists and is active
   * @param {EntityId} entityId - ID of the entity to check
   * @returns {boolean} True if entity exists and is active, false otherwise
   * @example
   * ```typescript
   * const entity = entityManager.createEntity();
   * console.log(entityManager.hasEntity(entity.id)); // true
   *
   * entity.deactivate();
   * console.log(entityManager.hasEntity(entity.id)); // false
   *
   * console.log(entityManager.hasEntity(999)); // false
   * ```
   */
  hasEntity(entityId: EntityId): boolean {
    const entity = this.entities.get(entityId);
    return entity !== undefined && entity.isActive();
  }

  /**
   * Get all active entities
   * @returns {Entity[]} Array of all active entities
   * @example
   * ```typescript
   * const entity1 = entityManager.createEntity();
   * const entity2 = entityManager.createEntity();
   * entity1.deactivate();
   *
   * const activeEntities = entityManager.getAllEntities();
   * console.log(activeEntities.length); // 1 (only entity2 is active)
   * ```
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values()).filter((entity) =>
      entity.isActive()
    );
  }

  /**
   * Get all entity IDs (both active and inactive)
   * @returns {EntityId[]} Array of all entity IDs
   * @example
   * ```typescript
   * const entity1 = entityManager.createEntity();
   * const entity2 = entityManager.createEntity();
   * entity1.deactivate();
   *
   * const allIds = entityManager.getAllEntityIds();
   * console.log(allIds.length); // 2 (includes inactive entities)
   * ```
   */
  getAllEntityIds(): EntityId[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Get the count of active entities
   * @returns {number} Number of active entities
   * @example
   * ```typescript
   * const entity1 = entityManager.createEntity();
   * const entity2 = entityManager.createEntity();
   * console.log(entityManager.getEntityCount()); // 2
   *
   * entity1.deactivate();
   * console.log(entityManager.getEntityCount()); // 1
   * ```
   */
  getEntityCount(): number {
    return Array.from(this.entities.values()).filter((entity) =>
      entity.isActive()
    ).length;
  }

  /**
   * Get total entity count (including inactive entities)
   * @returns {number} Total number of entities (active and inactive)
   * @example
   * ```typescript
   * const entity1 = entityManager.createEntity();
   * const entity2 = entityManager.createEntity();
   * entity1.deactivate();
   *
   * console.log(entityManager.getTotalEntityCount()); // 2
   * console.log(entityManager.getEntityCount()); // 1
   * ```
   */
  getTotalEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Clean up inactive entities (garbage collection)
   * Removes inactive entities and recycles their IDs
   * @returns {void}
   * @example
   * ```typescript
   * const entity = entityManager.createEntity();
   * entity.deactivate();
   *
   * console.log(entityManager.getTotalEntityCount()); // 1
   * entityManager.cleanup();
   * console.log(entityManager.getTotalEntityCount()); // 0
   * ```
   */
  cleanup(): void {
    const beforeCount = this.entities.size;
    let cleanedCount = 0;

    for (const [id, entity] of this.entities.entries()) {
      if (!entity.isActive()) {
        this.entities.delete(id);
        this.recycledIds.push(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(
        `Cleaned up ${cleanedCount} inactive entities (${beforeCount} -> ${this.entities.size})`,
        'EntityManager'
      );
    }
  }

  /**
   * Reset the entity manager (destroy all entities)
   * Clears all entities and resets ID generation
   * @returns {void}
   * @example
   * ```typescript
   * const entity1 = entityManager.createEntity();
   * const entity2 = entityManager.createEntity();
   *
   * console.log(entityManager.getEntityCount()); // 2
   * entityManager.reset();
   * console.log(entityManager.getEntityCount()); // 0
   *
   * const newEntity = entityManager.createEntity();
   * console.log(newEntity.id); // 1 (IDs reset)
   * ```
   */
  reset(): void {
    const entityCount = this.entities.size;
    this.entities.clear();
    this.recycledIds = [];
    this.nextEntityId = 1;

    this.logger.info(
      `Reset EntityManager, destroyed ${entityCount} entities`,
      'EntityManager'
    );

    eventBus.emit(CoreEvents.DEBUG_LOG, {
      level: 'info',
      message: 'EntityManager reset',
      system: 'EntityManager',
      data: { destroyedEntities: entityCount },
    });
  }

  /**
   * Get comprehensive statistics about entity management
   * @returns {Object} Statistics object containing entity counts and memory usage
   * @returns {number} returns.activeEntities - Number of active entities
   * @returns {number} returns.totalEntities - Total number of entities
   * @returns {number} returns.recycledIds - Number of recycled IDs available
   * @returns {EntityId} returns.nextId - Next ID that will be assigned
   * @returns {number} returns.maxEntities - Maximum entities allowed
   * @returns {string} returns.memoryUsage - Estimated memory usage
   * @example
   * ```typescript
   * const stats = entityManager.getStats();
   * console.log(`Active: ${stats.activeEntities}/${stats.maxEntities}`);
   * console.log(`Memory: ${stats.memoryUsage}`);
   * console.log(`Recycled IDs: ${stats.recycledIds}`);
   * ```
   */
  getStats(): {
    activeEntities: number;
    totalEntities: number;
    recycledIds: number;
    nextId: EntityId;
    maxEntities: number;
    memoryUsage: string;
  } {
    const activeCount = this.getEntityCount();
    const totalCount = this.getTotalEntityCount();

    return {
      activeEntities: activeCount,
      totalEntities: totalCount,
      recycledIds: this.recycledIds.length,
      nextId: this.nextEntityId,
      maxEntities: this.maxEntities,
      memoryUsage: `${((totalCount * 24) / 1024).toFixed(2)} KB`, // Rough estimate
    };
  }

  /**
   * Generate the next available entity ID
   * @private
   * @returns {EntityId} Next unique entity ID
   * @throws {Error} If entity ID would overflow Number.MAX_SAFE_INTEGER
   */
  private generateNextId(): EntityId {
    if (this.nextEntityId >= Number.MAX_SAFE_INTEGER) {
      throw new Error('Entity ID overflow - too many entities created');
    }
    return this.nextEntityId++;
  }
}

/**
 * Singleton instance for global entity management
 * Provides a shared EntityManager across the entire application
 * @type {EntityManager}
 * @example
 * ```typescript
 * import { entityManager } from '@english-learning-town/core';
 *
 * // Use the singleton instance
 * const entity = entityManager.createEntity();
 * console.log(entity.id); // 1
 * ```
 */
export const entityManager = new EntityManager();

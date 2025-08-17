/**
 * ECS Utility Functions - Performance optimizations and component archetypes
 */

import type { World, ComponentManager, Entity, Component } from './core';
import {
  createPositionComponent,
  createSizeComponent,
  createVelocityComponent,
  createCollisionComponent,
  createRenderableComponent,
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent,
  createInteractiveComponent,
  createInputComponent,
  createHealthComponent,
  createAIComponent,
  createMovementAnimationComponent,
  createPhysicsComponent,
  createAudioComponent,
} from './components';

// ========== PERFORMANCE UTILITIES ==========

/**
 * Entity Pool - Reusable entity ID pool for performance
 */
export class EntityPool {
  private availableIds: string[] = [];
  private usedIds = new Set<string>();
  private idCounter = 0;

  getEntityId(): string {
    if (this.availableIds.length > 0) {
      const id = this.availableIds.pop()!;
      this.usedIds.add(id);
      return id;
    }

    const id = `entity_${this.idCounter++}`;
    this.usedIds.add(id);
    return id;
  }

  releaseEntityId(id: string): void {
    if (this.usedIds.has(id)) {
      this.usedIds.delete(id);
      this.availableIds.push(id);
    }
  }

  clear(): void {
    this.availableIds = [];
    this.usedIds.clear();
    this.idCounter = 0;
  }
}

/**
 * Component Cache - Cache frequently accessed components
 */
export class ComponentCache {
  private cache = new Map<string, Component>();
  private cacheKeys = new Set<string>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get<T extends Component>(entityId: string, componentType: string): T | undefined {
    const key = `${entityId}:${componentType}`;
    return this.cache.get(key) as T | undefined;
  }

  set(entityId: string, componentType: string, component: Component): void {
    const key = `${entityId}:${componentType}`;
    
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove least recently used item
      const firstKey = this.cacheKeys.values().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.cacheKeys.delete(firstKey);
      }
    }

    this.cache.set(key, component);
    this.cacheKeys.delete(key);
    this.cacheKeys.add(key);
  }

  remove(entityId: string, componentType: string): void {
    const key = `${entityId}:${componentType}`;
    this.cache.delete(key);
    this.cacheKeys.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.cacheKeys.clear();
  }
}

/**
 * Query Manager - Optimized entity queries with caching
 */
export class QueryManager {
  private queryCache = new Map<string, string[]>();
  private cacheValidTime = new Map<string, number>();
  private readonly cacheTimeout = 100; // 100ms cache timeout

  getEntitiesWithComponents(
    components: ComponentManager,
    requiredComponents: readonly string[],
    useCache = true
  ): string[] {
    const queryKey = requiredComponents.slice().sort().join(':');
    const now = Date.now();

    if (useCache) {
      const cachedResult = this.queryCache.get(queryKey);
      const cacheTime = this.cacheValidTime.get(queryKey);
      
      if (cachedResult && cacheTime && (now - cacheTime) < this.cacheTimeout) {
        return cachedResult;
      }
    }

    const result = components.getEntitiesWithComponents(requiredComponents);
    
    if (useCache) {
      this.queryCache.set(queryKey, result);
      this.cacheValidTime.set(queryKey, now);
    }

    return result;
  }

  invalidateCache(): void {
    this.queryCache.clear();
    this.cacheValidTime.clear();
  }

  invalidateQuery(requiredComponents: readonly string[]): void {
    const queryKey = requiredComponents.slice().sort().join(':');
    this.queryCache.delete(queryKey);
    this.cacheValidTime.delete(queryKey);
  }
}

// ========== COMPONENT ARCHETYPES ==========

/**
 * Predefined entity archetypes for common game objects
 */
export class EntityArchetypes {
  static createPlayer(world: World, id: string, position: { x: number; y: number }, name = 'Player'): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(1, 1));
    world.addComponent(entity.id, createVelocityComponent(0, 0, 5));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon: '🧑', zIndex: 10 }));
    world.addComponent(entity.id, createPlayerComponent(name));
    world.addComponent(entity.id, createInputComponent('player', true));
    world.addComponent(entity.id, createHealthComponent(100, 100, 1));
    world.addComponent(entity.id, createMovementAnimationComponent());

    return entity;
  }

  static createNPC(
    world: World, 
    id: string, 
    position: { x: number; y: number }, 
    name: string, 
    role: string,
    icon = '🧝'
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(1, 1));
    world.addComponent(entity.id, createVelocityComponent(0, 0, 2));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon, zIndex: 5 }));
    world.addComponent(entity.id, createNPCComponent(name, role));
    world.addComponent(entity.id, createInteractiveComponent('dialogue', { requiresAdjacency: true }));
    world.addComponent(entity.id, createHealthComponent(50, 50));
    world.addComponent(entity.id, createAIComponent('idle', 3, 1));

    return entity;
  }

  static createBuilding(
    world: World,
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number },
    name: string,
    buildingType: 'educational' | 'commercial' | 'residential' | 'social' | 'storage',
    icon = '🏢'
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(size.width, size.height));
    world.addComponent(entity.id, createCollisionComponent(false, true));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon, zIndex: 1 }));
    world.addComponent(entity.id, createBuildingComponent(name, buildingType));
    world.addComponent(entity.id, createInteractiveComponent('building-entrance', { 
      requiresAdjacency: true,
      interactionRange: 2
    }));

    return entity;
  }

  static createProjectile(
    world: World,
    id: string,
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    icon = '💥'
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(0.3, 0.3));
    world.addComponent(entity.id, createVelocityComponent(velocity.x, velocity.y, 20));
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon, zIndex: 8 }));
    world.addComponent(entity.id, createPhysicsComponent(0.1, 0, 0.8, false));

    return entity;
  }

  static createPickup(
    world: World,
    id: string,
    position: { x: number; y: number },
    _itemType: string,
    icon = '💎'
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(0.5, 0.5));
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon, zIndex: 3 }));
    world.addComponent(entity.id, createInteractiveComponent('quest', { 
      requiresAdjacency: false,
      interactionRange: 1.5 
    }));

    return entity;
  }

  static createParticle(
    world: World,
    id: string,
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    _lifetime: number,
    icon = '✨'
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(0.2, 0.2));
    world.addComponent(entity.id, createVelocityComponent(velocity.x, velocity.y, 10));
    world.addComponent(entity.id, createCollisionComponent(true, false));
    world.addComponent(entity.id, createRenderableComponent('emoji', { icon, zIndex: 9 }));
    world.addComponent(entity.id, createPhysicsComponent(0.01, 0.1, 0.3, false));

    return entity;
  }

  static createSoundSource(
    world: World,
    id: string,
    position: { x: number; y: number },
    soundId: string,
    _range = 10
  ): Entity {
    const entity = world.createEntity(id);
    
    world.addComponent(entity.id, createPositionComponent(position.x, position.y));
    world.addComponent(entity.id, createSizeComponent(0.1, 0.1));
    world.addComponent(entity.id, createAudioComponent(soundId, 1, true));

    return entity;
  }
}

// ========== SPATIAL UTILITIES ==========

/**
 * Spatial indexing for fast collision detection and queries
 */
export class SpatialIndex {
  private grid: Map<string, string[]> = new Map();
  private cellSize: number;

  constructor(cellSize = 5) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX}:${cellY}`;
  }

  addEntity(entityId: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(entityId);
  }

  removeEntity(entityId: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    const entities = this.grid.get(key);
    if (entities) {
      const index = entities.indexOf(entityId);
      if (index > -1) {
        entities.splice(index, 1);
      }
    }
  }

  getNearbyEntities(x: number, y: number, radius = 1): string[] {
    const nearby: string[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(x / this.cellSize);
    const centerCellY = Math.floor(y / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx}:${centerCellY + dy}`;
        const entities = this.grid.get(key);
        if (entities) {
          nearby.push(...entities);
        }
      }
    }

    return nearby;
  }

  clear(): void {
    this.grid.clear();
  }
}

// ========== MATH UTILITIES ==========

export class MathUtils {
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static normalize(x: number, y: number): { x: number; y: number } {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomDirection(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }
}

// ========== COMPONENT UTILITIES ==========

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
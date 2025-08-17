/**
 * Performance Utilities
 * Entity pooling, component caching, and query optimization
 */

import type { ComponentManager, Component } from '../core';

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
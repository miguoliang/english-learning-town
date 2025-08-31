/**
 * Type guards and type predicates to reduce runtime type checking
 * Improves performance and reduces boilerplate validation code
 */

import { Component, ComponentType } from '../Component';
import { EntityId } from '../Entity';
import { SystemType } from '../GameSystem';
import { SystemStateType, SystemState } from '../types/UtilityTypes';

// ========== Component Type Guards ==========

/**
 * Type guard for component validation
 */
export function isComponent(value: unknown): value is Component {
  return (
    typeof value === 'object' &&
    value !== null &&
    'componentType' in value &&
    typeof (value as any).componentType === 'string'
  );
}

/**
 * Type guard for specific component type
 */
export function isComponentOfType<T extends Component>(
  component: Component,
  expectedType: ComponentType
): component is T {
  return component.componentType === expectedType;
}

/**
 * Type guard for component type string validation
 */
export function isValidComponentType(value: unknown): value is ComponentType {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Batch component type validation
 */
export function areValidComponentTypes(
  values: unknown[]
): values is ComponentType[] {
  return Array.isArray(values) && values.every(isValidComponentType);
}

// ========== Entity ID Type Guards ==========

/**
 * Type guard for entity ID validation
 */
export function isValidEntityId(value: unknown): value is EntityId {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Batch entity ID validation
 */
export function areValidEntityIds(values: unknown[]): values is EntityId[] {
  return Array.isArray(values) && values.every(isValidEntityId);
}

// ========== System Type Guards ==========

/**
 * Type guard for system type validation
 */
export function isValidSystemType(value: unknown): value is SystemType {
  return Object.values(SystemType).includes(value as SystemType);
}

/**
 * Type guard for system state validation
 */
export function isValidSystemState(value: unknown): value is SystemStateType {
  return Object.values(SystemState).includes(value as SystemStateType);
}

/**
 * Specific system state type guards
 */
export const isSystemInitialized = (
  state: SystemStateType
): state is 'initialized' => state === SystemState.INITIALIZED;

export const isSystemRunning = (state: SystemStateType): state is 'running' =>
  state === SystemState.RUNNING;

export const isSystemStopped = (state: SystemStateType): state is 'stopped' =>
  state === SystemState.STOPPED;

export const isSystemError = (state: SystemStateType): state is 'error' =>
  state === SystemState.ERROR;

// ========== Configuration Type Guards ==========

/**
 * Type guard for system configuration validation
 */
export function isValidSystemConfig(value: unknown): value is {
  name: string;
  priority: number;
  enabled: boolean;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'priority' in value &&
    'enabled' in value &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).priority === 'number' &&
    typeof (value as any).enabled === 'boolean'
  );
}

/**
 * Type guard for update frequency validation
 */
export function isValidUpdateFrequency(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && Number.isFinite(value);
}

// ========== Array Type Guards ==========

/**
 * Generic type guard for non-empty arrays
 */
export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for component array validation
 */
export function isValidComponentArray(value: unknown): value is Component[] {
  return Array.isArray(value) && value.every(isComponent);
}

// ========== Performance Optimization Type Guards ==========

/**
 * Type guard with performance caching
 */
export function createCachedTypeGuard<T>(
  predicate: (value: unknown) => value is T,
  cacheSize: number = 100
) {
  const cache = new Map<unknown, boolean>();

  return function (value: unknown): value is T {
    if (cache.has(value)) {
      return cache.get(value) as boolean;
    }

    const result = predicate(value);

    // Simple LRU: remove oldest entry when cache is full
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(value, result);
    return result;
  };
}

/**
 * High-performance component type guard with caching
 */
export const isComponentCached = createCachedTypeGuard(isComponent, 50);

/**
 * High-performance entity ID validation with caching
 */
export const isValidEntityIdCached = createCachedTypeGuard(
  isValidEntityId,
  200
);

// ========== Assertion Functions ==========

/**
 * Assertion function for component validation
 */
export function assertIsComponent(value: unknown): asserts value is Component {
  if (!isComponent(value)) {
    throw new Error(`Expected Component, got ${typeof value}`);
  }
}

/**
 * Assertion function for entity ID validation
 */
export function assertIsValidEntityId(
  value: unknown
): asserts value is EntityId {
  if (!isValidEntityId(value)) {
    throw new Error(`Expected valid EntityId, got ${typeof value}: ${value}`);
  }
}

/**
 * Assertion function for component type validation
 */
export function assertIsValidComponentType(
  value: unknown
): asserts value is ComponentType {
  if (!isValidComponentType(value)) {
    throw new Error(
      `Expected valid ComponentType, got ${typeof value}: ${value}`
    );
  }
}

// ========== Utility Type Predicates ==========

/**
 * Type predicate for filtering undefined values
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type predicate for filtering null values
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Combined type predicate for filtering null/undefined
 */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type predicate for empty object checking
 */
export function isEmptyObject(value: object): value is Record<string, never> {
  return Object.keys(value).length === 0;
}

/**
 * Type predicate for non-empty object checking
 */
export function isNonEmptyObject<T extends object>(
  value: T
): value is T & Record<string, unknown> {
  return !isEmptyObject(value);
}

// ========== Specialized ECS Type Guards ==========

/**
 * Type guard for checking if entity has required components
 */
export function entityHasComponents(
  entityId: EntityId,
  requiredComponents: ComponentType[],
  hasComponentFn: (entityId: EntityId, componentType: ComponentType) => boolean
): boolean {
  return requiredComponents.every((componentType) =>
    hasComponentFn(entityId, componentType)
  );
}

/**
 * Type guard for valid ECS query parameters
 */
export function isValidECSQuery(value: unknown): value is {
  componentTypes: ComponentType[];
  entityIds?: EntityId[];
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'componentTypes' in value &&
    areValidComponentTypes((value as any).componentTypes) &&
    (!('entityIds' in value) || areValidEntityIds((value as any).entityIds))
  );
}

// ========== Export Utility Collections ==========

/**
 * Collection of all component-related type guards
 */
export const ComponentTypeGuards = {
  isComponent,
  isComponentOfType,
  isValidComponentType,
  areValidComponentTypes,
  isValidComponentArray,
  isComponentCached,
  assertIsComponent,
  assertIsValidComponentType,
} as const;

/**
 * Collection of all entity-related type guards
 */
export const EntityTypeGuards = {
  isValidEntityId,
  areValidEntityIds,
  isValidEntityIdCached,
  assertIsValidEntityId,
} as const;

/**
 * Collection of all system-related type guards
 */
export const SystemTypeGuards = {
  isValidSystemType,
  isValidSystemState,
  isSystemInitialized,
  isSystemRunning,
  isSystemStopped,
  isSystemError,
  isValidSystemConfig,
  isValidUpdateFrequency,
} as const;

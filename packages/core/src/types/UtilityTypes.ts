/**
 * Advanced TypeScript utility types for ECS optimization
 * Reduces boilerplate code and improves type safety
 */

import { ComponentType, Component } from '../Component';
import { EntityId } from '../Entity';
import { SystemType } from '../GameSystem';

// ========== Component Type Utilities ==========

/**
 * Extract component types from a component union
 */
export type ComponentTypeOf<T extends Component> = T['componentType'];

/**
 * Create a map of component types to component instances
 */
export type ComponentMap<T extends Record<string, Component>> = {
  readonly [K in keyof T]: T[K];
};

/**
 * Helper to extract multiple component types as tuple
 */
export type ComponentTypeTuple<T extends readonly Component[]> = {
  readonly [K in keyof T]: ComponentTypeOf<T[K]>;
};

// ========== System Configuration Utilities ==========

/**
 * Base system configuration with smart defaults
 */
export interface BaseSystemConfig {
  readonly name: string;
  readonly priority: number;
  readonly enabled?: boolean;
  readonly dependencies?: readonly string[];
  readonly systemType?: SystemType;
  readonly updateFrequency?: number;
  readonly autoStart?: boolean;
}

/**
 * Complete system configuration with all defaults applied
 */
export type ResolvedSystemConfig = Required<BaseSystemConfig>;

/**
 * System configuration with computed properties
 */
export type SystemConfigWithDefaults<T extends BaseSystemConfig> =
  ResolvedSystemConfig & T;

// ========== Entity Query Utilities ==========

/**
 * Query result for entities with specific components
 */
export type EntityQuery<T extends readonly ComponentType[]> = {
  readonly entities: readonly EntityId[];
  readonly componentTypes: T;
  readonly count: number;
};

/**
 * Component accessor for type-safe component retrieval
 */
export type ComponentAccessor<T extends Component> = {
  get<K extends ComponentTypeOf<T>>(
    entityId: EntityId,
    componentType: K
  ): T | undefined;
  has<K extends ComponentTypeOf<T>>(
    entityId: EntityId,
    componentType: K
  ): boolean;
};

// ========== System State Management ==========

/**
 * System state flags as const assertion for better type inference
 */
export const SystemState = {
  UNINITIALIZED: 'uninitialized',
  INITIALIZING: 'initializing',
  INITIALIZED: 'initialized',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error',
} as const;

export type SystemStateType = (typeof SystemState)[keyof typeof SystemState];

/**
 * System lifecycle hooks mapped type
 */
export type SystemHooks = {
  readonly [K in SystemStateType as `on${Capitalize<K>}`]?: () => void | Promise<void>;
};

// ========== Performance Optimization Types ==========

/**
 * Cached query result with TTL
 */
export interface CachedQuery<T = EntityId[]> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly key: string;
}

/**
 * Cache manager interface
 */
export interface QueryCache {
  get<T = EntityId[]>(key: string): CachedQuery<T> | undefined;
  set<T = EntityId[]>(key: string, data: T, ttl?: number): void;
  invalidate(key?: string): void;
  clear(): void;
}

// ========== Type Guards and Predicates ==========

/**
 * Type guard for component identification
 */
export type ComponentPredicate<T extends Component> = (
  component: Component
) => component is T;

/**
 * Type guard for system state
 */
export type SystemStatePredicate<T extends SystemStateType> = (
  state: SystemStateType
) => state is T;

// ========== Builder Pattern Types ==========

/**
 * Fluent builder pattern for system configuration
 */
export interface SystemBuilder<T extends BaseSystemConfig = BaseSystemConfig> {
  name(name: string): SystemBuilder<T & { name: string }>;
  priority(priority: number): SystemBuilder<T & { priority: number }>;
  type(systemType: SystemType): SystemBuilder<T & { systemType: SystemType }>;
  dependencies(
    ...deps: string[]
  ): SystemBuilder<T & { dependencies: readonly string[] }>;
  updateFrequency(freq: number): SystemBuilder<T & { updateFrequency: number }>;
  autoStart(auto: boolean): SystemBuilder<T & { autoStart: boolean }>;
  build(): T extends BaseSystemConfig ? ResolvedSystemConfig : never;
}

// ========== Conditional Types for System Specialization ==========

/**
 * Conditional type for systems that require specific components
 */
export type RequiredComponentsType<T> = T extends {
  requiredComponents: infer R;
}
  ? R extends readonly ComponentType[]
    ? R
    : never
  : never;

/**
 * Extract system type from configuration
 */
export type ExtractSystemType<T> = T extends { systemType: infer S }
  ? S extends SystemType
    ? S
    : SystemType.GAMEPLAY
  : SystemType.GAMEPLAY;

// ========== Event System Types ==========

/**
 * Type-safe event payload mapping
 */
export interface EventPayloadMap {
  'system:initialized': { systemName: string; config: ResolvedSystemConfig };
  'system:started': { systemName: string };
  'system:stopped': { systemName: string };
  'entity:created': { entityId: EntityId };
  'entity:destroyed': { entityId: EntityId };
  'component:added': { entityId: EntityId; componentType: ComponentType };
  'component:removed': { entityId: EntityId; componentType: ComponentType };
}

/**
 * Type-safe event emitter
 */
export type TypedEventEmitter = {
  emit<K extends keyof EventPayloadMap>(
    event: K,
    payload: EventPayloadMap[K]
  ): void;
  on<K extends keyof EventPayloadMap>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void
  ): () => void;
};

// ========== Metadata Types ==========

/**
 * System metadata for reflection and debugging
 */
export interface SystemMetadata {
  readonly name: string;
  readonly type: SystemType;
  readonly requiredComponents: readonly ComponentType[];
  readonly optionalComponents: readonly ComponentType[];
  readonly dependencies: readonly string[];
  readonly version: string;
  readonly description?: string;
}

/**
 * Component metadata for registration
 */
export interface ComponentMetadata {
  readonly type: ComponentType;
  readonly version: string;
  readonly serializable: boolean;
  readonly size: number;
  readonly description?: string;
}

// ========== Function Overload Reduction ==========

/**
 * Unified method signature for component operations
 */
export type ComponentOperation =
  | { action: 'get'; entityId: EntityId; componentType: ComponentType }
  | { action: 'add'; entityId: EntityId; component: Component }
  | { action: 'remove'; entityId: EntityId; componentType: ComponentType }
  | { action: 'has'; entityId: EntityId; componentType: ComponentType };

/**
 * Result type for component operations
 */
export type ComponentOperationResult<T extends ComponentOperation> =
  T['action'] extends 'get'
    ? Component | undefined
    : T['action'] extends 'add'
      ? void
      : T['action'] extends 'remove'
        ? boolean
        : T['action'] extends 'has'
          ? boolean
          : never;

// ========== Template Literal Types for Type Safety ==========

/**
 * Generate event names from prefixes
 */
export type EventName<
  Prefix extends string,
  Suffix extends string,
> = `${Prefix}:${Suffix}`;

/**
 * Component type naming convention
 */
export type ComponentTypeName<T extends string> = Lowercase<T>;

/**
 * System name validation
 */
export type ValidSystemName<T extends string> = T extends `${string}System`
  ? T
  : never;

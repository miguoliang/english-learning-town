/**
 * TypeScript decorators for ECS systems to reduce boilerplate code
 * Provides declarative configuration and automatic registration
 */

import 'reflect-metadata';
import { ComponentType } from '../Component';
import { SystemType } from '../GameSystem';
import {
  SystemMetadata,
  BaseSystemConfig,
  ResolvedSystemConfig,
} from '../types/UtilityTypes';

// ========== Metadata Keys ==========
const REQUIRED_COMPONENTS_KEY = Symbol('system:requiredComponents');
const OPTIONAL_COMPONENTS_KEY = Symbol('system:optionalComponents');
const SYSTEM_CONFIG_KEY = Symbol('system:config');

// ========== System Configuration Decorator ==========

/**
 * Decorator for system configuration - reduces constructor boilerplate
 */
export function System(config: Omit<BaseSystemConfig, 'name'>) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    const systemName = constructor.name;

    const resolvedConfig: ResolvedSystemConfig = {
      name: systemName,
      priority: config.priority,
      enabled: config.enabled ?? true,
      dependencies: config.dependencies ?? [],
      systemType: config.systemType ?? SystemType.GAMEPLAY,
      updateFrequency: config.updateFrequency ?? 0,
      autoStart: config.autoStart ?? true,
    };

    Reflect.defineMetadata(SYSTEM_CONFIG_KEY, resolvedConfig, constructor);

    return class extends constructor {
      constructor(...args: any[]) {
        super(resolvedConfig, ...args);
      }
    };
  };
}

// ========== Component Requirements Decorators ==========

/**
 * Decorator to specify required components - eliminates getRequiredComponents() method
 */
export function RequiresComponents(...componentTypes: ComponentType[]) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    Reflect.defineMetadata(
      REQUIRED_COMPONENTS_KEY,
      componentTypes,
      constructor
    );

    // Automatically implement getRequiredComponents method
    constructor.prototype.getRequiredComponents = function (): ComponentType[] {
      return componentTypes;
    };

    return constructor;
  };
}

/**
 * Decorator for optional components - used for query optimization
 */
export function OptionalComponents(...componentTypes: ComponentType[]) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    Reflect.defineMetadata(
      OPTIONAL_COMPONENTS_KEY,
      componentTypes,
      constructor
    );

    // Automatically implement getOptionalComponents method
    constructor.prototype.getOptionalComponents = function (): ComponentType[] {
      return componentTypes;
    };

    return constructor;
  };
}

// ========== Lifecycle Decorators ==========

/**
 * Decorator for automatic method binding and error handling
 */
export function SystemMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error) {
      console.error(
        `Error in ${target.constructor.name}.${propertyKey}:`,
        error
      );
      throw error;
    }
  };

  return descriptor;
}

/**
 * Decorator for update frequency validation
 */
export function UpdateFrequency(frequency: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let lastUpdate = 0;
    const interval = frequency > 0 ? 1000 / frequency : 0;

    descriptor.value = function (
      deltaTime: number,
      currentTime: number = performance.now()
    ) {
      if (interval > 0 && currentTime - lastUpdate < interval) {
        return;
      }
      lastUpdate = currentTime;
      return originalMethod.call(this, deltaTime);
    };

    return descriptor;
  };
}

// ========== Performance Decorators ==========

/**
 * Decorator for automatic query caching
 */
export function CachedQuery(ttl: number = 16) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const cache = new Map<string, { data: any; timestamp: number }>();
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      const now = performance.now();
      const cached = cache.get(cacheKey);

      if (cached && now - cached.timestamp < ttl) {
        return cached.data;
      }

      const result = originalMethod.apply(this, args);
      cache.set(cacheKey, { data: result, timestamp: now });

      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator for performance measurement
 */
export function Measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();

    // Check if debug is enabled through config accessor
    if ((this as any).getConfigValue?.('enableDebug')) {
      console.log(
        `${target.constructor.name}.${propertyKey}: ${(end - start).toFixed(2)}ms`
      );
    }

    return result;
  };

  return descriptor;
}

// ========== Validation Decorators ==========

/**
 * Decorator for component type validation
 */
export function ValidateComponentTypes(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (
    componentTypes: ComponentType[],
    ...args: any[]
  ) {
    if (!Array.isArray(componentTypes) || componentTypes.length === 0) {
      throw new Error(
        `${target.constructor.name}.${propertyKey}: componentTypes must be a non-empty array`
      );
    }

    for (const type of componentTypes) {
      if (typeof type !== 'string' || type.trim().length === 0) {
        throw new Error(
          `${target.constructor.name}.${propertyKey}: invalid component type: ${type}`
        );
      }
    }

    return originalMethod.call(this, componentTypes, ...args);
  };

  return descriptor;
}

// ========== Metadata Utilities ==========

/**
 * Get system configuration from decorator metadata
 */
export function getSystemConfig(
  constructor: new (...args: any[]) => any
): ResolvedSystemConfig | undefined {
  return Reflect.getMetadata(SYSTEM_CONFIG_KEY, constructor);
}

/**
 * Get required components from decorator metadata
 */
export function getRequiredComponents(
  constructor: new (...args: any[]) => any
): ComponentType[] {
  return Reflect.getMetadata(REQUIRED_COMPONENTS_KEY, constructor) || [];
}

/**
 * Get optional components from decorator metadata
 */
export function getOptionalComponents(
  constructor: new (...args: any[]) => any
): ComponentType[] {
  return Reflect.getMetadata(OPTIONAL_COMPONENTS_KEY, constructor) || [];
}

/**
 * Get complete system metadata
 */
export function getSystemMetadata(
  constructor: new (...args: any[]) => any
): SystemMetadata | undefined {
  const config = getSystemConfig(constructor);
  if (!config) return undefined;

  return {
    name: config.name,
    type: config.systemType,
    requiredComponents: getRequiredComponents(constructor),
    optionalComponents: getOptionalComponents(constructor),
    dependencies: config.dependencies,
    version: '1.0.0', // Could be extracted from package.json
    description: constructor.name,
  };
}

// ========== System Registry ==========

/**
 * Automatic system registration
 */
export function RegisterSystem(target: new (...args: any[]) => any) {
  // Register system automatically when class is defined
  // This would integrate with the SystemManager
  const metadata = getSystemMetadata(target);
  if (metadata) {
    // systemManager.registerSystemClass(target as any, metadata);
    console.log(`System registered: ${metadata.name}`);
  }

  return target;
}

// ========== Composition Decorators ==========

/**
 * Combine multiple decorators into one
 */
export function ECSSystem(
  config: Omit<BaseSystemConfig, 'name'>,
  requiredComponents: ComponentType[] = [],
  optionalComponents: ComponentType[] = []
) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    // Apply all decorators
    const SystemDecorated = System(config)(constructor);
    const ComponentsDecorated = RequiresComponents(...requiredComponents)(
      SystemDecorated
    );
    const OptionalDecorated = OptionalComponents(...optionalComponents)(
      ComponentsDecorated
    );
    const RegisteredDecorated = RegisterSystem(OptionalDecorated);

    return RegisteredDecorated as T;
  };
}

// ========== Type-safe Component Decorators ==========

/**
 * Type-safe component requirement decorator using template literals
 */
export function ComponentRequirement<T extends ComponentType>(
  componentType: T
) {
  return function (target: any, _propertyKey: string) {
    const existingComponents =
      Reflect.getMetadata(REQUIRED_COMPONENTS_KEY, target.constructor) || [];
    Reflect.defineMetadata(
      REQUIRED_COMPONENTS_KEY,
      [...existingComponents, componentType],
      target.constructor
    );
  };
}

// ========== Export Utility Functions ==========

/**
 * Helper to create system decorators with validation
 */
export const createSystemDecorator = (
  name: string,
  config: Partial<BaseSystemConfig>
) => {
  return ECSSystem({
    priority: 1000,
    enabled: true,
    ...config,
  });
};

/**
 * Common system type decorators
 */
export const CoreSystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.CORE });

export const GameplaySystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.GAMEPLAY });

export const UISystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.UI });

export const AudioSystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.AUDIO });

export const NetworkSystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.NETWORK });

export const DebugSystem = (
  config: Omit<BaseSystemConfig, 'name' | 'systemType'>
) => System({ ...config, systemType: SystemType.DEBUG });

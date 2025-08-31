# @english-learning-town/core

A high-performance, type-safe ECS (Entity-Component-System) engine built with
modern TypeScript. This package provides the foundational architecture for
building scalable games and interactive applications.

## Features

- 🚀 **Pure ECS Architecture** - True separation of entities, components, and
  systems
- 🎯 **Type Safety** - Full TypeScript support with advanced type inference
- ⚡ **High Performance** - Optimized query caching and memory management
- 🎨 **Decorator Support** - Reduce boilerplate with modern decorators
- 🔧 **Production Ready** - Comprehensive error handling and debugging tools
- 📦 **Zero Dependencies** - Lightweight with minimal external dependencies

## Installation

```bash
npm install @english-learning-town/core
# or
pnpm add @english-learning-town/core
```

## Quick Start

### 1. Initialize the ECS World

```typescript
import { world, gameEngine } from '@english-learning-town/core';

// Initialize the ECS world
await world.initialize();

// Start the game engine
gameEngine.start();
```

### 2. Create Components

Components are pure data containers with no logic:

```typescript
import { BaseComponent, ComponentType } from '@english-learning-town/core';

// Position component
export class PositionComponent extends BaseComponent {
  readonly componentType: ComponentType = 'position';

  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
    super();
  }

  serialize() {
    return {
      componentType: this.componentType,
      x: this.x,
      y: this.y,
    };
  }

  static deserialize(data: any): PositionComponent {
    return new PositionComponent(data.x, data.y);
  }
}

// Velocity component
export class VelocityComponent extends BaseComponent {
  readonly componentType: ComponentType = 'velocity';

  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
    super();
  }

  serialize() {
    return {
      componentType: this.componentType,
      x: this.x,
      y: this.y,
    };
  }

  static deserialize(data: any): VelocityComponent {
    return new VelocityComponent(data.x, data.y);
  }
}
```

### 3. Register Components

```typescript
import { world } from '@english-learning-town/core';

// Register component types
world.registerComponentType('position', PositionComponent);
world.registerComponentType('velocity', VelocityComponent);
```

### 4. Create Systems

#### Basic System (Manual Configuration)

```typescript
import {
  GameSystem,
  ComponentType,
  EntityId,
} from '@english-learning-town/core';

export class MovementSystem extends GameSystem {
  constructor() {
    super({
      name: 'MovementSystem',
      priority: 100,
      systemType: SystemType.GAMEPLAY,
    });
  }

  protected getRequiredComponents(): ComponentType[] {
    return ['position', 'velocity'];
  }

  protected processEntity(entityId: EntityId, deltaTime: number): void {
    const position = this.getComponent<PositionComponent>(entityId, 'position');
    const velocity = this.getComponent<VelocityComponent>(entityId, 'velocity');

    if (position && velocity) {
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
    }
  }
}
```

#### Optimized System (With Decorators)

```typescript
import {
  GameplaySystem,
  RequiresComponents,
  CachedQueryDecorator as CachedQuery,
} from '@english-learning-town/core';

@GameplaySystem({ priority: 100 })
@RequiresComponents('position', 'velocity')
export class MovementSystem extends GameSystem {
  @CachedQuery(16) // Cache for 16ms
  protected processEntity(entityId: EntityId, deltaTime: number): void {
    // Multi-component getter for better performance
    const { position, velocity } = this.getComponents(entityId, {
      position: 'position',
      velocity: 'velocity',
    });

    if (position && velocity) {
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
    }
  }
}
```

### 5. Register and Start Systems

```typescript
import { world } from '@english-learning-town/core';

// Register systems
const movementSystem = new MovementSystem();
world.registerSystem(movementSystem);

// Systems will start automatically when world starts
world.start();
```

### 6. Create and Manage Entities

```typescript
import { world } from '@english-learning-town/core';

// Create an entity
const entity = world.createEntity();

// Add components
const position = new PositionComponent(100, 200);
const velocity = new VelocityComponent(50, -30);

world.addComponent(entity.id, position);
world.addComponent(entity.id, velocity);

// Query entities
const movingEntities = world.queryEntities(['position', 'velocity']);
console.log(`Found ${movingEntities.length} moving entities`);

// Remove components
world.removeComponent(entity.id, 'velocity');

// Destroy entity
world.destroyEntity(entity.id);
```

## Advanced Usage

### Custom System Types

```typescript
import { CoreSystem, RequiresComponents } from '@english-learning-town/core';

@CoreSystem({
  priority: 50,
  updateFrequency: 30, // 30 FPS
  dependencies: ['InputSystem'],
})
@RequiresComponents('transform', 'renderable')
export class RenderSystem extends GameSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  protected async onInitialize(): Promise<void> {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
  }

  protected processEntities(entities: EntityId[], deltaTime: number): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render all entities
    super.processEntities(entities, deltaTime);
  }

  protected processEntity(entityId: EntityId, deltaTime: number): void {
    const transform = this.getComponent<TransformComponent>(
      entityId,
      'transform'
    );
    const renderable = this.getComponent<RenderableComponent>(
      entityId,
      'renderable'
    );

    if (transform && renderable) {
      this.ctx.fillStyle = renderable.color;
      this.ctx.fillRect(
        transform.x,
        transform.y,
        renderable.width,
        renderable.height
      );
    }
  }
}
```

### Performance Optimization

#### Batch Operations

```typescript
@GameplaySystem({ priority: 200 })
@RequiresComponents('health', 'status')
export class HealthSystem extends GameSystem {
  protected processEntities(entities: EntityId[], deltaTime: number): void {
    // Batch process entities for better performance
    const healingEntities = entities.filter((entityId) =>
      this.hasComponent(entityId, 'healing')
    );

    const damageEntities = entities.filter((entityId) =>
      this.hasComponent(entityId, 'damage')
    );

    this.processHealing(healingEntities, deltaTime);
    this.processDamage(damageEntities, deltaTime);
  }

  private processHealing(entities: EntityId[], deltaTime: number): void {
    entities.forEach((entityId) => {
      const { health, healing } = this.getComponents(entityId, {
        health: 'health',
        healing: 'healing',
      });

      if (health && healing) {
        health.current = Math.min(
          health.max,
          health.current + healing.rate * deltaTime
        );
      }
    });
  }
}
```

#### Type Guards for Validation

```typescript
import {
  isValidEntityId,
  isComponent,
  assertIsValidEntityId,
  ComponentTypeGuards,
} from '@english-learning-town/core';

export class SafeSystem extends GameSystem {
  protected processEntity(entityId: unknown, deltaTime: number): void {
    // Type guard with assertion
    assertIsValidEntityId(entityId); // Throws if invalid, narrows type

    // entityId is now typed as EntityId
    const component = this.getComponent(entityId, 'position');

    if (isComponent(component)) {
      // component is now typed as Component
      console.log(`Processing component: ${component.componentType}`);
    }
  }

  protected validateComponents(components: unknown[]): void {
    const validComponents = components.filter(ComponentTypeGuards.isComponent);
    // validComponents is now Component[]
    validComponents.forEach((component) => {
      console.log(`Valid component: ${component.componentType}`);
    });
  }
}
```

### Event Handling

```typescript
import { eventBus, CoreEvents } from '@english-learning-town/core';

export class GameManager {
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to system events
    eventBus.on(CoreEvents.SYSTEM_STARTED, (data) => {
      console.log(`System started: ${data.system}`);
    });

    eventBus.on(CoreEvents.SYSTEM_ERROR, (data) => {
      console.error(`System error in ${data.system}:`, data.error);
      this.handleSystemError(data);
    });

    // Listen to engine events
    eventBus.on(CoreEvents.ENGINE_STARTED, () => {
      console.log('Game engine started successfully');
    });
  }

  private handleSystemError(errorData: any): void {
    // Implement error recovery logic
    if (errorData.system === 'RenderSystem') {
      // Restart render system
      world.stopSystem('RenderSystem');
      setTimeout(() => world.startSystem('RenderSystem'), 1000);
    }
  }
}
```

## API Reference

### World

The `World` class is the central coordinator for all ECS operations.

```typescript
// Entity management
const entity = world.createEntity(): Entity
world.destroyEntity(entityId: EntityId): boolean
world.hasEntity(entityId: EntityId): boolean

// Component management
world.addComponent<T>(entityId: EntityId, component: T): void
world.removeComponent(entityId: EntityId, componentType: ComponentType): boolean
world.getComponent<T>(entityId: EntityId, componentType: ComponentType): T | undefined
world.hasComponent(entityId: EntityId, componentType: ComponentType): boolean

// System management
world.registerSystem(system: GameSystem): void
world.unregisterSystem(systemName: string): Promise<void>
world.startSystem(systemName: string): void
world.stopSystem(systemName: string): void

// Queries
world.queryEntities(componentTypes: ComponentType[]): EntityId[]
world.queryEntitiesWithComponent(componentType: ComponentType): EntityId[]

// Lifecycle
world.initialize(): Promise<void>
world.start(): void
world.stop(): void
world.cleanup(): Promise<void>
```

### GameSystem

Base class for all systems in the ECS architecture.

```typescript
// Required overrides
abstract getRequiredComponents(): ComponentType[]

// Optional overrides
protected processEntities(entities: EntityId[], deltaTime: number): void
protected processEntity(entityId: EntityId, deltaTime: number): void
protected getOptionalComponents(): ComponentType[]

// Lifecycle hooks
protected async onInitialize(): Promise<void>
protected onStart(): void
protected onStop(): void
protected async onCleanup(): Promise<void>

// Query methods
protected query<T>(componentTypes: T, ttl?: number): EntityId[]
protected getComponent<T>(entityId: EntityId, componentType: ComponentType): T | undefined
protected getComponents<T>(entityId: EntityId, componentMap: T): { [K in keyof T]: Component | undefined }
protected hasComponent(entityId: EntityId, componentType: ComponentType): boolean
protected hasComponents(entityId: EntityId, componentTypes: ComponentType[]): boolean
```

### Decorators

#### System Configuration

```typescript
@System(config: SystemConfig) // Basic system configuration
@CoreSystem(config) // Core system type
@GameplaySystem(config) // Gameplay system type
@UISystem(config) // UI system type
@AudioSystem(config) // Audio system type
@NetworkSystem(config) // Network system type
@DebugSystem(config) // Debug system type
```

#### Component Requirements

```typescript
@RequiresComponents(...componentTypes: ComponentType[])
@OptionalComponents(...componentTypes: ComponentType[])
```

#### Performance

```typescript
@CachedQuery(ttl: number) // Cache query results
@Measure // Measure method execution time
@UpdateFrequency(frequency: number) // Limit update frequency
```

## Best Practices

### 1. Component Design

- Keep components as pure data containers
- Avoid logic in components
- Use composition over inheritance
- Make components serializable

```typescript
// ✅ Good: Pure data component
class HealthComponent extends BaseComponent {
  readonly componentType = 'health';
  constructor(
    public current: number,
    public max: number
  ) {
    super();
  }
}

// ❌ Bad: Component with logic
class HealthComponent extends BaseComponent {
  heal(amount: number) {
    /* logic here */
  } // Don't do this
}
```

### 2. System Design

- Single responsibility per system
- Use decorators to reduce boilerplate
- Batch operations when possible
- Handle errors gracefully

```typescript
// ✅ Good: Focused system
@GameplaySystem({ priority: 100 })
@RequiresComponents('position', 'velocity')
class MovementSystem extends GameSystem {
  protected processEntity(entityId: EntityId, deltaTime: number): void {
    // Only handle movement
  }
}
```

### 3. Performance

- Use query caching for expensive operations
- Batch component access when possible
- Avoid creating objects in update loops
- Use type guards for validation

```typescript
// ✅ Good: Efficient querying
@CachedQuery(16)
protected updateEntities(): void {
  const entities = this.query(['position', 'velocity']);
  entities.forEach(entityId => {
    const { position, velocity } = this.getComponents(entityId, {
      position: 'position',
      velocity: 'velocity'
    });
    // Process...
  });
}
```

### 4. Error Handling

- Use type guards for input validation
- Handle system errors gracefully
- Implement fallback behaviors
- Log errors appropriately

```typescript
export class RobustSystem extends GameSystem {
  protected processEntity(entityId: EntityId, deltaTime: number): void {
    try {
      if (!isValidEntityId(entityId)) {
        console.warn(`Invalid entity ID: ${entityId}`);
        return;
      }

      // Process entity safely
      this.processEntitySafely(entityId, deltaTime);
    } catch (error) {
      console.error(`Error processing entity ${entityId}:`, error);
      // Continue processing other entities
    }
  }
}
```

## Debugging and Monitoring

### Get System Statistics

```typescript
// Engine stats
const engineStats = gameEngine.getStats();
console.log('FPS:', engineStats.fps);
console.log('Delta Time:', engineStats.deltaTime);

// World stats
const worldStats = world.getStats();
console.log('Entities:', worldStats.entities.activeEntities);
console.log('Systems:', worldStats.systems.running);

// Individual system stats
const system = world.getSystem('MovementSystem');
console.log('System running:', system?.isRunning);
```

### Enable Debug Mode

```typescript
// Enable engine debug mode
gameEngine.updateConfig({ enableDebug: true });

// Listen to debug events
eventBus.on(CoreEvents.DEBUG_LOG, (data) => {
  console.log(`[${data.system}] ${data.message}`);
});
```

## TypeScript Configuration

For optimal TypeScript support, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

## License

This package is part of the English Learning Town project.

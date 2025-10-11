# ECS Architecture Guide

## Overview

This project uses **bitECS**, a high-performance Entity Component System (ECS) library, to manage game entities and their behaviors. This architecture provides better separation of concerns, improved maintainability, and excellent performance.

## Why ECS?

### Problems It Solves

1. **Conditional Logic Complexity**: Easily manage entities with varying behaviors based on state
2. **Performance**: Data-oriented design is cache-friendly and fast
3. **Maintainability**: Systems are independent and testable
4. **Flexibility**: Mix and match components without inheritance hierarchies

### Before ECS

```typescript
// Complex arrays of objects with mixed concerns
private buildingLayers: Array<{
  layers: Phaser.Tilemaps.TilemapLayer[];
  depthThreshold: number;
  bounds: { minX, maxX, minY, maxY };
  scale: number;
}> = [];

// Manual updates scattered across methods
updateBuildingTransparency() {
  this.buildingLayers.forEach(buildingGroup => {
    // Complex logic mixing data and behavior
  });
}
```

### After ECS

```typescript
// Clean component definitions (pure data)
const TransparencyComponent = defineComponent({
  currentAlpha: Types.f32,
  targetAlpha: Types.f32,
  transitionSpeed: Types.f32,
});

// Focused systems (pure logic)
const transparencySystem = (world: IWorld) => {
  const entities = transparencyQuery(world);
  // Process only entities with transparency component
};
```

## Architecture

### Components (Data)

Components are pure data structures that describe entity properties:

- **DepthComponent**: Z-depth sorting for proper layering
- **BoundsComponent**: Spatial bounds for collision/triggers
- **PositionComponent**: World position tracking
- **SpriteComponent**: Link to Phaser game objects

### Systems (Logic)

Systems process entities with specific component combinations:

- **DepthSortingSystem**: Updates sprite depth based on Y position

### Entity Factory

Helper class for creating common entity types with their components:

```typescript
// Create a player
EntityFactory.createPlayer(world, {
  sprite: playerSprite,
  x: 400,
  y: 300,
  baseDepth: 10000
});
```

## Usage Example

### Setup

```typescript
import { createECSWorld, EntityFactory, depthSortingSystem } from '../ecs';

class Game extends Scene {
  private ecsWorld: IWorld;
  
  create() {
    // Initialize ECS world
    this.ecsWorld = createECSWorld();
    
    // Create entities
    this.playerEntityId = EntityFactory.createPlayer(this.ecsWorld, {
      sprite: this.player,
      x: 100,
      y: 100
    });
  }
}
```

### Update Loop

```typescript
update() {
  // Update position components
  PositionComponent.x[this.playerEntityId] = this.player.x;
  PositionComponent.y[this.playerEntityId] = this.player.y;
  
  // Run systems
  depthSortingSystem(this.ecsWorld);
}
```

### Cleanup

```typescript
destroy() {
  SpriteRegistry.clear();
  resetECSWorld();
}
```

## Adding New Features

### Step 1: Define Component

```typescript
// components/HealthComponent.ts
export const HealthComponent = defineComponent({
  current: Types.ui16,
  max: Types.ui16,
});
```

### Step 2: Create System

```typescript
// systems/HealthSystem.ts
const healthQuery = defineQuery([HealthComponent, SpriteComponent]);

export const healthSystem = (world: IWorld): IWorld => {
  const entities = healthQuery(world);
  
  for (const eid of entities) {
    const current = HealthComponent.current[eid];
    const max = HealthComponent.max[eid];
    
    // Update health bar, check for death, etc.
  }
  
  return world;
};
```

### Step 3: Add to Entity Factory (Optional)

```typescript
static createEnemy(world: IWorld, options: EnemyOptions): number {
  const eid = addEntity(world);
  
  addComponent(world, HealthComponent, eid);
  HealthComponent.current[eid] = 100;
  HealthComponent.max[eid] = 100;
  
  return eid;
}
```

### Step 4: Run in Update Loop

```typescript
update() {
  healthSystem(this.ecsWorld);
}
```

## Best Practices

1. **Components = Pure Data**: No methods, just properties
2. **Systems = Pure Functions**: No side effects outside entity processing
3. **Queries First**: Define queries outside systems for performance
4. **Phaser Objects Separate**: Use SpriteRegistry to keep Phaser objects out of ECS
5. **Cleanup**: Always clean up ECS resources on scene destroy

## Performance Benefits

- **Cache-Friendly**: Components stored in contiguous arrays
- **Parallel-Ready**: Systems can be parallelized (future enhancement)
- **Query Optimization**: bitECS uses bitsets for fast entity filtering
- **Memory Efficient**: Packed data structures with no overhead

## Migration Strategy

The current implementation migrated two complex systems to ECS:

1. ✅ Building transparency (conditional alpha based on player position)
2. ✅ Depth sorting (Y-based sprite layering)

Future candidates for migration:

- [ ] Collision detection (conditional collision bodies)
- [ ] NPC interactions (proximity-based triggers)
- [ ] Door system (state-based transitions)
- [ ] Particle effects (lifecycle management)

## Resources

- [bitECS GitHub](https://github.com/NateTheGreatt/bitECS)
- [ECS Pattern Overview](https://en.wikipedia.org/wiki/Entity_component_system)
- [Data-Oriented Design](https://en.wikipedia.org/wiki/Data-oriented_design)


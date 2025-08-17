# @elt/core

Core Entity Component System (ECS) engine for English Learning Town.

## Overview

Pure TypeScript ECS implementation with zero React dependencies. Provides the foundation for game logic through composition-based architecture with event-driven communication.

## Features

- **ECS Architecture**: World → Entities → Components + Systems
- **Event-Driven**: Type-safe event bus with mitt library  
- **Performance Optimized**: Efficient component filtering and batch processing
- **Fully Tested**: 157 comprehensive unit tests
- **Type-Safe**: Strict TypeScript with zero compilation errors

## Installation

```bash
pnpm add @elt/core
```

## Quick Start

```typescript
import { World, createPositionComponent, createRenderableComponent } from '@elt/core';

// Create ECS world
const world = new World();

// Create entity with components
const entity = world.createEntity('player');
world.addComponent(entity.id, createPositionComponent(10, 10));
world.addComponent(entity.id, createRenderableComponent('emoji', { icon: '🧑' }));

// Add systems
world.addSystem(new MovementSystem());
world.addSystem(new RenderSystem());

// Start game loop
const gameLoop = () => {
  world.update();
  requestAnimationFrame(gameLoop);
};
gameLoop();
```

## Architecture

### Core Classes

- **World**: Main ECS coordinator managing entities, components, and systems
- **Entity**: Simple ID-based entities
- **Component**: Pure data interfaces
- **System**: Logic processors that operate on entities with specific components

### Available Components

- **Spatial**: PositionComponent, SizeComponent, VelocityComponent, CollisionComponent
- **Visual**: RenderableComponent, AnimationComponent, MovementAnimationComponent  
- **Interactive**: InteractiveComponent, InputComponent
- **Game-Specific**: PlayerComponent, NPCComponent, BuildingComponent
- **Educational**: LearningComponent, ProgressComponent, QuestGiverComponent

### Available Systems

- **CollisionSystem**: Collision detection and movement validation
- **MovementSystem**: Physics-based entity movement
- **InputStateSystem**: Keyboard input processing
- **MouseInputSystem**: Click-to-move and entity interactions
- **InteractionSystem**: NPC dialogue, building entrances, scene transitions
- **RenderSystem**: Entity rendering with z-index sorting
- **AnimationSystem**: Frame-based entity animations

## Event System

Type-safe event bus for system communication:

```typescript
import { ecsEventBus } from '@elt/core';

// Emit events
ecsEventBus.emit('dialogue:start', { npcId: 'teacher', playerId: 'player' });

// Listen for events
ecsEventBus.on('scene:transition', (event) => {
  console.log(`Transitioning from ${event.from} to ${event.to}`);
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Build package
pnpm build
```

## Testing

Comprehensive test suite with 157 tests covering:

- Core ECS functionality
- Component creation and management
- System processing and interactions
- Event bus communication
- Integration scenarios

## License

Private - English Learning Town Project
# Technical Collaboration Guide for Claude

## 🎯 Project Context
English Learning Town - Educational RPG built with React + TypeScript that gamifies English language learning through interactive storytelling and quest-based progression.

## 📋 Discussion Framework Reference

### Quick Navigation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture, ECS patterns, system design
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Feature planning, roadmap, sprint planning, testing strategy

## 🎮 Game Architecture

### ECS (Entity Component System) Architecture (2025-01-09)
The game has been fully migrated to **ECS architecture** with Event-Driven and Data-Driven patterns:

**Game = World → Entities → Components + Systems**

1. **ECS Core Pattern**:
   ```typescript
   // Entities are just IDs
   const entity = world.createEntity('player');
   
   // Components are pure data
   world.addComponent(entity.id, createPositionComponent(10, 10));
   world.addComponent(entity.id, createPlayerComponent('Alex'));
   
   // Systems contain all logic
   world.addSystem(new MovementSystem());
   world.addSystem(new RenderSystem());
   ```

2. **Event-Driven Communication**:
   ```typescript
   // Systems communicate via events, not direct calls
   eventBus.emit('dialogue:start', { npcId: 'teacher', dialogueId: 'lesson-1' });
   eventBus.emit('scene:transition', { from: 'town', to: 'school-interior' });
   eventBus.emit('player:moved', { newPosition: { x: 15, y: 10 } });
   ```

3. **Data-Driven Scene Configuration**:
   ```json
   // scenes/town.json - Complete scene definition
   {
     "id": "town",
     "name": "English Learning Town",
     "entities": [
       {
         "id": "school",
         "components": {
           "position": { "x": 5, "y": 3 },
           "size": { "width": 4, "height": 3 },
           "building": { "name": "School", "type": "educational" },
           "interactive": { "type": "building-entrance", "entrances": [...] }
         }
       }
     ]
   }
   ```

4. **SRP-Compliant System Architecture** (2025-01-09):
   - **CollisionSystem**: Collision detection and movement validation
   - **MovementSystem**: Physics-based entity movement
   - **KeyboardInputSystem**: WASD/Arrow key input processing
   - **MouseInputSystem**: Click-to-move and entity interactions
   - **InteractionSystem**: NPC dialogue, building entrances, scene transitions
   - **RenderSystem**: Z-index sorted polymorphic rendering
   - **AnimationSystem**: Frame-based entity animations
   - **MovementAnimationSystem**: Direction-based movement animations

### ECS Components Available
- **Spatial**: PositionComponent, SizeComponent, VelocityComponent, CollisionComponent
- **Visual**: RenderableComponent, AnimationComponent, MovementAnimationComponent
- **Interactive**: InteractiveComponent, InputComponent
- **Game-Specific**: PlayerComponent, NPCComponent, BuildingComponent, FurnitureComponent, DecorationComponent
- **Educational**: LearningComponent, ProgressComponent, QuestGiverComponent

### Architecture Components
- **ECSGameApp**: Top-level scene coordinator using ECS
- **ECSScene**: Universal scene component (replaces TownScene/SchoolScene)
- **ECSRenderer**: React component that renders ECS world
- **World**: Core ECS coordinator managing entities/components/systems
- **SceneLoader**: Data-driven scene creation from JSON
- **useECSWorld**: React hook for ECS world management
- **EventBus**: Event system for loose system coupling

### Migration from Range Architecture
- **Before**: Range-based inheritance hierarchy (BuildingRange, SpriteRange, PlantRange)
- **After**: Composition-based ECS (entities with mixable components)
- **Benefit**: More flexible - any entity can have any combination of components
- **Example**: A building can now be animated, a plant can become interactive, NPCs can have learning components

## 🏗️ React Development Guidelines

### TypeScript Import Best Practices
**CRITICAL**: Use type-only imports to optimize bundle size and ensure build compliance:
```typescript
// CORRECT - Type-only imports
import type { QuestData, NPCData, DialogueEntry } from '../types';
import { QuestStatus, ObjectiveType } from '../types';

// WRONG - Can cause bundling issues
import { QuestData, NPCData, QuestStatus } from '../types';
```

### Single Responsibility Principle Architecture
Follow the established modular architecture with ECS integration:
```
src/
├── components/
│   ├── forms/          # Form-specific components
│   ├── scenes/         # Scene containers (ECSScene, MainMenu)
│   └── ui/             # Reusable UI components
├── ecs/                # ECS architecture core
│   ├── core.ts         # World, Entity, Component, System base classes
│   ├── components.ts   # Component definitions
│   ├── systems.ts      # System implementations
│   ├── sceneLoader.ts  # Data-driven scene creation
│   └── ECSRenderer.tsx # React ECS renderer
├── data/
│   └── scenes/         # JSON scene configurations
├── hooks/              # Business logic hooks (including useECSWorld)
├── styles/             # Theme and global styles
├── utils/              # Utility functions and managers
└── stores/             # State management
```

### Component Development Patterns
- **Keep components under 200 lines**
- **Single responsibility per component**
- **Extract business logic to custom hooks**

```typescript
// CORRECT - ECS Scene Component
export const ECSScene: React.FC<ECSSceneProps> = ({ sceneId, sceneName, sceneDataPath }) => {
  const { world, loadScene } = useECSWorld();
  return <ECSRenderer world={world} />;
};

// CORRECT - ECS World Management Hook
export const useECSWorld = (options: UseECSWorldOptions = {}) => {
  const world = useMemo(() => new World(), []);
  const sceneLoader = useMemo(() => new SceneLoader(world), [world]);
  return { world, sceneLoader, loadScene, addPlayer };
};
```

### Single Responsibility Principle (SRP) Refactoring

**ECS Architecture Migration Completed** (2025-01-09) - Major architectural evolution:

**From Range Architecture to ECS**:
- **Before**: Inheritance-based Range hierarchy (BuildingRange, SpriteRange, PlantRange)
- **After**: Composition-based ECS with mixable components

**ECS Implementation**:
- **World.ts**: Core ECS coordinator managing entities, components, and systems
- **components.ts**: 20+ component types for spatial, visual, interactive, and game-specific data
- **systems.ts**: 6 systems handling movement, input, interaction, rendering, and animation
- **sceneLoader.ts**: Data-driven scene creation from JSON configurations
- **ECSRenderer.tsx**: React component that renders ECS world in real-time
- **useECSWorld.ts**: React hook for ECS world lifecycle management

**SRP-Refactored Systems** (2025-01-09):
- **CollisionSystem**: Dedicated collision detection and movement validation
- **MovementSystem**: Pure physics-based entity movement  
- **KeyboardInputSystem**: WASD/Arrow key input processing only
- **MouseInputSystem**: Click-to-move and entity click interactions
- **InteractionSystem**: Event-driven NPC dialogue, building entrances, scene transitions
- **RenderSystem**: Z-index sorted rendering with polymorphic entity types
- **AnimationSystem**: Frame-based animations for dynamic entities
- **MovementAnimationSystem**: Direction-based movement animations

**Data-Driven Scenes**:
- **town.json**: Complete town layout with buildings, NPCs, and decorations
- **school.json**: Classroom interior with furniture and educational NPCs
- **SceneLoader**: Automatic entity/component creation from JSON data

**DialogueSystem Refactoring Completed** - Previous SRP example:

**Before**: DialogueSystem.tsx (500+ lines, multiple responsibilities)
- UI rendering + state management + keyboard handling + vocabulary logic + quest integration

**After**: Modular architecture with focused components
- **DialogueSystem.tsx**: UI orchestration only (110 lines)
- **useDialogueState.ts**: State management, vocabulary learning, quest integration
- **useDialogueKeyboard.ts**: Keyboard interactions (ESC, arrows, Enter/Space)
- **DialogueHeader.tsx**: Speaker info and controls hint
- **DialogueText.tsx**: Vocabulary-highlighted text rendering
- **ResponseOptions.tsx**: Dialogue response selection
- **ContinueButton.tsx**: Simple dialogue continuation
- **VocabularyProgress.tsx**: Learned vocabulary feedback
- **vocabularyHighlighter.ts**: Text highlighting and NPC avatar utilities

**ECS Architecture Benefits**:
- **Scalability**: Easy to add new entity types and behaviors via composition
- **Maintainability**: Clear separation of data (components) and logic (systems)  
- **Flexibility**: Systems can be enabled/disabled, components mixed and matched
- **Performance**: Efficient component filtering and batch processing
- **Extensibility**: Add new systems without modifying existing code
- **Event-Driven**: Loose coupling between systems via EventBus
- **Data-Driven**: JSON scene configurations enable rapid level design

### UI/UX Improvements (2025-01-03)

**Dialogue System Navigation Enhancement**:
- **Problem**: Button scaling animations were distracting and shifted dialogue layout
- **Solution**: Replaced with 👉 finger pointer positioned 30px left of active options
- **Benefits**: Clear visual indication without layout shifts, better focus on dialogue content

**Vocabulary Highlighting Bug Fix**:
- **Problem**: Raw HTML classes like `vocabulary-highlight">` appearing in dialogue text
- **Root Cause**: Fragile regex-based HTML parsing in DialogueText component
- **Solution**: Modified `vocabularyHighlighter.ts` to generate inline styles directly
- **Principle**: Avoid regex HTML parsing - generate final styled HTML at source
- **Result**: Clean vocabulary highlighting without HTML artifacts

### Theme Usage Patterns
Always use theme properties from styled-components:
```typescript
// CORRECT - Theme-based styling
const Button = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.text};
`;
```

### TypeScript Configuration Compliance
The project uses strict TypeScript settings:
- `verbatimModuleSyntax: true` - Requires explicit type-only imports
- `erasableSyntaxOnly: true` - Use const objects instead of enums
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - Prefix unused params with underscore

### Type Definitions Pattern
```typescript
// CORRECT - Const objects (compliant with erasableSyntaxOnly)
export const QuestType = {
  CONVERSATION: 'CONVERSATION',
  DELIVERY: 'DELIVERY'
} as const;
export type QuestType = typeof QuestType[keyof typeof QuestType];

// WRONG - Enums not allowed
export enum QuestType { ... }
```

### Audio Management
Use the centralized AudioManager:
```typescript
import { AudioManager } from '../utils/audioManager';
AudioManager.playClick();
AudioManager.playSuccess();
```

### ECS Implementation Guidelines

**Entity Creation Pattern**:
```typescript
// 1. Create entity
const entity = world.createEntity('unique-id');

// 2. Add components
world.addComponent(entity.id, createPositionComponent(10, 5));
world.addComponent(entity.id, createRenderableComponent('emoji', { icon: '🏫' }));
world.addComponent(entity.id, createBuildingComponent('School', 'educational'));

// 3. Systems automatically process entities with required components
// No manual registration needed - systems discover entities by components
```

**Component Development Pattern**:
```typescript
// Components are pure data interfaces
export interface CustomComponent extends Component {
  readonly type: 'custom';
  customProperty: string;
  customData: number;
}

// Factory function for creation
export const createCustomComponent = (prop: string, data: number): CustomComponent => ({
  type: 'custom',
  customProperty: prop,
  customData: data
});
```

**System Development Pattern**:
```typescript
export class CustomSystem implements System {
  readonly name = 'CustomSystem';
  readonly requiredComponents = ['position', 'custom'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, events: EventBus): void {
    const customEntities = components.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of customEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const custom = components.getComponent<CustomComponent>(entityId, 'custom');
      // Process entity logic here
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }
}
```

**Event-Driven Communication**:
```typescript
// Systems emit events instead of direct method calls
events.emit('dialogue:start', { npcId: 'teacher', playerId: 'player' });

// Other systems listen for events
events.subscribe('dialogue:start', (event) => {
  // Handle dialogue start logic
});
```

**Data-Driven Scene Creation**:
```json
// Add new entities via JSON - no code changes needed
{
  "id": "new-building",
  "components": {
    "position": { "x": 15, "y": 8 },
    "renderable": { "type": "emoji", "icon": "🏪" },
    "building": { "name": "New Shop", "type": "commercial" },
    "interactive": { "type": "building-entrance", "entrances": [...] }
  }
}
```

### Build & Testing Protocol
After making changes:
1. Run `npm run build` - Verify TypeScript compilation (zero errors)
2. Run `npm run dev` - Test development server
3. Check bundle size optimization (target: <150KB gzipped)
4. Verify all functionality works end-to-end

## Development Setup
```bash
cd react-client
npm install
npm run dev
```

## Architecture Notes
- React frontend connects to existing Go backend
- All game logic now in TypeScript/React
- State persisted with Zustand + localStorage
- Lightweight CSS animations (framer-motion removed for better debugging)
- Audio generated procedurally with Web Audio API

## Key Files to Remember
- `src/ecs/core.ts` - ECS World, Entity, Component, System base classes
- `src/ecs/components.ts` - All component type definitions
- `src/ecs/systems.ts` - All system implementations
- `src/ecs/sceneLoader.ts` - Data-driven scene creation
- `src/data/scenes/` - JSON scene configurations
- `src/hooks/useECSWorld.ts` - ECS world management hook
- `src/components/ECSGameApp.tsx` - Main ECS game coordinator
- `src/components/scenes/ECSScene.tsx` - Universal scene component
- `src/stores/gameStore.ts` - Main game state
- `src/stores/questStore.ts` - Quest management
- `src/services/api.ts` - Backend integration

## 🎯 Communication Patterns

### Decision Documentation
When making technical decisions:
1. **Context**: What problem are we solving?
2. **Options**: What alternatives did we consider? 
3. **Decision**: What did we choose and why?
4. **Consequences**: What are the trade-offs?

### Code Discussion Topics
- Architecture and maintainability focus
- Educational effectiveness impact
- Performance implications
- Accessibility requirements validation

## 📊 Current Status Dashboard

### Technical Health
- ✅ TypeScript: Strict mode, zero errors
- ✅ Build: Optimized bundle (265KB total, 84KB gzipped)
- ✅ Architecture: **ECS architecture** - Entity Component System with event-driven communication
- ✅ **SRP Compliance**: All systems follow Single Responsibility Principle (2025-01-09)
- ✅ Performance: Efficient component filtering and batch processing
- ✅ Data-Driven: JSON scene configurations for rapid development
- ✅ Event System: Loose coupling between systems via EventBus
- ✅ Codebase: Clean - all legacy Range architecture code removed

### Feature Status
- ✅ **ECS Core**: World → Entities → Components + Systems architecture
- ✅ **Scene Management**: Universal ECSScene component with data-driven loading
- ✅ **Collision System**: Dedicated collision detection and movement validation
- ✅ **Movement System**: Pure physics-based entity movement
- ✅ **Input Systems**: Separated keyboard and mouse input processing (SRP-compliant)
- ✅ **Interaction System**: Event-driven NPC dialogue, building entrances, scene transitions
- ✅ **Render System**: Z-index sorted rendering with polymorphic entities
- ✅ **Animation Systems**: Frame-based and movement animations
- ✅ **Data-Driven Scenes**: Town and school JSON configurations
- ✅ NPC Dialogue: Interactive conversations (event-driven)
- ✅ Quest System: Visual tracking, objectives
- ✅ Progress Tracking: XP, levels, vocabulary

### Architecture Migration Complete
- ❌ **Legacy System Completely Removed**: All Range architecture files deleted
- ❌ **Legacy Components Removed**: TownScene, SchoolScene, GameApp, RangeMap, BuildingRange, SpriteRange, PlantRange
- ❌ **Legacy Hooks Removed**: useRangeEntities, useRangePlayerMovement, useRangeInteraction, useSceneManager, useBuildingScenes, useNPCInteraction
- ❌ **Legacy Utils Removed**: interactionManager, rangeGridSystem, renderingStrategies, interactionConditions
- ✅ **ECS Architecture Active**: ECSGameApp → ECSScene → ECSRenderer → World
- ✅ **Single Coherent System**: Composition-based ECS with mixable components
- ✅ **Clean Codebase**: No commented code, no debug logs, no legacy imports

This guide serves as our technical collaboration framework for efficient, focused discussions around programming principles, product features, planning, testing methods, and production practices.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
# Technical Collaboration Guide for Claude

## 🎯 Project Context
English Learning Town - Educational RPG built with React + TypeScript in a **monorepo architecture** that gamifies English language learning through interactive storytelling and quest-based progression.

### 🏗️ Monorepo Structure (2025-01-17)
Modern monorepo architecture with pnpm workspaces and Turbo build system:

```
english-learning-town/
├── apps/
│   └── client/                 # Main React application
├── packages/
│   ├── core/                   # @elt/core - ECS engine (157 tests)
│   ├── ui/                     # @elt/ui - Reusable React components
│   └── game-client/            # @elt/game-client - Game-specific components
├── pnpm-workspace.yaml         # Workspace configuration
├── turbo.json                  # Build system configuration
└── tsconfig.base.json          # Shared TypeScript config
```

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

### Monorepo Package Architecture
Modern modular architecture with dedicated packages:

```
# @elt/core package (packages/core/)
├── src/
│   ├── core.ts         # World, Entity, Component, System base classes
│   ├── components.ts   # ECS component definitions
│   ├── systems.ts      # System implementations
│   ├── events.ts       # Event bus and type definitions
│   ├── utils.ts        # ECS utilities and helpers
│   └── __tests__/      # 157 comprehensive tests

# @elt/ui package (packages/ui/)
├── src/
│   ├── components/
│   │   ├── basic/      # Button, AnimatedEmoji
│   │   ├── forms/      # Input components
│   │   ├── feedback/   # LoadingScreen, Spinner
│   │   └── error/      # ErrorBoundary, ErrorFallback
│   ├── styles/         # Theme and animations
│   └── utils/          # Emoji parser, error helpers

# @elt/game-client package (packages/game-client/)
├── src/
│   └── components/
│       ├── progress/   # XPProgressBar
│       └── quest/      # QuestTracker

# Main Application (apps/client/)
├── src/
│   ├── components/
│   │   ├── scenes/     # MainMenu, ECSSceneZustand
│   │   ├── dialogue/   # Dialogue system components
│   │   ├── settings/   # SettingsModal
│   │   ├── help/       # HelpModal
│   │   └── ui/         # Game-specific UI components
│   ├── ecs/            # Client-specific ECS extensions
│   ├── stores/         # Zustand state management
│   ├── hooks/          # Business logic hooks
│   └── utils/          # Client utilities
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

### Unified Tech Stack (2025-01-23)

**Complete tech stack unification implemented** with centralized configuration management:

**Shared Configuration System**:
```
/configs/
├── tsconfig.base.json          # Base TypeScript settings
├── tsconfig.react.json         # React-specific TypeScript config  
├── tsconfig.package.json       # React package configuration
├── tsconfig.node-package.json  # Node.js package configuration
├── tsconfig.app.json           # Application-specific config
├── eslint.config.js            # Unified ESLint rules
├── vitest.config.js            # Shared test configuration
├── tsup.config.js              # Package build configuration
└── versions.json               # Centralized dependency versions
```

**Unified Dependency Versions**:
- **React**: `^18.3.1` - Consistent across all packages
- **TypeScript**: `^5.8.3` - Latest stable with modern features
- **ESLint**: `^9.30.1` - Modern flat config system
- **Vitest**: `^1.0.0` - Fast test runner with Vite integration
- **tsup**: `^8.0.0` - Modern TypeScript bundler

**Package Architecture**:
- **React Packages** (`@elt/ui`, `@elt/game-client`, `apps/client`): Use `tsconfig.package.json` / `tsconfig.app.json`
- **Node Packages** (`@elt/core`, learning packages): Use `tsconfig.node-package.json`
- **All packages**: Extend shared configs with package-specific overrides

**Configuration Benefits**:
- **Single-source management**: Config changes propagate to all packages
- **Version consistency**: No more React 19 vs 18 conflicts  
- **Maintainability**: Updates happen in one place
- **Developer experience**: Consistent tooling across packages
- **Build optimization**: Shared configurations enable better caching

### Build & Testing Protocol
Monorepo development workflow using pnpm and Turbo:

1. **Install dependencies**: `pnpm install` (from root)
2. **Build all packages**: `pnpm build` (uses Turbo for optimal caching)
3. **Run tests**: `pnpm test` (all packages: 200+ tests total)
4. **Development server**: `pnpm dev` (from root or `cd apps/client && pnpm dev`)
5. **Individual package builds**: `pnpm build --filter=@elt/core`

## Development Setup
```bash
# Clone and setup monorepo
git clone <repository>
cd english-learning-town
pnpm install

# Development workflow
pnpm dev          # Start client development server
pnpm build        # Build all packages with Turbo
pnpm test         # Run all tests across packages
pnpm lint         # Lint all packages

# Individual package development
cd packages/core && pnpm test --watch
cd packages/ui && pnpm build --watch
```

## Architecture Notes
- React frontend connects to existing Go backend
- All game logic now in TypeScript/React
- State persisted with Zustand + localStorage
- Lightweight CSS animations (framer-motion removed for better debugging)
- Audio generated procedurally with Web Audio API

## Key Files to Remember

### Core ECS Package (@elt/core)
- `packages/core/src/core.ts` - ECS World, Entity, Component, System base classes
- `packages/core/src/components.ts` - All component type definitions  
- `packages/core/src/systems.ts` - All system implementations
- `packages/core/src/events.ts` - Event bus and type-safe event definitions
- `packages/core/src/utils.ts` - ECS utilities and component archetypes

### UI Package (@elt/ui)
- `packages/ui/src/components/basic/Button.tsx` - Reusable Button component
- `packages/ui/src/components/basic/AnimatedEmoji.tsx` - Animated emoji component
- `packages/ui/src/components/error/ErrorBoundary.tsx` - Error handling
- `packages/ui/src/styles/theme.ts` - Shared theme configuration

### Game Client Package (@elt/game-client)
- `packages/game-client/src/components/progress/XPProgressBar.tsx` - XP display
- `packages/game-client/src/components/quest/QuestTracker.tsx` - Quest UI

### Main Application (apps/client)
- `apps/client/src/components/ECSGameApp.tsx` - Main ECS game coordinator
- `apps/client/src/components/scenes/MainMenu.tsx` - Main menu with settings/help
- `apps/client/src/components/settings/SettingsModal.tsx` - Game settings
- `apps/client/src/components/help/HelpModal.tsx` - Tutorial and help
- `apps/client/src/stores/unifiedGameStore.ts` - Main game state (Zustand)
- `apps/client/src/ecs/sceneLoader.ts` - Data-driven scene creation
- `apps/client/public/data/scenes/` - JSON scene configurations

### Shared Configuration System (configs/)
- `configs/tsconfig.base.json` - Base TypeScript compiler settings
- `configs/tsconfig.react.json` - React-specific TypeScript configuration
- `configs/tsconfig.package.json` - React package TypeScript settings
- `configs/tsconfig.node-package.json` - Node.js package TypeScript settings
- `configs/tsconfig.app.json` - Application TypeScript configuration
- `configs/eslint.config.js` - Unified ESLint rules and settings
- `configs/vitest.config.js` - Shared test runner configuration
- `configs/tsup.config.js` - Package bundler configuration
- `configs/versions.json` - Centralized dependency version management

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
- ✅ **Monorepo**: pnpm workspaces + Turbo build system
- ✅ **Package Architecture**: 3 focused packages (@elt/core, @elt/ui, @elt/game-client)
- ✅ **Unified Tech Stack**: Centralized configuration system with shared TypeScript, ESLint, Vitest configs
- ✅ **Dependency Consistency**: React 18.3.1 across all packages, proper devDependencies structure
- ✅ **Configuration Management**: Single-source configs in `/configs/` directory
- ✅ TypeScript: Strict mode, zero errors across all packages
- ✅ **Testing**: 200+ tests total (157 in @elt/core alone)
- ✅ Build: Optimized bundle with package separation
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
- ✅ **Settings System**: Audio controls, player preferences, modal UI
- ✅ **Help System**: Interactive tutorial with tabbed interface (Controls, Gameplay, Features)
- ✅ **Package System**: Reusable components across @elt/* packages

### Monorepo Migration Complete (Week 2 - 2025-01-17)
- ✅ **Monorepo Structure**: Complete migration from single package to modular monorepo
- ✅ **Package Extraction**: @elt/core (ECS engine), @elt/ui (components), @elt/game-client (game UI)
- ✅ **Build System**: Turbo + pnpm workspaces for optimized builds and dependency management
- ✅ **Testing Coverage**: 200+ tests across all packages with comprehensive coverage
- ✅ **Clean Architecture**: All legacy Range architecture files removed
- ✅ **Package Dependencies**: Proper @elt/* imports, zero legacy relative imports
- ✅ **Codebase Cleanup**: Removed empty directories, redundant files, build artifacts
- ✅ **Documentation**: Updated to reflect monorepo structure and new features
- ✅ **Settings & Help**: Complete UI for game configuration and tutorial system
- ✅ **Event Integration**: Scene transitions wired from ECS to React state management

### Tech Stack Unification Complete (Week 3 - 2025-01-23)
- ✅ **Centralized Configuration**: Shared configs in `/configs/` for TypeScript, ESLint, Vitest, tsup
- ✅ **Dependency Version Unification**: Consistent React 18.3.1, TypeScript 5.8.3, ESLint 9.30.1 across all packages
- ✅ **Package.json Structure**: Proper separation of dependencies vs devDependencies (types moved to devDependencies)
- ✅ **Configuration Architecture**: React packages vs Node packages use appropriate base configurations
- ✅ **Maintenance Efficiency**: Single-source configuration management enables project-wide updates
- ✅ **Developer Experience**: Consistent tooling and build process across all packages
- ✅ **Version Management**: Centralized dependency versions prevent conflicts and inconsistencies

This guide serves as our technical collaboration framework for efficient, focused discussions around programming principles, product features, planning, testing methods, and production practices.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
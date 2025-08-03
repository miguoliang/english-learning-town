# Technical Collaboration Guide for Claude

## 🎯 Project Context
English Learning Town - Educational RPG built with React + TypeScript that gamifies English language learning through interactive storytelling and quest-based progression.

## 📋 Discussion Framework Reference

### Quick Navigation
- **[TECHNICAL_DISCUSSION.md](TECHNICAL_DISCUSSION.md)** - Programming principles, architecture decisions, code patterns
- **[PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)** - Feature planning, user stories, success metrics  
- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Testing methods, quality assurance, educational validation
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - Sprint planning, implementation roadmap

## 🎮 Game Architecture

### Range Architecture System (2025-01-03)
The game follows the **Range architecture** with proper hierarchy:

**Game = Scenes → Scene = Ranges → Range = Cells**

1. **Scene Management** - Each scene contains multiple ranges:
   ```typescript
   // TownScene orchestrates all ranges in the town
   const { ranges } = useRangeEntities();
   const { playerPosition, movePlayer, ranges: movementRanges } = useRangePlayerMovement(ranges);
   ```

2. **Range System** - Every entity is a Range with 4 core concerns:
   - **Boundary**: Position and size in grid coordinates
   - **Walkability**: Whether sprites can pass through
   - **Interaction**: What happens when engaged (configurable interactive cells)
   - **Rendering**: Polymorphic `range.render()` method

3. **Interactive Cells** - Ranges can have configurable interactive cells:
   ```typescript
   // Buildings have no interactive cells by default
   building.setInteractiveCells([{ x: 11, y: 12 }]); // Add door
   building.addInteractiveCells([{ x: 9, y: 11 }]);  // Add more doors
   building.removeInteractiveCells();                // Remove all doors
   ```

4. **Scene Transitions** - Each scene is a different set of ranges:
   ```typescript
   // TownScene = Town ranges (buildings, NPCs, plants)
   const { ranges } = useRangeEntities();
   
   // SchoolScene = School ranges (furniture, school NPCs)
   const { ranges } = useSchoolRanges();
   
   // Scene transition via entrance interaction
   if (building.id === 'school' && entrance.sceneId === 'school-interior') {
     onEnterSchool(); // Switch to SchoolScene
   }
   ```

### Core Range Types
- **BuildingRange**: Buildings with entrances (doors are specific implementation of interactive cells)
- **SpriteRange**: NPCs and player characters with movement and dialogue
- **PlantRange**: Decorative elements (trees, bushes, flowers, grass)

### Architecture Components
- **GameApp**: Top-level scene coordinator with transition management
- **TownScene**: Main town scene with buildings, NPCs, and plants
- **SchoolScene**: School interior scene with classroom furniture and school NPCs
- **useSceneManager**: Scene transition state management (town ↔ school)
- **RangeMap**: Polymorphic rendering of all ranges via `range.render()`
- **useRangeEntities**: Town scene range management and creation
- **useSchoolRanges**: School scene range management and creation
- **useRangePlayerMovement**: Range-based player movement system
- **useRangeInteraction**: Range-based interaction system

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
Follow the established modular architecture:
```
src/
├── components/
│   ├── forms/          # Form-specific components
│   ├── game/           # Game entities (Player, NPC, Building, TownMap)
│   ├── scenes/         # Main scene containers
│   └── ui/             # Reusable UI components
├── hooks/              # Business logic hooks
├── styles/             # Theme and global styles
├── utils/              # Utility functions and managers
└── stores/             # State management
```

### Component Development Patterns
- **Keep components under 200 lines**
- **Single responsibility per component**
- **Extract business logic to custom hooks**

```typescript
// CORRECT - Focused component
export const Player: React.FC<PlayerProps> = ({ position, icon }) => {
  return <PlayerSprite x={position.x} y={position.y}>{icon}</PlayerSprite>;
};

// CORRECT - Business logic in hook
export const usePlayerMovement = (buildings: BuildingData[]) => {
  // Movement logic here
  return { playerPosition, movePlayer, handleMapClick };
};
```

### Single Responsibility Principle (SRP) Refactoring

**Range Architecture Migration Completed** - Major architectural refactoring:

**Before**: Parallel architecture systems (legacy + Range)
- Legacy Game.tsx (78 lines) + GridSystem.ts + GameData.ts + GameRenderer.tsx
- Range architecture (complete but unused) + useRangeEntities + RangeMap + BuildingRange

**After**: Single Range-based architecture 
- **TownScene.tsx**: Range-based scene orchestration
- **RangeMap.tsx**: Polymorphic range rendering via `range.render()`
- **Range.ts**: Base class with 4 core concerns (Boundary, Walkability, Interaction, Rendering)
- **BuildingRange.tsx**: Building-specific Range with configurable interactive cells
- **SpriteRange.ts**: NPC and player Range implementations
- **useRangeEntities.ts**: Range entity management
- **useRangePlayerMovement.ts**: Range-based player movement
- **useRangeInteraction.ts**: Range-based interaction system

**Legacy System Removed**:
- ❌ `Game.tsx` - Legacy game orchestrator  
- ❌ `src/game/` - Entire legacy directory (GridSystem, GameData, PlayerController)
- ❌ `GameRenderer.tsx` - Legacy rendering system
- ❌ `usePlayerMovement.ts` - Legacy movement system
- ❌ `useKeyboardControls.ts` - Legacy keyboard controls

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

**Benefits Achieved**:
- Each component/hook has a single, clear responsibility
- Easier testing and maintenance
- Better code reusability
- Clearer separation of concerns
- Improved readability and debugging

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

### Range Implementation Guidelines

**Interactive Cells Configuration**:
```typescript
// Buildings have no interactive cells by default
const warehouse = new BuildingRange({...}); // No doors initially

// Add doors/entrances at any time
warehouse.setInteractiveCells([
  { x: 11, y: 12 }, // Main entrance
  { x: 9, y: 11 }   // Side door
]);

// Add more doors incrementally
warehouse.addInteractiveCells([{ x: 13, y: 11 }]); // Additional door

// Remove all doors
warehouse.removeInteractiveCells();
```

**Range Development Pattern**:
```typescript
// 1. Extend Range base class
export class CustomRange extends Range {
  // 2. Implement 4 core concerns
  canCollide(): boolean { /* Walkability logic */ }
  canInteract(): boolean { /* Interaction capability */ }
  getTypeName(): string { /* Range identification */ }
  render(): ReactNode { /* Visual representation */ }
}

// 3. Use polymorphic rendering
ranges.map(range => range.render()) // Works for all Range types
```

**Benefits of Range Architecture**:
- Single source of truth for game entities
- Polymorphic behavior through `range.render()`
- Configurable interactive cells for any Range
- Clean separation of concerns (Boundary, Walkability, Interaction, Rendering)
- Scalable scene management

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
- `src/stores/gameStore.ts` - Main game state
- `src/stores/questStore.ts` - Quest management
- `src/types/index.ts` - TypeScript definitions
- `src/components/quest/` - Quest UI components
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
- ✅ Build: Optimized bundle (273KB total, 86KB gzipped)
- ✅ Architecture: **Range architecture** - Single source of truth, no parallel systems
- ✅ Performance: Polymorphic rendering via `range.render()`
- ✅ Interactive Cells: Configurable doors/entrances for all Ranges
- ✅ Scene Management: Clean transitions between multiple scenes

### Feature Status
- ✅ **Range System**: Scene → Range → Cell hierarchy established
- ✅ **Scene Transitions**: GameApp manages TownScene ↔ SchoolScene transitions
- ✅ **SchoolScene**: Complete classroom with furniture, teacher, and students
- ✅ **BuildingRange**: Configurable interactive cells (doors/entrances)
- ✅ **SpriteRange**: NPCs and player with Range-based movement
- ✅ **TownScene**: Range-based scene orchestration
- ✅ **Entrance Interactions**: Press Space at school door to enter classroom
- ✅ NPC Dialogue: Interactive conversations (works in both scenes)
- ✅ Quest System: Visual tracking, objectives
- ✅ Progress Tracking: XP, levels, vocabulary

### Architecture Migration Complete
- ❌ **Legacy System Removed**: Game.tsx, GridSystem, GameRenderer, usePlayerMovement
- ✅ **Range Architecture Active**: TownScene → RangeMap → Range.render()
- ✅ **No Parallel Architectures**: Single coherent system

This guide serves as our technical collaboration framework for efficient, focused discussions around programming principles, product features, planning, testing methods, and production practices.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
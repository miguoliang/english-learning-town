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

### Simple Grid-Based System (2025-01-03)
The game follows a simplified, grid-based architecture with three core principles:

1. **Map = Marked Grid Cells** - The game world is a 40x40px grid where cells are marked as:
   - Walkable/non-walkable (for movement collision)
   - Interactive/non-interactive (for space bar interactions)

2. **Movement = Check Next Cell** - Player movement simply checks if the target cell is walkable:
   ```typescript
   if (gridSystem.isWalkable(newX, newY)) {
     playerController.setPosition({ x: newX, y: newY });
   }
   ```

3. **Interaction = Check Adjacent Cells** - Space bar interactions check current cell for interactive entities:
   ```typescript
   const entity = gridSystem.getInteractiveEntity(playerPos.x, playerPos.y);
   if (entity) { /* interact */ }
   ```

### Core Game Systems
- **GridSystem**: Manages cell states (walkable/interactive)
- **PlayerController**: Handles player position and movement validation
- **GameRenderer**: Pure visual rendering with styled components
- **Keyboard-Only Controls**: Arrow keys for movement, Space for interaction

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

**Game System Refactoring Completed** - Latest example of proper SRP implementation:

**Before**: Game.tsx (345+ lines, multiple responsibilities)
- Grid system logic + player movement + entity management + keyboard handling + UI rendering + data definitions

**After**: Modular architecture with focused components
- **Game.tsx**: System orchestration only (78 lines)
- **GridSystem.ts**: Grid cell management (walkable/interactive cells)
- **PlayerController.ts**: Player movement and interaction logic
- **GameData.ts**: Static game entity definitions and constants
- **useKeyboardControls.ts**: Keyboard event handling
- **GameRenderer.tsx**: Visual rendering and styled components

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

### Grid-Based Map System (2025-01-03)
**Architecture**: CSS Grid-like layout with 40px square cells for structured movement and collision detection.

**Core Components**:
- **GridSystem** (`utils/gridSystem.ts`): Core grid logic, coordinate conversion, collision map
- **useGridSystem** (`hooks/useGridSystem.ts`): React hook managing grid state and collision areas
- **GridOverlay** (`components/game/GridOverlay.tsx`): Visual debugging with dashed grid lines

**Key Features**:
- **Square Cells**: 40px × 40px grid cells across entire screen
- **Exact Positioning**: Buildings placed on precise grid coordinates (e.g., School at grid 5,3)
- **Dynamic Sizing**: Building visuals match their m×n grid footprint exactly
- **Collision Detection**: Boolean collision map prevents movement through occupied cells
- **Visual Debugging**: Optional dashed grid overlay with color-coded collision areas

**Building Grid Footprints**:
```typescript
School: 4×3 cells (160px × 120px)
Shop: 4×3 cells (160px × 120px)  
Library: 3×3 cells (120px × 120px)
Café: 3×2 cells (120px × 80px)
NPCs: 1×1 cells (40px × 40px)
```

**Implementation Pattern**:
```typescript
// Grid-aligned positioning
const cellSize = 40;
const gridX = 5; // Grid coordinate
const screenX = gridX * cellSize; // Screen position

// Visual size matches grid footprint
const visualWidth = gridSize.width * cellSize;
const visualHeight = gridSize.height * cellSize;
```

**Benefits**: 
- Predictable movement patterns
- Precise collision detection
- Scalable for level design
- Clear visual feedback for debugging

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
- ✅ Build: Optimized bundle (95KB gzipped, reduced from framer-motion removal)
- ✅ Architecture: Clean, modular, SRP-compliant
- ✅ Performance: 60fps, responsive design
- ✅ UI/UX: Finger pointer navigation, clean dialogue highlighting

### Feature Status
- ✅ Quest System: Visual tracking, objectives
- ✅ NPC Dialogue: Interactive conversations
- ✅ Progress Tracking: XP, levels, vocabulary
- ✅ Mobile Support: Touch-friendly interface

This guide serves as our technical collaboration framework for efficient, focused discussions around programming principles, product features, planning, testing methods, and production practices.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
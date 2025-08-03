# Technical Collaboration Guide for Claude

## 🎯 Project Context
English Learning Town - Educational RPG built with React + TypeScript that gamifies English language learning through interactive storytelling and quest-based progression.

## 📋 Discussion Framework Reference

### Quick Navigation
- **[TECHNICAL_DISCUSSION.md](TECHNICAL_DISCUSSION.md)** - Programming principles, architecture decisions, code patterns
- **[PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)** - Feature planning, user stories, success metrics  
- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Testing methods, quality assurance, educational validation
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - Sprint planning, implementation roadmap

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
- Animations handled by Framer Motion
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
- ✅ Build: Optimized bundle (133KB gzipped)
- ✅ Architecture: Clean, modular, SRP-compliant
- ✅ Performance: 60fps, responsive design

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
# English Learning Town - Technical Architecture

A modular, TypeScript-based game engine and educational application built with
modern web technologies. The project uses a monorepo structure with independent
packages that provide reusable game systems, state management, and speech
recognition capabilities.

**Architecture:** Modular monorepo with 6 specialized packages  
**Technology Stack:** TypeScript, React, Konva.js, Zustand, Web Speech API  
**Build System:** Turbo + pnpm workspaces + tsup/Vite

## Package Architecture Overview

The project is organized into specialized packages that handle different aspects
of the game engine and application:

```
english-learning-town/
├── packages/
│   ├── types/           # 📋 Shared TypeScript definitions and interfaces
│   ├── logger/          # 📝 Framework-agnostic logging system
│   ├── core/            # ⚙️  Game engine with systems, events, and error recovery
│   ├── store/           # 💾 Zustand-based state management
│   ├── speech/          # 🎤 Web Speech API integration and services
│   └── (future packages for UI, content, etc.)
└── apps/
    └── client/          # 🎮 React-based game application
```

Each package is independently buildable and has clear responsibilities and
interfaces.

## 📋 Types Package (`@english-learning-town/types`)

**Purpose:** Centralized TypeScript definitions that provide type safety across
all packages.

### Key Concepts

- **Branded Types**: Uses TypeScript branded types for IDs (`PlayerId`,
  `CharacterId`, etc.) to prevent mixing different ID types
- **Game Entities**: Comprehensive interfaces for `Player`, `Character`,
  `Quest`, `Item`, `Location`, and `Dialogue`
- **Educational Types**: Speech recognition types (`SpeechChallenge`,
  `SpeechRecognitionResult`) and learning progression types
- **System Architecture Types**: Core interfaces for game engine components

### Important Interfaces

```typescript
// Entity identification with type safety
export type PlayerId = string & { __brand: 'PlayerId' };
export type CharacterId = string & { __brand: 'CharacterId' };

// Core game entities
export interface Player {
  id: PlayerId;
  level: number;
  experience: number;
  position: Position;
  stats: PlayerStats;
  // ... other properties
}

// Educational components
export interface SpeechChallenge {
  type: SpeechChallengeType;
  targetText: string;
  successThreshold: number;
  // ... challenge configuration
}
```

### Design Philosophy

All packages depend on this foundation package, ensuring consistent data
structures and preventing type mismatches across the entire system.

## 📝 Logger Package (`@english-learning-town/logger`)

**Purpose:** Framework-agnostic logging system with multiple output targets and
structured logging capabilities.

### Key Concepts

- **LogLevel Hierarchy**: TRACE → DEBUG → INFO → WARN → ERROR → FATAL
- **Multiple Output Targets**: Console, custom handlers, event system
  integration
- **Structured Logging**: Contextual information, timestamps, and metadata
- **Performance Monitoring**: Built-in timing utilities and execution
  measurement

### Core Classes

```typescript
// Factory pattern for logger management
export class LoggerFactory {
  static getLogger(systemName: string): Logger;
  static setGlobalConfig(config: LoggerConfig): void;
}

// Individual logger instances
export class Logger {
  info(message: string, context?: string, data?: any): void;
  error(message: string, context?: string, data?: any, error?: Error): void;
  // ... other log levels
}

// Performance monitoring utilities
export const LoggerUtils = {
  createPerformanceLogger: (systemName: string) => ({ time, measure }),
  createStructuredLogger: (systemName: string, context: Record<string, any>)
};
```

### Design Philosophy

Zero dependencies on game-specific code, making it reusable across any
TypeScript/JavaScript project. Supports custom output handlers for integration
with external systems.

## ⚙️ Core Package (`@english-learning-town/core`)

**Purpose:** Game engine foundation providing system architecture, event
handling, and error recovery mechanisms.

### Key Concepts

- **Game Engine**: Fixed-timestep game loop with system orchestration
- **System Architecture**: Modular systems with lifecycle management (initialize
  → start → update → stop)
- **Event Bus**: Centralized communication using mitt library with error
  handling
- **Error Recovery**: Automatic recovery strategies with configurable backoff
  and retry logic

### Core Components

#### GameEngine

```typescript
export class GameEngine {
  async initialize(): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  registerSystem(system: GameSystem): void;
}

// Singleton instance for global access
export const gameEngine = new GameEngine();
```

#### GameSystem Base Class

```typescript
export abstract class GameSystem {
  // System categorization and configuration
  get systemType(): SystemType; // CORE, GAMEPLAY, UI, AUDIO, etc.
  get updateFrequency(): number; // Updates per second (0 = every frame)

  // Lifecycle methods (abstract - must implement)
  protected abstract onInitialize(): Promise<void>;
  protected abstract onUpdate(deltaTime: number): void;
  // ... other lifecycle methods
}
```

#### EventBus

```typescript
export class EventBus {
  on<T>(eventType: string, handler: EventHandler<T>): () => void;
  emit<T>(eventType: string, data?: T): void;
  // Includes error handling and logging integration
}

// Core vs Application Events
export const CoreEvents = {
  SYSTEM_INITIALIZED: 'system:initialized',
  ENGINE_STARTED: 'engine:started',
  ERROR_OCCURRED: 'error:occurred',
};
```

#### Error Recovery System

```typescript
export class ErrorRecoveryManager {
  async handleError(error: Error, context: ErrorContext): Promise<boolean>;
  registerStrategy(strategy: RecoveryStrategy): void;
}

// Utility wrapper for automatic error handling
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T | undefined>;
```

### Design Philosophy

The core package provides reusable game engine patterns that are
domain-agnostic. Systems can be categorized by type, run at different update
frequencies, and automatically recover from errors.

## 💾 Store Package (`@english-learning-town/store`)

**Purpose:** Zustand-based state management with persistence and type-safe
selectors.

### Key Concepts

- **Zustand Store**: Reactive state management with immer for immutable updates
- **Persistence**: Automatic save/load of player progress and settings
- **Selective Persistence**: Only saves important data (progress, settings) not
  transient state
- **Type-Safe Selectors**: Pre-built hooks for common state access patterns

### Store Structure

```typescript
export interface GameStore extends GameState {
  // Core game state
  player: Player;
  gameData: { locations; characters; dialogues; quests; items } | null;

  // Game actions
  setPlaying: (playing: boolean) => void;
  movePlayer: (position: Position) => void;
  updatePlayerStats: (experience: number) => void;
  setCurrentLocation: (locationId: string) => void;
  // ... other actions
}

// Convenient selector hooks
export const usePlayer = () => useGameStore((state) => state.player);
export const usePlayerPosition = () =>
  useGameStore((state) => state.player.position);
export const useGameActions = () =>
  useGameStore((state) => ({
    setPlaying: state.setPlaying,
    movePlayer: state.movePlayer,
    // ... other actions
  }));
```

### Design Philosophy

Centralizes all game state with automatic persistence for progression data. Uses
immer middleware for safe immutable updates and provides typed selectors to
prevent direct state mutations.

## 🎤 Speech Package (`@english-learning-town/speech`)

**Purpose:** Web Speech API integration with accuracy scoring and pronunciation
evaluation.

### Key Concepts

- **SpeechRecognitionService**: Wraps browser Web Speech API with error handling
- **Confidence Scoring**: Evaluates pronunciation accuracy using multiple
  metrics
- **Language Support**: Configurable language models for different learning
  levels
- **Event-Driven Architecture**: Integrates with core EventBus for speech state
  management

### Core Service

```typescript
export class SpeechRecognitionService {
  constructor(config: SpeechRecognitionConfig) {
    // Initializes with language, continuous mode, etc.
  }

  async startListening(): Promise<void>;
  stopListening(): void;

  // Event handlers for recognition results
  onResult(callback: (result: SpeechRecognitionResult) => void): void;
  onError(callback: (error: SpeechRecognitionError) => void): void;
}

// Configuration interface
export interface SpeechRecognitionConfig {
  language: string; // 'en-US', 'en-GB', etc.
  continuous: boolean; // Keep listening or single phrase
  interimResults: boolean; // Show partial results
  maxAlternatives: number; // Multiple recognition options
  grammars?: string[]; // Optional grammar constraints
}
```

### Integration Pattern

```typescript
// Typical usage in dialogue system
const speechService = new SpeechRecognitionService({
  language: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 3,
});

speechService.onResult((result) => {
  const accuracy = evaluatePronunciation(result.transcript, targetPhrase);
  // Handle scoring and feedback
});
```

### Design Philosophy

Abstracts Web Speech API complexity while providing educational-specific
features like pronunciation accuracy evaluation and integration with the game's
learning objectives.

## 🎮 Client App (`apps/client`)

**Purpose:** React-based game application that combines all packages into a
playable educational experience.

### Key Concepts

- **React + TypeScript**: Modern web app using functional components and hooks
- **Konva.js Rendering**: 2D canvas-based game world with efficient sprite
  rendering
- **Component Architecture**: Modular UI components for game world, dialogues,
  and interface
- **Game Data Loading**: JSON-based content system for locations, NPCs, quests,
  and dialogues

### Core Components

```typescript
// Main game world rendering
export const GameWorld: React.FC = () => {
  // Uses Konva Stage for 2D canvas rendering
  // Handles player movement, NPC positioning, and world interaction
};

// Educational dialogue interface
export const DialogueSystem: React.FC = () => {
  // Manages conversation flow with NPCs
  // Integrates speech recognition for pronunciation practice
  // Handles quest progression and educational feedback
};

// Player stats and game UI
export const GameUI: React.FC = () => {
  // Displays player level, XP, inventory
  // Shows quest objectives and progress
  // Provides game controls and settings
};
```

### Current Architecture Integration

```typescript
// How packages work together in the client
import { useGameStore, usePlayer } from '@english-learning-town/store';
import { SpeechRecognitionService } from '@english-learning-town/speech';
import { LoggerFactory } from '@english-learning-town/logger';
import { gameEngine, GameSystem } from '@english-learning-town/core';

// Example game system implementation
class RenderingSystem extends GameSystem {
  constructor() {
    super({
      name: 'Rendering',
      priority: 100,
      systemType: SystemType.CORE,
      updateFrequency: 60, // 60 FPS
    });
  }

  protected async onInitialize(): Promise<void> {
    // Set up Konva stage and layers
  }

  protected onUpdate(deltaTime: number): void {
    // Update sprite positions, animations
  }
}
```

## System Integration & Data Flow 🔄

### Package Dependencies

```
client app
    ↓
┌─ store ←── types
├─ speech ←── types
├─ core ←── logger ←── (no deps)
└─ types (foundation)
```

### Runtime Data Flow

1. **Game Initialization**: Client loads JSON data → Store → Game systems
   initialize
2. **Player Input**: WASD keys → Store updates → Rendering system responds
3. **NPC Interaction**: Proximity detection → Dialogue system → Speech service
   activation
4. **Learning Loop**: Speech input → Accuracy scoring → XP calculation →
   Progress persistence
5. **State Synchronization**: All changes flow through Zustand store → UI
   updates

### Educational Content Pipeline

```
JSON Data Files → Type Validation → Store Management → Component Rendering
     ↓                ↓                    ↓               ↓
   Static         Runtime Safety      Live State      Visual UI
   Content        (types package)    (store package)  (React app)
```

## Development & Build System 🛠️

### Monorepo Structure

- **pnpm workspaces**: Efficient package management with shared dependencies
- **Turbo**: Parallel building and caching for fast development
- **TypeScript**: Shared tsconfig with project references for incremental
  compilation
- **ESM modules**: Modern ES module format throughout the monorepo

### Build Pipeline

```bash
# Install dependencies across all packages
pnpm install

# Build all packages in dependency order
pnpm build

# Development with hot reload
pnpm dev

# Type checking across entire monorepo
pnpm type-check
```

### Package Build Outputs

- **types**: TypeScript declarations (`.d.ts`)
- **logger, core, store, speech**: ESM bundles with source maps
- **client**: Optimized web application bundle

This architecture provides a robust, scalable foundation for an educational game
that can evolve with additional features while maintaining clean separation of
concerns and reusable components.

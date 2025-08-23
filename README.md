# 🎓 English Learning Town

**A modern educational RPG built with React + TypeScript in a monorepo architecture that gamifies English language learning through interactive storytelling, character dialogue, and quest-based progression.**

[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8.svg)](https://golang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

English Learning Town transforms language learning into an engaging RPG experience where players explore a vibrant town, interact with NPCs through natural conversations, and complete quests that reinforce vocabulary and grammar skills. Built with a modern monorepo architecture featuring dedicated packages for maximum code reusability and maintainability.

## 🏗️ Monorepo Structure

```
english-learning-town/
├── configs/                    # 🆕 Unified configuration system
│   ├── tsconfig.*.json         # Shared TypeScript configurations
│   ├── eslint.config.js        # Unified ESLint rules
│   ├── vitest.config.js        # Shared test configuration
│   ├── tsup.config.js          # Package build configuration  
│   └── versions.json           # Centralized dependency versions
├── apps/
│   └── client/                 # Main React application
├── packages/
│   ├── core/                   # @elt/core - ECS engine (157 tests)
│   ├── ui/                     # @elt/ui - Reusable React components
│   ├── game-client/            # @elt/game-client - Game-specific UI
│   ├── learning-algorithms/    # @elt/learning-algorithms - ML/AI learning
│   ├── learning-analytics/     # @elt/learning-analytics - Progress tracking
│   └── learning-assessment/    # @elt/learning-assessment - Testing & evaluation
├── pnpm-workspace.yaml         # Workspace configuration
├── turbo.json                  # Build system configuration
└── tsconfig.base.json          # Root TypeScript references
```

## ✨ Key Features

### 🏗️ Architecture & Development
- **📦 Monorepo Structure**: Clean package separation with @elt/* namespaced packages
- **⚡ Turbo Build System**: Optimized builds with intelligent caching
- **🧪 200+ Tests**: Comprehensive test coverage across all packages (157 in @elt/core alone)
- **🔒 Type Safety**: Strict TypeScript across all packages with zero compilation errors

### 🎮 Game Features  
- **🎯 Enhanced Quest System**: Visual progress tracking with real-time indicators and multi-quest management
- **💬 Rich Dialogue System**: Interactive conversations with vocabulary highlighting and learning feedback
- **⚙️ Settings & Help**: Complete configuration UI and interactive tutorial system
- **🏛️ ECS Architecture**: Entity Component System with event-driven communication
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🎨 Modern UI/UX**: Smooth animations, intuitive interface, and beautiful visual design

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**: For React development
- **pnpm**: Package manager for monorepo
- **Go 1.19+**: Backend API server
- **Git**: Version control

### Installation

```bash
# Clone the repository
git clone https://github.com/miguoliang/english-learning-town.git
cd english-learning-town

# Install all dependencies
pnpm install

# Start development
pnpm dev          # Start client development server
pnpm build        # Build all packages with Turbo  
pnpm test         # Run all tests (200+ tests)
```

Open [http://localhost:5173](http://localhost:5173) to play the game!

### Package Development

```bash
# Individual package development
cd packages/core && pnpm test --watch    # ECS engine tests
cd packages/ui && pnpm build --watch     # UI components  
cd apps/client && pnpm dev               # Main application
```

#### Start Script Options
```bash
# Direct script usage
./start.sh                  # Start both backend and frontend
./start.sh --backend-only    # Start only Go backend (port 8080)
./start.sh --frontend-only   # Start only React frontend (port 5173)
./start.sh --cleanup         # Clean up any running processes
./start.sh --help            # Show all available options

# Or use npm scripts
npm start                   # Same as ./start.sh
npm run start:backend       # Backend only
npm run start:frontend      # Frontend only
npm run cleanup             # Clean up processes
npm run install:all         # Install all dependencies
npm run build               # Build for production
```

## 🏗️ Architecture

```
React Frontend (TypeScript) ←→ Go Backend (REST API) ←→ SQLite Database
```

### Technology Stack

**🆕 Unified Configuration System**
- **React**: `18.3.1` - Consistent across all packages
- **TypeScript**: `5.8.3` - Latest stable with modern features
- **ESLint**: `9.30.1` - Modern flat config system
- **Vitest**: `1.0.0` - Fast test runner with Vite integration
- **tsup**: `8.0.0` - Modern TypeScript bundler

**Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand with persistence
- **Styling**: CSS-only theming (migrated from Styled Components)
- **Audio**: Howler.js + Web Audio API
- **Build System**: Turbo + pnpm workspaces

**Backend**
- **API**: Go with Gin framework
- **Database**: SQLite for persistence

**Development Tools**
- **Shared Configs**: TypeScript, ESLint, Vitest, tsup in `/configs/`
- **Version Management**: Centralized dependency versions
- **Package Structure**: Proper dependencies vs devDependencies separation

## 📋 Development Status

### ✅ React Implementation (COMPLETED)
**Modern Web-Based Educational Game with Clean Architecture**

- [x] **React Frontend Architecture**
  - [x] TypeScript + React 18 + Vite setup
  - [x] Zustand state management with persistence
  - [x] Styled Components for CSS-in-JS styling
  - [x] Framer Motion animations and transitions
  - [x] **Single Responsibility Principle refactoring** ⭐ NEW
  - [x] **Modular component architecture** ⭐ NEW
  - [x] **Custom hooks for business logic** ⭐ NEW

- [x] **Enhanced Quest System**
  - [x] Visual quest tracker with real-time progress
  - [x] Detailed quest log with objectives and rewards
  - [x] Multi-quest management and switching
  - [x] Animated notifications and status updates

- [x] **Rich Dialogue System**
  - [x] Interactive NPC conversations with vocabulary highlighting
  - [x] Response-based learning progression
  - [x] Audio feedback and visual effects
  - [x] Educational content integration

- [x] **Modern Game Features**
  - [x] **Keyboard-based controls** ⭐ NEW
  - [x] **Space bar NPC interactions** ⭐ NEW
  - [x] Responsive design for all devices
  - [x] Procedural sound generation
  - [x] Progress tracking and experience system

- [x] **Code Quality & Build**
  - [x] **Production-ready TypeScript build** ⭐ NEW
  - [x] **Optimized bundle size (133KB gzipped)** ⭐ NEW
  - [x] **Zero build errors and warnings** ⭐ NEW
  - [x] **Type-safe development experience** ⭐ NEW

### ✅ Tech Stack Unification (COMPLETED) 🆕
**Centralized Configuration Management & Version Consistency**

- [x] **Shared Configuration System**
  - [x] Unified TypeScript configs for React vs Node packages  
  - [x] Shared ESLint, Vitest, tsup configurations
  - [x] Centralized dependency version management
  - [x] Single-source configuration updates

- [x] **Dependency Version Consistency**
  - [x] React 18.3.1 across all packages (fixed React 19 vs 18 conflict)
  - [x] TypeScript 5.8.3 with modern language features
  - [x] ESLint 9.30.1 with flat config system
  - [x] Proper separation of dependencies vs devDependencies

- [x] **Package Structure Optimization**
  - [x] Type definitions moved to devDependencies
  - [x] Package-specific configuration inheritance
  - [x] Clean dependency hygiene across monorepo
  - [x] Reduced production bundle size

### 🎯 Current Focus Areas

- **📚 Content Expansion**: Adding more NPCs, quests, and learning content
- **🎨 Visual Polish**: Enhanced animations and visual feedback
- **📱 Mobile Optimization**: Touch-friendly interactions and responsive UI
- **🔊 Audio Enhancement**: Background music and advanced sound effects
- **📊 Analytics**: Learning progress tracking and educational insights

## 🎯 Game Mechanics

### Learning System
- **Contextual Vocabulary**: Words introduced through meaningful conversations
- **Progressive Difficulty**: Quests build on previous knowledge
- **Repetition & Reinforcement**: Natural review through gameplay
- **Multiple Learning Styles**: Visual, auditory, and kinesthetic approaches

### Character Progression
- **Experience Points**: Earned through successful interactions
- **Friendship Levels**: Deeper relationships unlock advanced content
- **Achievement System**: Milestones for motivation and tracking
- **Customization Rewards**: Unlockable appearances and abilities

## 🧪 Testing

```bash
# Frontend development and testing
cd react-client
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Backend tests
cd backend-go && go test ./...

# Type checking
cd react-client && npm run type-check
```

## 📖 Documentation

### Core Documentation
- **[CLAUDE.md](CLAUDE.md)** - Technical collaboration guide and coding patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Feature roadmap, sprint planning, and implementation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture, ECS patterns, and best practices

### Additional Resources
- **[Development Guide](docs/src/development/README.md)**: Setup and contribution guidelines
- **[API Documentation](docs/src/api/README.md)**: Backend endpoints and data models
- **[Game Design](docs/src/game-design/README.md)**: Educational methodology and mechanics

## 🤝 Contributing

We welcome contributions! Please see our organized documentation:
- **[CLAUDE.md](CLAUDE.md)** - Technical collaboration guide and coding patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Current priorities and implementation roadmap
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture principles and best practices

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the coding patterns in CLAUDE.md
4. Add tests for new functionality
5. Submit a pull request

## 📊 Current Status

**🎉 React Implementation Complete!** - Modern educational game ready to play
- ✅ Full React + TypeScript implementation
- ✅ Enhanced quest system with visual progress tracking
- ✅ Rich dialogue system with vocabulary learning
- ✅ Responsive design for all devices
- ✅ Smooth animations and modern UI/UX
- ✅ Click-to-move town exploration
- ✅ Real-time progress indicators and notifications

**🌐 Play now at: [http://localhost:5173](http://localhost:5173)**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/miguoliang/english-learning-town/issues)
- **Discussions**: [GitHub Discussions](https://github.com/miguoliang/english-learning-town/discussions)
- **Documentation**: [Online Docs](docs/book/index.html)

---

**🎮 Ready to learn English through gaming? Let's make language learning an adventure!**
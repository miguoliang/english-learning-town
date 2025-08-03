# 🎓 English Learning Town

**A modern educational RPG that gamifies English language learning through interactive storytelling, character dialogue, and quest-based progression. Built with React and TypeScript for a superior web-based learning experience.**

[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8.svg)](https://golang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

English Learning Town transforms language learning into an engaging RPG experience where players explore a vibrant town, interact with NPCs through natural conversations, and complete quests that reinforce vocabulary and grammar skills. The modern React implementation provides superior text handling, responsive design, and enhanced user experience perfect for educational content.

## ✨ Key Features

- **🎯 Enhanced Quest System**: Visual progress tracking with real-time indicators and multi-quest management
- **💬 Rich Dialogue System**: Interactive conversations with vocabulary highlighting and learning feedback
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🎨 Modern UI/UX**: Smooth animations, intuitive interface, and beautiful visual design
- **🔊 Audio Feedback**: Procedural sound generation for immersive gameplay
- **📊 Advanced Progress Tracking**: Detailed quest logs, experience points, and learning analytics

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+**: For React development
- **Go 1.19+**: Backend API server
- **Git**: Version control

### Installation
```bash
# Clone the repository
git clone https://github.com/miguoliang/english-learning-town.git
cd english-learning-town

# Start the backend server
cd backend-go && go run cmd/main.go

# In a new terminal, start the React client
cd react-client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play the game!

## 🏗️ Architecture

```
React Frontend (TypeScript) ←→ Go Backend (REST API) ←→ SQLite Database
```

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand with persistence
- **Styling**: Styled Components + CSS-in-JS
- **Animations**: Framer Motion
- **Audio**: Howler.js + Web Audio API
- **Backend**: Go with Gin framework
- **Database**: SQLite for persistence

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
  - [x] **Arrow key navigation** ⭐ NEW
  - [x] Responsive design for all devices
  - [x] Procedural sound generation
  - [x] Simple, responsive controls
  - [x] Progress tracking and experience system

- [x] **Code Quality & Build**
  - [x] **Production-ready TypeScript build** ⭐ NEW
  - [x] **Optimized bundle size (133KB gzipped)** ⭐ NEW
  - [x] **Zero build errors and warnings** ⭐ NEW
  - [x] **Type-safe development experience** ⭐ NEW

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
- **[TECHNICAL_DISCUSSION.md](TECHNICAL_DISCUSSION.md)** - Programming principles, architecture decisions, testing strategies
- **[PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)** - Feature planning, user stories, success metrics
- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Quality assurance, educational validation methods
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - Sprint planning, implementation roadmap

### Additional Resources
- **[Development Guide](docs/src/development/README.md)**: Setup and contribution guidelines
- **[API Documentation](docs/src/api/README.md)**: Backend endpoints and data models
- **[Game Design](docs/src/game-design/README.md)**: Educational methodology and mechanics
- **[Technical Architecture](docs/src/technical/README.md)**: System design and patterns

## 🤝 Contributing

We welcome contributions! Please see our organized documentation structure:
- **[CLAUDE.md](CLAUDE.md)** - Technical collaboration guide and coding patterns
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - Current priorities and implementation roadmap
- **[TECHNICAL_DISCUSSION.md](TECHNICAL_DISCUSSION.md)** - Architecture principles and best practices

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
# 🎮 English Learning Town

**An immersive educational RPG that gamifies English language learning through interactive storytelling, character dialogue, and quest-based progression.**

[![Godot](https://img.shields.io/badge/Godot-4.4-blue.svg)](https://godotengine.org/)
[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8.svg)](https://golang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

English Learning Town transforms language learning into an engaging RPG experience where players explore a vibrant town, interact with NPCs through natural conversations, and complete quests that reinforce vocabulary and grammar skills. The game combines the addictive elements of RPGs with proven educational methodologies.

## ✨ Key Features

- **🎯 Interactive Dialogue System**: Natural conversations with NPCs featuring vocabulary highlighting
- **🎮 Smooth Movement**: Continuous tile-based movement with audio feedback and animations
- **📚 Quest-Based Learning**: Progressive challenges that build on previous knowledge
- **🔊 Audio Feedback**: Procedural sound effects for immersive gameplay
- **👥 Character Customization**: Male/female sprites with directional animations
- **📊 Progress Tracking**: Experience points, levels, and friendship systems

## 🚀 Quick Start

### Prerequisites
- **Godot Engine 4.4+**: Game development environment
- **Go 1.19+**: Backend API server
- **Git**: Version control

### Installation
```bash
# Clone the repository
git clone https://github.com/miguoliang/english-learning-town.git
cd english-learning-town

# Start the backend server
cd backend-go && go run cmd/main.go

# Launch the game client
cd godot-client && godot project.godot
```

## 🏗️ Architecture

```
Godot Client (GDScript) ←→ Go Backend (REST API) ←→ SQLite Database
```

### Technology Stack
- **Frontend**: Godot Engine 4.4 with GDScript
- **Backend**: Go with Gin framework
- **Database**: SQLite for persistence
- **Audio**: Procedural sound generation
- **Graphics**: Pixel art with directional sprites

## 📋 Development Roadmap

### ✅ Week 1: Core Systems (COMPLETED)
**Foundation & Critical Fixes**

- [x] **Fix All Compilation Bugs**
  - [x] Resolve Godot 4 typed Array assignment errors
  - [x] Fix API client null checks and bounds checking
  - [x] Implement proper setter methods for Resource classes

- [x] **Complete Dialogue System**
  - [x] Create DialogueUI scene with speaker portraits
  - [x] Implement keyboard navigation and response handling
  - [x] Add proper signal flow and state management
  - [x] Fix movement blocking after dialogue interactions

- [x] **Smooth Movement System**
  - [x] Implement continuous hold-to-move controls
  - [x] Add movement queuing for seamless direction changes
  - [x] Create cubic easing and visual feedback animations
  - [x] Optimize movement speed and responsiveness

- [x] **Audio System Implementation**
  - [x] Create AudioManager singleton with procedural sound generation
  - [x] Add footstep sounds with pitch variation
  - [x] Implement dialogue open/close audio feedback
  - [x] Create interaction sound effects with volume control

### 🔄 Week 2: User Experience (IN PROGRESS)
**Tutorial & Quest Management**

- [ ] **Tutorial/Onboarding System**
  - [ ] Create guided introduction to movement controls
  - [ ] Implement interactive hints and tooltips
  - [ ] Add progressive UI element revelation
  - [ ] Design tutorial quest with guided steps

- [ ] **Enhanced Quest UI**
  - [ ] Visual quest log with active objectives
  - [ ] Progress indicators with completion percentages
  - [ ] Integration with existing QuestManager system
  - [ ] Quest notification system with animations

- [ ] **Story Content Enhancement**
  - [ ] Expand dialogue trees with more personality
  - [ ] Add character backstories and motivations
  - [ ] Create compelling overarching narrative
  - [ ] Implement friendship system effects

### 🎨 Week 3: Content & Polish
**Character Development & Expansion**

- [ ] **Additional NPCs**
  - [ ] Add student characters for peer learning
  - [ ] Create townspeople with diverse specialties
  - [ ] Implement authority figures (principal, mayor)
  - [ ] Design visitors for cultural exchange

- [ ] **Visual Enhancements**
  - [ ] Particle effects for correct answers
  - [ ] Character portrait animations
  - [ ] Screen transitions and visual effects
  - [ ] Environmental animations and details

- [ ] **Advanced Audio**
  - [ ] Background ambient music system
  - [ ] Voice acting for key phrases
  - [ ] Dynamic music based on game state
  - [ ] Audio settings and accessibility options

### 🌟 Week 4: Advanced Features
**Multiplayer & Analytics**

- [ ] **Social Features**
  - [ ] Leaderboards and achievements
  - [ ] Multiplayer conversation practice
  - [ ] Community challenges and events
  - [ ] Progress sharing and motivation

- [ ] **Learning Analytics**
  - [ ] Player behavior tracking
  - [ ] Learning pattern analysis
  - [ ] Adaptive difficulty adjustment
  - [ ] Performance insights for educators

- [ ] **Content Management**
  - [ ] Dynamic content loading from server
  - [ ] Lesson plan integration
  - [ ] Custom vocabulary sets
  - [ ] Teacher dashboard for progress monitoring

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
# Run all tests
cd godot-client && ./run_tests.sh

# Backend tests
cd backend-go && go test ./...

# Performance benchmarks
cd godot-client && godot --headless --path . --script test/TestBootstrap.gd
```

## 📖 Documentation

- **[Development Guide](docs/src/development/README.md)**: Setup and contribution guidelines
- **[API Documentation](docs/src/api/README.md)**: Backend endpoints and data models
- **[Game Design](docs/src/game-design/README.md)**: Educational methodology and mechanics
- **[Technical Architecture](docs/src/technical/README.md)**: System design and patterns

## 🤝 Contributing

We welcome contributions! Please see our [Development Plan](DEVELOPMENT_PLAN.md) for current priorities and [CLAUDE.md](CLAUDE.md) for critical coding patterns.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the coding patterns in CLAUDE.md
4. Add tests for new functionality
5. Submit a pull request

## 📊 Current Status

**🎉 Week 1 Complete!** - All core systems are functional
- Game compiles and runs without errors
- Smooth movement and audio feedback implemented
- Complete dialogue system with NPC interactions
- Solid foundation for Week 2 development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/miguoliang/english-learning-town/issues)
- **Discussions**: [GitHub Discussions](https://github.com/miguoliang/english-learning-town/discussions)
- **Documentation**: [Online Docs](docs/book/index.html)

---

**🎮 Ready to learn English through gaming? Let's make language learning an adventure!**
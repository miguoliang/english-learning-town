# English Learning Town - Godot Client

A **Godot 4.2** cross-platform game client for English Learning Town, targeting **macOS and iOS**.

## 🎮 Architecture

```
Godot Client (GDScript) ←→ Go Backend (REST API) ←→ SQLite Database
```

## 📁 Project Structure

```
godot-client/
├── project.godot              # Main project configuration
├── export_presets.cfg         # iOS/macOS export settings
├── icon.svg                   # App icon
├── scripts/
│   ├── managers/
│   │   └── GameManager.gd      # Global game state manager
│   ├── networking/
│   │   └── APIClient.gd        # HTTP client for Go backend
│   ├── data/
│   │   ├── PlayerData.gd       # Player data model
│   │   └── QuestionData.gd     # Question data model
│   ├── players/
│   │   └── PlayerController.gd # 2D character movement
│   └── ui/
│       └── MainMenuUI.gd       # Main menu interface
├── scenes/
│   ├── MainMenu.tscn           # Login/player creation scene
│   └── TownExploration.tscn    # Main game world scene
└── assets/
    ├── sprites/                # Character and environment art
    ├── audio/                  # Sound effects and music
    └── fonts/                  # UI fonts
```

## 🚀 Getting Started

### Prerequisites
- **Godot 4.2** or newer
- **Xcode** (for iOS builds)
- **Go backend** running on localhost:3000

### Setup Instructions

1. **Open in Godot**
   ```bash
   # Open Godot Engine and import the godot-client folder
   ```

2. **Configure Project**
   - Verify autoloads: `GameManager` and `APIClient` should be set
   - Check input map has movement keys (WASD + arrows)
   - Confirm export presets for iOS/macOS

3. **API Configuration**
   - Edit `APIClient.gd` `base_url` if backend isn't on localhost:3000
   - For iOS builds, ensure backend is network-accessible

### Building for Platforms

#### macOS Build
1. **Project → Export → macOS**
2. Select export template location
3. **Export Project** → Choose destination
4. Run the generated `.app` file

#### iOS Build  
1. **Project → Export → iOS**
2. Configure:
   - **Bundle Identifier**: `com.yourcompany.englishlearningtown`
   - **Provisioning Profile**: Your development profile
   - **Team ID**: Your Apple developer team
3. **Export Project** → Choose destination  
4. Open exported Xcode project and deploy

## 🎯 Core Features

### Player Management
- **Character Creation**: Name + gender selection with validation
- **Progress Tracking**: Level, money, experience synced with server
- **Data Persistence**: Local caching with server synchronization
- **Offline Support**: Cached data when server unavailable

### Game Mechanics
- **2D Movement**: WASD/Arrow keys + touch controls for mobile
- **Character Controller**: Physics-based movement with animations
- **Scene Management**: Smooth transitions between game areas
- **Input Handling**: Cross-platform input (keyboard + touch)

### API Integration
- **RESTful Client**: Full integration with Go backend endpoints
- **Async Requests**: Non-blocking HTTP requests with callbacks
- **Error Handling**: User-friendly error messages and retry logic
- **Health Monitoring**: Connection status monitoring

### UI System
- **Responsive Design**: Adapts to different screen sizes
- **Scene-based UI**: Separate UI layers for different game states
- **Input Validation**: Client-side validation before API calls
- **Loading States**: Visual feedback for network operations

## 📱 Mobile-First Design

### iOS Optimizations
- **Touch Controls**: Optimized for finger input
- **Auto-layout**: Responsive UI scaling
- **Performance**: 60 FPS target on mobile devices
- **Battery Efficient**: Optimized rendering and network usage

### macOS Features
- **Desktop Controls**: Full keyboard and mouse support
- **Window Management**: Resizable windows with proper scaling
- **Menu Integration**: Native macOS menu integration

## 🔧 Configuration

### API Settings
```gdscript
# In APIClient.gd
@export var base_url: String = "http://localhost:3000"  # Development
# Change to production URL for release builds
```

### Export Settings
- **Debug builds**: Local development with debug logging
- **Release builds**: Production-ready with optimizations
- **Platform-specific**: Different settings for iOS vs macOS

## 🎨 Visual Assets

### Required Graphics
- **Character sprites**: Male/female player variations
- **Environment**: Town backgrounds, buildings, NPCs  
- **UI elements**: Buttons, panels, icons
- **Animations**: Character walk/run cycles

### Audio Assets
- **Background music**: Ambient town theme
- **Sound effects**: UI clicks, success/failure sounds
- **Voice over**: Question narration (optional)

## 🔧 Development Features

### Debug Tools
- **Console logging**: Detailed debug output in editor
- **API monitoring**: Request/response logging
- **State inspection**: Real-time game state viewing

### Testing
- **Scene testing**: Individual scene testing in editor
- **API mocking**: Offline development mode
- **Cross-platform**: Test on multiple devices/simulators

## 🔐 Security & Performance

### Data Security
- **Local storage**: Encrypted player data cache
- **Network**: HTTPS communication in production
- **Validation**: Input sanitization and validation

### Performance
- **Memory management**: Efficient resource usage
- **Network optimization**: Request batching and caching
- **Rendering**: Optimized for 60 FPS on mobile

## 📚 Code Architecture

### Singleton Pattern
- **GameManager**: Global game state and player data
- **APIClient**: Centralized network communication

### Scene Architecture
- **Modular scenes**: Independent, reusable components  
- **Signal-based**: Loose coupling via Godot signals
- **State management**: Clean state transitions

### Data Flow
```
User Input → UI Controller → GameManager → APIClient → Go Backend
                ↓                                ↓
            Local State ←←←←←← Server Response ←←←←←
```

## 🚀 Deployment

### iOS App Store
1. Configure proper bundle ID and certificates
2. Test on physical devices
3. Submit through Xcode for App Store review

### macOS Distribution
1. Code sign with Developer ID
2. Notarize with Apple
3. Distribute via Mac App Store or direct download

## 🔄 API Endpoints Used

- `POST /api/players/` - Create new player
- `GET /api/players/:id` - Get player data  
- `PUT /api/players/:id` - Update player progress
- `GET /api/players/:id/stats` - Get player statistics
- `GET /api/questions/random` - Get random quiz question
- `POST /api/interactions/` - Submit quiz answers
- `GET /health` - Server health check

## 🎯 Next Steps

1. **Enhanced Graphics**: Add character sprites and animations
2. **Quiz System**: Implement interactive English learning interface  
3. **Audio Integration**: Add background music and sound effects
4. **Social Features**: Leaderboards and multiplayer interactions
5. **Content Management**: Dynamic content loading from server
6. **Analytics**: Player behavior tracking and learning insights
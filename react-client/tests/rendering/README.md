# ECS Rendering System Tests

This directory contains comprehensive Playwright tests for the ECS (Entity Component System) rendering pipeline in the English Learning Town game.

## Test Structure

### 1. `render-system.spec.ts`
Tests the core RenderSystem logic and entity processing:
- **Entity Processing**: Validates that entities with required components are processed correctly
- **Z-index Ordering**: Ensures entities are rendered in proper depth order
- **Performance**: Tests rendering performance with multiple entities
- **Real-time Updates**: Verifies that entity position and property changes are reflected
- **Visibility Handling**: Tests entity show/hide functionality
- **Error Handling**: Ensures graceful handling of malformed entity data

### 2. `ecs-renderer.spec.ts` 
Tests the React ECSRenderer component functionality:
- **Canvas Rendering**: Verifies game canvas setup and styling
- **Entity Styling**: Tests entity positioning, sizing, and visual attributes
- **Input Handling**: Tests mouse clicks and keyboard input processing
- **Hover Effects**: Validates CSS transitions and interactive feedback
- **Responsive Design**: Tests rendering across different screen sizes
- **Scene Management**: Tests scene transitions and state maintenance

### 3. `rendering-integration.spec.ts`
Integration tests for the complete rendering pipeline:
- **End-to-End Rendering**: Tests World → RenderSystem → ECSRenderer → DOM flow
- **Game Loop Integration**: Tests continuous updates and game state consistency
- **Performance Under Load**: Stress tests with many entities and rapid interactions  
- **Error Recovery**: Tests graceful handling of rendering errors
- **Animation Integration**: Tests entity animations and visual effects
- **State Consistency**: Verifies game state remains consistent across interactions

## Key Test Scenarios

### Core Functionality
- ✅ Entity creation and rendering
- ✅ Position and size calculations (grid-based)
- ✅ Z-index depth sorting
- ✅ Visibility state management
- ✅ Real-time entity updates

### Visual Rendering
- ✅ Emoji entity rendering
- ✅ Sprite image rendering with proper scaling
- ✅ Background color and styling
- ✅ CSS hover effects and transitions
- ✅ Grid overlay (when enabled)

### Interactions
- ✅ Canvas click events (for movement/pathfinding)
- ✅ Entity click events (for interactions)
- ✅ Keyboard input (WASD/arrow keys)
- ✅ Scene transitions (building entrances)
- ✅ NPC interactions (dialogue triggers)

### Performance
- ✅ Multi-entity rendering efficiency
- ✅ Rapid interaction handling
- ✅ Memory leak prevention
- ✅ Frame rate consistency
- ✅ Large scene handling

### Responsive Design
- ✅ Multiple viewport sizes (1920x1080 to 800x600)
- ✅ Entity positioning across screen sizes
- ✅ Canvas scaling and layout
- ✅ Font size and cell size scaling

## Running the Tests

### Individual Test Files
```bash
# Run RenderSystem tests
npx playwright test tests/rendering/render-system.spec.ts

# Run ECSRenderer component tests  
npx playwright test tests/rendering/ecs-renderer.spec.ts

# Run integration tests
npx playwright test tests/rendering/rendering-integration.spec.ts
```

### All Rendering Tests
```bash
# Run all rendering tests
npx playwright test tests/rendering/

# Run with UI mode for debugging
npx playwright test tests/rendering/ --ui

# Run with specific browser
npx playwright test tests/rendering/ --project=chromium
```

### Debugging Tests
```bash
# Run in debug mode
npx playwright test tests/rendering/ --debug

# Run with headed browser (visible)
npx playwright test tests/rendering/ --headed

# Generate test report
npx playwright test tests/rendering/ --reporter=html
```

## Test Architecture

### ECS Component Coverage
The tests cover all major ECS components involved in rendering:
- **PositionComponent**: X/Y coordinates and movement
- **SizeComponent**: Width/height for entity bounds
- **RenderableComponent**: Visual properties (emoji, sprite, colors, z-index)
- **CollisionComponent**: Walkable areas and collision detection
- **InteractiveComponent**: Click handlers and interaction types

### System Integration
Tests verify the interaction between systems:
- **RenderSystem**: Entity collection, sorting, and frame emission
- **MovementSystem**: Position updates and collision checking
- **InputSystems**: Keyboard and mouse event processing
- **AnimationSystems**: Visual effects and movement animations

### React Component Integration
Tests ensure proper React integration:
- **ECSRenderer**: DOM rendering and event handling
- **Game Loop**: RequestAnimationFrame and continuous updates
- **Event Bus**: System communication and state synchronization
- **Styled Components**: CSS-in-JS styling and theming

## Performance Benchmarks

### Acceptable Performance Targets
- **Entity Rendering**: < 100ms for 100+ entities
- **Interaction Response**: < 50ms click-to-response time
- **Scene Loading**: < 2 seconds for complete scene
- **Memory Usage**: Stable (no leaks during 10+ minute sessions)

### Load Testing
- **Entity Count**: Tested up to 1000 entities
- **Rapid Interactions**: 20+ clicks/keystrokes per second
- **Screen Resizing**: Multiple viewport changes without performance degradation
- **Long-Running Sessions**: Extended gameplay without memory leaks

## Browser Compatibility

Tests are run across multiple browsers:
- **Chromium**: Primary testing browser
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility testing

## Error Handling

### Graceful Degradation
Tests verify the system handles errors gracefully:
- Missing or corrupted entity data
- Invalid component configurations
- Network interruptions (for sprite loading)
- Extreme values (very large/small coordinates)
- Rapid state changes and race conditions

### Recovery Scenarios  
- Entity addition/removal during rendering
- Component updates during frame processing
- Scene transitions with entity cleanup
- Input system failures and recovery

## Future Test Enhancements

### Planned Additions
- **Visual Regression Testing**: Screenshot comparisons for visual consistency
- **Accessibility Testing**: Screen reader and keyboard navigation
- **Mobile Responsive**: Touch input and mobile viewport testing
- **WebGL Rendering**: If graphics are upgraded to WebGL/Canvas
- **Network Testing**: Multiplayer rendering synchronization

### Performance Monitoring
- **FPS Tracking**: Frame rate monitoring during gameplay
- **Memory Profiling**: Long-term memory usage analysis
- **CPU Usage**: Rendering performance impact measurement
- **Battery Impact**: Mobile device battery consumption testing

---

These tests ensure the ECS rendering system is robust, performant, and provides a smooth gaming experience across different devices and usage scenarios.
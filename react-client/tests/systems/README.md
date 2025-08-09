# ECS Systems Tests

This directory contains comprehensive tests for the individual ECS systems following the SRP (Single Responsibility Principle) architecture.

## Test Structure

Each system has its own test file that thoroughly tests its specific functionality:

### Core Systems
- **GridMovementSystem.spec.ts** - Tests discrete grid-based player movement
- **CollisionSystem.spec.ts** - Tests collision detection and movement validation  
- **InputStateSystem.spec.ts** - Tests keyboard input state management
- **PlayerInteractionSystem.spec.ts** - Tests spacebar-triggered interactions
- **RenderSystem.spec.ts** - Tests event-driven entity rendering
- **InteractionZoneSystem.spec.ts** - Tests interaction zone detection

### System Coverage

| System | Functionality Tested | Key Test Areas |
|--------|---------------------|----------------|
| GridMovementSystem | Discrete movement | Arrow keys, WASD, collision integration, discrete behavior |
| CollisionSystem | Collision detection | Non-walkable entities, bounds validation, overlap detection |
| InputStateSystem | Input management | Key press/release, state consistency, event emission |
| PlayerInteractionSystem | Spacebar interactions | Zone-based interaction, entity detection, event emission |
| RenderSystem | Visual rendering | Entity positioning, z-index, event-driven updates |
| InteractionZoneSystem | Zone detection | Relative/absolute coordinates, adjacency, range validation |

## Running Tests

### Run all system tests:
```bash
npm run test:systems
```

### Run specific system test:
```bash
npx playwright test tests/systems/GridMovementSystem.spec.ts
npx playwright test tests/systems/CollisionSystem.spec.ts
```

### Run with UI mode:
```bash
npx playwright test tests/systems/ --ui
```

## Test Architecture

### Test Setup
Each test:
1. Navigates to the game (`/`)
2. Enters a test player name
3. Starts a new adventure  
4. Waits for game initialization (2s)
5. Waits for entities to render

### Test Categories

**Functional Tests**: Verify core system behavior
- Movement responses to input
- Collision detection accuracy  
- Event emission correctness
- State management consistency

**Integration Tests**: Verify system interactions
- Input → Movement → Render pipeline
- Collision → Movement blocking
- Interaction → Zone detection

**Performance Tests**: Verify system efficiency
- Rapid input handling
- Multiple entity processing
- Error-free operation under load

**Edge Case Tests**: Verify robustness
- Rapid key presses
- Boundary conditions
- Invalid states

## Key Testing Principles

### Event-Driven Verification
Tests listen to console logs to verify:
- Event emission (`INPUT_KEY_DOWN`, `ENTITY_MOVED`, etc.)
- System responses to events
- Error-free operation

### Visual Verification
Tests check rendered entities for:
- Correct positioning (absolute, grid-aligned)
- Proper z-index ordering
- Visibility and styling
- Hover effects and animations

### State Consistency
Tests verify:
- Input state management
- Position updates
- Component integrity
- System coordination

## Console Log Monitoring

Tests actively monitor console output for:
- ✅ **Success indicators**: "Player moved", "Component added"
- ❌ **Error detection**: JavaScript errors, system failures
- 🔍 **Debug information**: Event flows, state changes
- ⚡ **Performance metrics**: Operation timing

## Adding New System Tests

When adding a new system:

1. Create `NewSystem.spec.ts` in this directory
2. Follow the established test pattern:
   ```typescript
   test.describe('NewSystem', () => {
     test.beforeEach(async ({ page }) => {
       // Standard setup
     });
     
     test('should [core functionality]', async ({ page }) => {
       // Test implementation
     });
   });
   ```
3. Include tests for:
   - Core functionality
   - Error conditions  
   - Performance
   - Integration with other systems
4. Update this README with test coverage information

## Test Data and Scenarios

### Standard Game State
- Player spawns at position (10, 10)
- Scene contains buildings, NPCs, decorations
- Interactive entities have defined interaction zones
- Grid-based movement (40px cells)

### Input Scenarios
- **Movement**: Arrow keys, WASD
- **Interaction**: Spacebar presses
- **Edge cases**: Rapid input, key combinations

### Expected Behaviors
- **Discrete movement**: One cell per keypress
- **Collision detection**: Blocked by non-walkable entities
- **Interaction zones**: Context-sensitive interactions
- **Event-driven rendering**: Updates only when needed

This comprehensive test suite ensures that the SRP-compliant ECS architecture maintains functionality while providing excellent maintainability and performance.

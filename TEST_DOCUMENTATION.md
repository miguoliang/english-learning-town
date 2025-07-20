# English Learning Town - Test Documentation

## 🧪 Testing Framework Overview

This project uses a comprehensive testing strategy to ensure the quality and reliability of the English Learning Town quest system. Our testing approach covers unit tests, integration tests, scene tests, and performance tests.

## 📁 Test Structure

```
test/
├── unit/                          # Unit tests for individual components
│   ├── TestQuestManager.gd        # QuestManager functionality
│   ├── TestNPCManager.gd          # NPC system and management
│   └── TestDialogueSystem.gd      # Dialogue trees and conversations
├── integration/                   # Integration tests for system workflows
│   ├── TestQuestFlow.gd           # Complete quest completion flows
│   └── TestNPCInteractions.gd     # Player-NPC interaction flows
├── scenes/                        # Scene-level tests
│   └── TestTownExploration.gd     # Main game scene functionality
├── performance/                   # Performance and stress tests
│   └── TestQuestSystemPerformance.gd
├── mocks/                         # Mock objects for testing
│   └── MockGameManager.gd         # Mock GameManager for isolated tests
└── TestBootstrap.gd               # Main test runner and setup
```

## 🎯 Test Categories

### Unit Tests

**Purpose**: Test individual components in isolation
**Coverage**:
- QuestManager quest creation, progression, completion
- NPCManager NPC registration and data management
- Dialogue system entry/response handling
- Quest objective tracking and validation

**Key Test Cases**:
- Quest availability based on prerequisites
- Objective progression and completion
- NPC data initialization and friendship system
- Dialogue highlighting and vocabulary teaching
- Save/load functionality

### Integration Tests

**Purpose**: Test complete workflows and system interactions
**Coverage**:
- Full quest completion flows (Welcome → Shopping → Delivery)
- Quest chain prerequisites and unlocking
- NPC-Quest integration and dialogue switching
- Reward system integration
- Error handling across systems

**Key Test Cases**:
- Complete welcome quest workflow
- Shopping quest with NPC interactions
- Delivery quest with item handling
- Quest save/load with active progress
- Multiple quest management

### Scene Tests

**Purpose**: Test the complete game scene and UI integration
**Coverage**:
- Scene loading and initialization
- Player-NPC interaction mechanics
- UI element functionality and connections
- Camera following and controls
- Quest UI updates and notifications

**Key Test Cases**:
- Scene loads with all required components
- NPCs are properly positioned and interactive
- Quest UI displays current quest and objectives
- Player movement and interaction controls work
- Menu and interaction buttons function correctly

### Performance Tests

**Purpose**: Ensure system performance under load
**Coverage**:
- Quest system scalability with many quests
- NPC system performance with multiple NPCs
- Dialogue processing speed
- Memory usage optimization
- Save/load performance

**Key Test Cases**:
- Handle 1000+ quests efficiently
- Process multiple NPCs without lag
- Fast dialogue highlighting and processing
- Reasonable memory usage
- Quick save/load operations

## 🚀 Running Tests

### Prerequisites

1. **Godot Engine 4.3+** installed
2. **GdUnit4** testing framework (optional, using built-in for now)
3. **Command line access** to project directory

### Quick Start

```bash
# Run all tests
./run_tests.sh

# Run specific test categories
./run_tests.sh --unit
./run_tests.sh --integration
./run_tests.sh --scene

# Run with verbose output
./run_tests.sh --verbose
```

### Manual Testing

```bash
# Run individual test file
godot --headless --script test/unit/TestQuestManager.gd

# Run with debugging
godot --script test/unit/TestQuestManager.gd --debug
```

## 📊 Test Results and Reporting

### Automated Reports

Tests generate comprehensive reports including:
- **Pass/Fail Status** for each test case
- **Performance Metrics** (execution time, memory usage)
- **Coverage Information** (components tested)
- **Error Logs** with detailed failure information

### Report Locations

```
test_results/
├── unit_results.log           # Unit test output
├── integration_results.log    # Integration test output
├── scene_results.log          # Scene test output
├── performance_results.log    # Performance metrics
└── test_report.html          # Comprehensive HTML report
```

### CI/CD Integration

Tests run automatically on:
- **Push to main/develop** branches
- **Pull requests**
- **Scheduled nightly runs**

GitHub Actions workflow provides:
- Multi-version Godot testing (4.3, 4.4)
- Automated test result artifacts
- Performance regression detection
- Test result summaries in PR comments

## 🎓 Educational System Testing

### Learning Objectives Validation

Our tests specifically validate educational features:

**Vocabulary Teaching**:
```gdscript
func test_vocabulary_teaching():
    var dialogue = DialogueEntry.new("Let's learn: hello, goodbye", "Teacher")
    dialogue.vocabulary_highlights = ["hello", "goodbye"]
    
    var highlighted = dialogue.get_highlighted_text()
    assert_that(highlighted).contains("[color=yellow]hello[/color]")
```

**Quest Learning Flow**:
```gdscript
func test_learning_progression():
    # Start with basic greetings
    quest_manager.start_quest("welcome")
    # Progress to shopping vocabulary
    quest_manager.start_quest("first_shopping")
    # Advance to directions and helping
    quest_manager.start_quest("delivery_mission")
```

**Cultural Learning Validation**:
```gdscript
func test_politeness_teaching():
    var dialogue = shopkeeper_data.quest_dialogues["first_shopping"][1]
    assert_that(dialogue.vocabulary_highlights).contains("please")
    assert_that(dialogue.vocabulary_highlights).contains("thank you")
```

## 📈 Performance Benchmarks

### Target Performance Metrics

| Component | Target | Measurement |
|-----------|--------|-------------|
| Quest Creation | < 1ms per quest | 1000 quests in < 1 second |
| NPC Registration | < 5ms per NPC | 100 NPCs in < 0.5 seconds |
| Dialogue Processing | < 0.1ms per entry | 1000 entries in < 100ms |
| Save/Load | < 2 seconds | Full game state |
| Memory Usage | < 100MB | 1000 quests + 100 NPCs |

### Stress Test Scenarios

1. **High Quest Load**: 1000+ active quests with complex objectives
2. **Many NPCs**: 500+ NPCs with full dialogue trees
3. **Rapid Interactions**: 1000+ player-NPC interactions per minute
4. **Memory Pressure**: Long gameplay sessions (simulated)
5. **Save/Load Stress**: Frequent save/load operations

## 🔧 Test Maintenance

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Extend GdUnitTestSuite** class
3. **Implement before_test() and after_test()** setup/cleanup
4. **Add test methods** with `test_` prefix
5. **Use assertions** to validate behavior
6. **Update this documentation**

### Test Naming Conventions

```gdscript
# Test method naming
func test_[component]_[functionality]_[expected_behavior]():
    # Example: test_quest_manager_start_quest_returns_true()

# Test file naming
Test[ComponentName].gd
# Example: TestQuestManager.gd
```

### Mock Objects

Use mock objects for:
- **External dependencies** (GameManager, APIClient)
- **Heavy objects** that slow down tests
- **Unpredictable systems** (network, file I/O)
- **UI components** that require scene tree

## 📋 Test Checklist

Before releasing new features, ensure:

- [ ] **Unit tests** cover new components
- [ ] **Integration tests** cover new workflows  
- [ ] **Scene tests** validate UI integration
- [ ] **Performance tests** check scalability
- [ ] **All tests pass** in CI/CD pipeline
- [ ] **Coverage targets** are met (>80%)
- [ ] **Documentation** is updated
- [ ] **Educational objectives** are validated

## 🚨 Troubleshooting

### Common Issues

**Tests fail in CI but pass locally**:
- Check Godot version differences
- Verify all dependencies are available
- Review environment-specific paths

**Performance tests are flaky**:
- Run on consistent hardware
- Use relative performance metrics
- Account for system load variations

**Scene tests crash**:
- Ensure proper cleanup in after_test()
- Check for missing node references
- Verify scene dependencies are loaded

### Debug Tips

```gdscript
# Add debug output
print("Debug: Quest status = ", quest.status)

# Use detailed assertions
assert_that(value).is_equal(expected).override_failure_message("Custom error message")

# Test with minimal setup
func test_minimal_example():
    var quest = QuestData.new("test", "Test Quest")
    assert_that(quest.id).is_equal("test")
```

## 📚 Additional Resources

- [Godot Testing Best Practices](https://docs.godotengine.org/en/stable/tutorials/scripting/unit_testing.html)
- [GdUnit4 Documentation](https://github.com/MikeSchulze/gdUnit4)
- [Testing Educational Games](https://www.gamasutra.com/view/feature/testing-educational-games)
- [Quest System Design Patterns](https://gamedev.stackexchange.com/questions/tagged/quest-system)

---

*This testing framework ensures that English Learning Town provides a reliable, performant, and educationally effective experience for language learners.*
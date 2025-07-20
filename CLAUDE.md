# Instructions for Claude Code Assistant

## Critical Code Patterns to Remember

### Godot Array Property Assignment
**NEVER** directly assign to typed Array properties in Godot Resources:
```gdscript
# WRONG - This causes "Invalid assignment" errors
quest_objective.vocabulary_to_use = ["word1", "word2"]
quest_objective.required_phrases = ["phrase1", "phrase2"]

# CORRECT - Always use setter methods
quest_objective.set_vocabulary_to_use(["word1", "word2"])
quest_objective.set_required_phrases(["phrase1", "phrase2"])
```

### Why This Happens
- Godot's typed Arrays in exported Resources require proper type handling
- Direct assignment bypasses type validation
- Setter methods ensure proper type conversion

### Prevention Strategy
1. **Always check** for existing setter methods before direct assignment
2. **Look for patterns** like `set_property_name()` methods
3. **Test assignments** in Resource classes carefully
4. **Use getters/setters** for all Array properties in Resources

### Common Properties That Need Setters
- `vocabulary_to_use: Array[String]`
- `required_phrases: Array[String]`
- Any `@export var array_property: Array[Type]` in Resource classes

## Testing Protocol
After making changes to Resource property assignments:
1. Run `godot --headless --path . --check-only` to verify compilation
2. Look for "Invalid assignment" errors specifically
3. Fix by using setter methods instead of direct assignment

## Movement System Notes
- Current system uses discrete 32-pixel grid movement
- Use `is_action_just_pressed()` for step-based input
- Sprites switch automatically based on player gender (male/female)
- Girl sprites: pink shirt, purple pants, longer hair
- Boy sprites: blue shirt, navy pants, shorter hair
## Additional Fixed Properties
- `response_options: Array[DialogueResponse]` - FIXED in TeacherData.gd, ShopkeeperData.gd, TestDialogueSystem.gd
- Added setter method `set_response_options()` to DialogueEntry.gd


## Comprehensive Review and Fixes Completed

### Fixed Properties:
1. `vocabulary_to_use: Array[String]` - FIXED in QuestManager.gd (2 instances)
2. `response_options: Array[DialogueResponse]` - FIXED in TeacherData.gd, ShopkeeperData.gd, TestDialogueSystem.gd
3. `vocabulary_highlights: Array[String]` - FIXED in DialogueEntry.gd from_dictionary() method
4. `default_dialogue: Array[DialogueEntry]` - FIXED in ShopkeeperData.gd, TeacherData.gd

### Added Setter Methods:
- `set_response_options()` to DialogueEntry.gd

### Review Status:
- ✅ All Resource classes reviewed: DialogueEntry, NPCData, QuestData, QuestObjective, ScheduleEntry, DialogueCondition, DialogueResponse
- ✅ All from_dictionary() methods checked
- ✅ All direct Array assignments in Resource classes fixed
- ✅ Append operations on typed Arrays confirmed safe
- ✅ All setter methods properly implemented

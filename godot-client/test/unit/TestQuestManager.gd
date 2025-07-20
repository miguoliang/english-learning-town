# TestQuestManager.gd
# Unit tests for QuestManager functionality

extends GdUnitTestSuite

var quest_manager: Node
var mock_game_manager: Node

func before_test():
	# Create fresh QuestManager instance for each test
	quest_manager = preload("res://scripts/managers/QuestManager.gd").new()
	quest_manager.debug_mode = true
	
	# Mock GameManager if needed
	setup_mock_game_manager()
	
	# Add to scene tree
	add_child(quest_manager)

func after_test():
	# Clean up after each test
	if quest_manager:
		quest_manager.queue_free()
	if mock_game_manager:
		mock_game_manager.queue_free()

func setup_mock_game_manager():
	# Create a mock GameManager for testing
	mock_game_manager = Node.new()
	mock_game_manager.name = "MockGameManager"
	
	# Add mock methods
	mock_game_manager.set_script(preload("res://test/mocks/MockGameManager.gd"))
	add_child(mock_game_manager)

# Test quest creation and loading
func test_quest_manager_initialization():
	assert_that(quest_manager).is_not_null()
	assert_that(quest_manager.all_quests).is_not_null()
	assert_that(quest_manager.all_quests.size()).is_greater(0)

func test_starter_quests_created():
	# Check that starter quests are created
	assert_that(quest_manager.all_quests.has("welcome")).is_true()
	assert_that(quest_manager.all_quests.has("first_shopping")).is_true() 
	assert_that(quest_manager.all_quests.has("delivery_mission")).is_true()
	
	# Verify quest properties
	var welcome_quest = quest_manager.get_quest("welcome")
	assert_that(welcome_quest).is_not_null()
	assert_that(welcome_quest.title).is_equal("Welcome to English Learning Town!")
	assert_that(welcome_quest.is_main_quest).is_true()
	assert_that(welcome_quest.objectives.size()).is_greater(0)

func test_quest_availability():
	# Welcome quest should be available immediately
	var welcome_quest = quest_manager.get_quest("welcome")
	assert_that(welcome_quest.is_available()).is_true()
	
	# Shopping quest should require welcome quest completion
	var shopping_quest = quest_manager.get_quest("first_shopping")
	assert_that(shopping_quest.is_available()).is_false()
	
	# Complete welcome quest and check shopping availability
	quest_manager.complete_quest("welcome")
	assert_that(shopping_quest.is_available()).is_true()

func test_quest_starting():
	# Test starting a quest
	var result = quest_manager.start_quest("welcome")
	assert_that(result).is_true()
	
	# Check quest is now active
	assert_that(quest_manager.is_quest_active("welcome")).is_true()
	assert_that(quest_manager.active_quests.size()).is_equal(1)
	assert_that(quest_manager.get_current_active_quest()).is_not_null()
	
	# Test starting invalid quest
	var invalid_result = quest_manager.start_quest("nonexistent_quest")
	assert_that(invalid_result).is_false()

func test_quest_objective_progression():
	# Start welcome quest
	quest_manager.start_quest("welcome")
	var quest = quest_manager.get_current_active_quest()
	
	# Check initial objective
	var initial_objective = quest.get_current_objective()
	assert_that(initial_objective).is_not_null()
	assert_that(initial_objective.objective_type).is_equal(QuestObjective.ObjectiveType.GO_TO_LOCATION)
	assert_that(initial_objective.target_id).is_equal("school")
	
	# Complete first objective
	var updated = quest_manager.update_quest_objective(
		"welcome",
		QuestObjective.ObjectiveType.GO_TO_LOCATION,
		"school"
	)
	assert_that(updated).is_true()
	
	# Check objective progression
	var current_objective = quest.get_current_objective()
	assert_that(current_objective.objective_type).is_equal(QuestObjective.ObjectiveType.TALK_TO_NPC)
	assert_that(current_objective.target_id).is_equal("teacher")

func test_quest_completion():
	# Start and complete welcome quest
	quest_manager.start_quest("welcome")
	var quest = quest_manager.get_current_active_quest()
	
	# Complete all objectives
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.TALK_TO_NPC, "teacher")
	
	# Check quest is completed
	assert_that(quest_manager.is_quest_completed("welcome")).is_true()
	assert_that(quest_manager.active_quests.size()).is_equal(0)
	assert_that(quest_manager.completed_quests).contains("welcome")

func test_quest_rewards():
	# Mock GameManager methods for rewards
	var signals_received = []
	
	# Start and complete quest
	quest_manager.start_quest("welcome")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.TALK_TO_NPC, "teacher")
	
	# Verify quest completion was called (would normally give rewards)
	assert_that(quest_manager.is_quest_completed("welcome")).is_true()

func test_quest_save_load():
	# Start a quest
	quest_manager.start_quest("welcome")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	
	# Save progress
	quest_manager.save_quest_progress()
	
	# Create new quest manager and load
	var new_quest_manager = preload("res://scripts/managers/QuestManager.gd").new()
	add_child(new_quest_manager)
	new_quest_manager.load_quest_progress()
	
	# Verify progress was loaded
	assert_that(new_quest_manager.is_quest_active("welcome")).is_true()
	var loaded_quest = new_quest_manager.get_quest("welcome")
	assert_that(loaded_quest.current_objective_index).is_equal(1)
	
	new_quest_manager.queue_free()

func test_quest_prerequisites():
	# Test that shopping quest requires welcome quest
	var shopping_quest = quest_manager.get_quest("first_shopping")
	assert_that(shopping_quest.prerequisite_quests).contains("welcome")
	assert_that(shopping_quest.is_available()).is_false()
	
	# Complete prerequisite
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	
	# Check shopping quest is now available
	assert_that(shopping_quest.is_available()).is_true()

func test_multiple_active_quests():
	# Start welcome quest
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	
	# Start shopping quest
	quest_manager.start_quest("first_shopping")
	assert_that(quest_manager.active_quests.size()).is_equal(1)
	
	# Current active quest should be shopping
	var current = quest_manager.get_current_active_quest()
	assert_that(current.id).is_equal("first_shopping")

func test_quest_signals():
	# Test quest signals are emitted
	var quest_started_received = false
	var quest_completed_received = false
	
	quest_manager.quest_started.connect(func(quest): quest_started_received = true)
	quest_manager.quest_completed.connect(func(quest): quest_completed_received = true)
	
	# Start and complete quest
	quest_manager.start_quest("welcome")
	assert_that(quest_started_received).is_true()
	
	quest_manager.complete_quest("welcome")
	assert_that(quest_completed_received).is_true()

func test_quest_objective_validation():
	quest_manager.start_quest("welcome")
	
	# Test invalid objective update
	var invalid_update = quest_manager.update_quest_objective(
		"welcome",
		QuestObjective.ObjectiveType.BUY_ITEM,  # Wrong type
		"wrong_target"
	)
	assert_that(invalid_update).is_false()
	
	# Test valid objective update
	var valid_update = quest_manager.update_quest_objective(
		"welcome",
		QuestObjective.ObjectiveType.GO_TO_LOCATION,
		"school"
	)
	assert_that(valid_update).is_true()
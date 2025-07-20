# TestQuestFlow.gd
# Integration tests for complete quest workflows

extends GdUnitTestSuite

var quest_manager: Node
var npc_manager: Node
var mock_game_manager: Node
var teacher_npc: Node
var shopkeeper_npc: Node

func before_test():
	# Set up complete quest system for integration testing
	setup_managers()
	setup_npcs()

func after_test():
	cleanup_test_environment()

func setup_managers():
	# Create mock GameManager
	mock_game_manager = preload("res://test/mocks/MockGameManager.gd").new()
	add_child(mock_game_manager)
	
	# Create QuestManager
	quest_manager = preload("res://scripts/managers/QuestManager.gd").new()
	quest_manager.debug_mode = true
	add_child(quest_manager)
	
	# Create NPCManager
	npc_manager = preload("res://scripts/managers/NPCManager.gd").new()
	add_child(npc_manager)

func setup_npcs():
	# Create teacher NPC
	teacher_npc = preload("res://scripts/npcs/NPC.gd").new()
	teacher_npc.name = "Teacher"
	add_child(teacher_npc)
	npc_manager.register_npc(teacher_npc, "teacher")
	
	# Create shopkeeper NPC
	shopkeeper_npc = preload("res://scripts/npcs/NPC.gd").new()
	shopkeeper_npc.name = "Shopkeeper"
	add_child(shopkeeper_npc)
	npc_manager.register_npc(shopkeeper_npc, "shopkeeper")

func cleanup_test_environment():
	if quest_manager:
		quest_manager.queue_free()
	if npc_manager:
		npc_manager.queue_free()
	if mock_game_manager:
		mock_game_manager.queue_free()
	if teacher_npc:
		teacher_npc.queue_free()
	if shopkeeper_npc:
		shopkeeper_npc.queue_free()

func test_complete_welcome_quest_flow():
	# Test the entire welcome quest from start to finish
	
	# 1. Quest should start automatically or be available
	assert_that(quest_manager.get_quest("welcome")).is_not_null()
	assert_that(quest_manager.get_quest("welcome").is_available()).is_true()
	
	# 2. Start the quest
	var started = quest_manager.start_quest("welcome")
	assert_that(started).is_true()
	assert_that(quest_manager.is_quest_active("welcome")).is_true()
	
	# 3. Check initial objective (go to school)
	var quest = quest_manager.get_current_active_quest()
	var first_objective = quest.get_current_objective()
	assert_that(first_objective.objective_type).is_equal(QuestObjective.ObjectiveType.GO_TO_LOCATION)
	assert_that(first_objective.target_id).is_equal("school")
	
	# 4. Complete first objective
	var obj1_completed = quest_manager.update_quest_objective(
		"welcome",
		QuestObjective.ObjectiveType.GO_TO_LOCATION,
		"school"
	)
	assert_that(obj1_completed).is_true()
	
	# 5. Check second objective (talk to teacher)
	var second_objective = quest.get_current_objective()
	assert_that(second_objective.objective_type).is_equal(QuestObjective.ObjectiveType.TALK_TO_NPC)
	assert_that(second_objective.target_id).is_equal("teacher")
	
	# 6. Complete second objective
	var obj2_completed = quest_manager.update_quest_objective(
		"welcome",
		QuestObjective.ObjectiveType.TALK_TO_NPC,
		"teacher"
	)
	assert_that(obj2_completed).is_true()
	
	# 7. Quest should be completed
	assert_that(quest_manager.is_quest_completed("welcome")).is_true()
	assert_that(quest_manager.active_quests.size()).is_equal(0)

func test_quest_chain_prerequisites():
	# Test that quest chain works with prerequisites
	
	# Shopping quest should not be available initially
	var shopping_quest = quest_manager.get_quest("first_shopping")
	assert_that(shopping_quest.is_available()).is_false()
	
	# Complete welcome quest
	quest_manager.start_quest("welcome")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.TALK_TO_NPC, "teacher")
	
	# Now shopping quest should be available
	assert_that(shopping_quest.is_available()).is_true()
	
	# Start shopping quest
	var shopping_started = quest_manager.start_quest("first_shopping")
	assert_that(shopping_started).is_true()

func test_npc_quest_dialogue_integration():
	# Test that NPCs properly integrate with quest system
	
	# Teacher should have welcome quest dialogue
	var teacher_data = teacher_npc.npc_data
	assert_that(teacher_data.quest_dialogues.has("welcome")).is_true()
	
	# Start welcome quest
	quest_manager.start_quest("welcome")
	
	# Teacher's current dialogue should be quest-specific
	var current_dialogue = teacher_data.get_current_dialogue()
	assert_that(current_dialogue).is_not_empty()
	
	# Should have welcome quest dialogue
	var welcome_dialogue = teacher_data.quest_dialogues["welcome"]
	assert_that(welcome_dialogue).is_equal(current_dialogue)

func test_quest_reward_integration():
	# Test that quest completion gives proper rewards
	
	var initial_money = mock_game_manager.get_player_money()
	var initial_experience = mock_game_manager.get_player_experience()
	
	# Complete welcome quest
	quest_manager.start_quest("welcome")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.TALK_TO_NPC, "teacher")
	
	# Check rewards were given (mocked)
	var welcome_quest = quest_manager.get_quest("welcome")
	assert_that(welcome_quest.experience_reward).is_greater(0)
	assert_that(welcome_quest.money_reward).is_greater(0)

func test_shopping_quest_flow():
	# Test complete shopping quest workflow
	
	# Complete prerequisite (welcome quest)
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	
	# Start shopping quest
	var shopping_started = quest_manager.start_quest("first_shopping")
	assert_that(shopping_started).is_true()
	
	var shopping_quest = quest_manager.get_current_active_quest()
	assert_that(shopping_quest.id).is_equal("first_shopping")
	
	# Complete objectives
	# 1. Go to shop
	quest_manager.update_quest_objective("first_shopping", QuestObjective.ObjectiveType.GO_TO_LOCATION, "shop")
	
	# 2. Buy pencil
	quest_manager.update_quest_objective("first_shopping", QuestObjective.ObjectiveType.BUY_ITEM, "pencil")
	
	# 3. Buy book
	quest_manager.update_quest_objective("first_shopping", QuestObjective.ObjectiveType.BUY_ITEM, "book")
	
	# Quest should be completed
	assert_that(quest_manager.is_quest_completed("first_shopping")).is_true()

func test_delivery_quest_flow():
	# Test delivery quest workflow
	
	# Complete prerequisites
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	quest_manager.start_quest("first_shopping")
	quest_manager.complete_quest("first_shopping")
	
	# Start delivery quest
	var delivery_started = quest_manager.start_quest("delivery_mission")
	assert_that(delivery_started).is_true()
	
	var delivery_quest = quest_manager.get_current_active_quest()
	
	# Complete objectives
	# 1. Get package from shopkeeper
	quest_manager.update_quest_objective("delivery_mission", QuestObjective.ObjectiveType.TALK_TO_NPC, "shopkeeper")
	
	# 2. Deliver package to teacher
	quest_manager.update_quest_objective("delivery_mission", QuestObjective.ObjectiveType.DELIVER_ITEM, "teacher")
	
	# Quest should be completed
	assert_that(quest_manager.is_quest_completed("delivery_mission")).is_true()

func test_quest_save_load_integration():
	# Test quest state persistence
	
	# Start and partially complete quest
	quest_manager.start_quest("welcome")
	quest_manager.update_quest_objective("welcome", QuestObjective.ObjectiveType.GO_TO_LOCATION, "school")
	
	# Save progress
	quest_manager.save_quest_progress()
	
	# Create new quest manager and load
	var new_quest_manager = preload("res://scripts/managers/QuestManager.gd").new()
	add_child(new_quest_manager)
	new_quest_manager.load_quest_progress()
	
	# Verify progress was loaded correctly
	assert_that(new_quest_manager.is_quest_active("welcome")).is_true()
	var loaded_quest = new_quest_manager.get_quest("welcome")
	assert_that(loaded_quest.current_objective_index).is_equal(1)
	
	new_quest_manager.queue_free()

func test_multiple_active_quests_handling():
	# Test system with multiple quests (if supported)
	
	# Complete welcome to unlock shopping
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	
	# Start shopping quest
	quest_manager.start_quest("first_shopping")
	
	# Should have one active quest
	assert_that(quest_manager.active_quests.size()).is_equal(1)
	assert_that(quest_manager.get_current_active_quest().id).is_equal("first_shopping")

func test_quest_ui_integration():
	# Test quest system integration with UI updates
	
	var quest_ui_updated = false
	var quest_completed_notification = false
	
	# Mock UI signal connections
	quest_manager.quest_started.connect(func(quest): quest_ui_updated = true)
	quest_manager.quest_completed.connect(func(quest): quest_completed_notification = true)
	
	# Start and complete quest
	quest_manager.start_quest("welcome")
	assert_that(quest_ui_updated).is_true()
	
	quest_manager.complete_quest("welcome")
	assert_that(quest_completed_notification).is_true()

func test_npc_quest_indicator_updates():
	# Test that NPC quest indicators update correctly
	
	# Teacher should have quest available initially
	assert_that(teacher_npc.has_available_quests()).is_true()
	
	# Start and complete welcome quest
	quest_manager.start_quest("welcome")
	quest_manager.complete_quest("welcome")
	
	# Update quest indicators
	npc_manager.update_all_npc_quest_indicators()
	
	# Shopkeeper should now have quest available
	assert_that(shopkeeper_npc.has_available_quests()).is_true()

func test_error_handling_in_quest_flow():
	# Test error conditions don't break quest flow
	
	# Try to complete objective for non-active quest
	var invalid_update = quest_manager.update_quest_objective(
		"nonexistent_quest",
		QuestObjective.ObjectiveType.TALK_TO_NPC,
		"teacher"
	)
	assert_that(invalid_update).is_false()
	
	# Try to start quest that's already active
	quest_manager.start_quest("welcome")
	var duplicate_start = quest_manager.start_quest("welcome")
	assert_that(duplicate_start).is_false()
	
	# Try to complete quest that's not active
	var invalid_complete = quest_manager.complete_quest("first_shopping")
	assert_that(invalid_complete).is_false()
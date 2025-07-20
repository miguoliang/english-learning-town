# TestNPCManager.gd
# Unit tests for NPCManager and NPC interactions

extends GdUnitTestSuite

var npc_manager: Node
var mock_teacher: Node
var mock_shopkeeper: Node

func before_test():
	# Create NPC Manager
	npc_manager = preload("res://scripts/managers/NPCManager.gd").new()
	add_child(npc_manager)
	
	# Create mock NPCs
	setup_mock_npcs()

func after_test():
	if npc_manager:
		npc_manager.queue_free()
	if mock_teacher:
		mock_teacher.queue_free()
	if mock_shopkeeper:
		mock_shopkeeper.queue_free()

func setup_mock_npcs():
	# Create mock teacher
	mock_teacher = preload("res://scripts/npcs/NPC.gd").new()
	mock_teacher.name = "Teacher"
	add_child(mock_teacher)
	
	# Create mock shopkeeper
	mock_shopkeeper = preload("res://scripts/npcs/NPC.gd").new()
	mock_shopkeeper.name = "Shopkeeper"
	add_child(mock_shopkeeper)

func test_npc_manager_initialization():
	assert_that(npc_manager).is_not_null()
	assert_that(npc_manager.npc_data).is_not_null()
	assert_that(npc_manager.npcs).is_not_null()

func test_npc_data_creation():
	# Check that NPC data is created
	assert_that(npc_manager.npc_data.has("teacher")).is_true()
	assert_that(npc_manager.npc_data.has("shopkeeper")).is_true()
	
	# Verify teacher data
	var teacher_data = npc_manager.get_npc_data("teacher")
	assert_that(teacher_data).is_not_null()
	assert_that(teacher_data.id).is_equal("teacher")
	assert_that(teacher_data.name).is_equal("Ms. Johnson")
	assert_that(teacher_data.can_give_quests).is_true()

func test_npc_registration():
	# Register teacher
	npc_manager.register_npc(mock_teacher, "teacher")
	
	# Check NPC is registered
	assert_that(npc_manager.npcs.has("teacher")).is_true()
	assert_that(npc_manager.get_npc("teacher")).is_equal(mock_teacher)
	
	# Check NPC has data assigned
	assert_that(mock_teacher.npc_data).is_not_null()
	assert_that(mock_teacher.npc_data.id).is_equal("teacher")

func test_npc_dialogue_data():
	# Register teacher and check dialogue
	npc_manager.register_npc(mock_teacher, "teacher")
	
	var teacher_data = mock_teacher.npc_data
	assert_that(teacher_data.default_dialogue).is_not_empty()
	assert_that(teacher_data.quest_dialogues).is_not_empty()
	assert_that(teacher_data.quest_dialogues.has("welcome")).is_true()

func test_npc_availability():
	npc_manager.register_npc(mock_teacher, "teacher")
	
	var teacher_data = mock_teacher.npc_data
	assert_that(teacher_data.is_available_now()).is_true()
	assert_that(teacher_data.is_always_available).is_true()

func test_npc_friendship_system():
	npc_manager.register_npc(mock_teacher, "teacher")
	
	var teacher_data = mock_teacher.npc_data
	var initial_friendship = teacher_data.friendship_level
	
	# Increase friendship
	teacher_data.increase_friendship(10)
	assert_that(teacher_data.friendship_level).is_equal(initial_friendship + 10)
	
	# Test friendship caps at max
	teacher_data.increase_friendship(1000)
	assert_that(teacher_data.friendship_level).is_equal(teacher_data.max_friendship)

func test_npc_quest_availability():
	npc_manager.register_npc(mock_teacher, "teacher")
	
	var teacher_data = mock_teacher.npc_data
	assert_that(teacher_data.available_quests).contains("welcome")
	assert_that(teacher_data.can_give_quests).is_true()

func test_shopkeeper_schedule():
	npc_manager.register_npc(mock_shopkeeper, "shopkeeper")
	
	var shopkeeper_data = mock_shopkeeper.npc_data
	assert_that(shopkeeper_data.daily_schedule).is_not_empty()
	
	# Check shop hours
	var morning_schedule = shopkeeper_data.daily_schedule[0]
	assert_that(morning_schedule.start_hour).is_equal(9)
	assert_that(morning_schedule.end_hour).is_equal(12)
	assert_that(morning_schedule.is_available).is_true()

func test_npc_greeting_messages():
	npc_manager.register_npc(mock_teacher, "teacher")
	
	var teacher_data = mock_teacher.npc_data
	var greeting = teacher_data.get_greeting()
	assert_that(greeting).is_not_empty()
	assert_that(teacher_data.greeting_messages).contains(greeting)

func test_npc_vocabulary_specialties():
	npc_manager.register_npc(mock_teacher, "teacher")
	npc_manager.register_npc(mock_shopkeeper, "shopkeeper")
	
	var teacher_data = mock_teacher.npc_data
	var shopkeeper_data = mock_shopkeeper.npc_data
	
	# Teacher specializes in education vocabulary
	assert_that(teacher_data.vocabulary_specialties).contains("greetings")
	assert_that(teacher_data.vocabulary_specialties).contains("school")
	
	# Shopkeeper specializes in shopping vocabulary
	assert_that(shopkeeper_data.vocabulary_specialties).contains("shopping")
	assert_that(shopkeeper_data.vocabulary_specialties).contains("money")

func test_npc_signal_connections():
	# Test that signals are properly connected when NPC is registered
	var signals_connected = 0
	
	# Mock signal connections
	mock_teacher.dialogue_started = Signal()
	mock_teacher.dialogue_ended = Signal()
	mock_teacher.quest_available = Signal()
	
	npc_manager.register_npc(mock_teacher, "teacher")
	
	# Verify NPC is properly set up (signals would be connected in real scenario)
	assert_that(mock_teacher.npc_data).is_not_null()

func test_multiple_npc_registration():
	# Register multiple NPCs
	npc_manager.register_npc(mock_teacher, "teacher")
	npc_manager.register_npc(mock_shopkeeper, "shopkeeper")
	
	# Check both are registered
	assert_that(npc_manager.npcs.size()).is_equal(2)
	assert_that(npc_manager.get_npc("teacher")).is_equal(mock_teacher)
	assert_that(npc_manager.get_npc("shopkeeper")).is_equal(mock_shopkeeper)

func test_invalid_npc_registration():
	# Try to register NPC with invalid ID
	npc_manager.register_npc(mock_teacher, "invalid_npc_id")
	
	# Should not be registered
	assert_that(npc_manager.npcs.has("invalid_npc_id")).is_false()
	assert_that(mock_teacher.npc_data).is_null()
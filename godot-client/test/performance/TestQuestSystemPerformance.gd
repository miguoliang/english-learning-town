# TestQuestSystemPerformance.gd
# Performance tests for the quest system

extends GdUnitTestSuite

var quest_manager: Node
var npc_manager: Node
var performance_data: Dictionary = {}

func before_test():
	quest_manager = preload("res://scripts/managers/QuestManager.gd").new()
	quest_manager.debug_mode = false  # Reduce debug output for performance
	add_child(quest_manager)
	
	npc_manager = preload("res://scripts/managers/NPCManager.gd").new()
	add_child(npc_manager)

func after_test():
	if quest_manager:
		quest_manager.queue_free()
	if npc_manager:
		npc_manager.queue_free()
	
	# Log performance data
	print("Performance Test Results:")
	for test_name in performance_data.keys():
		print("  %s: %s" % [test_name, performance_data[test_name]])

func test_quest_manager_initialization_performance():
	# Test QuestManager initialization time
	var start_time = Time.get_usec_from_system()
	
	# Create multiple quest managers
	var managers = []
	for i in range(100):
		var manager = preload("res://scripts/managers/QuestManager.gd").new()
		managers.append(manager)
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["quest_manager_init_100x"] = "%d microseconds" % duration
	
	# Clean up
	for manager in managers:
		manager.queue_free()
	
	# Should initialize 100 managers in reasonable time (< 1 second)
	assert_that(duration).is_less(1000000)  # 1 second in microseconds

func test_large_number_of_quests_performance():
	# Test performance with many quests
	var start_time = Time.get_usec_from_system()
	
	# Create many quests
	for i in range(1000):
		var quest = QuestData.new("test_quest_%d" % i, "Test Quest %d" % i)
		quest.description = "This is test quest number %d" % i
		
		var objective = QuestObjective.new("Complete objective %d" % i)
		quest.objectives = [objective]
		
		quest_manager.add_quest(quest)
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["create_1000_quests"] = "%d microseconds" % duration
	
	# Should handle 1000 quests efficiently
	assert_that(quest_manager.all_quests.size()).is_greater_equal(1000)
	assert_that(duration).is_less(5000000)  # 5 seconds

func test_quest_objective_updates_performance():
	# Test performance of many quest objective updates
	
	# Create quest with many objectives
	var quest = QuestData.new("performance_quest", "Performance Test Quest")
	for i in range(100):
		var objective = QuestObjective.new("Objective %d" % i)
		objective.target_count = 10
		quest.objectives.append(objective)
	
	quest_manager.add_quest(quest)
	quest_manager.start_quest("performance_quest")
	
	var start_time = Time.get_usec_from_system()
	
	# Update objectives rapidly
	for i in range(1000):
		quest_manager.update_quest_objective(
			"performance_quest",
			QuestObjective.ObjectiveType.TALK_TO_NPC,
			"test_npc_%d" % (i % 10)
		)
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["1000_objective_updates"] = "%d microseconds" % duration
	
	# Should handle many updates quickly
	assert_that(duration).is_less(2000000)  # 2 seconds

func test_many_npcs_performance():
	# Test performance with many NPCs
	var start_time = Time.get_usec_from_system()
	
	var npcs = []
	for i in range(500):
		var npc = preload("res://scripts/npcs/NPC.gd").new()
		npc.name = "TestNPC_%d" % i
		
		# Create basic NPC data
		var npc_data = NPCData.new("test_npc_%d" % i, "Test NPC %d" % i)
		npc_data.default_dialogue = [DialogueEntry.new("Hello from NPC %d" % i, npc_data.name)]
		npc.npc_data = npc_data
		
		npcs.append(npc)
		add_child(npc)
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["create_500_npcs"] = "%d microseconds" % duration
	
	# Clean up
	for npc in npcs:
		npc.queue_free()
	
	# Should create many NPCs efficiently
	assert_that(duration).is_less(3000000)  # 3 seconds

func test_dialogue_system_performance():
	# Test dialogue system performance
	var start_time = Time.get_usec_from_system()
	
	# Create many dialogue entries
	var dialogues = []
	for i in range(1000):
		var dialogue = DialogueEntry.new("This is dialogue entry number %d with some vocabulary words to highlight" % i, "Speaker_%d" % i)
		dialogue.set_vocabulary_highlights(["vocabulary", "words", "highlight", "dialogue"])
		dialogue.set_teaches_vocabulary(["teach", "learn", "vocabulary", "word_%d" % i])
		
		# Test highlighting performance
		var highlighted = dialogue.get_highlighted_text()
		assert_that(highlighted).is_not_empty()
		
		dialogues.append(dialogue)
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["process_1000_dialogues"] = "%d microseconds" % duration
	
	# Should process many dialogues quickly
	assert_that(duration).is_less(2000000)  # 2 seconds

func test_quest_save_load_performance():
	# Test quest save/load performance
	
	# Create many quests and start some
	for i in range(100):
		var quest = QuestData.new("save_test_quest_%d" % i, "Save Test Quest %d" % i)
		var objective = QuestObjective.new("Test objective %d" % i)
		quest.objectives = [objective]
		quest_manager.add_quest(quest)
		
		# Start every 5th quest
		if i % 5 == 0:
			quest_manager.start_quest("save_test_quest_%d" % i)
	
	# Test save performance
	var start_time = Time.get_usec_from_system()
	quest_manager.save_quest_progress()
	var save_end_time = Time.get_usec_from_system()
	var save_duration = save_end_time - start_time
	
	# Test load performance
	var load_start_time = Time.get_usec_from_system()
	quest_manager.load_quest_progress()
	var load_end_time = Time.get_usec_from_system()
	var load_duration = load_end_time - load_start_time
	
	performance_data["save_100_quests"] = "%d microseconds" % save_duration
	performance_data["load_100_quests"] = "%d microseconds" % load_duration
	
	# Save/load should be reasonably fast
	assert_that(save_duration).is_less(1000000)  # 1 second
	assert_that(load_duration).is_less(1000000)  # 1 second

func test_memory_usage():
	# Test memory usage with many objects
	var initial_memory = OS.get_static_memory_usage(false)
	
	# Create many objects
	var objects = []
	for i in range(1000):
		var quest = QuestData.new("memory_test_%d" % i, "Memory Test %d" % i)
		var objective = QuestObjective.new("Memory objective %d" % i)
		quest.objectives = [objective]
		objects.append(quest)
	
	var peak_memory = OS.get_static_memory_usage(false)
	var memory_used = peak_memory - initial_memory
	
	# Clean up
	objects.clear()
	
	var final_memory = OS.get_static_memory_usage(false)
	
	performance_data["memory_1000_quests"] = "%d bytes" % memory_used
	performance_data["memory_initial"] = "%d bytes" % initial_memory
	performance_data["memory_peak"] = "%d bytes" % peak_memory
	performance_data["memory_final"] = "%d bytes" % final_memory
	
	# Memory usage should be reasonable
	assert_that(memory_used).is_less(50000000)  # 50MB for 1000 quests

func test_concurrent_quest_operations():
	# Test performance with concurrent quest operations
	var start_time = Time.get_usec_from_system()
	
	# Simulate concurrent operations
	var operations = 0
	for i in range(100):
		# Create quest
		var quest = QuestData.new("concurrent_quest_%d" % i, "Concurrent Quest %d" % i)
		var objective = QuestObjective.new("Concurrent objective %d" % i)
		quest.objectives = [objective]
		quest_manager.add_quest(quest)
		operations += 1
		
		# Start quest
		quest_manager.start_quest("concurrent_quest_%d" % i)
		operations += 1
		
		# Update objective
		quest_manager.update_quest_objective(
			"concurrent_quest_%d" % i,
			QuestObjective.ObjectiveType.TALK_TO_NPC,
			"npc_%d" % i
		)
		operations += 1
		
		# Complete quest
		quest_manager.complete_quest("concurrent_quest_%d" % i)
		operations += 1
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["concurrent_operations"] = "%d operations in %d microseconds" % [operations, duration]
	performance_data["ops_per_second"] = "%.2f ops/sec" % (float(operations) / (float(duration) / 1000000.0))
	
	# Should handle concurrent operations efficiently
	assert_that(duration).is_less(5000000)  # 5 seconds for 400 operations

func test_stress_test():
	# Comprehensive stress test
	print("Running stress test...")
	
	var start_time = Time.get_usec_from_system()
	var operations_count = 0
	
	# Create a realistic game scenario
	for session in range(10):  # 10 game sessions
		# Create quests for this session
		for i in range(50):
			var quest = QuestData.new("stress_quest_%d_%d" % [session, i], "Stress Quest %d.%d" % [session, i])
			for j in range(3):  # 3 objectives per quest
				var objective = QuestObjective.new("Objective %d.%d.%d" % [session, i, j])
				quest.objectives.append(objective)
			quest_manager.add_quest(quest)
			operations_count += 1
		
		# Simulate gameplay
		for i in range(25):  # Start 25 quests
			quest_manager.start_quest("stress_quest_%d_%d" % [session, i])
			operations_count += 1
			
			# Complete objectives
			for j in range(3):
				quest_manager.update_quest_objective(
					"stress_quest_%d_%d" % [session, i],
					QuestObjective.ObjectiveType.TALK_TO_NPC,
					"stress_npc_%d" % j
				)
				operations_count += 1
		
		# Save progress
		quest_manager.save_quest_progress()
		operations_count += 1
	
	var end_time = Time.get_usec_from_system()
	var duration = end_time - start_time
	
	performance_data["stress_test_operations"] = "%d operations" % operations_count
	performance_data["stress_test_duration"] = "%d microseconds" % duration
	performance_data["stress_ops_per_second"] = "%.2f ops/sec" % (float(operations_count) / (float(duration) / 1000000.0))
	
	print("Stress test completed: %d operations in %.2f seconds" % [operations_count, float(duration) / 1000000.0])
	
	# Should handle stress test without major performance degradation
	assert_that(duration).is_less(30000000)  # 30 seconds
	assert_that(operations_count).is_greater(1000)
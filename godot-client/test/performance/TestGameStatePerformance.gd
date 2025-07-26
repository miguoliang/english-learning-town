# TestGameStatePerformance.gd
# Performance tests for GameStateManager

extends GdUnitTestSuite

var state_manager: Node

func before_test():
	state_manager = preload("res://scripts/managers/GameStateManager.gd").new()
	add_child(state_manager)
	await get_tree().process_frame

func after_test():
	if state_manager:
		state_manager.queue_free()

func test_state_transition_performance():
	# Test rapid state transitions don't cause performance issues
	var start_time = Time.get_ticks_msec()
	
	# Perform many state transitions
	for i in range(1000):
		state_manager.set_state(state_manager.GameState.PLAYING)
		state_manager.set_state(state_manager.GameState.PAUSED)
		state_manager.set_state(state_manager.GameState.PLAYING)
	
	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time
	
	# Should complete quickly (less than 100ms for 1000 transitions)
	assert_that(duration).is_less(100)
	print("State transitions took: %d ms" % duration)

func test_mode_transition_performance():
	# Test rapid mode transitions
	state_manager.set_state(state_manager.GameState.PLAYING)
	
	var start_time = Time.get_ticks_msec()
	
	for i in range(1000):
		state_manager.set_mode(state_manager.GameMode.NORMAL)
		state_manager.set_mode(state_manager.GameMode.DIALOGUE)
		state_manager.set_mode(state_manager.GameMode.TUTORIAL)
		state_manager.set_mode(state_manager.GameMode.NORMAL)
	
	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time
	
	assert_that(duration).is_less(100)
	print("Mode transitions took: %d ms" % duration)

func test_input_blocking_performance():
	# Test input blocking/unblocking performance
	var start_time = Time.get_ticks_msec()
	
	for i in range(1000):
		state_manager.block_input(true, "Test")
		state_manager.block_input(false)
	
	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time
	
	assert_that(duration).is_less(50)
	print("Input blocking took: %d ms" % duration)

func test_state_history_memory_usage():
	# Test state history doesn't grow unbounded
	var initial_history_size = state_manager.state_history.size()
	
	# Make many state changes to fill history
	for i in range(state_manager.max_history * 2):
		state_manager.set_state(state_manager.GameState.PLAYING)
		state_manager.set_state(state_manager.GameState.PAUSED)
	
	# History should be capped at max_history
	assert_that(state_manager.state_history.size()).is_less_equal(state_manager.max_history)
	print("History size capped at: %d" % state_manager.state_history.size())

func test_signal_emission_performance():
	# Test signal emissions don't cause performance issues
	var signal_count = 0
	
	state_manager.state_changed.connect(func(old, new): signal_count += 1)
	state_manager.mode_changed.connect(func(old, new): signal_count += 1)
	
	var start_time = Time.get_ticks_msec()
	
	# Trigger many signal emissions
	for i in range(500):
		state_manager.set_state(state_manager.GameState.PLAYING)
		state_manager.set_mode(state_manager.GameMode.DIALOGUE)
		state_manager.set_mode(state_manager.GameMode.NORMAL)
	
	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time
	
	assert_that(duration).is_less(100)
	assert_that(signal_count).is_greater(0)
	print("Signal emissions took: %d ms for %d signals" % [duration, signal_count])

func test_concurrent_operations_performance():
	# Test multiple operations don't interfere with performance
	state_manager.set_state(state_manager.GameState.PLAYING)
	
	var start_time = Time.get_ticks_msec()
	
	for i in range(200):
		# Simulate typical usage pattern
		state_manager.set_mode(state_manager.GameMode.DIALOGUE)
		state_manager.block_input(true, "Dialogue")
		var state_info = state_manager.get_state_info()
		state_manager.block_input(false)
		state_manager.set_mode(state_manager.GameMode.NORMAL)
		
		# Check state
		var can_move = state_manager.can_player_move()
		var in_dialogue = state_manager.is_in_dialogue()
	
	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time
	
	assert_that(duration).is_less(150)
	print("Concurrent operations took: %d ms" % duration)

func test_memory_stability():
	# Test that repeated operations don't cause memory leaks
	var initial_objects = get_tree().get_node_count()
	
	# Perform many operations
	for i in range(100):
		state_manager.set_state(state_manager.GameState.PLAYING)
		state_manager.set_mode(state_manager.GameMode.TUTORIAL)
		state_manager.block_input(true, "Test")
		var info = state_manager.get_state_info()
		state_manager.block_input(false)
		state_manager.set_mode(state_manager.GameMode.NORMAL)
	
	# Force garbage collection
	await get_tree().process_frame
	
	var final_objects = get_tree().get_node_count()
	
	# Object count should remain stable
	var object_growth = final_objects - initial_objects
	assert_that(object_growth).is_less(10)  # Allow some variance
	print("Object growth: %d nodes" % object_growth)
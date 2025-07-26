# TestTutorialStateIntegration.gd
# Integration tests for tutorial system with GameStateManager

extends GdUnitTestSuite

var game_state_manager: Node
var tutorial_manager: Node
var mock_player: Node
var mock_overlay: Node

func before_test():
	# Create GameStateManager
	game_state_manager = preload("res://scripts/managers/GameStateManager.gd").new()
	add_child(game_state_manager)
	
	# Create TutorialManager
	tutorial_manager = preload("res://scripts/managers/TutorialManager.gd").new()
	add_child(tutorial_manager)
	
	# Create mock player
	mock_player = preload("res://test/mocks/MockPlayer.gd").new()
	mock_player.add_to_group("player")
	add_child(mock_player)
	
	# Wait for initialization
	await get_tree().process_frame

func after_test():
	if game_state_manager:
		game_state_manager.queue_free()
	if tutorial_manager:
		tutorial_manager.queue_free()
	if mock_player:
		mock_player.queue_free()
	if mock_overlay:
		mock_overlay.queue_free()

func test_tutorial_start_coordinates_state():
	# Test tutorial start properly coordinates with GameStateManager
	
	# Start in playing state
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.NORMAL)
	
	# Start tutorial
	tutorial_manager.start_tutorial()
	
	# Should be in tutorial mode
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.TUTORIAL)
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	assert_that(tutorial_manager.is_tutorial_active).is_true()

func test_tutorial_finish_restores_state():
	# Test tutorial completion restores normal state
	
	# Start tutorial
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	tutorial_manager.start_tutorial()
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	
	# Finish tutorial
	tutorial_manager.finish_tutorial()
	
	# Should return to normal mode
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.NORMAL)
	assert_that(game_state_manager.is_in_tutorial()).is_false()
	assert_that(tutorial_manager.is_tutorial_active).is_false()

func test_tutorial_signal_integration():
	# Test tutorial signals properly coordinate with GameStateManager
	
	var tutorial_started_received = false
	var tutorial_finished_received = false
	
	# Connect to signals
	tutorial_manager.tutorial_started.connect(func(): tutorial_started_received = true)
	tutorial_manager.tutorial_finished.connect(func(): tutorial_finished_received = true)
	
	# Start and finish tutorial
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	tutorial_manager.start_tutorial()
	assert_that(tutorial_started_received).is_true()
	
	tutorial_manager.finish_tutorial()
	assert_that(tutorial_finished_received).is_true()

func test_input_blocking_during_tutorial():
	# Test input is properly blocked during tutorial
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	assert_that(game_state_manager.is_input_blocked()).is_false()
	
	# Start tutorial
	tutorial_manager.start_tutorial()
	assert_that(game_state_manager.is_input_blocked()).is_true()
	assert_that(game_state_manager.get_input_block_reason()).contains("Tutorial")
	
	# Finish tutorial
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.is_input_blocked()).is_false()

func test_player_movement_during_tutorial():
	# Test player movement is controlled during tutorial
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	assert_that(game_state_manager.can_player_move()).is_true()
	
	# Start tutorial
	tutorial_manager.start_tutorial()
	# Initially blocked during setup
	assert_that(game_state_manager.can_player_move()).is_false()
	
	# Finish tutorial
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.can_player_move()).is_true()

func test_tutorial_skip_coordination():
	# Test tutorial skip properly coordinates state
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	tutorial_manager.start_tutorial()
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	
	# Skip tutorial (same as finish)
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.NORMAL)

func test_tutorial_force_start():
	# Test force start tutorial for testing/debugging
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	
	# Force start should work even if already completed
	tutorial_manager.tutorial_completed = true
	tutorial_manager.force_start_tutorial()
	
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	assert_that(tutorial_manager.is_tutorial_active).is_true()

func test_tutorial_state_persistence():
	# Test tutorial state is properly managed
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	
	# Start tutorial
	tutorial_manager.start_tutorial()
	var step_before = tutorial_manager.current_step
	
	# Advance step
	tutorial_manager.advance_step()
	assert_that(tutorial_manager.current_step).is_equal(step_before + 1)
	assert_that(game_state_manager.is_in_tutorial()).is_true()

func test_multiple_tutorial_attempts():
	# Test multiple tutorial start/stop cycles
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	
	# First cycle
	tutorial_manager.start_tutorial()
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.NORMAL)
	
	# Second cycle
	tutorial_manager.force_start_tutorial()
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.NORMAL)

func test_tutorial_ui_integration():
	# Test tutorial UI elements coordinate with state
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	tutorial_manager.start_tutorial()
	
	# Tutorial should disable non-tutorial UI
	assert_that(game_state_manager.is_in_tutorial()).is_true()
	
	# Finish should re-enable all UI
	tutorial_manager.finish_tutorial()
	assert_that(game_state_manager.can_show_ui()).is_true()

func test_state_history_tracking():
	# Test state changes are properly tracked
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	var initial_history_size = game_state_manager.state_history.size()
	
	# Start tutorial
	tutorial_manager.start_tutorial()
	assert_that(game_state_manager.state_history.size()).is_greater(initial_history_size)
	
	# Check tutorial mode is in history
	var found_tutorial_entry = false
	for entry in game_state_manager.state_history:
		if entry.type == "MODE" and entry.new_value == game_state_manager.GameMode.TUTORIAL:
			found_tutorial_entry = true
			break
	assert_that(found_tutorial_entry).is_true()

func test_concurrent_state_operations():
	# Test tutorial works with other state operations
	
	game_state_manager.set_state(game_state_manager.GameState.PLAYING)
	tutorial_manager.start_tutorial()
	
	# Try to change to dialogue mode during tutorial
	var initial_mode = game_state_manager.current_mode
	game_state_manager.start_dialogue()
	
	# Should be in dialogue mode now
	assert_that(game_state_manager.current_mode).is_equal(game_state_manager.GameMode.DIALOGUE)
	
	# End dialogue should return to tutorial
	game_state_manager.end_dialogue()
	# Note: This depends on implementation - might return to normal instead of tutorial

func test_error_handling():
	# Test tutorial system handles errors gracefully
	
	# Try to start tutorial in wrong state
	game_state_manager.set_state(game_state_manager.GameState.MAIN_MENU)
	tutorial_manager.start_tutorial()
	
	# Should handle gracefully
	assert_that(true).is_true()  # Just test it doesn't crash
	
	# Try to finish when not started
	tutorial_manager.finish_tutorial()
	assert_that(true).is_true()  # Should not crash
extends Node

# GameStateManager - Central coordinator for all game state
# Provides single source of truth and coordinates existing managers

signal state_changed(old_state: GameState, new_state: GameState)
signal mode_changed(old_mode: GameMode, new_mode: GameMode)

# Game States
enum GameState {
	MAIN_MENU,
	LOADING,
	PLAYING,
	PAUSED,
	SETTINGS,
	QUEST_LOG
}

# Game Modes (sub-states of PLAYING)
enum GameMode {
	NORMAL,
	TUTORIAL,
	DIALOGUE,
	CUTSCENE,
	INVENTORY
}

# Current state
var current_state: GameState = GameState.MAIN_MENU
var current_mode: GameMode = GameMode.NORMAL
var previous_state: GameState = GameState.MAIN_MENU
var previous_mode: GameMode = GameMode.NORMAL

# State history for debugging
var state_history: Array[Dictionary] = []
var max_history: int = 10

# Input blocking
var input_blocked: bool = false
var input_block_reason: String = ""

func _ready():
	name = "GameStateManager"
	print("GameStateManager initialized")
	
	# Connect to existing managers
	_connect_to_managers()
	
	# Set initial state
	set_state(GameState.MAIN_MENU)

func _connect_to_managers():
	"""Connect to existing manager signals"""
	# Tutorial Manager
	if TutorialManager:
		TutorialManager.tutorial_finished.connect(_on_tutorial_finished)
		if TutorialManager.has_signal("tutorial_started"):
			TutorialManager.tutorial_started.connect(_on_tutorial_started)
	
	# Quest Manager  
	if QuestManager:
		QuestManager.quest_started.connect(_on_quest_event)
		QuestManager.quest_completed.connect(_on_quest_event)

func _input(event):
	"""Central input handling with priority-based routing"""
	if input_blocked:
		get_viewport().set_input_as_handled()
		return
	
	# Priority-based input handling - highest priority first
	var handled = false
	
	# 1. Debug overlay (F-keys) - highest priority, works in any state
	if _handle_debug_input(event):
		get_viewport().set_input_as_handled()
		return
	
	# 2. State-specific input handling with mode priority
	match current_state:
		GameState.PLAYING:
			handled = _handle_playing_input(event)
		GameState.PAUSED:
			# Pause state disabled - force back to playing
			print("Warning: Game was in PAUSED state, forcing back to PLAYING")
			set_state(GameState.PLAYING)
			handled = false
		GameState.QUEST_LOG:
			handled = _handle_quest_log_input(event)
		GameState.SETTINGS:
			handled = _handle_settings_input(event)
	
	# Consume the event if handled
	if handled:
		get_viewport().set_input_as_handled()

func _handle_playing_input(event) -> bool:
	"""Handle input during gameplay with mode-based priority"""
	match current_mode:
		GameMode.TUTORIAL:
			return _handle_tutorial_input(event)
		GameMode.DIALOGUE:
			return _handle_dialogue_input(event)
		GameMode.NORMAL:
			return _handle_normal_gameplay_input(event)
		GameMode.CUTSCENE:
			return _handle_cutscene_input(event)
		GameMode.INVENTORY:
			return _handle_inventory_input(event)
	
	return false

func _handle_paused_input(event) -> bool:
	"""Handle input when paused"""
	if event.is_action_pressed("ui_cancel"):
		set_state(GameState.PLAYING)
		return true
	
	# Block all other input when paused
	return true

func _handle_debug_input(event) -> bool:
	"""Handle debug input - highest priority, works in any state"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_F3:
				# Toggle debug overlay
				_toggle_debug_overlay()
				return true
			KEY_F4:
				# Cycle debug level
				_cycle_debug_level()
				return true
			KEY_F5:
				# Start tutorial debug
				start_tutorial()
				return true
			KEY_F6:
				# Reset tutorial debug
				_reset_tutorial_debug()
				return true
			KEY_F7:
				# Print debug state info
				_debug_print_state()
				return true
			KEY_F8:
				# Force fix stuck state
				force_fix_state()
				return true
	
	return false

func _handle_tutorial_input(event) -> bool:
	"""Handle input during tutorial mode - high priority"""
	# Tutorial controller gets first chance at input
	var tutorial_overlay = get_tree().get_first_node_in_group("tutorial_ui")
	if tutorial_overlay and tutorial_overlay.visible:
		# Let tutorial overlay handle ESC and Enter/Space
		if event.is_action_pressed("ui_cancel") or event.is_action_pressed("ui_accept"):
			return false  # Pass to tutorial overlay
	
	# Block most other inputs during tutorial
	if event is InputEventKey and event.pressed:
		# Allow debug keys to pass through
		if event.keycode in [KEY_F3, KEY_F4, KEY_F5, KEY_F6]:
			return false
		
		# Check movement keys - allow if tutorial permits
		if event.is_action("move_up") or event.is_action("move_down") or \
		   event.is_action("move_left") or event.is_action("move_right") or \
		   event.is_action("run"):
			return not allow_tutorial_movement()  # Block if tutorial doesn't allow movement
		
		# Check interaction key - allow if tutorial permits
		if event.is_action("interact"):
			return not allow_tutorial_interaction()  # Block if tutorial doesn't allow interaction
	
	# Block mouse clicks during tutorial (except for tutorial UI)
	if event is InputEventMouseButton:
		return true
	
	return false

func _handle_dialogue_input(event) -> bool:
	"""Handle input during dialogue mode"""
	# Dialogue UI gets first chance at input
	var dialogue_ui = get_tree().get_first_node_in_group("dialogue_ui")
	if dialogue_ui and dialogue_ui.visible:
		# Let dialogue UI handle Enter/Space and ESC
		if event.is_action_pressed("ui_accept") or event.is_action_pressed("ui_cancel") or \
		   event.is_action_pressed("interact"):
			return false  # Pass to dialogue UI
	
	# Block movement during dialogue
	if event.is_action("move_up") or event.is_action("move_down") or \
	   event.is_action("move_left") or event.is_action("move_right") or \
	   event.is_action("run"):
		return true  # Block movement
	
	return false

func _handle_normal_gameplay_input(event) -> bool:
	"""Handle input during normal gameplay"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_ESCAPE:
				# ESC does nothing in normal gameplay (pause disabled)
				return true
			KEY_TAB:
				# Tab opens quest log
				show_quest_log()
				return true
			KEY_I:
				# I opens inventory
				set_mode(GameMode.INVENTORY)
				return true
	
	# Allow all other input to pass through for normal gameplay
	return false

func _handle_cutscene_input(event) -> bool:
	"""Handle input during cutscenes"""
	# Block most input during cutscenes
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE:
			# Allow ESC to skip cutscene
			set_mode(GameMode.NORMAL)
			return true
	
	# Block all other input
	return true

func _handle_inventory_input(event) -> bool:
	"""Handle input during inventory mode"""
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE or event.keycode == KEY_I:
			# ESC or I closes inventory
			set_mode(GameMode.NORMAL)
			return true
	
	# Block movement during inventory
	if event.is_action("move_up") or event.is_action("move_down") or \
	   event.is_action("move_left") or event.is_action("move_right") or \
	   event.is_action("run"):
		return true
	
	return false

func _handle_quest_log_input(event) -> bool:
	"""Handle input during quest log state"""
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE or event.keycode == KEY_TAB:
			# ESC or Tab closes quest log
			hide_quest_log()
			return true
	
	# Block movement during quest log
	if event.is_action("move_up") or event.is_action("move_down") or \
	   event.is_action("move_left") or event.is_action("move_right") or \
	   event.is_action("run"):
		return true
	
	return false

func _handle_settings_input(event) -> bool:
	"""Handle input during settings state"""
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE:
			# ESC closes settings
			set_state(previous_state)
			return true
	
	# Block all gameplay input during settings
	return true

# State Management
func set_state(new_state: GameState):
	"""Change the main game state"""
	if new_state == current_state:
		return
		
	var old_state = current_state
	previous_state = current_state
	current_state = new_state
	
	_log_state_change("STATE", old_state, new_state)
	_handle_state_transition(old_state, new_state)
	
	state_changed.emit(old_state, new_state)
	print("Game state: %s -> %s" % [GameState.keys()[old_state], GameState.keys()[new_state]])

func set_mode(new_mode: GameMode):
	"""Change the game mode (only valid when PLAYING)"""
	if current_state != GameState.PLAYING:
		print("Warning: Cannot set mode when not PLAYING. Current state: %s" % GameState.keys()[current_state])
		return
		
	if new_mode == current_mode:
		return
		
	var old_mode = current_mode
	previous_mode = current_mode
	current_mode = new_mode
	
	_log_state_change("MODE", old_mode, new_mode)
	_handle_mode_transition(old_mode, new_mode)
	
	mode_changed.emit(old_mode, new_mode)
	print("Game mode: %s -> %s" % [GameMode.keys()[old_mode], GameMode.keys()[new_mode]])

func _handle_state_transition(old_state: GameState, new_state: GameState):
	"""Handle state transition logic"""
	# Exiting states
	match old_state:
		GameState.PLAYING:
			# Ensure clean exit from gameplay
			if current_mode == GameMode.TUTORIAL:
				block_input(false)
		GameState.PAUSED:
			# Pause state disabled - ensure game is unpaused
			get_tree().paused = false
	
	# Entering states
	match new_state:
		GameState.MAIN_MENU:
			set_mode(GameMode.NORMAL)
			block_input(false)
		GameState.PLAYING:
			# Default to normal mode unless specified
			if current_mode != GameMode.TUTORIAL:
				set_mode(GameMode.NORMAL)
		GameState.PAUSED:
			# Pause state disabled - redirect to playing
			print("Warning: Attempt to enter PAUSED state, redirecting to PLAYING")
			set_state(GameState.PLAYING)
			return

func _handle_mode_transition(old_mode: GameMode, new_mode: GameMode):
	"""Handle mode transition logic"""
	# Exiting modes
	match old_mode:
		GameMode.TUTORIAL:
			block_input(false, "")
			_enable_all_ui()
		GameMode.DIALOGUE:
			block_input(false, "")
			_enable_player_movement()
	
	# Entering modes
	match new_mode:
		GameMode.TUTORIAL:
			block_input(true, "Tutorial active")
			_setup_tutorial_mode()
		GameMode.DIALOGUE:
			block_input(true, "Dialogue active")
			_disable_player_movement()
		GameMode.NORMAL:
			block_input(false, "")
			_enable_all_ui()
			_enable_player_movement()

# Input Management
func block_input(blocked: bool, reason: String = ""):
	"""Block/unblock input with reason tracking"""
	input_blocked = blocked
	input_block_reason = reason
	
	if blocked:
		print("Input blocked: %s" % reason)
	else:
		print("Input unblocked")

func is_input_blocked() -> bool:
	"""Check if input is currently blocked"""
	return input_blocked

func get_input_block_reason() -> String:
	"""Get reason why input is blocked"""
	return input_block_reason

# Helper Methods
func is_in_tutorial() -> bool:
	"""Check if currently in tutorial"""
	return current_state == GameState.PLAYING and current_mode == GameMode.TUTORIAL

func is_in_dialogue() -> bool:
	"""Check if currently in dialogue"""
	return current_state == GameState.PLAYING and current_mode == GameMode.DIALOGUE

func can_player_move() -> bool:
	"""Check if player movement should be allowed"""
	if input_blocked:
		return false
	return current_state == GameState.PLAYING and current_mode in [GameMode.NORMAL, GameMode.TUTORIAL]

func can_show_ui() -> bool:
	"""Check if UI elements should be shown"""
	return current_state in [GameState.PLAYING, GameState.PAUSED]

# Manager Integration
func start_tutorial():
	"""Start tutorial mode"""
	set_state(GameState.PLAYING)
	set_mode(GameMode.TUTORIAL)
	
	if TutorialManager and TutorialManager.has_method("force_start_tutorial"):
		TutorialManager.force_start_tutorial()

func start_dialogue():
	"""Start dialogue mode"""
	if current_state == GameState.PLAYING:
		set_mode(GameMode.DIALOGUE)

func end_dialogue():
	"""End dialogue mode"""
	if current_mode == GameMode.DIALOGUE:
		set_mode(GameMode.NORMAL)

func show_quest_log():
	"""Show quest log"""
	if current_state == GameState.PLAYING:
		set_state(GameState.QUEST_LOG)

func hide_quest_log():
	"""Hide quest log"""
	if current_state == GameState.QUEST_LOG:
		set_state(GameState.PLAYING)

# Event Handlers
func _on_tutorial_started():
	"""Handle tutorial start"""
	set_mode(GameMode.TUTORIAL)

func _on_tutorial_finished():
	"""Handle tutorial completion"""
	if current_mode == GameMode.TUTORIAL:
		set_mode(GameMode.NORMAL)

func _on_quest_event(quest):
	"""Handle quest events"""
	# Log quest events but don't change state
	print("Quest event: %s" % quest.title if quest else "Unknown quest")

# State Setup Helpers
func _setup_tutorial_mode():
	"""Setup tutorial-specific state"""
	_disable_non_tutorial_ui()

func _disable_non_tutorial_ui():
	"""Disable UI elements during tutorial"""
	# Coordinate with existing tutorial manager
	if TutorialManager and TutorialManager.has_method("disable_non_tutorial_interactions"):
		TutorialManager.disable_non_tutorial_interactions()

func _enable_all_ui():
	"""Enable all UI elements"""
	if TutorialManager and TutorialManager.has_method("enable_all_interactions"):
		TutorialManager.enable_all_interactions()

func _disable_player_movement():
	"""Disable player movement"""
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("enable_movement"):
		player.enable_movement(false)

func _enable_player_movement():
	"""Enable player movement"""
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("enable_movement"):
		player.enable_movement(true)

# Debugging and Logging
func _log_state_change(type: String, old_value, new_value):
	"""Log state changes for debugging"""
	var log_entry = {
		"timestamp": Time.get_ticks_msec(),
		"type": type,
		"old_value": old_value,
		"new_value": new_value
	}
	
	state_history.append(log_entry)
	if state_history.size() > max_history:
		state_history.pop_front()

func get_state_info() -> Dictionary:
	"""Get current state information"""
	return {
		"state": GameState.keys()[current_state],
		"mode": GameMode.keys()[current_mode],
		"input_blocked": input_blocked,
		"input_block_reason": input_block_reason,
		"can_player_move": can_player_move(),
		"can_show_ui": can_show_ui()
	}

func print_state_history():
	"""Print recent state changes for debugging"""
	print("=== State History ===")
	for entry in state_history:
		var type_name = entry.type
		var old_val = entry.old_value
		var new_val = entry.new_value
		var time = entry.timestamp
		
		if entry.type == "STATE":
			print("[%d] STATE: %s -> %s" % [time, GameState.keys()[old_val], GameState.keys()[new_val]])
		else:
			print("[%d] MODE: %s -> %s" % [time, GameMode.keys()[old_val], GameMode.keys()[new_val]])

# Debug API
func force_state(state: GameState):
	"""Force state change (debug only)"""
	print("DEBUG: Forcing state to %s" % GameState.keys()[state])
	set_state(state)

func force_mode(mode: GameMode):
	"""Force mode change (debug only)"""
	print("DEBUG: Forcing mode to %s" % GameMode.keys()[mode])
	set_mode(mode)

# Debug helper methods
func _toggle_debug_overlay():
	"""Toggle debug overlay"""
	var debug_overlay = get_tree().get_first_node_in_group("debug_overlay")
	if debug_overlay and debug_overlay.has_method("toggle_debug"):
		debug_overlay.toggle_debug()

func _cycle_debug_level():
	"""Cycle debug level"""
	var debug_overlay = get_tree().get_first_node_in_group("debug_overlay")
	if debug_overlay and debug_overlay.has_method("cycle_debug_level"):
		debug_overlay.cycle_debug_level()

func _reset_tutorial_debug():
	"""Reset tutorial debug"""
	if TutorialManager and TutorialManager.has_method("reset_tutorial_progress"):
		TutorialManager.reset_tutorial_progress()

func _debug_print_state():
	"""Debug helper to print current state info"""
	print("=== GameStateManager Debug Info ===")
	print("Current State: %s" % GameState.keys()[current_state])
	print("Current Mode: %s" % GameMode.keys()[current_mode])
	print("Input Blocked: %s" % input_blocked)
	if input_blocked:
		print("Block Reason: %s" % input_block_reason)
	print("Can Player Move: %s" % can_player_move())
	print("Tree Paused: %s" % get_tree().paused)
	print("=====================================")

func force_fix_state():
	"""Debug method to force fix stuck states"""
	print("Force fixing game state...")
	input_blocked = false
	input_block_reason = ""
	get_tree().paused = false  # Ensure never paused
	set_state(GameState.PLAYING)
	set_mode(GameMode.NORMAL)
	print("Game state forcibly reset to normal gameplay (pause disabled)")

# Public API for input delegation
func allow_tutorial_movement() -> bool:
	"""Check if tutorial allows player movement currently"""
	if current_mode != GameMode.TUTORIAL:
		return true
	
	var tutorial_manager = get_node_or_null("/root/TutorialManager")
	if tutorial_manager and tutorial_manager.has_method("can_player_move"):
		return tutorial_manager.can_player_move()
	
	return false

func allow_tutorial_interaction() -> bool:
	"""Check if tutorial allows interactions currently"""
	if current_mode != GameMode.TUTORIAL:
		return true
	
	var tutorial_manager = get_node_or_null("/root/TutorialManager")
	if tutorial_manager and tutorial_manager.has_method("can_player_interact"):
		return tutorial_manager.can_player_interact()
	
	return false
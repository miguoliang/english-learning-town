extends Node

# Preload required classes
const TutorialStep = preload("res://scripts/tutorial/TutorialStep.gd")
const TutorialUIController = preload("res://scripts/tutorial/TutorialUIController.gd")
const TutorialHighlighter = preload("res://scripts/tutorial/TutorialHighlighter.gd")
const TutorialPersistence = preload("res://scripts/tutorial/TutorialPersistence.gd")

# TutorialManager - Central coordinator for tutorial system
# Orchestrates tutorial steps and manages overall tutorial flow

signal tutorial_step_completed(step_name: String)
signal tutorial_started()
signal tutorial_finished()

# Tutorial state
var is_tutorial_active: bool = false
var current_step: int = 0
var tutorial_steps: Array[TutorialStep] = []
var tutorial_completed: bool = false

# Component references
var ui_controller: TutorialUIController
var highlighter: TutorialHighlighter

func _ready():
	print("TutorialManager initialized")
	
	# Initialize components
	var ui_controller_script = load("res://scripts/tutorial/TutorialUIController.gd")
	ui_controller = ui_controller_script.new()
	var highlighter_script = load("res://scripts/tutorial/TutorialHighlighter.gd")  
	highlighter = highlighter_script.new()
	add_child(ui_controller)
	add_child(highlighter)
	
	setup_tutorial_steps()
	
	# Check if tutorial should start
	if should_start_tutorial():
		call_deferred("start_tutorial")

func should_start_tutorial() -> bool:
	"""Check if this is a new player who needs the tutorial"""
	# Check if tutorial was already completed
	if TutorialPersistence.has_tutorial_save_data():
		return false
	
	# Check if this is a first-time player
	if not GameManager.is_player_logged_in:
		return true
		
	# Check player progress - if they're level 1 with no experience, show tutorial
	var player = GameManager.current_player
	return player and player.level == 1 and player.experience == 0

func setup_tutorial_steps():
	"""Define all tutorial steps"""
	tutorial_steps.clear()
	
	# Step 1: Welcome
	tutorial_steps.append(TutorialStep.new(
		"welcome",
		"Welcome to English Learning Town!",
		"You're about to begin an exciting journey learning English through adventure and conversation. Let's start with the basics!",
		"",
		"click_continue",
		false,
		0.0
	))
	
	# Step 2: Movement Controls
	tutorial_steps.append(TutorialStep.new(
		"movement",
		"Movement Controls",
		"Use WASD keys or Arrow keys to move around. Hold down a direction key to move continuously. Try moving around now!",
		"player",
		"move_player",
		false,
		0.0
	))
	
	# Step 3: Running
	tutorial_steps.append(TutorialStep.new(
		"running",
		"Running",
		"Hold SHIFT while moving to run faster. This helps you explore the town more quickly!",
		"player",
		"run_player",
		false,
		0.0
	))
	
	# Step 4: NPC Interaction
	tutorial_steps.append(TutorialStep.new(
		"npc_approach",
		"Meeting NPCs",
		"See that person nearby? Those are NPCs (Non-Player Characters). Walk close to the teacher to learn how to interact!",
		"teacher",
		"approach_npc",
		false,
		0.0
	))
	
	# Step 5: Interaction Key
	tutorial_steps.append(TutorialStep.new(
		"interaction",
		"Starting Conversations",
		"Press E or SPACE when near an NPC to start a conversation. Try talking to the teacher now!",
		"teacher",
		"interact_with_npc",
		false,
		0.0
	))
	
	# Step 6: Dialogue System
	tutorial_steps.append(TutorialStep.new(
		"dialogue",
		"Conversation System",
		"During conversations, you can press SPACE or ENTER to continue, or use ESC to close the dialogue. The highlighted words help you learn new vocabulary!",
		"dialogue_ui",
		"complete_dialogue",
		false,
		0.0
	))
	
	# Step 7: Quests
	tutorial_steps.append(TutorialStep.new(
		"quests",
		"Learning Quests",
		"Look at the quest panel on the right! Quests give you goals and help you practice English. Complete quests to earn experience and level up!",
		"quest_panel",
		"view_quest",
		true,
		4.0
	))
	
	# Step 8: Tutorial Complete
	tutorial_steps.append(TutorialStep.new(
		"complete",
		"Tutorial Complete!",
		"Great job! You now know the basics. Explore the town, talk to NPCs, and complete quests to improve your English. Have fun learning!",
		"",
		"finish_tutorial",
		true,
		3.0
	))

func start_tutorial():
	"""Begin the tutorial sequence"""
	if tutorial_completed:
		return
		
	print("Starting tutorial for new player")
	is_tutorial_active = true
	current_step = 0
	
	# Notify GameStateManager
	if GameStateManager:
		GameStateManager.set_mode(GameStateManager.GameMode.TUTORIAL)
	
	# Emit tutorial started signal
	tutorial_started.emit()
	
	# Create tutorial overlay
	var overlay = ui_controller.create_tutorial_overlay()
	if overlay and overlay.has_signal("continue_pressed"):
		overlay.continue_pressed.connect(_on_tutorial_continue)
	if overlay and overlay.has_signal("skip_tutorial"):
		overlay.skip_tutorial.connect(_on_skip_tutorial)
	
	# Disable some game elements during tutorial
	ui_controller.disable_non_tutorial_interactions()
	
	# Show first step
	show_current_step()


func show_current_step():
	"""Display the current tutorial step"""
	if current_step >= tutorial_steps.size():
		finish_tutorial()
		return
	
	var step = tutorial_steps[current_step]
	print("Tutorial Step %d: %s" % [current_step + 1, step.title])
	
	# Update tutorial overlay
	if ui_controller.tutorial_overlay:
		if ui_controller.tutorial_overlay.has_method("show_step"):
			ui_controller.tutorial_overlay.show_step(step)
		else:
			# Fallback for simple overlay
			# TODO: Fix ui_controller.show_step_simple(step) method call
			pass
	
	# Show contextual hints based on step
	show_step_hints(step)
	
	# Reveal UI elements progressively
	# TODO: Fix ui_controller.reveal_ui_for_step(step) method call
	
	# Handle highlighting and auto-advance
	if step.target_element != "":
		highlighter.highlight_element(step.target_element)
	
	if step.auto_advance:
		var timer = Timer.new()
		timer.wait_time = step.delay
		timer.one_shot = true
		timer.timeout.connect(_on_auto_advance_timer)
		add_child(timer)
		timer.start()

func show_step_hints(step: TutorialStep):
	"""Show helpful hints for the current tutorial step"""
	if not has_node("/root/HintManager"):
		return
	
	var hint_manager = get_node("/root/HintManager")
	
	match step.id:
		"movement":
			hint_manager.show_hint("movement_basic", Vector2(100, 200))
		"running":
			hint_manager.show_hint("movement_running", Vector2(100, 200))
		"npc_approach":
			hint_manager.show_contextual_hint(
				"NPCs are the characters you can talk to in the town. They can teach you new words and give you quests!",
				Vector2(400, 150),
				"About NPCs",
				6.0
			)
		"interaction":
			hint_manager.show_hint("interaction_npc", Vector2(400, 200))
		"dialogue":
			hint_manager.show_hint("dialogue_continue", Vector2(300, 400))
		"quests":
			hint_manager.show_hint("quest_log", Vector2(get_tree().current_scene.get_viewport().get_visible_rect().size.x - 350, 150))



func advance_step():
	"""Move to the next tutorial step"""
	if not is_tutorial_active:
		return
		
	var step = tutorial_steps[current_step]
	tutorial_step_completed.emit(step.id)
	
	current_step += 1
	show_current_step()

func _on_tutorial_continue():
	"""Handle continue button press"""
	advance_step()

func _on_auto_advance_timer():
	"""Handle automatic step advancement"""
	advance_step()

func _on_skip_tutorial():
	"""Handle tutorial skip request"""
	print("Tutorial skipped by user")
	finish_tutorial()

func finish_tutorial():
	"""Complete the tutorial sequence"""
	print("Tutorial completed!")
	is_tutorial_active = false
	tutorial_completed = true
	
	# Notify GameStateManager
	if GameStateManager:
		GameStateManager.set_mode(GameStateManager.GameMode.NORMAL)
	
	# Clean up tutorial overlay
	ui_controller.cleanup_overlay()
	
	# Re-enable game interactions
	ui_controller.enable_all_interactions()
	
	# Save progress
	TutorialPersistence.save_tutorial_progress()
	
	# Emit completion signal
	tutorial_finished.emit()
	
	# Show completion celebration
	show_tutorial_completion()

func show_tutorial_completion():
	"""Show a completion message"""
	if AudioManager:
		AudioManager.play_sfx("dialogue_open", 1.2)
	
	# You could show a congratulations popup here
	print("🎉 Tutorial completed! Welcome to English Learning Town!")


# Public API for other systems to check tutorial state
func is_tutorial_running() -> bool:
	return is_tutorial_active

func get_current_step_id() -> String:
	if current_step < tutorial_steps.size():
		return tutorial_steps[current_step].id
	return ""

# Event handlers for tutorial progression
func _on_player_moved():
	"""Called when player moves during movement tutorial"""
	if is_tutorial_active and get_current_step_id() == "movement":
		advance_step()

func _on_player_ran():
	"""Called when player runs during running tutorial"""
	if is_tutorial_active and get_current_step_id() == "running":
		advance_step()

func _on_player_approached_npc():
	"""Called when player approaches NPC during tutorial"""
	if is_tutorial_active and get_current_step_id() == "npc_approach":
		advance_step()

func _on_player_interacted_with_npc():
	"""Called when player interacts with NPC during tutorial"""
	if is_tutorial_active and get_current_step_id() == "interaction":
		advance_step()

func _on_dialogue_completed():
	"""Called when player completes a dialogue during tutorial"""
	if is_tutorial_active and get_current_step_id() == "dialogue":
		advance_step()

# Debug/Testing methods
func force_start_tutorial():
	"""Force start the tutorial (for testing)"""
	print("Force starting tutorial...")
	
	# Clean up any existing tutorial first
	if ui_controller and ui_controller.tutorial_overlay:
		ui_controller.cleanup_overlay()
	
	# Reset tutorial state
	is_tutorial_active = false
	tutorial_completed = false
	current_step = 0
	
	# Start tutorial immediately
	start_tutorial()

func reset_tutorial_progress():
	"""Reset tutorial progress (for testing)"""
	TutorialPersistence.reset_tutorial_progress()
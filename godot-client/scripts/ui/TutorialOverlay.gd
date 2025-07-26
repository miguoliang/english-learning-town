extends Control
class_name TutorialOverlay

# TutorialOverlay - UI component for displaying tutorial steps
# Now integrates with GameStateManager for proper input handling

signal continue_pressed()
signal skip_tutorial()

# UI node references
@onready var tutorial_panel: Panel = $TutorialPanel
@onready var step_counter: Label = $TutorialPanel/VBoxContainer/StepCounter
@onready var title_label: Label = $TutorialPanel/VBoxContainer/TitleLabel
@onready var description_label: RichTextLabel = $TutorialPanel/VBoxContainer/DescriptionLabel
@onready var continue_button: Button = $TutorialPanel/VBoxContainer/ButtonContainer/ContinueButton
@onready var skip_button: Button = $TutorialPanel/VBoxContainer/ButtonContainer/SkipButton

# Current tutorial step
var current_step_data: TutorialManager.TutorialStep
var step_number: int = 0
var total_steps: int = 8

# ESC handling - direct termination

# Skip state tracking
var is_being_skipped: bool = false
var is_tutorial_finished: bool = false

func _ready():
	# Add to tutorial_ui group for GameStateManager integration
	add_to_group("tutorial_ui")
	
	# Start with panel hidden and animate in
	tutorial_panel.modulate.a = 0.0
	var original_y = tutorial_panel.position.y
	tutorial_panel.position.y = get_viewport().get_visible_rect().size.y  # Start off-screen at bottom
	
	# Animate panel entrance
	var tween = create_tween()
	tween.parallel().tween_property(tutorial_panel, "modulate:a", 1.0, 0.3)
	tween.parallel().tween_property(tutorial_panel, "position:y", original_y, 0.3)
	tween.tween_callback(_on_panel_shown)

func _on_panel_shown():
	"""Called when panel animation completes"""
	# Play tutorial start sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("dialogue_open", 0.8)

func show_step(step_data: TutorialManager.TutorialStep):
	"""Display a tutorial step"""
	current_step_data = step_data
	step_number += 1
	
	# Update UI elements
	step_counter.text = "Step %d of %d" % [step_number, total_steps]
	title_label.text = step_data.title
	description_label.text = format_description(step_data.description)
	
	# Handle button visibility and text
	update_button_state()
	
	# Play step sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_hover", 1.2)

func format_description(text: String) -> String:
	"""Format the description text with rich text markup"""
	# Add some styling to make text more engaging
	var formatted = text
	
	# Highlight key terms
	formatted = formatted.replace("WASD", "[color=yellow]WASD[/color]")
	formatted = formatted.replace("Arrow keys", "[color=yellow]Arrow keys[/color]")
	formatted = formatted.replace("SHIFT", "[color=yellow]SHIFT[/color]")
	formatted = formatted.replace("E", "[color=yellow]E[/color]")
	formatted = formatted.replace("SPACE", "[color=yellow]SPACE[/color]")
	formatted = formatted.replace("ENTER", "[color=yellow]ENTER[/color]")
	formatted = formatted.replace("ESC", "[color=yellow]ESC[/color]")
	
	# Highlight important concepts
	formatted = formatted.replace("NPCs", "[color=cyan]NPCs[/color]")
	formatted = formatted.replace("quests", "[color=green]quests[/color]")
	formatted = formatted.replace("experience", "[color=orange]experience[/color]")
	formatted = formatted.replace("vocabulary", "[color=pink]vocabulary[/color]")
	
	return formatted

func update_button_state():
	"""Update button text and visibility based on current step"""
	if not current_step_data:
		return
	
	# Update continue button text based on action required
	match current_step_data.action_required:
		"click_continue":
			continue_button.text = "Let's Start!"
			continue_button.show()
		"move_player":
			continue_button.text = "Try Moving!"
			continue_button.hide()  # Player must move to advance
		"run_player":
			continue_button.text = "Try Running!"
			continue_button.hide()  # Player must run to advance
		"approach_npc":
			continue_button.text = "Walk to Teacher"
			continue_button.hide()  # Player must approach
		"interact_with_npc":
			continue_button.text = "Press E to Talk"
			continue_button.hide()  # Player must interact
		"complete_dialogue":
			continue_button.text = "Try Talking!"
			continue_button.hide()  # Player must complete dialogue
		"view_quest":
			continue_button.text = "I See It!"
			continue_button.show()  # Auto-advance but allow manual
		"finish_tutorial":
			continue_button.text = "Start Playing!"
			continue_button.show()
		_:
			continue_button.text = "Continue"
			continue_button.show()
	
	# Hide skip button on final step
	if current_step_data.id == "complete":
		skip_button.hide()

func _on_continue_button_pressed():
	"""Handle continue button press"""
	# Play button sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	
	# Animate panel exit for final step
	if current_step_data and current_step_data.id == "complete":
		animate_panel_exit()
	else:
		continue_pressed.emit()

func _on_skip_button_pressed():
	"""Handle skip tutorial button press"""
	# Play button sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	
	# Skip tutorial directly
	is_being_skipped = true
	animate_panel_exit()


func animate_panel_exit():
	"""Animate tutorial panel exit"""
	var tween = create_tween()
	tween.parallel().tween_property(tutorial_panel, "modulate:a", 0.0, 0.3)
	tween.parallel().tween_property(tutorial_panel, "position:y", tutorial_panel.position.y + 50, 0.3)
	tween.tween_callback(_on_panel_hidden)

func _on_panel_hidden():
	"""Called when panel exit animation completes"""
	is_tutorial_finished = true  # Mark tutorial as finished to stop input processing
	
	if is_being_skipped:
		# User confirmed skipping the tutorial
		skip_tutorial.emit()
	elif current_step_data and current_step_data.id == "complete":
		# Tutorial completed normally
		continue_pressed.emit()
	else:
		# This shouldn't happen, but fallback to continue
		continue_pressed.emit()

func _input(event):
	"""Handle keyboard shortcuts - now coordinated with GameStateManager"""
	# Only handle input if visible and not finished
	if not visible or is_tutorial_finished:
		return
	
	# Only handle input if GameStateManager allows it (tutorial mode active)
	var game_state_manager = get_node_or_null("/root/GameStateManager")
	if game_state_manager and not game_state_manager.is_in_tutorial():
		return
		
	# Allow Enter to continue (when continue button is visible)
	if event.is_action_pressed("ui_accept") and continue_button.visible:
		_on_continue_button_pressed()
		get_viewport().set_input_as_handled()  # Consume the event
	
	# Handle ESC to skip tutorial
	elif event.is_action_pressed("ui_cancel"):
		_handle_esc_press()
		get_viewport().set_input_as_handled()  # Consume the event to prevent other handlers

# Animation helpers
func pulse_highlight():
	"""Create a subtle pulse effect for attention"""
	var tween = create_tween()
	tween.tween_property(tutorial_panel, "modulate:a", 0.8, 0.5)
	tween.tween_property(tutorial_panel, "modulate:a", 1.0, 0.5)

func shake_panel():
	"""Gentle shake for important notifications"""
	var original_pos = tutorial_panel.position
	var tween = create_tween()
	tween.tween_property(tutorial_panel, "position:x", original_pos.x + 5, 0.05)
	tween.tween_property(tutorial_panel, "position:x", original_pos.x - 5, 0.05)
	tween.tween_property(tutorial_panel, "position:x", original_pos.x + 3, 0.05)
	tween.tween_property(tutorial_panel, "position:x", original_pos.x, 0.05)

# Public API for external control
func highlight_step():
	"""Draw attention to current step"""
	pulse_highlight()

func notify_action_required():
	"""Indicate that player action is required"""
	shake_panel()

func update_step_counter(current: int, total: int):
	"""Update the step counter manually"""
	step_number = current
	total_steps = total
	step_counter.text = "Step %d of %d" % [current, total]

func finish_tutorial():
	"""Mark tutorial as finished to stop input processing"""
	is_tutorial_finished = true

# Player movement is now handled by GameStateManager

# ESC handling functions
func _handle_esc_press():
	"""Handle ESC key press - directly terminate tutorial"""
	# ESC immediately terminates tutorial
	is_being_skipped = true
	animate_panel_exit()

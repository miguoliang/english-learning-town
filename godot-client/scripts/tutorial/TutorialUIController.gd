extends Node
class_name TutorialUIController

# Preload required classes
const TutorialStep = preload("res://scripts/tutorial/TutorialStep.gd")

# TutorialUIController - Manages tutorial UI overlay and animations
# Handles creation, display, and animation of tutorial interface

var tutorial_overlay: Control

func create_tutorial_overlay():
	"""Create the tutorial UI overlay"""
	# Clean up any existing overlay first
	if tutorial_overlay:
		cleanup_overlay()
	
	var overlay_scene = load("res://scenes/TutorialOverlay.tscn")
	if overlay_scene:
		tutorial_overlay = overlay_scene.instantiate()
		
		# Ensure tutorial overlay is rendered on top using Z-Index constants
		tutorial_overlay.z_index = ZIndex.TUTORIAL
		
		get_tree().current_scene.add_child(tutorial_overlay)
		
		# Adjust panel position based on viewport size
		var panel = tutorial_overlay.get_node_or_null("TutorialPanel")
		if panel:
			var viewport_size = get_tree().current_scene.get_viewport().get_visible_rect().size
			var panel_height = 160.0
			var bottom_margin = 20.0
			panel.offset_top = -panel_height - bottom_margin
			panel.offset_bottom = -bottom_margin
			print("Tutorial panel positioned for viewport size: %s" % viewport_size)
		
		return tutorial_overlay
	else:
		print("Warning: Could not load TutorialOverlay.tscn - creating simple fallback")
		return create_simple_tutorial_overlay()

func create_simple_tutorial_overlay():
	"""Create a simple tutorial overlay as fallback"""
	tutorial_overlay = Control.new()
	tutorial_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	# Ensure simple overlay is also rendered on top using Z-Index constants
	tutorial_overlay.z_index = ZIndex.TUTORIAL
	
	# Create simple panel - positioned at bottom center
	var panel = Panel.new()
	var viewport_size = get_tree().current_scene.get_viewport().get_visible_rect().size
	panel.size = Vector2(600, 160)
	panel.position = Vector2((viewport_size.x - panel.size.x) / 2, viewport_size.y - panel.size.y - 20)
	
	# Add text label
	var label = RichTextLabel.new()
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	label.offset_left = 20
	label.offset_right = -20
	label.offset_top = 20
	label.offset_bottom = -60
	label.bbcode_enabled = true
	
	# Add continue button
	var button = Button.new()
	button.text = "Continue"
	button.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
	button.position = Vector2(-120, -40)
	button.size = Vector2(100, 30)
	
	# Assemble UI
	panel.add_child(label)
	panel.add_child(button)
	tutorial_overlay.add_child(panel)
	get_tree().current_scene.add_child(tutorial_overlay)
	
	# Store references for show_step method
	tutorial_overlay.set_meta("title_label", label)
	tutorial_overlay.set_meta("continue_button", button)
	
	return tutorial_overlay

func show_step_simple(step: TutorialStep):
	"""Show tutorial step in simple fallback overlay"""
	if not tutorial_overlay:
		return
		
	var label = tutorial_overlay.get_meta("title_label")
	var button = tutorial_overlay.get_meta("continue_button")
	
	if label:
		var formatted_text = "[center][b]%s[/b][/center]\n\n%s" % [step.title, step.description]
		label.text = formatted_text
	
	if button:
		match step.action_required:
			"click_continue":
				button.text = "Let's Start!"
			"finish_tutorial":
				button.text = "Start Playing!"
			_:
				button.text = "Continue"

func reveal_ui_for_step(step: TutorialStep):
	"""Progressively reveal UI elements based on tutorial step"""
	var scene_controller = get_tree().current_scene
	
	match step.id:
		"dialogue":
			# After learning about dialogue, reveal the experience label
			var exp_label = scene_controller.get_node_or_null("UI/HUD/TopPanel/HBoxContainer/ExperienceLabel")
			if exp_label:
				animate_ui_reveal(exp_label)
		
		"quests":
			# During quest step, fully reveal the quest panel
			var quest_panel = scene_controller.get_node_or_null("UI/HUD/QuestPanel")
			if quest_panel:
				animate_ui_reveal(quest_panel)
				quest_panel.mouse_filter = Control.MOUSE_FILTER_PASS
		
		"complete":
			# At completion, reveal all remaining UI
			var menu_button = scene_controller.get_node_or_null("UI/HUD/BottomPanel/HBoxContainer/MenuButton")
			if menu_button:
				animate_ui_reveal(menu_button)
				menu_button.disabled = false

func animate_ui_reveal(ui_element: Control):
	"""Animate the revelation of a UI element"""
	if not ui_element:
		return
	
	# Create reveal animation
	var tween = create_tween()
	tween.tween_property(ui_element, "modulate:a", 1.0, 0.5)
	
	# Add a gentle glow effect
	var original_modulate = ui_element.modulate
	tween.parallel().tween_property(ui_element, "modulate", Color(1.2, 1.2, 1.2, 1.0), 0.3)
	tween.tween_property(ui_element, "modulate", original_modulate, 0.2)
	
	# Play reveal sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_hover", 0.9)

func disable_non_tutorial_interactions():
	"""Disable certain interactions during tutorial"""
	var scene_controller = get_tree().current_scene
	
	# Hide quest panel initially
	var quest_panel = scene_controller.get_node_or_null("UI/HUD/QuestPanel")
	if quest_panel:
		quest_panel.modulate.a = 0.3
		quest_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	# Hide some HUD elements initially
	var menu_button = scene_controller.get_node_or_null("UI/HUD/BottomPanel/HBoxContainer/MenuButton")
	if menu_button:
		menu_button.modulate.a = 0.3
		menu_button.disabled = true
	
	# Dim experience label initially
	var exp_label = scene_controller.get_node_or_null("UI/HUD/TopPanel/HBoxContainer/ExperienceLabel")
	if exp_label:
		exp_label.modulate.a = 0.3

func enable_all_interactions():
	"""Re-enable all game interactions after tutorial"""
	var scene_controller = get_tree().current_scene
	
	# Ensure all UI elements are fully visible and enabled
	var quest_panel = scene_controller.get_node_or_null("UI/HUD/QuestPanel")
	if quest_panel:
		quest_panel.modulate.a = 1.0
		quest_panel.mouse_filter = Control.MOUSE_FILTER_PASS
	
	var menu_button = scene_controller.get_node_or_null("UI/HUD/BottomPanel/HBoxContainer/MenuButton")
	if menu_button:
		menu_button.modulate.a = 1.0
		menu_button.disabled = false
	
	var exp_label = scene_controller.get_node_or_null("UI/HUD/TopPanel/HBoxContainer/ExperienceLabel")
	if exp_label:
		exp_label.modulate.a = 1.0

func cleanup_overlay():
	"""Clean up tutorial overlay"""
	if tutorial_overlay:
		# First mark tutorial as finished to stop input processing
		if tutorial_overlay.has_method("finish_tutorial"):
			tutorial_overlay.finish_tutorial()
		# Use queue_free to avoid locked object issues
		tutorial_overlay.queue_free()
		tutorial_overlay = null
extends Control
class_name HintTooltip

# HintTooltip - UI component for displaying interactive hints and tooltips

signal hint_dismissed()

# UI node references
@onready var hint_panel: Panel = $HintPanel
@onready var hint_icon: TextureRect = $HintPanel/HintContainer/TitleContainer/HintIcon
@onready var title_label: Label = $HintPanel/HintContainer/TitleContainer/TitleLabel
@onready var content_label: RichTextLabel = $HintPanel/HintContainer/ContentLabel
@onready var close_button: Button = $HintPanel/CloseButton
@onready var progress_bar: ProgressBar = $HintPanel/ProgressBar

# Current hint data
var hint_data: HintManager.HintData
var target_node: Node
var auto_dismiss_timer: float = 0.0
var max_duration: float = 5.0
var is_auto_dismissing: bool = true

func _ready():
	# Start hidden and animate in
	modulate.a = 0.0
	scale = Vector2(0.8, 0.8)
	
	# Connect close button
	close_button.pressed.connect(_on_close_button_pressed)

func setup_hint(data: HintManager.HintData, position: Vector2, target: Node = null):
	"""Setup the hint with data and positioning"""
	hint_data = data
	target_node = target
	
	# Set hint content
	title_label.text = hint_data.title
	content_label.text = format_hint_text(hint_data.text)
	
	# Set icon if available
	if hint_data.icon:
		hint_icon.texture = hint_data.icon
		hint_icon.show()
	else:
		hint_icon.hide()
	
	# Configure close button
	close_button.visible = hint_data.can_be_dismissed
	
	# Set timer
	max_duration = hint_data.duration if hint_data.duration > 0 else 5.0
	auto_dismiss_timer = max_duration
	progress_bar.value = 100.0
	
	# Position hint
	position_hint(position)
	
	# Style based on priority
	apply_priority_styling()
	
	# Animate in
	animate_in()

func format_hint_text(text: String) -> String:
	"""Format hint text with rich text markup"""
	var formatted = text
	
	# Highlight key controls
	formatted = formatted.replace("WASD", "[color=yellow][b]WASD[/b][/color]")
	formatted = formatted.replace("SHIFT", "[color=yellow][b]SHIFT[/b][/color]")
	formatted = formatted.replace("E", "[color=yellow][b]E[/b][/color]")
	formatted = formatted.replace("SPACE", "[color=yellow][b]SPACE[/b][/color]")
	formatted = formatted.replace("ENTER", "[color=yellow][b]ENTER[/b][/color]")
	formatted = formatted.replace("ESC", "[color=yellow][b]ESC[/b][/color]")
	
	# Highlight important game terms
	formatted = formatted.replace("NPCs", "[color=cyan][b]NPCs[/b][/color]")
	formatted = formatted.replace("quests", "[color=green][b]quests[/b][/color]")
	formatted = formatted.replace("XP", "[color=orange][b]XP[/b][/color]")
	formatted = formatted.replace("experience", "[color=orange][b]experience[/b][/color]")
	
	return formatted

func position_hint(target_position: Vector2):
	"""Position the hint relative to target or screen position"""
	var screen_size = get_viewport().get_visible_rect().size
	var hint_size = hint_panel.size
	
	if target_node:
		# Position relative to target node
		var target_pos = target_node.global_position
		target_position = target_pos + Vector2(50, -hint_size.y - 10)
	elif target_position == Vector2.ZERO:
		# Default to top-right area
		target_position = Vector2(screen_size.x - hint_size.x - 20, 100)
	
	# Keep hint on screen
	target_position.x = clamp(target_position.x, 10, screen_size.x - hint_size.x - 10)
	target_position.y = clamp(target_position.y, 10, screen_size.y - hint_size.y - 10)
	
	position = target_position

func apply_priority_styling():
	"""Apply visual styling based on hint priority"""
	if not hint_data:
		return
	
	var style = hint_panel.get_theme_stylebox("panel").duplicate() as StyleBoxFlat
	
	match hint_data.priority:
		HintManager.HintPriority.CRITICAL:
			style.border_color = Color.RED
			style.bg_color = Color(0.2, 0.05, 0.05, 0.95)
			progress_bar.modulate = Color.RED
		HintManager.HintPriority.HIGH:
			style.border_color = Color.YELLOW
			style.bg_color = Color(0.15, 0.15, 0.05, 0.95)
			progress_bar.modulate = Color.YELLOW
		HintManager.HintPriority.MEDIUM:
			style.border_color = Color.CYAN
			style.bg_color = Color(0.05, 0.1, 0.15, 0.95)
			progress_bar.modulate = Color.CYAN
		HintManager.HintPriority.LOW:
			style.border_color = Color.GRAY
			style.bg_color = Color(0.1, 0.1, 0.1, 0.9)
			progress_bar.modulate = Color.GRAY
	
	hint_panel.add_theme_stylebox_override("panel", style)

func animate_in():
	"""Animate hint entrance"""
	var tween = create_tween()
	tween.parallel().tween_property(self, "modulate:a", 1.0, 0.3)
	tween.parallel().tween_property(self, "scale", Vector2.ONE, 0.3)
	tween.tween_callback(_on_animation_in_complete)

func animate_out():
	"""Animate hint exit"""
	var tween = create_tween()
	tween.parallel().tween_property(self, "modulate:a", 0.0, 0.2)
	tween.parallel().tween_property(self, "scale", Vector2(0.8, 0.8), 0.2)
	tween.tween_callback(_on_animation_out_complete)

func _on_animation_in_complete():
	"""Called when entrance animation completes"""
	# Play hint sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_hover", 0.8)

func _on_animation_out_complete():
	"""Called when exit animation completes"""
	hint_dismissed.emit()
	queue_free()

func _process(delta):
	"""Update auto-dismiss timer and progress bar"""
	if not is_auto_dismissing or auto_dismiss_timer <= 0:
		return
	
	auto_dismiss_timer -= delta
	var progress = (auto_dismiss_timer / max_duration) * 100.0
	progress_bar.value = progress
	
	if auto_dismiss_timer <= 0:
		dismiss_hint()

func dismiss_hint():
	"""Dismiss this hint"""
	is_auto_dismissing = false
	animate_out()

func _on_close_button_pressed():
	"""Handle close button press"""
	# Play button sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	
	dismiss_hint()

func _input(event):
	"""Handle input for hint dismissal"""
	if not visible or not hint_data:
		return
	
	# Allow ESC to dismiss dismissible hints
	if event.is_action_pressed("ui_cancel") and hint_data.can_be_dismissed:
		dismiss_hint()

# Public API for external control
func pause_auto_dismiss():
	"""Pause the auto-dismiss timer"""
	is_auto_dismissing = false

func resume_auto_dismiss():
	"""Resume the auto-dismiss timer"""
	is_auto_dismissing = true

func extend_duration(additional_time: float):
	"""Extend the hint display duration"""
	auto_dismiss_timer += additional_time
	max_duration += additional_time

func set_urgent():
	"""Mark hint as urgent (red styling, longer duration)"""
	if hint_data:
		hint_data.priority = HintManager.HintPriority.CRITICAL
		apply_priority_styling()
		extend_duration(3.0)

# Animation helpers
func pulse_attention():
	"""Create a pulse effect to draw attention"""
	var tween = create_tween()
	tween.tween_property(hint_panel, "modulate:a", 0.7, 0.3)
	tween.tween_property(hint_panel, "modulate:a", 1.0, 0.3)

func shake_hint():
	"""Gentle shake animation for important notifications"""
	var original_pos = hint_panel.position
	var tween = create_tween()
	tween.tween_property(hint_panel, "position:x", original_pos.x + 3, 0.05)
	tween.tween_property(hint_panel, "position:x", original_pos.x - 3, 0.05)
	tween.tween_property(hint_panel, "position:x", original_pos.x + 2, 0.05)
	tween.tween_property(hint_panel, "position:x", original_pos.x, 0.05)
extends Node
class_name HintDisplay

# HintDisplay - Handles visual display of hints
# Creates and manages hint UI elements

signal hint_displayed(hint_id: String)
signal hint_dismissed(hint_id: String)

@export var hint_display_duration: float = 5.0
@export var max_concurrent_hints: int = 3

var active_hint_nodes: Dictionary = {}

func display_hint(hint_data: HintData, position: Vector2 = Vector2.ZERO, duration: float = -1.0) -> Control:
	"""Display a hint on screen"""
	if not hint_data:
		return null
	
	# Check if we're at max concurrent hints
	if active_hint_nodes.size() >= max_concurrent_hints:
		dismiss_oldest_hint()
	
	# Use custom duration or hint's default duration or global default
	var display_duration = duration if duration > 0 else (hint_data.duration if hint_data.duration > 0 else hint_display_duration)
	
	# Create hint tooltip
	var hint_tooltip = create_hint_tooltip(hint_data, position)
	if not hint_tooltip:
		return null
	
	# Add to scene and track
	get_tree().current_scene.add_child(hint_tooltip)
	active_hint_nodes[hint_data.id] = hint_tooltip
	
	# Auto-dismiss after duration
	if display_duration > 0:
		var timer = Timer.new()
		timer.wait_time = display_duration
		timer.one_shot = true
		timer.timeout.connect(_on_hint_timeout.bind(hint_data.id))
		add_child(timer)
		timer.start()
	
	hint_displayed.emit(hint_data.id)
	return hint_tooltip

func create_hint_tooltip(hint_data: HintData, position: Vector2) -> Control:
	"""Create the visual hint tooltip"""
	var tooltip = PanelContainer.new()
	tooltip.name = "HintTooltip_" + hint_data.id
	
	# Style the panel
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.1, 0.1, 0.9)
	style.border_color = Color.CYAN
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	tooltip.add_theme_stylebox_override("panel", style)
	
	# Create content container
	var vbox = VBoxContainer.new()
	vbox.custom_minimum_size = Vector2(200, 50)
	
	# Title label
	if hint_data.title != "":
		var title_label = Label.new()
		title_label.text = hint_data.title
		title_label.add_theme_font_size_override("font_size", 14)
		title_label.add_theme_color_override("font_color", Color.CYAN)
		vbox.add_child(title_label)
	
	# Text label
	var text_label = RichTextLabel.new()
	text_label.bbcode_enabled = true
	text_label.text = hint_data.text
	text_label.fit_content = true
	text_label.custom_minimum_size.y = 30
	text_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vbox.add_child(text_label)
	
	# Close button if dismissible
	if hint_data.can_be_dismissed:
		var close_button = Button.new()
		close_button.text = "×"
		close_button.custom_minimum_size = Vector2(20, 20)
		close_button.pressed.connect(_on_hint_dismissed.bind(hint_data.id))
		
		# Position close button in top-right
		var close_container = HBoxContainer.new()
		var spacer = Control.new()
		spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		close_container.add_child(spacer)
		close_container.add_child(close_button)
		vbox.add_child(close_container)
	
	tooltip.add_child(vbox)
	
	# Position the tooltip
	position_hint_tooltip(tooltip, position, hint_data)
	
	# Add entrance animation
	animate_hint_entrance(tooltip)
	
	return tooltip

func position_hint_tooltip(tooltip: Control, position: Vector2, hint_data: HintData):
	"""Position the hint tooltip on screen"""
	if position == Vector2.ZERO:
		# Default positioning - center of screen with slight offset
		var viewport_size = get_tree().current_scene.get_viewport().get_visible_rect().size
		position = Vector2(viewport_size.x * 0.8, viewport_size.y * 0.2)
	
	tooltip.position = position
	
	# Ensure tooltip stays on screen
	var viewport_size = get_tree().current_scene.get_viewport().get_visible_rect().size
	if tooltip.position.x + tooltip.size.x > viewport_size.x:
		tooltip.position.x = viewport_size.x - tooltip.size.x - 10
	if tooltip.position.y + tooltip.size.y > viewport_size.y:
		tooltip.position.y = viewport_size.y - tooltip.size.y - 10
	
	tooltip.position.x = max(10, tooltip.position.x)
	tooltip.position.y = max(10, tooltip.position.y)

func animate_hint_entrance(tooltip: Control):
	"""Animate hint entrance"""
	# Start invisible and small
	tooltip.modulate.a = 0.0
	tooltip.scale = Vector2(0.8, 0.8)
	
	# Animate to full visibility and size
	var tween = create_tween()
	tween.parallel().tween_property(tooltip, "modulate:a", 1.0, 0.3)
	tween.parallel().tween_property(tooltip, "scale", Vector2.ONE, 0.3)

func dismiss_hint(hint_id: String) -> bool:
	"""Dismiss a specific hint"""
	if not active_hint_nodes.has(hint_id):
		return false
	
	var tooltip = active_hint_nodes[hint_id]
	
	# Animate out
	var tween = create_tween()
	tween.parallel().tween_property(tooltip, "modulate:a", 0.0, 0.2)
	tween.parallel().tween_property(tooltip, "scale", Vector2(0.8, 0.8), 0.2)
	tween.tween_callback(tooltip.queue_free)
	
	# Remove from tracking
	active_hint_nodes.erase(hint_id)
	
	hint_dismissed.emit(hint_id)
	return true

func dismiss_oldest_hint():
	"""Dismiss the oldest active hint"""
	if active_hint_nodes.is_empty():
		return
	
	# Get first hint (oldest)
	var oldest_id = active_hint_nodes.keys()[0]
	dismiss_hint(oldest_id)

func dismiss_all_hints():
	"""Dismiss all active hints"""
	var hint_ids = active_hint_nodes.keys().duplicate()
	for hint_id in hint_ids:
		dismiss_hint(hint_id)

func is_hint_active(hint_id: String) -> bool:
	"""Check if a hint is currently displayed"""
	return active_hint_nodes.has(hint_id)

func get_active_hint_count() -> int:
	"""Get number of active hints"""
	return active_hint_nodes.size()

func _on_hint_timeout(hint_id: String):
	"""Handle hint auto-dismiss timeout"""
	dismiss_hint(hint_id)

func _on_hint_dismissed(hint_id: String):
	"""Handle manual hint dismissal"""
	dismiss_hint(hint_id)
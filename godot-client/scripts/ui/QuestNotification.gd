extends Control
class_name QuestNotification

# QuestNotification - Animated notification for quest updates

signal notification_dismissed()

# UI node references
@onready var notification_panel: Panel = $NotificationPanel
@onready var notification_icon: TextureRect = $NotificationPanel/NotificationContainer/HeaderContainer/NotificationIcon
@onready var title_label: Label = $NotificationPanel/NotificationContainer/HeaderContainer/TitleLabel
@onready var message_label: RichTextLabel = $NotificationPanel/NotificationContainer/MessageLabel
@onready var progress_container: VBoxContainer = $NotificationPanel/NotificationContainer/ProgressContainer
@onready var progress_label: Label = $NotificationPanel/NotificationContainer/ProgressContainer/ProgressLabel
@onready var progress_bar: ProgressBar = $NotificationPanel/NotificationContainer/ProgressContainer/ProgressBar
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var timer: Timer = $Timer

# Notification types
enum NotificationType {
	QUEST_STARTED,
	QUEST_COMPLETED,
	OBJECTIVE_COMPLETED,
	QUEST_FAILED,
	EXPERIENCE_GAINED,
	LEVEL_UP
}

# Current notification data
var notification_type: NotificationType
var auto_dismiss: bool = true
var show_progress: bool = false

func _ready():
	# Start hidden
	notification_panel.position.x = 350
	notification_panel.modulate.a = 0.0
	
	# Connect timer
	timer.timeout.connect(_on_timer_timeout)

func show_quest_notification(type: NotificationType, title: String, message: String, duration: float = 4.0, progress_value: float = -1.0):
	"""Show a quest notification with animation"""
	notification_type = type
	
	# Set content
	title_label.text = title
	message_label.text = format_notification_message(message)
	
	# Configure icon and styling based on type
	configure_notification_appearance()
	
	# Handle progress display
	if progress_value >= 0:
		show_progress = true
		progress_container.show()
		progress_bar.value = progress_value
		progress_label.text = "Progress: %.0f%%" % progress_value
	else:
		show_progress = false
		progress_container.hide()
	
	# Set timer duration
	timer.wait_time = duration
	
	# Animate in
	animate_in()

func format_notification_message(message: String) -> String:
	"""Format notification message with rich text"""
	var formatted = message
	
	# Highlight important terms
	formatted = formatted.replace("XP", "[color=orange][b]XP[/b][/color]")
	formatted = formatted.replace("experience", "[color=orange][b]experience[/b][/color]")
	formatted = formatted.replace("Level", "[color=cyan][b]Level[/b][/color]")
	formatted = formatted.replace("completed", "[color=green][b]completed[/b][/color]")
	formatted = formatted.replace("failed", "[color=red][b]failed[/b][/color]")
	
	return formatted

func configure_notification_appearance():
	"""Configure appearance based on notification type"""
	var style = notification_panel.get_theme_stylebox("panel").duplicate() as StyleBoxFlat
	
	match notification_type:
		NotificationType.QUEST_STARTED:
			style.border_color = Color.CYAN
			style.bg_color = Color(0.1, 0.15, 0.2, 0.9)
			notification_icon.modulate = Color.CYAN
			title_label.text = "New Quest!" if title_label.text == "Quest Update" else title_label.text
		
		NotificationType.QUEST_COMPLETED:
			style.border_color = Color.GREEN
			style.bg_color = Color(0.1, 0.2, 0.1, 0.9)
			notification_icon.modulate = Color.GREEN
			title_label.text = "Quest Complete!" if title_label.text == "Quest Update" else title_label.text
		
		NotificationType.OBJECTIVE_COMPLETED:
			style.border_color = Color.YELLOW
			style.bg_color = Color(0.2, 0.2, 0.1, 0.9)
			notification_icon.modulate = Color.YELLOW
			title_label.text = "Objective Complete!" if title_label.text == "Quest Update" else title_label.text
		
		NotificationType.QUEST_FAILED:
			style.border_color = Color.RED
			style.bg_color = Color(0.2, 0.1, 0.1, 0.9)
			notification_icon.modulate = Color.RED
			title_label.text = "Quest Failed" if title_label.text == "Quest Update" else title_label.text
		
		NotificationType.EXPERIENCE_GAINED:
			style.border_color = Color.ORANGE
			style.bg_color = Color(0.2, 0.15, 0.1, 0.9)
			notification_icon.modulate = Color.ORANGE
			title_label.text = "Experience Gained!" if title_label.text == "Quest Update" else title_label.text
		
		NotificationType.LEVEL_UP:
			style.border_color = Color.GOLD
			style.bg_color = Color(0.2, 0.2, 0.05, 0.9)
			notification_icon.modulate = Color.GOLD
			title_label.text = "Level Up!" if title_label.text == "Quest Update" else title_label.text
	
	notification_panel.add_theme_stylebox_override("panel", style)

func animate_in():
	"""Animate notification entrance"""
	# Set starting position (off-screen to the right)
	notification_panel.position.x = 350
	notification_panel.modulate.a = 0.0
	
	var tween = create_tween()
	tween.parallel().tween_property(notification_panel, "position:x", 0, 0.5)
	tween.parallel().tween_property(notification_panel, "modulate:a", 1.0, 0.3)
	tween.tween_callback(_on_animate_in_complete)

func animate_out():
	"""Animate notification exit"""
	var tween = create_tween()
	tween.parallel().tween_property(notification_panel, "position:x", 350, 0.4)
	tween.parallel().tween_property(notification_panel, "modulate:a", 0.0, 0.3)
	tween.tween_callback(_on_animate_out_complete)

func _on_animate_in_complete():
	"""Called when entrance animation completes"""
	# Play notification sound based on type
	if has_node("/root/AudioManager"):
		var audio_manager = get_node("/root/AudioManager")
		match notification_type:
			NotificationType.QUEST_STARTED:
				audio_manager.play_sfx("dialogue_open", 1.1)
			NotificationType.QUEST_COMPLETED:
				audio_manager.play_sfx("interact", 1.3)
			NotificationType.OBJECTIVE_COMPLETED:
				audio_manager.play_sfx("button_hover", 1.2)
			NotificationType.LEVEL_UP:
				audio_manager.play_sfx("interact", 1.5)
			_:
				audio_manager.play_sfx("button_hover", 1.0)
	
	# Start auto-dismiss timer
	if auto_dismiss:
		timer.start()

func _on_animate_out_complete():
	"""Called when exit animation completes"""
	notification_dismissed.emit()
	queue_free()

func _on_timer_timeout():
	"""Handle auto-dismiss timer"""
	dismiss_notification()

func dismiss_notification():
	"""Manually dismiss the notification"""
	auto_dismiss = false
	timer.stop()
	animate_out()

func _input(event):
	"""Handle input for manual dismissal"""
	if not visible:
		return
	
	# Click to dismiss
	if event is InputEventMouseButton and event.pressed:
		if get_global_rect().has_point(event.global_position):
			dismiss_notification()

# Public API
func extend_duration(additional_time: float):
	"""Extend the auto-dismiss timer"""
	if timer.is_inside_tree() and not timer.is_stopped():
		timer.wait_time += additional_time

func set_urgent():
	"""Mark notification as urgent (longer display, different styling)"""
	extend_duration(3.0)
	
	# Add urgent styling
	var style = notification_panel.get_theme_stylebox("panel") as StyleBoxFlat
	if style:
		style.border_width_left = 4
		style.border_width_top = 4
		style.border_width_right = 4
		style.border_width_bottom = 4
		notification_panel.add_theme_stylebox_override("panel", style)
	
	# Add pulsing effect
	pulse_urgent()

func pulse_urgent():
	"""Create pulsing effect for urgent notifications"""
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(notification_panel, "modulate:a", 0.7, 0.8)
	tween.tween_property(notification_panel, "modulate:a", 1.0, 0.8)

func update_progress(new_progress: float):
	"""Update progress bar if shown"""
	if show_progress and progress_bar:
		var tween = create_tween()
		tween.tween_property(progress_bar, "value", new_progress, 0.3)
		progress_label.text = "Progress: %.0f%%" % new_progress
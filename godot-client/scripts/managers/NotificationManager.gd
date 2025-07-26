extends Node

# NotificationManager - Manages quest notifications and other game notifications
# Handles stacking, queuing, and positioning of notifications

signal notification_shown(notification_id: String)
signal notification_dismissed(notification_id: String)

# Notification settings
@export var max_concurrent_notifications: int = 3
@export var notification_spacing: float = 10.0
@export var notification_start_y: float = 20.0

# Active notifications tracking
var active_notifications: Array = []
var notification_queue: Array[Dictionary] = []
var notification_counter: int = 0

func _ready():
	print("NotificationManager initialized")

func show_quest_notification(type: int, title: String, message: String, duration: float = 4.0, progress: float = -1.0) -> String:
	"""Show a quest notification"""
	var notification_id = "notification_" + str(notification_counter)
	notification_counter += 1
	
	var notification_data = {
		"id": notification_id,
		"type": type,
		"title": title,
		"message": message,
		"duration": duration,
		"progress": progress
	}
	
	if active_notifications.size() < max_concurrent_notifications:
		_create_and_show_notification(notification_data)
	else:
		# Queue notification for later
		notification_queue.append(notification_data)
	
	return notification_id

func _create_and_show_notification(notification_data: Dictionary):
	"""Create and display a notification"""
	var notification_scene = load("res://scenes/QuestNotification.tscn")
	if not notification_scene:
		print("Warning: Could not load QuestNotification.tscn")
		return
	
	var notification = notification_scene.instantiate()
	get_tree().current_scene.add_child(notification)
	
	# Position notification
	_position_notification(notification)
	
	# Configure and show
	notification.show_quest_notification(
		notification_data.type,
		notification_data.title,
		notification_data.message,
		notification_data.duration,
		notification_data.progress
	)
	
	# Connect dismissal signal
	notification.notification_dismissed.connect(_on_notification_dismissed.bind(notification))
	
	# Store reference
	notification.set_meta("notification_id", notification_data.id)
	active_notifications.append(notification)
	
	# Emit signal
	notification_shown.emit(notification_data.id)

func _position_notification(notification):
	"""Position notification based on existing notifications"""
	var y_offset = notification_start_y
	
	for existing_notification in active_notifications:
		if existing_notification and is_instance_valid(existing_notification):
			y_offset += existing_notification.size.y + notification_spacing
	
	notification.position.y = y_offset

func _on_notification_dismissed(notification):
	"""Handle notification dismissal"""
	if notification in active_notifications:
		var notification_id = notification.get_meta("notification_id", "")
		active_notifications.erase(notification)
		
		# Emit dismissal signal
		if notification_id != "":
			notification_dismissed.emit(notification_id)
		
		# Reposition remaining notifications
		_reposition_notifications()
		
		# Show queued notification if any
		_show_next_queued_notification()

func _reposition_notifications():
	"""Reposition all active notifications"""
	for i in range(active_notifications.size()):
		var notification = active_notifications[i]
		if notification and is_instance_valid(notification):
			var target_y = notification_start_y + i * (notification.size.y + notification_spacing)
			
			# Animate to new position
			var tween = create_tween()
			tween.tween_property(notification, "position:y", target_y, 0.3)

func _show_next_queued_notification():
	"""Show the next queued notification if any"""
	if notification_queue.size() > 0 and active_notifications.size() < max_concurrent_notifications:
		var next_notification = notification_queue.pop_front()
		_create_and_show_notification(next_notification)

# Convenience methods for common notification types
func show_quest_started(quest_title: String) -> String:
	"""Show quest started notification"""
	return show_quest_notification(
		0,  # QUEST_STARTED
		"New Quest!",
		"Started: [color=cyan][b]%s[/b][/color]" % quest_title,
		5.0
	)

func show_quest_completed(quest_title: String, exp_reward: int = 0, money_reward: int = 0) -> String:
	"""Show quest completed notification"""
	var reward_text = ""
	if exp_reward > 0:
		reward_text += "\n+%d XP" % exp_reward
	if money_reward > 0:
		reward_text += "\n+$%d" % money_reward
	
	return show_quest_notification(
		1,  # QUEST_COMPLETED
		"Quest Complete!",
		"Completed: [color=green][b]%s[/b][/color]%s" % [quest_title, reward_text],
		6.0
	)

func show_objective_completed(objective_text: String, progress_percentage: float = -1.0) -> String:
	"""Show objective completed notification"""
	return show_quest_notification(
		2,  # OBJECTIVE_COMPLETED
		"Objective Complete!",
		"✓ %s" % objective_text,
		4.0,
		progress_percentage
	)

func show_experience_gained(amount: int) -> String:
	"""Show experience gained notification"""
	return show_quest_notification(
		4,  # EXPERIENCE_GAINED
		"Experience Gained!",
		"+%d XP" % amount,
		3.0
	)

func show_level_up(new_level: int) -> String:
	"""Show level up notification"""
	var notification_id = show_quest_notification(
		5,  # LEVEL_UP
		"Level Up!",
		"Congratulations! You reached [color=gold][b]Level %d[/b][/color]!" % new_level,
		7.0
	)
	
	# Make level up notifications urgent
	call_deferred("_make_notification_urgent", notification_id)
	return notification_id

func show_custom_notification(title: String, message: String, duration: float = 4.0) -> String:
	"""Show a custom notification"""
	return show_quest_notification(
		2,  # OBJECTIVE_COMPLETED - Default type
		title,
		message,
		duration
	)

func _make_notification_urgent(notification_id: String):
	"""Make a specific notification urgent"""
	for notification in active_notifications:
		if notification.get_meta("notification_id", "") == notification_id:
			notification.set_urgent()
			break

# Public API for external control
func dismiss_notification(notification_id: String) -> bool:
	"""Manually dismiss a specific notification"""
	for notification in active_notifications:
		if notification.get_meta("notification_id", "") == notification_id:
			notification.dismiss_notification()
			return true
	return false

func dismiss_all_notifications():
	"""Dismiss all active notifications"""
	var notifications_to_dismiss = active_notifications.duplicate()
	for notification in notifications_to_dismiss:
		if notification and is_instance_valid(notification):
			notification.dismiss_notification()

func clear_notification_queue():
	"""Clear all queued notifications"""
	notification_queue.clear()

func get_active_notification_count() -> int:
	"""Get number of active notifications"""
	return active_notifications.size()

func get_queued_notification_count() -> int:
	"""Get number of queued notifications"""
	return notification_queue.size()

# Configuration methods
func set_max_concurrent_notifications(max_count: int):
	"""Set maximum concurrent notifications"""
	max_concurrent_notifications = max_count
	
	# Dismiss excess notifications if any
	while active_notifications.size() > max_concurrent_notifications:
		var last_notification = active_notifications.back()
		if last_notification:
			last_notification.dismiss_notification()

func set_notification_spacing(spacing: float):
	"""Set spacing between notifications"""
	notification_spacing = spacing
	_reposition_notifications()

func set_notification_start_position(y_position: float):
	"""Set starting Y position for notifications"""
	notification_start_y = y_position
	_reposition_notifications()
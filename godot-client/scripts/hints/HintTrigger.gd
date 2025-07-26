extends Node
class_name HintTrigger

# HintTrigger - Handles contextual hint triggering
# Manages conditions and timing for automatic hint display

var hint_history: Array[String] = []
var last_hint_times: Dictionary = {}
var hint_cooldown: float = 10.0  # Prevent spamming same hint

func should_show_hint(hint_data: HintData) -> bool:
	"""Check if a hint should be shown based on conditions"""
	if not hint_data:
		return false
	
	# Check if hint was already shown (for one-time hints)
	if hint_data.one_time_only and hint_history.has(hint_data.id):
		return false
	
	# Check cooldown to prevent spam
	if last_hint_times.has(hint_data.id):
		var time_since_last = Time.get_time_dict_from_system()["second"] - last_hint_times[hint_data.id]
		if time_since_last < hint_cooldown:
			return false
	
	# Check conditions if any
	return check_hint_conditions(hint_data)

func check_hint_conditions(hint_data: HintData) -> bool:
	"""Check if hint conditions are met"""
	if hint_data.conditions.is_empty():
		return true
	
	for condition in hint_data.conditions:
		if not evaluate_condition(condition):
			return false
	
	return true

func evaluate_condition(condition: String) -> bool:
	"""Evaluate a single hint condition"""
	match condition:
		"player_near_npc":
			return is_player_near_npc()
		"tutorial_active":
			return is_tutorial_active()
		"first_time_playing":
			return is_first_time_playing()
		"has_active_quest":
			return has_active_quest()
		"dialogue_open":
			return is_dialogue_open()
		"low_level":
			return is_low_level()
		_:
			# Unknown condition, assume true
			return true

func is_player_near_npc() -> bool:
	"""Check if player is near any NPC"""
	var player = get_tree().get_first_node_in_group("player")
	if not player:
		return false
	
	var npcs = get_tree().get_nodes_in_group("npcs")
	for npc in npcs:
		if player.global_position.distance_to(npc.global_position) < 100:
			return true
	
	return false

func is_tutorial_active() -> bool:
	"""Check if tutorial is currently active"""
	if has_node("/root/TutorialManager"):
		return get_node("/root/TutorialManager").is_tutorial_running()
	return false

func is_first_time_playing() -> bool:
	"""Check if this is the player's first time playing"""
	if not GameManager or not GameManager.is_player_logged_in:
		return true
	
	var player = GameManager.current_player
	return player and player.level == 1 and player.experience == 0

func has_active_quest() -> bool:
	"""Check if player has active quests"""
	if not QuestManager:
		return false
	
	return not QuestManager.get_active_quests().is_empty()

func is_dialogue_open() -> bool:
	"""Check if dialogue is currently open"""
	# This would need to check the actual dialogue system
	var dialogue_ui = get_tree().get_first_node_in_group("dialogue_ui")
	return dialogue_ui != null and dialogue_ui.visible

func is_low_level() -> bool:
	"""Check if player is low level (< 5)"""
	if not GameManager or not GameManager.is_player_logged_in:
		return true
	
	var player = GameManager.current_player
	return player and player.level < 5

func trigger_contextual_hint(context: String, position: Vector2 = Vector2.ZERO):
	"""Trigger hints based on game context"""
	match context:
		"player_moved":
			maybe_show_movement_hints()
		"npc_approached":
			maybe_show_interaction_hints(position)
		"dialogue_started":
			maybe_show_dialogue_hints(position)
		"quest_received":
			maybe_show_quest_hints()
		"first_login":
			maybe_show_welcome_hints()

func maybe_show_movement_hints():
	"""Show movement hints if appropriate"""
	if is_first_time_playing() and not hint_history.has("movement_basic"):
		request_hint_display("movement_basic")

func maybe_show_interaction_hints(position: Vector2):
	"""Show interaction hints when near NPCs"""
	if not hint_history.has("interaction_npc"):
		request_hint_display("interaction_npc", position)

func maybe_show_dialogue_hints(position: Vector2):
	"""Show dialogue hints when dialogue starts"""
	if not hint_history.has("dialogue_continue"):
		request_hint_display("dialogue_continue", position)

func maybe_show_quest_hints():
	"""Show quest hints when receiving first quest"""
	if not hint_history.has("quest_log") and has_active_quest():
		request_hint_display("quest_log")

func maybe_show_welcome_hints():
	"""Show welcome hints for new players"""
	if is_first_time_playing():
		request_hint_display("movement_basic")

func request_hint_display(hint_id: String, position: Vector2 = Vector2.ZERO):
	"""Request that a hint be displayed"""
	# Send signal to HintManager to display the hint
	get_parent().display_hint_by_id(hint_id, position)

func mark_hint_shown(hint_id: String):
	"""Mark a hint as having been shown"""
	if not hint_history.has(hint_id):
		hint_history.append(hint_id)
	
	# Record timing
	last_hint_times[hint_id] = Time.get_time_dict_from_system()["second"]

func reset_hint_history():
	"""Reset hint history (for testing)"""
	hint_history.clear()
	last_hint_times.clear()

func get_hint_history() -> Array[String]:
	"""Get the list of hints that have been shown"""
	return hint_history.duplicate()
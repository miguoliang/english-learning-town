extends Node

# Preload required classes
const HintData = preload("res://scripts/hints/HintData.gd")
const HintRegistry = preload("res://scripts/hints/HintRegistry.gd")
const HintDisplay = preload("res://scripts/hints/HintDisplay.gd")
const HintTrigger = preload("res://scripts/hints/HintTrigger.gd")

# HintManager - Central coordinator for hint system
# Orchestrates hint registry, display, and triggering components

signal hint_shown(hint_id: String)
signal hint_dismissed(hint_id: String)

# Hint types and priorities
enum HintPriority {
	LOW = 0,
	MEDIUM = 1,
	HIGH = 2,
	CRITICAL = 3
}

# Component references
var hint_registry: HintRegistry
var hint_display: HintDisplay
var hint_trigger: HintTrigger

# Data storage
var registered_hints: Dictionary = {}
var hint_history: Array[String] = []

# Settings
var hints_disabled: bool = false

func _ready():
	print("HintManager initialized")
	
	# Initialize components
	hint_registry = HintRegistry.new()
	hint_display = HintDisplay.new()
	hint_trigger = HintTrigger.new()
	
	add_child(hint_registry)
	add_child(hint_display)
	add_child(hint_trigger)
	
	# Connect component signals
	hint_display.hint_displayed.connect(_on_hint_displayed)
	hint_display.hint_dismissed.connect(_on_hint_dismissed)
	
	# Connect to tutorial system
	if TutorialManager:
		TutorialManager.tutorial_step_completed.connect(_on_tutorial_step_completed)


func show_hint(hint_id: String, position: Vector2 = Vector2.ZERO, target_node: Node = null, duration: float = -1.0) -> bool:
	"""Show a hint by ID"""
	if hints_disabled or not registered_hints.has(hint_id):
		return false
	
	var hint_data = registered_hints[hint_id]
	
	# Check if hint was already shown (for one-time hints)
	if hint_data.one_time_only and hint_history.has(hint_id):
		return false
	
	# Check conditions if any
	if not _check_hint_conditions(hint_data):
		return false
	
	# Display the hint using display component
	# TODO: Fix hint_display.display_hint method call
	# var tooltip = hint_display.display_hint(hint_data, position, duration)
	# if tooltip:
	#	hint_trigger.mark_hint_shown(hint_id)
	#	return true
	return false

func _check_hint_conditions(hint_data: HintData) -> bool:
	"""Check if hint conditions are met using the trigger component"""
	# TODO: Fix hint_trigger.check_hint_conditions method call
	# if hint_trigger and hint_trigger.has_method("check_hint_conditions"):
	#	return hint_trigger.check_hint_conditions(hint_data)
	return true

func show_contextual_hint(text: String, position: Vector2, title: String = "Tip", duration: float = -1.0) -> String:
	"""Show a quick contextual hint without pre-registration"""
	var hint_id = "contextual_" + str(Time.get_ticks_msec())
	var hint_data = HintData.new(hint_id, title, text, HintPriority.MEDIUM)
	hint_data.duration = duration if duration > 0 else 5.0
	
	# Display the hint directly
	# TODO: Fix hint_display.display_hint method call
	# var tooltip = hint_display.display_hint(hint_data, position, duration)
	# if tooltip:
	#	return hint_id
	return ""

func dismiss_hint(hint_id: String):
	"""Manually dismiss a specific hint"""
	# TODO: Fix hint_display.dismiss_hint method call
	# hint_display.dismiss_hint(hint_id)

func dismiss_all_hints():
	"""Dismiss all currently active hints"""
	# TODO: Fix hint_display.dismiss_all_hints method call
	# hint_display.dismiss_all_hints()

# Component event handlers
func _on_hint_displayed(hint_id: String):
	"""Handle hint display event"""
	hint_shown.emit(hint_id)

func _on_hint_dismissed(hint_id: String):
	"""Handle hint dismissal event"""
	hint_dismissed.emit(hint_id)




func _on_tutorial_step_completed(step_name: String):
	"""Handle tutorial step completion to show relevant hints"""
	hint_trigger.trigger_contextual_hint("tutorial_step_" + step_name)

# Public API
func enable_hints(enabled: bool):
	"""Enable or disable all hints"""
	hints_disabled = not enabled
	if hints_disabled:
		dismiss_all_hints()

func is_hint_active(hint_id: String) -> bool:
	"""Check if a specific hint is currently active"""
	return hint_display.is_hint_active(hint_id)

func get_active_hint_count() -> int:
	"""Get number of currently active hints"""
	return hint_display.get_active_hint_count()

func clear_hint_history():
	"""Clear hint history (for testing or reset)"""
	hint_trigger.reset_hint_history()

# Contextual hint helpers
func show_interaction_hint(target_node: Node):
	"""Show interaction hint near a target node"""
	if target_node:
		var pos = target_node.global_position + Vector2(50, -30)
		show_hint("interaction_npc", pos, target_node)

func show_movement_hint():
	"""Show movement hint"""
	show_hint("movement_basic", Vector2(100, 100))

func show_quest_hint():
	"""Show quest-related hint"""
	show_hint("quest_log", Vector2(get_viewport().get_visible_rect().size.x - 350, 100))

func display_hint_by_id(hint_id: String, position: Vector2 = Vector2.ZERO):
	"""Display a hint by ID - used by trigger component"""
	show_hint(hint_id, position)
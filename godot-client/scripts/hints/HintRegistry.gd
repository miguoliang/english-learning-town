extends Node
class_name HintRegistry

# HintRegistry - Manages hint registration and retrieval
# Centralizes hint data and provides access methods

var registered_hints: Dictionary = {}

func _ready():
	setup_predefined_hints()

func setup_predefined_hints():
	"""Setup common game hints"""
	# Movement hints
	register_hint("movement_basic", "Movement", "Use WASD or arrow keys to move around", HintManager.HintPriority.HIGH)
	register_hint("movement_running", "Running", "Hold SHIFT while moving to run faster", HintManager.HintPriority.MEDIUM)
	
	# Interaction hints
	register_hint("interaction_npc", "Talk to NPCs", "Press E or SPACE when near NPCs to start conversations", HintManager.HintPriority.HIGH)
	register_hint("interaction_range", "Get Closer", "Move closer to the NPC to interact with them", HintManager.HintPriority.MEDIUM)
	
	# Dialogue hints
	register_hint("dialogue_continue", "Continue Dialogue", "Press SPACE or ENTER to continue, ESC to close", HintManager.HintPriority.MEDIUM)
	register_hint("dialogue_responses", "Choose Response", "Use mouse or number keys to select your response", HintManager.HintPriority.MEDIUM)
	
	# Quest hints
	register_hint("quest_log", "Quest Information", "Check your quest panel on the right for current objectives", HintManager.HintPriority.MEDIUM)
	register_hint("quest_progress", "Quest Progress", "Complete objectives to advance through quests", HintManager.HintPriority.LOW)
	
	# UI hints
	register_hint("ui_menu", "Game Menu", "Click Menu to access settings and return to main menu", HintManager.HintPriority.LOW)
	register_hint("ui_experience", "Experience Points", "Talk to NPCs and complete quests to gain XP and level up", HintManager.HintPriority.LOW)

func register_hint(id: String, title: String, text: String, priority: HintManager.HintPriority = HintManager.HintPriority.MEDIUM) -> HintData:
	"""Register a hint for later use"""
	var hint = HintData.new(id, title, text, priority)
	registered_hints[id] = hint
	return hint

func get_hint(hint_id: String) -> HintData:
	"""Get a registered hint by ID"""
	return registered_hints.get(hint_id, null)

func has_hint(hint_id: String) -> bool:
	"""Check if a hint is registered"""
	return registered_hints.has(hint_id)

func get_all_hints() -> Dictionary:
	"""Get all registered hints"""
	return registered_hints.duplicate()

func unregister_hint(hint_id: String) -> bool:
	"""Remove a hint from registry"""
	if registered_hints.has(hint_id):
		registered_hints.erase(hint_id)
		return true
	return false
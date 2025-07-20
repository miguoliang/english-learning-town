extends Resource
class_name QuestObjective

# Objective details
@export var description: String = ""
@export var short_description: String = ""
@export var hint: String = ""

# Objective type and parameters
@export var objective_type: ObjectiveType = ObjectiveType.TALK_TO_NPC
@export var target_id: String = ""
@export var target_count: int = 1
@export var current_count: int = 0

# Completion tracking
@export var is_completed: bool = false
@export var is_optional: bool = false

# Learning elements
@export var required_phrases: Array[String] = []
@export var vocabulary_to_use: Array[String] = []

func set_required_phrases(phrases: Array[String]):
	required_phrases.clear()
	required_phrases.append_array(phrases)

func get_required_phrases() -> Array[String]:
	return required_phrases

func set_vocabulary_to_use(vocab: Array[String]):
	vocabulary_to_use.clear()
	vocabulary_to_use.append_array(vocab)

func get_vocabulary_to_use() -> Array[String]:
	return vocabulary_to_use

enum ObjectiveType {
	TALK_TO_NPC,        # Talk to a specific NPC
	GO_TO_LOCATION,     # Visit a specific location
	COLLECT_ITEM,       # Collect specific items
	BUY_ITEM,          # Purchase items from shops
	DELIVER_ITEM,      # Take item to location/NPC
	USE_VOCABULARY,    # Use specific words in conversation
	COMPLETE_DIALOGUE, # Complete a dialogue tree
	LEARN_GRAMMAR,     # Learn grammar concepts
	READ_TEXT,         # Read books/signs
	WRITE_TEXT         # Write letters/notes
}

func _init(desc: String = "", type: ObjectiveType = ObjectiveType.TALK_TO_NPC):
	description = desc
	objective_type = type

func check_completion() -> bool:
	if current_count >= target_count:
		is_completed = true
	return is_completed

func increment_progress(amount: int = 1):
	current_count = min(current_count + amount, target_count)
	check_completion()

func get_progress_text() -> String:
	if target_count == 1:
		return description
	else:
		return "%s (%d/%d)" % [description, current_count, target_count]

func get_completion_percentage() -> float:
	if target_count == 0:
		return 1.0
	return float(current_count) / float(target_count)

func to_dictionary() -> Dictionary:
	return {
		"description": description,
		"objective_type": objective_type,
		"target_id": target_id,
		"target_count": target_count,
		"current_count": current_count,
		"is_completed": is_completed,
		"required_phrases": required_phrases
	}

func from_dictionary(dict: Dictionary):
	description = dict.get("description", "")
	objective_type = dict.get("objective_type", ObjectiveType.TALK_TO_NPC)
	target_id = dict.get("target_id", "")
	target_count = dict.get("target_count", 1)
	current_count = dict.get("current_count", 0)
	is_completed = dict.get("is_completed", false)
	var phrases = dict.get("required_phrases", [])
	if phrases is Array:
		set_required_phrases(phrases as Array[String])
	else:
		set_required_phrases([])
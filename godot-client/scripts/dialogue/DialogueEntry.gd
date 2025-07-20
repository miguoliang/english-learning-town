extends Resource
class_name DialogueEntry

# Dialogue content
@export var speaker_name: String = ""
@export var text: String = ""
@export var audio_file: String = ""

# Dialogue type and behavior
@export var dialogue_type: DialogueType = DialogueType.STATEMENT
@export var emotion: Emotion = Emotion.NEUTRAL
@export var requires_response: bool = false

# Learning elements
@export var vocabulary_highlights: Array[String] = []
@export var grammar_points: Array[String] = []
@export var pronunciation_focus: Array[String] = []

# Branching and conditions
@export var response_options: Array[DialogueResponse] = []
@export var conditions: Array[DialogueCondition] = []
@export var next_dialogue_id: String = ""

# Quest integration
@export var triggers_quest: String = ""
@export var completes_objective: bool = false
@export var objective_type: QuestObjective.ObjectiveType
@export var objective_target: String = ""

# Effects and rewards
@export var friendship_change: int = 0
@export var teaches_vocabulary: Array[String] = []
@export var unlocks_dialogue: Array[String] = []

enum DialogueType {
	STATEMENT,      # Simple statement
	QUESTION,       # Asks a question
	GREETING,       # Greeting dialogue
	FAREWELL,       # Goodbye dialogue
	TEACHING,       # Educational content
	QUEST_GIVE,     # Gives a quest
	QUEST_COMPLETE, # Completes a quest
	SHOP,          # Shopping interaction
	INFORMATION    # Provides game info
}

enum Emotion {
	NEUTRAL,
	HAPPY,
	SAD,
	ANGRY,
	EXCITED,
	CONFUSED,
	FRIENDLY,
	SERIOUS
}

func _init(dialogue_text: String = "", speaker: String = ""):
	text = dialogue_text
	speaker_name = speaker

func set_vocabulary_highlights(vocab: Array[String]):
	vocabulary_highlights.clear()
	vocabulary_highlights.append_array(vocab)

func get_vocabulary_highlights() -> Array[String]:
	return vocabulary_highlights

func set_teaches_vocabulary(vocab: Array[String]):
	teaches_vocabulary = vocab

func get_teaches_vocabulary() -> Array[String]:
	return teaches_vocabulary

func is_available() -> bool:
	# Check all conditions
	for condition in conditions:
		if not condition.is_met():
			return false
	return true

func get_highlighted_text() -> String:
	var highlighted = text
	
	# Highlight vocabulary words
	for word in get_vocabulary_highlights():
		highlighted = highlighted.replace(word, "[color=yellow]" + word + "[/color]")
	
	return highlighted

func execute_effects():
	# Apply friendship changes
	if friendship_change != 0:
		# TODO: Apply to current NPC
		pass
	
	# Teach vocabulary
	for word in teaches_vocabulary:
		# TODO: Add to player vocabulary
		pass
	
	# Trigger quest
	if triggers_quest != "":
		QuestManager.start_quest(triggers_quest)
	
	# Complete objective
	if completes_objective:
		QuestManager.update_quest_objective("", objective_type, objective_target)

func to_dictionary() -> Dictionary:
	return {
		"speaker_name": speaker_name,
		"text": text,
		"dialogue_type": dialogue_type,
		"emotion": emotion,
		"vocabulary_highlights": vocabulary_highlights,
		"next_dialogue_id": next_dialogue_id,
		"triggers_quest": triggers_quest
	}

func from_dictionary(dict: Dictionary):
	speaker_name = dict.get("speaker_name", "")
	text = dict.get("text", "")
	dialogue_type = dict.get("dialogue_type", DialogueType.STATEMENT)
	emotion = dict.get("emotion", Emotion.NEUTRAL)
	var vocab = dict.get("vocabulary_highlights", [])
	if vocab is Array:
		set_vocabulary_highlights(vocab as Array[String])
	else:
		set_vocabulary_highlights([])
	next_dialogue_id = dict.get("next_dialogue_id", "")
	triggers_quest = dict.get("triggers_quest", "")
func set_response_options(responses: Array[DialogueResponse]):
	response_options.clear()
	response_options.append_array(responses)

func get_response_options() -> Array[DialogueResponse]:
	return response_options

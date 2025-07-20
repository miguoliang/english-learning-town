extends Resource
class_name DialogueResponse

# Response content
@export var text: String = ""
@export var leads_to_dialogue_id: String = ""

# Learning requirements
@export var required_vocabulary: Array[String] = []
@export var difficulty_level: int = 1
@export var learning_category: QuestData.LearningCategory = QuestData.LearningCategory.VOCABULARY

# Conditions and effects
@export var conditions: Array[DialogueCondition] = []
@export var friendship_change: int = 0
@export var is_correct_answer: bool = true
@export var provides_hint: bool = false

# Quest effects
@export var advances_quest: bool = false
@export var completes_objective: bool = false
@export var starts_new_quest: String = ""

func _init(response_text: String = "", next_id: String = ""):
	text = response_text
	leads_to_dialogue_id = next_id

func is_available() -> bool:
	# Check vocabulary requirements
	for word in required_vocabulary:
		# TODO: Check if player knows this word
		pass
	
	# Check conditions
	for condition in conditions:
		if not condition.is_met():
			return false
	
	return true

func execute_response():
	# Apply effects when this response is chosen
	if friendship_change != 0:
		# TODO: Apply to current NPC
		pass
	
	if starts_new_quest != "":
		QuestManager.start_quest(starts_new_quest)
	
	if completes_objective:
		# TODO: Complete current quest objective
		pass
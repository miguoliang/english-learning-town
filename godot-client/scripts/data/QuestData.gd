extends Resource
class_name QuestData

# Quest metadata
@export var id: String
@export var title: String
@export var description: String
@export var short_description: String

# Quest type and category
@export var quest_type: QuestType = QuestType.CONVERSATION
@export var learning_category: LearningCategory = LearningCategory.VOCABULARY

# Quest requirements and targets
@export var required_level: int = 1
@export var prerequisite_quests: Array[String] = []
@export var target_npc_id: String = ""
@export var target_location: String = ""

# Quest objectives
@export var objectives: Array[QuestObjective] = []
@export var current_objective_index: int = 0

# Quest state
@export var status: QuestStatus = QuestStatus.NOT_STARTED
@export var is_main_quest: bool = false
@export var is_daily_quest: bool = false

# Rewards
@export var experience_reward: int = 50
@export var money_reward: int = 10
@export var vocabulary_rewards: Array[String] = []
@export var item_rewards: Array[String] = []

# Learning content
@export var new_vocabulary: Array[String] = []
@export var grammar_focus: Array[String] = []
@export var dialogue_practice: Array[String] = []

func set_new_vocabulary(vocab: Array[String]):
	new_vocabulary = vocab

func get_new_vocabulary() -> Array[String]:
	return new_vocabulary

func set_objectives(objs: Array[QuestObjective]):
	objectives = objs

func get_objectives() -> Array[QuestObjective]:
	return objectives

func add_objective(objective: QuestObjective):
	objectives.append(objective)

func set_prerequisite_quests(prereqs: Array[String]):
	prerequisite_quests = prereqs

func get_prerequisite_quests() -> Array[String]:
	return prerequisite_quests

func set_vocabulary_rewards(rewards: Array[String]):
	vocabulary_rewards = rewards

func get_vocabulary_rewards() -> Array[String]:
	return vocabulary_rewards

func set_item_rewards(rewards: Array[String]):
	item_rewards = rewards

func get_item_rewards() -> Array[String]:
	return item_rewards

func set_grammar_focus(grammar: Array[String]):
	grammar_focus = grammar

func get_grammar_focus() -> Array[String]:
	return grammar_focus

func set_dialogue_practice(dialogue: Array[String]):
	dialogue_practice = dialogue

func get_dialogue_practice() -> Array[String]:
	return dialogue_practice

enum QuestType {
	CONVERSATION,    # Talk to NPCs
	DELIVERY,       # Take items between locations
	SHOPPING,       # Buy specific items
	EXPLORATION,    # Visit locations
	COLLECTION,     # Gather items/words
	LEARNING        # Complete educational activities
}

enum LearningCategory {
	VOCABULARY,
	GRAMMAR,
	SPEAKING,
	LISTENING,
	READING,
	WRITING,
	PRONUNCIATION
}

enum QuestStatus {
	NOT_STARTED,
	ACTIVE,
	COMPLETED,
	FAILED,
	TURNED_IN
}

func _init(quest_id: String = "", quest_title: String = ""):
	id = quest_id
	title = quest_title
	if get_objectives().is_empty():
		add_objective(QuestObjective.new())

func is_available() -> bool:
	# Check if player meets requirements
	if GameManager.get_player_level() < required_level:
		return false
	
	# Check prerequisite quests
	for prereq_id in get_prerequisite_quests():
		if not QuestManager.is_quest_completed(prereq_id):
			return false
	
	return status == QuestStatus.NOT_STARTED

func is_active() -> bool:
	return status == QuestStatus.ACTIVE

func is_completed() -> bool:
	return status == QuestStatus.COMPLETED or status == QuestStatus.TURNED_IN

func get_current_objective() -> QuestObjective:
	if current_objective_index < get_objectives().size():
		return get_objectives()[current_objective_index]
	return null

func advance_objective() -> bool:
	current_objective_index += 1
	if current_objective_index >= get_objectives().size():
		complete_quest()
		return true
	return false

func complete_quest():
	status = QuestStatus.COMPLETED
	print("Quest completed: ", title)

func to_dictionary() -> Dictionary:
	var dict = {
		"id": id,
		"title": title,
		"description": description,
		"quest_type": quest_type,
		"status": status,
		"current_objective_index": current_objective_index,
		"experience_reward": experience_reward,
		"money_reward": money_reward
	}
	return dict

func from_dictionary(dict: Dictionary):
	id = dict.get("id", "")
	title = dict.get("title", "")
	description = dict.get("description", "")
	quest_type = dict.get("quest_type", QuestType.CONVERSATION)
	status = dict.get("status", QuestStatus.NOT_STARTED)
	current_objective_index = dict.get("current_objective_index", 0)
	experience_reward = dict.get("experience_reward", 50)
	money_reward = dict.get("money_reward", 10)
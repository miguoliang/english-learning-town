extends Resource
class_name NPCData

# NPC Identity
@export var id: String
@export var name: String
@export var title: String = ""
@export var description: String = ""

# Appearance
@export var sprite_texture: Texture2D
@export var dialogue_portrait: Texture2D

# Location and Behavior
@export var location_id: String = ""
@export var position: Vector2 = Vector2.ZERO
@export var movement_type: MovementType = MovementType.STATIONARY

# Personality and Dialogue
@export var personality_traits: Array[String] = []
@export var greeting_messages: Array[String] = []
@export var default_dialogue: Array[DialogueEntry] = []
@export var quest_dialogues: Dictionary = {}

# Relationships
@export var friendship_level: int = 0
@export var max_friendship: int = 100
@export var relationship_status: RelationshipStatus = RelationshipStatus.STRANGER

# Schedule and Availability
@export var daily_schedule: Array[ScheduleEntry] = []
@export var is_always_available: bool = true
@export var available_days: Array[int] = [0, 1, 2, 3, 4, 5, 6]  # 0 = Sunday

# Teaching Specialization
@export var teaching_categories: Array[QuestData.LearningCategory] = []
@export var vocabulary_specialties: Array[String] = []
@export var can_give_quests: bool = false
@export var available_quests: Array[String] = []

enum MovementType {
	STATIONARY,     # Never moves
	PATROL,         # Walks back and forth
	WANDER,         # Random movement in area
	SCHEDULED       # Moves based on schedule
}

enum RelationshipStatus {
	STRANGER,
	ACQUAINTANCE,
	FRIEND,
	CLOSE_FRIEND,
	BEST_FRIEND
}

func _init(npc_id: String = "", npc_name: String = ""):
	id = npc_id
	name = npc_name

func set_default_dialogue(dialogue: Array[DialogueEntry]):
	default_dialogue = dialogue

func get_default_dialogue() -> Array[DialogueEntry]:
	var result: Array[DialogueEntry] = []
	for entry in default_dialogue:
		if entry is DialogueEntry:
			result.append(entry)
	return result

func set_available_quests(quests: Array[String]):
	available_quests = quests

func get_available_quests() -> Array[String]:
	return available_quests

func set_vocabulary_specialties(vocab: Array[String]):
	vocabulary_specialties = vocab

func get_vocabulary_specialties() -> Array[String]:
	return vocabulary_specialties

func get_current_dialogue() -> Array[DialogueEntry]:
	# Check for quest-specific dialogue first
	var active_quest = QuestManager.get_current_active_quest()
	if active_quest and quest_dialogues.has(active_quest.id):
		var quest_dialogue = quest_dialogues[active_quest.id]
		if quest_dialogue is Array:
			return quest_dialogue as Array[DialogueEntry]
	
	# Ensure we always return a properly typed Array[DialogueEntry]
	var result: Array[DialogueEntry] = []
	for entry in default_dialogue:
		if entry is DialogueEntry:
			result.append(entry)
	return result

func get_greeting() -> String:
	if greeting_messages.is_empty():
		return "Hello there!"
	
	# Choose greeting based on relationship level
	var greeting_index = min(friendship_level / 20, greeting_messages.size() - 1)
	return greeting_messages[greeting_index]

func increase_friendship(amount: int = 5):
	friendship_level = min(friendship_level + amount, max_friendship)
	update_relationship_status()

func update_relationship_status():
	if friendship_level >= 80:
		relationship_status = RelationshipStatus.BEST_FRIEND
	elif friendship_level >= 60:
		relationship_status = RelationshipStatus.CLOSE_FRIEND
	elif friendship_level >= 40:
		relationship_status = RelationshipStatus.FRIEND
	elif friendship_level >= 20:
		relationship_status = RelationshipStatus.ACQUAINTANCE
	else:
		relationship_status = RelationshipStatus.STRANGER

func is_available_now() -> bool:
	if is_always_available:
		return true
	
	var current_time = Time.get_datetime_dict_from_system()
	var current_day = current_time.weekday
	var current_hour = current_time.hour
	
	# Check if available today
	if current_day not in available_days:
		return false
	
	# Check schedule
	for schedule_entry in daily_schedule:
		if schedule_entry.start_hour <= current_hour and current_hour < schedule_entry.end_hour:
			return schedule_entry.is_available
	
	return false

func get_display_name() -> String:
	if title != "":
		return title + " " + name
	return name

func to_dictionary() -> Dictionary:
	return {
		"id": id,
		"name": name,
		"friendship_level": friendship_level,
		"relationship_status": relationship_status,
		"location_id": location_id,
		"position": {"x": position.x, "y": position.y}
	}

func from_dictionary(dict: Dictionary):
	id = dict.get("id", "")
	name = dict.get("name", "")
	friendship_level = dict.get("friendship_level", 0)
	relationship_status = dict.get("relationship_status", RelationshipStatus.STRANGER)
	location_id = dict.get("location_id", "")
	
	var pos_dict = dict.get("position", {"x": 0, "y": 0})
	position = Vector2(pos_dict.x, pos_dict.y)

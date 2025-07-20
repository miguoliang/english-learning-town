extends Node

# QuestManager - Central quest system management
# Singleton autoload that handles all quest logic, progression, and state

signal quest_started(quest: QuestData)
signal quest_completed(quest: QuestData)
signal quest_objective_completed(quest: QuestData, objective: QuestObjective)
signal quest_failed(quest: QuestData)
signal active_quest_changed(quest: QuestData)

@export var debug_mode: bool = true

# Quest storage
var all_quests: Dictionary = {}
var active_quests: Array[QuestData] = []
var completed_quests: Array[String] = []
var available_quests: Array[String] = []

# Current tracking
var current_active_quest: QuestData = null
var daily_quests_completed_today: int = 0
var last_daily_reset_date: String = ""

func _ready():
	if debug_mode:
		print("QuestManager initialized")
	
	# Initialize quest system
	load_all_quests()
	load_quest_progress()
	check_daily_quest_reset()
	update_available_quests()

# Quest Management
func load_all_quests():
	# Create starter quests
	create_starter_quests()
	
	if debug_mode:
		print("Loaded %d quests total" % all_quests.size())

func create_starter_quests():
	# Welcome quest - first conversation
	var welcome_quest = QuestData.new("welcome", "Welcome to English Learning Town!")
	welcome_quest.description = "Welcome to our friendly town! Let's start by learning how to greet people. Find the teacher at the school and practice saying hello."
	welcome_quest.short_description = "Learn basic greetings"
	welcome_quest.quest_type = QuestData.QuestType.CONVERSATION
	welcome_quest.learning_category = QuestData.LearningCategory.SPEAKING
	welcome_quest.target_npc_id = "teacher"
	welcome_quest.target_location = "school"
	welcome_quest.is_main_quest = true
	welcome_quest.experience_reward = 100
	welcome_quest.money_reward = 20
	welcome_quest.set_new_vocabulary(["hello", "good morning", "nice to meet you", "welcome"])
	
	var obj1 = QuestObjective.new("Go to the school building", QuestObjective.ObjectiveType.GO_TO_LOCATION)
	obj1.target_id = "school"
	obj1.hint = "Look for the building with books and desks!"
	
	var obj2 = QuestObjective.new("Talk to the teacher", QuestObjective.ObjectiveType.TALK_TO_NPC)
	obj2.target_id = "teacher"
	obj2.set_required_phrases(["Hello", "Good morning", "Nice to meet you"])
	obj2.hint = "Try greeting the teacher politely!"
	
	welcome_quest.set_objectives([obj1, obj2])
	add_quest(welcome_quest)
	
	# Shopping quest - learn numbers and items
	var shopping_quest = QuestData.new("first_shopping", "Your First Shopping Trip")
	shopping_quest.description = "The teacher asked you to buy some school supplies. Go to the shop and practice asking for items and using numbers."
	shopping_quest.short_description = "Buy school supplies"
	shopping_quest.quest_type = QuestData.QuestType.SHOPPING
	shopping_quest.learning_category = QuestData.LearningCategory.VOCABULARY
	shopping_quest.target_npc_id = "shopkeeper"
	shopping_quest.target_location = "shop"
	shopping_quest.set_prerequisite_quests(["welcome"])
	shopping_quest.experience_reward = 75
	shopping_quest.money_reward = 15
	shopping_quest.set_new_vocabulary(["pencil", "book", "eraser", "how much", "please", "thank you"])
	
	var shop_obj1 = QuestObjective.new("Go to the shop", QuestObjective.ObjectiveType.GO_TO_LOCATION)
	shop_obj1.target_id = "shop"
	
	var shop_obj2 = QuestObjective.new("Buy a pencil", QuestObjective.ObjectiveType.BUY_ITEM)
	shop_obj2.target_id = "pencil"
	shop_obj2.set_vocabulary_to_use(["please", "how much", "thank you"])
	
	var shop_obj3 = QuestObjective.new("Buy a book", QuestObjective.ObjectiveType.BUY_ITEM)
	shop_obj3.target_id = "book"
	
	shopping_quest.set_objectives([shop_obj1, shop_obj2, shop_obj3])
	add_quest(shopping_quest)
	
	# Delivery quest - learn directions
	var delivery_quest = QuestData.new("delivery_mission", "Special Delivery")
	delivery_quest.description = "The shopkeeper has a package for the teacher. Help deliver it and learn how to ask for and give directions."
	delivery_quest.short_description = "Deliver package to teacher"
	delivery_quest.quest_type = QuestData.QuestType.DELIVERY
	delivery_quest.learning_category = QuestData.LearningCategory.VOCABULARY
	delivery_quest.set_prerequisite_quests(["first_shopping"])
	delivery_quest.experience_reward = 60
	delivery_quest.money_reward = 12
	delivery_quest.set_new_vocabulary(["package", "delivery", "left", "right", "straight", "behind", "next to"])
	
	var del_obj1 = QuestObjective.new("Get the package from the shopkeeper", QuestObjective.ObjectiveType.TALK_TO_NPC)
	del_obj1.target_id = "shopkeeper"
	
	var del_obj2 = QuestObjective.new("Deliver the package to the teacher", QuestObjective.ObjectiveType.DELIVER_ITEM)
	del_obj2.target_id = "teacher"
	del_obj2.set_vocabulary_to_use(["delivery", "package", "here you are"])
	
	delivery_quest.set_objectives([del_obj1, del_obj2])
	add_quest(delivery_quest)
	
	if debug_mode:
		print("Created starter quests: welcome, first_shopping, delivery_mission")

func add_quest(quest: QuestData):
	all_quests[quest.id] = quest
	if debug_mode:
		print("Added quest: ", quest.title)

func start_quest(quest_id: String) -> bool:
	if not all_quests.has(quest_id):
		if debug_mode:
			print("Quest not found: ", quest_id)
		return false
	
	var quest = all_quests[quest_id]
	
	if not quest.is_available():
		if debug_mode:
			print("Quest not available: ", quest.title)
		return false
	
	quest.status = QuestData.QuestStatus.ACTIVE
	active_quests.append(quest)
	
	if current_active_quest == null:
		current_active_quest = quest
		active_quest_changed.emit(quest)
	
	quest_started.emit(quest)
	
	if debug_mode:
		print("Started quest: ", quest.title)
	
	return true

func complete_quest(quest_id: String) -> bool:
	if not all_quests.has(quest_id):
		return false
	
	var quest = all_quests[quest_id]
	
	if quest.status != QuestData.QuestStatus.ACTIVE:
		return false
	
	quest.status = QuestData.QuestStatus.COMPLETED
	completed_quests.append(quest_id)
	active_quests.erase(quest)
	
	# Give rewards
	give_quest_rewards(quest)
	
	# Update active quest
	if current_active_quest == quest:
		current_active_quest = get_next_active_quest()
		if current_active_quest:
			active_quest_changed.emit(current_active_quest)
	
	quest_completed.emit(quest)
	update_available_quests()
	
	if debug_mode:
		print("Completed quest: ", quest.title)
	
	return true

func update_quest_objective(quest_id: String, objective_type: QuestObjective.ObjectiveType, target_id: String = "", amount: int = 1) -> bool:
	if not all_quests.has(quest_id):
		return false
	
	var quest = all_quests[quest_id]
	if quest.status != QuestData.QuestStatus.ACTIVE:
		return false
	
	var current_obj = quest.get_current_objective()
	if not current_obj:
		return false
	
	# Check if this update matches the current objective
	if current_obj.objective_type == objective_type and (target_id == "" or current_obj.target_id == target_id):
		current_obj.increment_progress(amount)
		
		if current_obj.is_completed:
			quest_objective_completed.emit(quest, current_obj)
			
			# Advance to next objective or complete quest
			if quest.advance_objective():
				complete_quest(quest_id)
			
			if debug_mode:
				print("Completed objective: ", current_obj.description)
		
		return true
	
	return false

func give_quest_rewards(quest: QuestData):
	if quest.experience_reward > 0:
		GameManager.add_experience(quest.experience_reward)
	
	if quest.money_reward > 0:
		GameManager.add_money(quest.money_reward)
	
	# Add vocabulary to player's collection
	for word in quest.get_new_vocabulary():
		# TODO: Add to vocabulary collection system
		pass

func update_available_quests():
	available_quests.clear()
	
	for quest_id in all_quests.keys():
		var quest = all_quests[quest_id]
		if quest.is_available():
			available_quests.append(quest_id)
	
	if debug_mode:
		print("Available quests: ", available_quests.size())

func get_available_quests() -> Array[QuestData]:
	var quests: Array[QuestData] = []
	for quest_id in available_quests:
		var quest = all_quests[quest_id]
		if quest is QuestData:
			quests.append(quest as QuestData)
	return quests

func get_active_quests() -> Array[QuestData]:
	return active_quests

func get_current_active_quest() -> QuestData:
	return current_active_quest

func get_next_active_quest() -> QuestData:
	if active_quests.size() > 0:
		return active_quests[0]
	return null

func is_quest_completed(quest_id: String) -> bool:
	return quest_id in completed_quests

func is_quest_active(quest_id: String) -> bool:
	for quest in active_quests:
		if quest.id == quest_id:
			return true
	return false

func get_quest(quest_id: String) -> QuestData:
	return all_quests.get(quest_id, null)

# Save/Load System
func save_quest_progress():
	var save_data = {
		"completed_quests": completed_quests,
		"daily_quests_completed": daily_quests_completed_today,
		"last_daily_reset": last_daily_reset_date,
		"active_quests": []
	}
	
	# Save active quest progress
	for quest in active_quests:
		save_data.active_quests.append(quest.to_dictionary())
	
	var config = ConfigFile.new()
	config.set_value("quests", "progress", save_data)
	
	var error = config.save("user://quest_progress.cfg")
	if error == OK and debug_mode:
		print("Quest progress saved")

func load_quest_progress():
	var config = ConfigFile.new()
	var error = config.load("user://quest_progress.cfg")
	
	if error != OK:
		# First time - start welcome quest
		start_quest("welcome")
		return
	
	var save_data = config.get_value("quests", "progress", {})
	
	completed_quests = save_data.get("completed_quests", [])
	daily_quests_completed_today = save_data.get("daily_quests_completed", 0)
	last_daily_reset_date = save_data.get("last_daily_reset", "")
	
	# Restore active quests
	var active_quest_data = save_data.get("active_quests", [])
	for quest_dict in active_quest_data:
		var quest_id = quest_dict.get("id", "")
		if all_quests.has(quest_id):
			var quest = all_quests[quest_id]
			if quest is QuestData:
				quest.from_dictionary(quest_dict)
				quest.status = QuestData.QuestStatus.ACTIVE
				active_quests.append(quest as QuestData)
	
	if active_quests.size() > 0:
		current_active_quest = active_quests[0]
	
	if debug_mode:
		print("Loaded quest progress: %d completed, %d active" % [completed_quests.size(), active_quests.size()])

func check_daily_quest_reset():
	var current_date = Time.get_date_string_from_system()
	if last_daily_reset_date != current_date:
		daily_quests_completed_today = 0
		last_daily_reset_date = current_date
		if debug_mode:
			print("Daily quests reset for: ", current_date)

extends NPCData
class_name ShopkeeperData

func _init():
	# Basic info
	id = "shopkeeper"
	name = "Mr. Smith"
	title = "Shopkeeper"
	description = "A cheerful shopkeeper who runs the local store."
	
	# Location
	location_id = "shop"
	position = Vector2(600, 400)  # Position in shop
	
	# Personality
	personality_traits = ["friendly", "helpful", "business-minded", "patient"]
	
	# Greetings
	greeting_messages = [
		"Welcome to my shop! How can I help you?",
		"Hello again! What would you like to buy today?",
		"Good to see you! I have some great items for you!",
		"Welcome back, my friend! What can I get for you?",
		"Hello there! You're becoming a regular customer!"
	]
	
	# Teaching specialization
	teaching_categories = [
		QuestData.LearningCategory.VOCABULARY,
		QuestData.LearningCategory.SPEAKING
	]
	vocabulary_specialties = ["shopping", "numbers", "money", "items", "politeness"]
	
	# Can give quests
	can_give_quests = true
	available_quests = ["first_shopping", "delivery_mission"]
	
	# Schedule (shop hours)
	var morning_hours = ScheduleEntry.new(9, 12, "shop", true)
	morning_hours.activity = "serving customers"
	var afternoon_hours = ScheduleEntry.new(13, 18, "shop", true)
	afternoon_hours.activity = "serving customers"
	daily_schedule = [morning_hours, afternoon_hours]
	
	# Setup dialogues
	setup_default_dialogue()
	setup_quest_dialogues()

func setup_default_dialogue():
	# Create a properly typed array for dialogue entries
	var dialogue_entries: Array[DialogueEntry] = []
	
	# Greeting
	var greeting = DialogueEntry.new()
	greeting.speaker_name = name
	greeting.text = "Hello! Welcome to my shop! I sell many useful items. You can buy pencils, books, erasers, and more!"
	greeting.dialogue_type = DialogueEntry.DialogueType.GREETING
	greeting.emotion = DialogueEntry.Emotion.FRIENDLY
	greeting.set_vocabulary_highlights(["shop", "sell", "items", "buy", "pencils", "books", "erasers"])
	greeting.set_teaches_vocabulary(["shop", "sell", "item", "buy", "pencil", "book", "eraser"])
	greeting.friendship_change = 3
	dialogue_entries.append(greeting)
	
	# Shop information
	var shop_info = DialogueEntry.new()
	shop_info.speaker_name = name
	shop_info.text = "When you want to buy something, just say 'I would like to buy...' and then tell me what you need. Don't forget to say 'please' and 'thank you'!"
	shop_info.dialogue_type = DialogueEntry.DialogueType.TEACHING
	shop_info.set_vocabulary_highlights(["buy", "I would like", "please", "thank you"])
	shop_info.set_teaches_vocabulary(["buy", "would like", "please", "thank you", "polite"])
	
	# Response options
	var response1 = DialogueResponse.new("I would like to buy a pencil, please.", "")
	response1.friendship_change = 5
	response1.is_correct_answer = true
	
	var response2 = DialogueResponse.new("Give me a pencil.", "")
	response2.friendship_change = -1
	response2.is_correct_answer = false
	
	var response3 = DialogueResponse.new("How much does a book cost?", "")
	response3.leads_to_dialogue_id = "price_info"
	
	shop_info.set_response_options([response1, response2, response3])
	shop_info.requires_response = true
	dialogue_entries.append(shop_info)
	
	# Price information
	var price_info = DialogueEntry.new()
	price_info.speaker_name = name
	price_info.text = "Great question! A pencil costs $2, a book costs $5, and an eraser costs $1. Very affordable!"
	price_info.dialogue_type = DialogueEntry.DialogueType.INFORMATION
	price_info.set_vocabulary_highlights(["costs", "pencil", "book", "eraser", "affordable"])
	price_info.set_teaches_vocabulary(["cost", "price", "dollar", "affordable", "cheap"])
	dialogue_entries.append(price_info)
	
	# Set the properly typed dialogue array
	set_default_dialogue(dialogue_entries)

func setup_quest_dialogues():
	quest_dialogues = {}
	
	# First shopping quest
	var shopping_dialogue: Array[DialogueEntry] = []
	
	var shopping_start = DialogueEntry.new()
	shopping_start.speaker_name = name
	shopping_start.text = "Ah, the teacher sent you! She asked me to help you practice shopping. Let's learn how to buy things politely!"
	shopping_start.dialogue_type = DialogueEntry.DialogueType.QUEST_GIVE
	shopping_start.emotion = DialogueEntry.Emotion.HAPPY
	shopping_start.set_vocabulary_highlights(["teacher", "practice", "shopping", "buy", "politely"])
	shopping_start.set_teaches_vocabulary(["practice", "shopping", "politely", "customer"])
	shopping_dialogue.append(shopping_start)
	
	var shopping_lesson = DialogueEntry.new()
	shopping_lesson.speaker_name = name
	shopping_lesson.text = "To be polite when shopping, say: 'I would like to buy [item], please.' Then I'll tell you the price, and you say 'Here you are' when you pay, and 'Thank you!'"
	shopping_lesson.dialogue_type = DialogueEntry.DialogueType.TEACHING
	shopping_lesson.set_vocabulary_highlights(["polite", "I would like to buy", "please", "price", "Here you are", "Thank you"])
	shopping_lesson.set_teaches_vocabulary(["polite", "would like", "price", "pay", "here you are"])
	shopping_lesson.completes_objective = true
	shopping_lesson.objective_type = QuestObjective.ObjectiveType.TALK_TO_NPC
	shopping_lesson.objective_target = "shopkeeper"
	shopping_dialogue.append(shopping_lesson)
	
	quest_dialogues["first_shopping"] = shopping_dialogue
	
	# Delivery quest
	var delivery_dialogue = []
	
	var delivery_start = DialogueEntry.new()
	delivery_start.speaker_name = name
	delivery_start.text = "Perfect timing! I have a package that needs to be delivered to the teacher. Could you help me? This will be great practice for giving and receiving directions!"
	delivery_start.dialogue_type = DialogueEntry.DialogueType.QUEST_GIVE
	delivery_start.emotion = DialogueEntry.Emotion.EXCITED
	delivery_start.triggers_quest = "delivery_mission"
	delivery_start.set_vocabulary_highlights(["package", "delivered", "teacher", "directions"])
	delivery_start.set_teaches_vocabulary(["package", "deliver", "direction", "help"])
	delivery_dialogue.append(delivery_start)
	
	var delivery_instruction = DialogueEntry.new()
	delivery_instruction.speaker_name = name
	delivery_instruction.text = "Here's the package. Take it to the teacher at the school. The school is north of here - go straight up from my shop. Tell her 'I have a delivery for you' when you arrive!"
	delivery_instruction.dialogue_type = DialogueEntry.DialogueType.INFORMATION
	delivery_instruction.set_vocabulary_highlights(["package", "school", "north", "straight up", "delivery"])
	delivery_instruction.set_teaches_vocabulary(["north", "straight", "delivery", "arrive"])
	delivery_instruction.completes_objective = true
	delivery_instruction.objective_type = QuestObjective.ObjectiveType.COLLECT_ITEM
	delivery_instruction.objective_target = "package"
	delivery_dialogue.append(delivery_instruction)
	
	quest_dialogues["delivery_mission"] = delivery_dialogue
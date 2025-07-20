extends NPCData
class_name TeacherData

func _init():
	# Basic info
	id = "teacher"
	name = "Ms. Johnson"
	title = "Teacher"
	description = "A friendly English teacher who loves helping students learn."
	
	# Location
	location_id = "school"
	position = Vector2(400, 300)  # Position in school
	
	# Personality
	personality_traits = ["patient", "encouraging", "educational", "helpful"]
	
	# Greetings based on relationship level
	greeting_messages = [
		"Hello there! Welcome to our school!",
		"Hi! Nice to see you again!",
		"Good morning! Ready to learn something new?",
		"Hello, my dear student! How are you today?",
		"Welcome back! I'm so happy to see you!"
	]
	
	# Teaching specialization
	teaching_categories = [
		QuestData.LearningCategory.GRAMMAR,
		QuestData.LearningCategory.SPEAKING,
		QuestData.LearningCategory.VOCABULARY
	]
	vocabulary_specialties = ["greetings", "school", "education", "manners"]
	
	# Can give quests
	can_give_quests = true
	available_quests = ["welcome"]
	
	# Default dialogue
	setup_default_dialogue()
	setup_quest_dialogues()

func setup_default_dialogue():
	# Create a properly typed array for dialogue entries
	var dialogue_entries: Array[DialogueEntry] = []
	
	# Greeting
	var greeting = DialogueEntry.new()
	greeting.speaker_name = name
	greeting.text = "Hello! I'm Ms. Johnson, the English teacher here. I love helping students learn English!"
	greeting.dialogue_type = DialogueEntry.DialogueType.GREETING
	greeting.emotion = DialogueEntry.Emotion.FRIENDLY
	greeting.set_vocabulary_highlights(["teacher", "English", "students", "learn"])
	greeting.set_teaches_vocabulary(["teacher", "English", "student", "learn"])
	greeting.friendship_change = 5
	dialogue_entries.append(greeting)
	
	# Information about school
	var info = DialogueEntry.new()
	info.speaker_name = name
	info.text = "This is our school! Here you can learn grammar, practice speaking, and improve your vocabulary. Would you like to start with some basic lessons?"
	info.dialogue_type = DialogueEntry.DialogueType.INFORMATION
	info.set_vocabulary_highlights(["school", "grammar", "speaking", "vocabulary", "lessons"])
	info.set_teaches_vocabulary(["school", "grammar", "speaking", "vocabulary", "lesson"])
	
	# Add response options
	var response1 = DialogueResponse.new("Yes, I'd love to learn!", "")
	response1.friendship_change = 3
	response1.is_correct_answer = true
	
	var response2 = DialogueResponse.new("Maybe later, thank you.", "")
	response2.friendship_change = 1
	
	var response3 = DialogueResponse.new("What kind of lessons do you have?", "")
	response3.leads_to_dialogue_id = "lesson_info"
	
	info.set_response_options([response1, response2, response3])
	info.requires_response = true
	dialogue_entries.append(info)
	
	# Lesson information
	var lesson_info = DialogueEntry.new()
	lesson_info.speaker_name = name
	lesson_info.text = "I teach many things! Grammar helps you make correct sentences. Vocabulary helps you learn new words. Speaking practice helps you talk confidently!"
	lesson_info.dialogue_type = DialogueEntry.DialogueType.TEACHING
	lesson_info.set_vocabulary_highlights(["grammar", "sentences", "vocabulary", "words", "speaking", "practice"])
	lesson_info.set_teaches_vocabulary(["grammar", "sentence", "vocabulary", "word", "speaking", "practice", "confident"])
	lesson_info.next_dialogue_id = ""
	dialogue_entries.append(lesson_info)
	
	# Set the properly typed dialogue array
	set_default_dialogue(dialogue_entries)

func setup_quest_dialogues():
	quest_dialogues = {}
	
	# Welcome quest dialogue
	var welcome_dialogue: Array[DialogueEntry] = []
	
	var welcome_start = DialogueEntry.new()
	welcome_start.speaker_name = name
	welcome_start.text = "Oh, a new student! Welcome to English Learning Town! I'm so excited to meet you. Let's start with the basics - learning how to greet people properly."
	welcome_start.dialogue_type = DialogueEntry.DialogueType.QUEST_GIVE
	welcome_start.emotion = DialogueEntry.Emotion.EXCITED
	welcome_start.triggers_quest = "welcome"
	welcome_start.set_vocabulary_highlights(["welcome", "student", "excited", "greet", "properly"])
	welcome_start.set_teaches_vocabulary(["welcome", "student", "excited", "greet", "properly", "basic"])
	welcome_dialogue.append(welcome_start)
	
	var welcome_instruction = DialogueEntry.new()
	welcome_instruction.speaker_name = name
	welcome_instruction.text = "First, let me teach you some important greetings: 'Hello', 'Good morning', and 'Nice to meet you'. Practice saying these to me!"
	welcome_instruction.dialogue_type = DialogueEntry.DialogueType.TEACHING
	welcome_instruction.set_vocabulary_highlights(["Hello", "Good morning", "Nice to meet you", "practice"])
	welcome_instruction.set_teaches_vocabulary(["hello", "good morning", "nice to meet you", "practice"])
	welcome_instruction.completes_objective = true
	welcome_instruction.objective_type = QuestObjective.ObjectiveType.TALK_TO_NPC
	welcome_instruction.objective_target = "teacher"
	welcome_dialogue.append(welcome_instruction)
	
	quest_dialogues["welcome"] = welcome_dialogue

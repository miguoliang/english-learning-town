# TestDialogueSystem.gd
# Unit tests for DialogueEntry, DialogueResponse, and dialogue flow

extends GdUnitTestSuite

var dialogue_entry: DialogueEntry
var dialogue_response: DialogueResponse
var dialogue_condition: DialogueCondition

func before_test():
	dialogue_entry = DialogueEntry.new()
	dialogue_response = DialogueResponse.new()
	dialogue_condition = DialogueCondition.new()

func after_test():
	if dialogue_entry:
		dialogue_entry = null
	if dialogue_response:
		dialogue_response = null
	if dialogue_condition:
		dialogue_condition = null

func test_dialogue_entry_creation():
	var entry = DialogueEntry.new("Hello there!", "Teacher")
	
	assert_that(entry.text).is_equal("Hello there!")
	assert_that(entry.speaker_name).is_equal("Teacher")
	assert_that(entry.dialogue_type).is_equal(DialogueEntry.DialogueType.STATEMENT)
	assert_that(entry.emotion).is_equal(DialogueEntry.Emotion.NEUTRAL)

func test_dialogue_entry_vocabulary_highlighting():
	var entry = DialogueEntry.new("Let's learn some new words today!", "Teacher")
	entry.set_vocabulary_highlights(["learn", "words"])
	
	var highlighted_text = entry.get_highlighted_text()
	assert_that(highlighted_text).contains("[color=yellow]learn[/color]")
	assert_that(highlighted_text).contains("[color=yellow]words[/color]")

func test_dialogue_response_creation():
	var response = DialogueResponse.new("Yes, I would like to learn!", "next_dialogue")
	
	assert_that(response.text).is_equal("Yes, I would like to learn!")
	assert_that(response.leads_to_dialogue_id).is_equal("next_dialogue")
	assert_that(response.is_correct_answer).is_true()

func test_dialogue_response_availability():
	var response = DialogueResponse.new("Advanced response", "")
	response.required_vocabulary = ["advanced", "vocabulary"]
	
	# Should be available (we're not checking vocabulary in mock)
	assert_that(response.is_available()).is_true()

func test_dialogue_condition_quest_active():
	var condition = DialogueCondition.new()
	condition.condition_type = DialogueCondition.ConditionType.QUEST_ACTIVE
	condition.target_value = "welcome"
	
	# Mock QuestManager for test
	var mock_quest_manager = MockQuestManager.new()
	mock_quest_manager.active_quests_dict["welcome"] = true
	
	# Would need to inject mock - for now just test structure
	assert_that(condition.condition_type).is_equal(DialogueCondition.ConditionType.QUEST_ACTIVE)
	assert_that(condition.target_value).is_equal("welcome")

func test_dialogue_condition_player_level():
	var condition = DialogueCondition.new()
	condition.condition_type = DialogueCondition.ConditionType.PLAYER_LEVEL
	condition.comparison_operator = DialogueCondition.ComparisonOperator.GREATER_EQUAL
	condition.required_amount = 5
	
	# Test comparison logic
	assert_that(condition.compare_values(5, 5)).is_true()  # 5 >= 5
	assert_that(condition.compare_values(6, 5)).is_true()  # 6 >= 5
	assert_that(condition.compare_values(4, 5)).is_false() # 4 >= 5

func test_dialogue_entry_with_responses():
	var entry = DialogueEntry.new("What would you like to do?", "Teacher")
	entry.requires_response = true
	
	var response1 = DialogueResponse.new("I want to learn grammar", "grammar_lesson")
	response1.friendship_change = 5
	
	var response2 = DialogueResponse.new("I want to practice speaking", "speaking_lesson")
	response2.friendship_change = 3
	
	entry.set_response_options([response1, response2])
	
	assert_that(entry.response_options.size()).is_equal(2)
	assert_that(entry.requires_response).is_true()
	assert_that(entry.response_options[0].friendship_change).is_equal(5)

func test_dialogue_entry_quest_integration():
	var entry = DialogueEntry.new("I have a quest for you!", "Teacher")
	entry.dialogue_type = DialogueEntry.DialogueType.QUEST_GIVE
	entry.triggers_quest = "welcome"
	entry.completes_objective = true
	entry.objective_type = QuestObjective.ObjectiveType.TALK_TO_NPC
	entry.objective_target = "teacher"
	
	assert_that(entry.triggers_quest).is_equal("welcome")
	assert_that(entry.completes_objective).is_true()
	assert_that(entry.objective_type).is_equal(QuestObjective.ObjectiveType.TALK_TO_NPC)

func test_dialogue_entry_teaching_content():
	var entry = DialogueEntry.new("Today we'll learn greetings: Hello, Hi, Good morning!", "Teacher")
	entry.dialogue_type = DialogueEntry.DialogueType.TEACHING
	entry.set_vocabulary_highlights(["Hello", "Hi", "Good morning"])
	entry.teaches_vocabulary = ["hello", "hi", "good morning", "greeting"]
	entry.grammar_points = ["capitalization", "punctuation"]
	
	assert_that(entry.dialogue_type).is_equal(DialogueEntry.DialogueType.TEACHING)
	assert_that(entry.teaches_vocabulary).contains("hello")
	assert_that(entry.grammar_points).contains("capitalization")

func test_dialogue_serialization():
	var entry = DialogueEntry.new("Test dialogue", "Speaker")
	entry.dialogue_type = DialogueEntry.DialogueType.GREETING
	entry.emotion = DialogueEntry.Emotion.HAPPY
	entry.set_vocabulary_highlights(["test", "dialogue"])
	
	var dict = entry.to_dictionary()
	assert_that(dict["text"]).is_equal("Test dialogue")
	assert_that(dict["speaker_name"]).is_equal("Speaker")
	assert_that(dict["dialogue_type"]).is_equal(DialogueEntry.DialogueType.GREETING)
	
	var new_entry = DialogueEntry.new()
	new_entry.from_dictionary(dict)
	assert_that(new_entry.text).is_equal("Test dialogue")
	assert_that(new_entry.speaker_name).is_equal("Speaker")

func test_teacher_dialogue_structure():
	var teacher_data = TeacherData.new()
	
	assert_that(teacher_data.default_dialogue).is_not_empty()
	assert_that(teacher_data.quest_dialogues.has("welcome")).is_true()
	
	var welcome_dialogue = teacher_data.quest_dialogues["welcome"]
	assert_that(welcome_dialogue).is_not_empty()
	assert_that(welcome_dialogue[0].triggers_quest).is_equal("welcome")

func test_shopkeeper_dialogue_structure():
	var shopkeeper_data = ShopkeeperData.new()
	
	assert_that(shopkeeper_data.default_dialogue).is_not_empty()
	assert_that(shopkeeper_data.quest_dialogues.has("first_shopping")).is_true()
	
	var shopping_dialogue = shopkeeper_data.quest_dialogues["first_shopping"]
	assert_that(shopping_dialogue).is_not_empty()

func test_dialogue_emotion_and_type_combinations():
	# Test various dialogue type and emotion combinations
	var greeting = DialogueEntry.new("Hello!", "NPC")
	greeting.dialogue_type = DialogueEntry.DialogueType.GREETING
	greeting.emotion = DialogueEntry.Emotion.FRIENDLY
	
	var question = DialogueEntry.new("How are you?", "NPC")
	question.dialogue_type = DialogueEntry.DialogueType.QUESTION
	question.emotion = DialogueEntry.Emotion.CURIOUS
	
	var teaching = DialogueEntry.new("Let me teach you this...", "Teacher")
	teaching.dialogue_type = DialogueEntry.DialogueType.TEACHING
	teaching.emotion = DialogueEntry.Emotion.SERIOUS
	
	assert_that(greeting.emotion).is_equal(DialogueEntry.Emotion.FRIENDLY)
	assert_that(question.dialogue_type).is_equal(DialogueEntry.DialogueType.QUESTION)
	assert_that(teaching.dialogue_type).is_equal(DialogueEntry.DialogueType.TEACHING)

# Mock class for testing
class MockQuestManager:
	var active_quests_dict = {}
	
	func is_quest_active(quest_id: String) -> bool:
		return active_quests_dict.get(quest_id, false)
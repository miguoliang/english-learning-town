extends RefCounted
class_name QuestionData

# Question data structure matching the Go backend model

var id: String = ""
var question: String = ""
var option_a: String = ""
var option_b: String = ""
var option_c: String = ""
var option_d: String = ""
var correct_answer: String = ""
var difficulty: String = "easy"
var reward: int = 10
var category: String = "general"

func _init(data: Dictionary = {}):
	from_dictionary(data)

func from_dictionary(data: Dictionary):
	if data.has("id"):
		id = data.id
	if data.has("question"):
		question = data.question
	if data.has("option_a"):
		option_a = data.option_a
	if data.has("option_b"):
		option_b = data.option_b
	if data.has("option_c"):
		option_c = data.option_c
	if data.has("option_d"):
		option_d = data.option_d
	if data.has("correct_answer"):
		correct_answer = data.correct_answer
	if data.has("difficulty"):
		difficulty = data.difficulty
	if data.has("reward"):
		reward = data.reward
	if data.has("category"):
		category = data.category

func to_dictionary() -> Dictionary:
	return {
		"id": id,
		"question": question,
		"option_a": option_a,
		"option_b": option_b,
		"option_c": option_c,
		"option_d": option_d,
		"correct_answer": correct_answer,
		"difficulty": difficulty,
		"reward": reward,
		"category": category
	}

func is_answer_correct(answer: String) -> bool:
	return answer.to_lower() == correct_answer.to_lower()
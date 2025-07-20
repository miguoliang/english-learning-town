extends RefCounted
class_name PlayerData

# Player data structure matching the Go backend model

var id: String = ""
var name: String = ""
var gender: String = ""
var money: int = 100
var level: int = 1
var experience: int = 0
var current_scenario: String = "town_center"
var created_at: String = ""
var updated_at: String = ""

func _init(data: Dictionary = {}):
	if data.has("id"):
		id = data.id
	if data.has("name"):
		name = data.name
	if data.has("gender"):
		gender = data.gender
	if data.has("money"):
		money = data.money
	if data.has("level"):
		level = data.level
	if data.has("experience"):
		experience = data.experience
	if data.has("current_scenario"):
		current_scenario = data.current_scenario
	if data.has("created_at"):
		created_at = data.created_at
	if data.has("updated_at"):
		updated_at = data.updated_at

func to_dictionary() -> Dictionary:
	return {
		"id": id,
		"name": name,
		"gender": gender,
		"money": money,
		"level": level,
		"experience": experience,
		"current_scenario": current_scenario,
		"created_at": created_at,
		"updated_at": updated_at
	}

func from_dictionary(data: Dictionary):
	if data.has("id"):
		id = data.id
	if data.has("name"):
		name = data.name
	if data.has("gender"):
		gender = data.gender
	if data.has("money"):
		money = data.money
	if data.has("level"):
		level = data.level
	if data.has("experience"):
		experience = data.experience
	if data.has("current_scenario"):
		current_scenario = data.current_scenario
	if data.has("created_at"):
		created_at = data.created_at
	if data.has("updated_at"):
		updated_at = data.updated_at

func get_experience_to_next_level() -> int:
	# Simple leveling formula: level * 100 experience needed
	var experience_needed = level * 100
	return experience_needed - experience

func can_level_up() -> bool:
	return experience >= level * 100

func level_up():
	if can_level_up():
		experience -= level * 100
		level += 1

func add_experience(amount: int):
	experience += amount
	# Auto level up if possible
	while can_level_up():
		level_up()

func add_money(amount: int):
	money += amount
	# Ensure money doesn't go below 0
	if money < 0:
		money = 0

func can_afford(cost: int) -> bool:
	return money >= cost

func spend_money(amount: int) -> bool:
	if can_afford(amount):
		money -= amount
		return true
	return false
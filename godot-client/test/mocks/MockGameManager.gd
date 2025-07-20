# MockGameManager.gd
# Mock implementation of GameManager for testing

extends Node

signal player_data_changed(player_data)

var current_player = null
var is_player_logged_in = false
var player_level = 1
var player_money = 100
var player_experience = 0

func _init():
	name = "GameManager"
	
	# Create mock player data
	current_player = MockPlayerData.new()
	is_player_logged_in = true

func get_player_level() -> int:
	return player_level

func get_player_money() -> int:
	return player_money

func get_player_experience() -> int:
	return player_experience

func add_experience(amount: int):
	player_experience += amount
	print("Mock: Added %d experience (total: %d)" % [amount, player_experience])

func add_money(amount: int):
	player_money += amount
	current_player.money = player_money
	print("Mock: Added $%d (total: $%d)" % [amount, player_money])

func get_player_display_name() -> String:
	return "Test Player"

class MockPlayerData:
	var id = "test_player_123"
	var name = "Test Player"
	var level = 1
	var money = 100
	var experience = 0
	var gender = "male"
	var current_scenario = "town_center"
	
	func to_dictionary() -> Dictionary:
		return {
			"id": id,
			"name": name,
			"level": level,
			"money": money,
			"experience": experience,
			"gender": gender,
			"current_scenario": current_scenario
		}
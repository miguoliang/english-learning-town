extends Node

# GameManager - Central game state management
# Singleton autoload that manages player data, game state, and API communication

signal player_data_changed(player_data: PlayerData)
signal scenario_changed(new_scenario: String)
signal money_changed(new_amount: int)
signal level_changed(new_level: int)
signal experience_changed(new_experience: int)
signal game_error(error_message: String)

@export var debug_mode: bool = true

var current_player: PlayerData
var is_player_logged_in: bool = false
var current_scenario: String = "town_center"

# Cache for offline play
var cached_questions: Array[QuestionData] = []
var is_online: bool = true

func _ready():
	if debug_mode:
		print("GameManager initialized")
	
	# Connect to API client signals
	APIClient.player_created.connect(_on_player_created)
	APIClient.player_data_received.connect(_on_player_data_received)
	APIClient.player_updated.connect(_on_player_updated)
	APIClient.error_occurred.connect(_on_api_error)
	APIClient.health_check_completed.connect(_on_health_check_completed)
	
	# Check API health on startup
	APIClient.check_health()
	
	# Load cached player data
	load_player_from_cache()

# Player Management
func create_new_player(player_name: String, gender: String):
	if player_name.strip_edges() == "":
		game_error.emit("Player name cannot be empty")
		return
	
	if gender not in ["male", "female"]:
		game_error.emit("Invalid gender selection")
		return
	
	if debug_mode:
		print("Creating new player: ", player_name, " (", gender, ")")
	
	APIClient.create_player(player_name, gender)

func load_player(player_id: String):
	if player_id.strip_edges() == "":
		game_error.emit("Player ID cannot be empty")
		return
	
	if debug_mode:
		print("Loading player: ", player_id)
	
	APIClient.get_player(player_id)

func update_player_progress(money_change: int = 0, level_change: int = 0, experience_change: int = 0, new_scenario: String = ""):
	if not is_player_logged_in:
		game_error.emit("No player logged in")
		return
	
	var updates = {}
	
	if money_change != 0:
		var new_money = current_player.money + money_change
		updates["money"] = new_money
	
	if level_change != 0:
		var new_level = current_player.level + level_change
		updates["level"] = new_level
	
	if experience_change != 0:
		var new_experience = current_player.experience + experience_change
		updates["experience"] = new_experience
	
	if new_scenario != "":
		updates["current_scenario"] = new_scenario
	
	if updates.size() > 0:
		if debug_mode:
			print("Updating player progress: ", updates)
		APIClient.update_player(current_player.id, updates)

func logout_player():
	current_player = null
	is_player_logged_in = false
	clear_player_cache()
	if debug_mode:
		print("Player logged out")

# Game State Management
func change_scenario(new_scenario: String):
	if current_scenario != new_scenario:
		current_scenario = new_scenario
		scenario_changed.emit(new_scenario)
		
		if is_player_logged_in:
			update_player_progress(0, 0, 0, new_scenario)

func add_money(amount: int):
	if is_player_logged_in:
		update_player_progress(amount)

func add_experience(amount: int):
	if is_player_logged_in:
		update_player_progress(0, 0, amount)

func can_afford(cost: int) -> bool:
	return is_player_logged_in and current_player.money >= cost

func spend_money(amount: int) -> bool:
	if can_afford(amount):
		add_money(-amount)
		return true
	return false

# Question Management
func get_random_question(difficulty: String = "easy", category: String = "general"):
	if is_online:
		APIClient.get_random_question(difficulty, category)
	else:
		# Use cached questions for offline play
		var matching_questions = cached_questions.filter(func(q): return q.difficulty == difficulty and q.category == category)
		if matching_questions.size() > 0:
			var random_question = matching_questions[randi() % matching_questions.size()]
			APIClient.question_received.emit(random_question.to_dictionary())

# Data Persistence
func save_player_to_cache():
	if current_player:
		var config = ConfigFile.new()
		config.set_value("player", "id", current_player.id)
		config.set_value("player", "data", current_player.to_dictionary())
		
		var save_path = "user://player_cache.cfg"
		var error = config.save(save_path)
		
		if error == OK and debug_mode:
			print("Player data cached successfully")

func load_player_from_cache():
	var config = ConfigFile.new()
	var error = config.load("user://player_cache.cfg")
	
	if error == OK:
		var player_id = config.get_value("player", "id", "")
		var player_data = config.get_value("player", "data", {})
		
		if player_id != "" and player_data.size() > 0:
			current_player = PlayerData.new(player_data)
			is_player_logged_in = true
			player_data_changed.emit(current_player)
			
			if debug_mode:
				print("Loaded cached player: ", current_player.name)
			
			# Try to refresh from server
			if is_online:
				load_player(player_id)

func clear_player_cache():
	var file = FileAccess.open("user://player_cache.cfg", FileAccess.WRITE)
	if file:
		file.close()
	
	# Remove the file
	DirAccess.remove_absolute("user://player_cache.cfg")

# API Event Handlers
func _on_player_created(player_data: Dictionary):
	current_player = PlayerData.new(player_data)
	is_player_logged_in = true
	save_player_to_cache()
	player_data_changed.emit(current_player)
	
	if debug_mode:
		print("Player created successfully: ", current_player.name)

func _on_player_data_received(player_data: Dictionary):
	current_player = PlayerData.new(player_data)
	is_player_logged_in = true
	save_player_to_cache()
	player_data_changed.emit(current_player)
	
	if debug_mode:
		print("Player data received: ", current_player.name)

func _on_player_updated(player_data: Dictionary):
	var old_money = current_player.money if current_player else 0
	var old_level = current_player.level if current_player else 1
	var old_experience = current_player.experience if current_player else 0
	var old_scenario = current_player.current_scenario if current_player else ""
	
	current_player = PlayerData.new(player_data)
	save_player_to_cache()
	player_data_changed.emit(current_player)
	
	# Emit specific change signals
	if old_money != current_player.money:
		money_changed.emit(current_player.money)
	
	if old_level != current_player.level:
		level_changed.emit(current_player.level)
	
	if old_experience != current_player.experience:
		experience_changed.emit(current_player.experience)
	
	if old_scenario != current_player.current_scenario:
		scenario_changed.emit(current_player.current_scenario)
	
	if debug_mode:
		print("Player data updated: ", current_player.name)

func _on_api_error(error_message: String):
	game_error.emit(error_message)
	if debug_mode:
		print("API Error: ", error_message)

func _on_health_check_completed(is_healthy: bool):
	is_online = is_healthy
	if debug_mode:
		print("API Health Check: ", "Online" if is_healthy else "Offline")
	
	if not is_healthy:
		game_error.emit("Cannot connect to server. Some features may be unavailable.")

# Utility Functions
func get_player_display_name() -> String:
	return current_player.name if is_player_logged_in else "Guest"

func get_player_money() -> int:
	return current_player.money if is_player_logged_in else 0

func get_player_level() -> int:
	return current_player.level if is_player_logged_in else 1

func get_player_experience() -> int:
	return current_player.experience if is_player_logged_in else 0

func get_current_scenario() -> String:
	if is_player_logged_in:
		return current_player.current_scenario
	return current_scenario

# Application lifecycle
func _notification(what):
	match what:
		NOTIFICATION_WM_CLOSE_REQUEST:
			save_player_to_cache()
		NOTIFICATION_APPLICATION_PAUSED:
			save_player_to_cache()
		NOTIFICATION_APPLICATION_FOCUS_OUT:
			save_player_to_cache()

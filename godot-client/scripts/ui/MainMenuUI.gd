extends Control

# Main Menu UI Controller
# Handles login, player creation, and main menu navigation

@onready var login_panel: Panel = $LoginPanel
@onready var create_player_panel: Panel = $CreatePlayerPanel
@onready var main_menu_panel: Panel = $MainMenuPanel
@onready var loading_indicator: Panel = $LoadingIndicator
@onready var error_label: Label = $ErrorLabel

# Login panel controls
@onready var player_id_input: LineEdit = $LoginPanel/VBoxContainer/PlayerIdInput
@onready var login_button: Button = $LoginPanel/VBoxContainer/LoginButton
@onready var create_new_player_button: Button = $LoginPanel/VBoxContainer/CreateNewPlayerButton

# Create player panel controls
@onready var player_name_input: LineEdit = $CreatePlayerPanel/VBoxContainer/PlayerNameInput
@onready var gender_option: OptionButton = $CreatePlayerPanel/VBoxContainer/GenderOption
@onready var create_player_button: Button = $CreatePlayerPanel/VBoxContainer/CreatePlayerButton
@onready var back_to_login_button: Button = $CreatePlayerPanel/VBoxContainer/BackToLoginButton

# Main menu panel controls
@onready var welcome_label: Label = $MainMenuPanel/VBoxContainer/WelcomeLabel
@onready var player_stats_label: Label = $MainMenuPanel/VBoxContainer/PlayerStatsLabel
@onready var start_game_button: Button = $MainMenuPanel/VBoxContainer/StartGameButton
@onready var view_stats_button: Button = $MainMenuPanel/VBoxContainer/ViewStatsButton
@onready var logout_button: Button = $MainMenuPanel/VBoxContainer/LogoutButton

func _ready():
	setup_ui()
	connect_signals()
	
	# Check if player is already logged in
	if GameManager.is_player_logged_in:
		show_main_menu()
	else:
		show_login_panel()

func setup_ui():
	# Setup gender options
	gender_option.clear()
	gender_option.add_item("Male")
	gender_option.add_item("Female")
	
	# Hide all panels initially
	hide_all_panels()
	clear_error()

func connect_signals():
	# Login panel signals
	login_button.pressed.connect(_on_login_button_pressed)
	create_new_player_button.pressed.connect(_on_create_new_player_button_pressed)
	
	# Create player panel signals
	create_player_button.pressed.connect(_on_create_player_button_pressed)
	back_to_login_button.pressed.connect(_on_back_to_login_button_pressed)
	
	# Main menu panel signals
	start_game_button.pressed.connect(_on_start_game_button_pressed)
	view_stats_button.pressed.connect(_on_view_stats_button_pressed)
	logout_button.pressed.connect(_on_logout_button_pressed)
	
	# Game manager signals
	GameManager.player_data_changed.connect(_on_player_data_changed)
	GameManager.game_error.connect(_on_game_error)
	
	# API client signals
	APIClient.player_stats_received.connect(_on_player_stats_received)

# Panel management
func hide_all_panels():
	login_panel.visible = false
	create_player_panel.visible = false
	main_menu_panel.visible = false
	loading_indicator.visible = false

func show_login_panel():
	hide_all_panels()
	login_panel.visible = true
	clear_error()
	player_id_input.grab_focus()

func show_create_player_panel():
	hide_all_panels()
	create_player_panel.visible = true
	clear_error()
	player_name_input.grab_focus()

func show_main_menu():
	hide_all_panels()
	main_menu_panel.visible = true
	update_main_menu_ui()
	clear_error()

func show_loading(show: bool):
	loading_indicator.visible = show

# Button handlers
func _on_login_button_pressed():
	var player_id = player_id_input.text.strip_edges()
	
	if player_id == "":
		show_error("Please enter a Player ID")
		return
	
	show_loading(true)
	GameManager.load_player(player_id)

func _on_create_new_player_button_pressed():
	show_create_player_panel()

func _on_create_player_button_pressed():
	var player_name = player_name_input.text.strip_edges()
	
	if player_name == "":
		show_error("Please enter a player name")
		return
	
	var gender = "male" if gender_option.selected == 0 else "female"
	
	show_loading(true)
	GameManager.create_new_player(player_name, gender)

func _on_back_to_login_button_pressed():
	show_login_panel()

func _on_start_game_button_pressed():
	# Transition to town exploration scene
	get_tree().change_scene_to_file("res://scenes/TownExploration.tscn")

func _on_view_stats_button_pressed():
	if GameManager.is_player_logged_in:
		show_loading(true)
		APIClient.get_player_stats(GameManager.current_player.id)

func _on_logout_button_pressed():
	GameManager.logout_player()
	show_login_panel()

# Event handlers
func _on_player_data_changed(player_data: PlayerData):
	show_loading(false)
	show_main_menu()

func _on_game_error(error_message: String):
	show_loading(false)
	show_error(error_message)

func _on_player_stats_received(stats: Dictionary):
	show_loading(false)
	
	var stats_text = "Player Statistics:\n"
	stats_text += "Total Interactions: " + str(stats.get("total_interactions", 0)) + "\n"
	stats_text += "Correct Answers: " + str(stats.get("correct_answers", 0)) + "\n"
	stats_text += "Total Money Earned: $" + str(stats.get("total_money_earned", 0)) + "\n"
	stats_text += "Accuracy: " + str(stats.get("accuracy_percentage", 0.0)) + "%"
	
	show_error(stats_text)  # Using error label to display stats

# UI updates
func update_main_menu_ui():
	if not GameManager.is_player_logged_in:
		return
	
	var player_data = GameManager.current_player
	
	welcome_label.text = "Welcome back, " + player_data.name + "!"
	
	var stats_text = "Level: " + str(player_data.level) + "\n"
	stats_text += "Money: $" + str(player_data.money) + "\n"
	stats_text += "Experience: " + str(player_data.experience) + "\n"
	stats_text += "Current Scenario: " + player_data.current_scenario
	
	player_stats_label.text = stats_text

func show_error(message: String):
	error_label.text = message
	error_label.visible = message != ""
	
	# Auto-hide error after 5 seconds
	if message != "":
		await get_tree().create_timer(5.0).timeout
		if error_label.text == message:  # Only hide if message hasn't changed
			clear_error()

func clear_error():
	error_label.text = ""
	error_label.visible = false

# Input handling
func _input(event):
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_ENTER:
				if login_panel.visible and player_id_input.has_focus():
					_on_login_button_pressed()
				elif create_player_panel.visible and (player_name_input.has_focus() or gender_option.has_focus()):
					_on_create_player_button_pressed()
			KEY_ESCAPE:
				if create_player_panel.visible:
					_on_back_to_login_button_pressed()
				elif main_menu_panel.visible:
					# Could open pause menu or settings
					pass

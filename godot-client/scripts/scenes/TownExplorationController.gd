extends Node2D

@onready var player: PlayerController = $Player
@onready var camera: Camera2D = $Camera2D
@onready var hud_top_panel = $UI/HUD/TopPanel/HBoxContainer
@onready var player_name_label = $UI/HUD/TopPanel/HBoxContainer/PlayerNameLabel
@onready var money_label = $UI/HUD/TopPanel/HBoxContainer/MoneyLabel
@onready var level_label = $UI/HUD/TopPanel/HBoxContainer/LevelLabel
@onready var experience_label = $UI/HUD/TopPanel/HBoxContainer/ExperienceLabel
@onready var scenario_label = $UI/HUD/BottomPanel/HBoxContainer/ScenarioLabel
@onready var menu_button = $UI/HUD/BottomPanel/HBoxContainer/MenuButton
@onready var interact_button = $UI/HUD/BottomPanel/HBoxContainer/InteractButton

# Quest UI elements
@onready var quest_panel = $UI/HUD/QuestPanel
@onready var current_quest_title = $UI/HUD/QuestPanel/QuestContainer/CurrentQuestTitle
@onready var current_objective = $UI/HUD/QuestPanel/QuestContainer/CurrentObjective
@onready var objective_progress = $UI/HUD/QuestPanel/QuestContainer/ObjectiveProgress
@onready var quest_log_button = $UI/HUD/QuestPanel/QuestContainer/QuestLogButton

# Dialogue UI
@onready var dialogue_ui: DialogueUI = $UI/DialogueUI

# NPCs
@onready var npcs_node = $NPCs

# NPC Manager
var npc_manager: Node

func _ready():
	initialize_scene()
	setup_camera()
	connect_ui_elements()
	update_hud()
	setup_quest_ui()
	setup_npcs()

func initialize_scene():
	print("TownExploration scene initialized")
	scenario_label.text = "Town Center"
	
	# Position player at spawn point
	player.position = Vector2(0, 0)
	camera.position = Vector2(0, 0)
	print("Player positioned at: ", player.position)
	print("Camera positioned at: ", camera.position)
	print("Player sprite visible: ", player.get_node("Sprite2D").visible)
	print("Player sprite modulate: ", player.get_node("Sprite2D").modulate)

func setup_camera():
	camera.enabled = true
	
	var tween = create_tween()
	tween.set_loops()
	tween.tween_method(_update_camera_position, camera.global_position, player.global_position, 0.1)
	tween.tween_callback(_update_camera_position.bind(player.global_position))

func _update_camera_position(pos: Vector2):
	camera.global_position = pos

func _process(_delta):
	if player:
		camera.global_position = player.global_position

func connect_ui_elements():
	menu_button.pressed.connect(_on_menu_button_pressed)
	interact_button.pressed.connect(_on_interact_button_pressed)
	quest_log_button.pressed.connect(_on_quest_log_button_pressed)
	
	if GameManager.player_data_changed.is_connected(update_hud):
		GameManager.player_data_changed.disconnect(update_hud)
	GameManager.player_data_changed.connect(update_hud)

func update_hud():
	if GameManager.is_player_logged_in and GameManager.current_player:
		player_name_label.text = GameManager.current_player.name
		money_label.text = "Money: $" + str(GameManager.current_player.money)
		level_label.text = "Level: " + str(GameManager.current_player.level)
		experience_label.text = "XP: " + str(GameManager.current_player.experience) + "/" + str(GameManager.current_player.level * 100)
		print("HUD updated with player data")
	else:
		player_name_label.text = "Guest"
		money_label.text = "Money: $0"
		level_label.text = "Level: 1"
		experience_label.text = "XP: 0/100"
		print("HUD updated with default data")

func _on_menu_button_pressed():
	print("Menu button pressed")
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func _on_interact_button_pressed():
	if player:
		player.try_interact()

func _on_quest_log_button_pressed():
	print("Quest log button pressed - TODO: Open quest log window")

func setup_quest_ui():
	# Connect to quest manager signals
	QuestManager.quest_started.connect(_on_quest_started)
	QuestManager.quest_completed.connect(_on_quest_completed)
	QuestManager.quest_objective_completed.connect(_on_quest_objective_completed)
	QuestManager.active_quest_changed.connect(_on_active_quest_changed)
	
	# Update UI with current quest
	update_quest_ui()

func update_quest_ui():
	var current_quest = QuestManager.get_current_active_quest()
	
	if current_quest == null:
		current_quest_title.text = "No active quest"
		current_objective.text = "Explore the town and look for people to talk to!"
		objective_progress.visible = false
		return
	
	current_quest_title.text = current_quest.title
	
	var current_obj = current_quest.get_current_objective()
	if current_obj:
		current_objective.text = current_obj.get_progress_text()
		objective_progress.visible = true
		objective_progress.value = current_obj.get_completion_percentage() * 100
		
		# Add hint if available
		if current_obj.hint != "":
			current_objective.text += "\n💡 " + current_obj.hint
	else:
		current_objective.text = "Quest completed - return to quest giver!"
		objective_progress.visible = false

func _on_quest_started(quest: QuestData):
	print("Quest started: ", quest.title)
	update_quest_ui()
	
	# Show brief notification
	show_quest_notification("New Quest: " + quest.title, Color.GREEN)

func _on_quest_completed(quest: QuestData):
	print("Quest completed: ", quest.title)
	update_quest_ui()
	
	# Show completion notification
	show_quest_notification("Quest Completed: " + quest.title, Color.GOLD)
	
	# Show rewards
	var reward_text = "Rewards: "
	if quest.experience_reward > 0:
		reward_text += str(quest.experience_reward) + " XP "
	if quest.money_reward > 0:
		reward_text += "$" + str(quest.money_reward)
	show_quest_notification(reward_text, Color.CYAN)

func _on_quest_objective_completed(quest: QuestData, objective: QuestObjective):
	print("Objective completed: ", objective.description)
	update_quest_ui()
	
	# Show objective completion
	show_quest_notification("✓ " + objective.description, Color.LIGHT_GREEN)

func _on_active_quest_changed(quest: QuestData):
	update_quest_ui()

func show_quest_notification(text: String, color: Color):
	# TODO: Create a proper notification system
	print("NOTIFICATION: ", text)

func setup_npcs():
	# Create NPC Manager
	npc_manager = preload("res://scripts/managers/NPCManager.gd").new()
	add_child(npc_manager)
	
	# Register all NPCs
	var teacher = npcs_node.get_node("Teacher")
	if teacher:
		npc_manager.register_npc(teacher, "teacher")
		# Add to player group for interaction
		teacher.add_to_group("npcs")
		# Connect dialogue signals
		teacher.dialogue_started.connect(_on_npc_dialogue_started)
		teacher.dialogue_ended.connect(_on_npc_dialogue_ended)
	
	var shopkeeper = npcs_node.get_node("Shopkeeper")
	if shopkeeper:
		npc_manager.register_npc(shopkeeper, "shopkeeper")
		shopkeeper.add_to_group("npcs")
		# Connect dialogue signals
		shopkeeper.dialogue_started.connect(_on_npc_dialogue_started)
		shopkeeper.dialogue_ended.connect(_on_npc_dialogue_ended)
	
	# Connect dialogue UI signals
	dialogue_ui.dialogue_continued.connect(_on_dialogue_continued)
	dialogue_ui.dialogue_response_selected.connect(_on_dialogue_response_selected)
	dialogue_ui.dialogue_closed.connect(_on_dialogue_closed)
	
	print("NPCs setup completed")

# Dialogue system handlers
func _on_npc_dialogue_started(npc: NPC):
	"""Handle when an NPC starts dialogue"""
	print("TownController: Dialogue started with ", npc.npc_data.name)
	if npc.current_dialogue_tree.size() > 0:
		var dialogue_entry = npc.current_dialogue_tree[npc.current_dialogue_index]
		dialogue_ui.show_dialogue(npc, dialogue_entry)
	else:
		# Create fallback dialogue
		var fallback = DialogueEntry.new(npc.get_fallback_dialogue(), npc.npc_data.name)
		dialogue_ui.show_dialogue(npc, fallback)

func _on_npc_dialogue_ended(npc: NPC):
	"""Handle when NPC dialogue ends"""
	# Ensure player movement is re-enabled
	if player:
		player.enable_movement(true)

func _on_dialogue_continued():
	"""Handle dialogue continuation"""
	# Find current NPC in dialogue
	var current_npc = dialogue_ui.current_npc
	if current_npc and current_npc.is_in_dialogue:
		current_npc.advance_dialogue()

func _on_dialogue_response_selected(response: DialogueResponse):
	"""Handle player response selection"""
	# Execute response effects
	response.execute_effects()
	
	# Find current NPC and continue dialogue
	var current_npc = dialogue_ui.current_npc
	if current_npc and current_npc.is_in_dialogue:
		current_npc.handle_response(response)

func _on_dialogue_closed():
	"""Handle dialogue being closed"""
	var current_npc = dialogue_ui.current_npc
	if current_npc:
		current_npc.end_dialogue()

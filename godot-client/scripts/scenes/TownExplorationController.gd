extends Node2D

@onready var player: PlayerController = $Player
@onready var camera: Camera2D = $Player/Camera2D
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

# Quest log window
var quest_log_window: QuestLogWindow

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
	setup_quest_log_window()
	setup_npcs()
	
	# Set initial game state
	if GameStateManager:
		GameStateManager.set_state(GameStateManager.GameState.PLAYING)

func initialize_scene():
	print("TownExploration scene initialized")
	scenario_label.text = "Town Center"
	
	# Position player at spawn point
	player.position = Vector2(0, 0)
	print("Player positioned at: ", player.position)
	print("Player sprite visible: ", player.get_node("Sprite2D").visible)
	print("Player sprite modulate: ", player.get_node("Sprite2D").modulate)

func setup_camera():
	camera.enabled = true

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
	if quest_log_window:
		quest_log_window.show_quest_log()
	else:
		print("Quest log window not initialized")

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
	
	# Show quest started notification
	if has_node("/root/NotificationManager"):
		get_node("/root/NotificationManager").show_quest_started(quest.title)

func _on_quest_completed(quest: QuestData):
	print("Quest completed: ", quest.title)
	update_quest_ui()
	
	# Show quest completion notification with rewards
	if has_node("/root/NotificationManager"):
		get_node("/root/NotificationManager").show_quest_completed(quest.title, quest.experience_reward, quest.money_reward)

func _on_quest_objective_completed(quest: QuestData, objective: QuestObjective):
	print("Objective completed: ", objective.description)
	update_quest_ui()
	
	# Show objective completion notification
	if has_node("/root/NotificationManager"):
		var completed_count = 0
		for obj in quest.objectives:
			if obj.is_completed:
				completed_count += 1
		var progress_percentage = (completed_count / float(quest.objectives.size())) * 100.0
		get_node("/root/NotificationManager").show_objective_completed(objective.description, progress_percentage)

func _on_active_quest_changed(quest: QuestData):
	update_quest_ui()

func show_quest_notification(text: String, color: Color):
	"""Show quest notification using the notification system"""
	if has_node("/root/NotificationManager"):
		# Determine notification type based on color
		var title = "Quest Update"
		if color == Color.GREEN:
			title = "New Quest!"
		elif color == Color.GOLD:
			title = "Quest Complete!"
		elif color == Color.LIGHT_GREEN:
			title = "Objective Complete!"
		elif color == Color.CYAN:
			title = "Reward!"
		
		get_node("/root/NotificationManager").show_custom_notification(title, text, 5.0)
	else:
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
	
	# Notify GameStateManager of dialogue mode
	if GameStateManager:
		GameStateManager.start_dialogue()
	
	if npc.current_dialogue_tree.size() > 0:
		var dialogue_entry = npc.current_dialogue_tree[npc.current_dialogue_index]
		dialogue_ui.show_dialogue(npc, dialogue_entry)
	else:
		# Create fallback dialogue
		var fallback = DialogueEntry.new(npc.get_fallback_dialogue(), npc.npc_data.name)
		dialogue_ui.show_dialogue(npc, fallback)

func _on_npc_dialogue_ended(npc: NPC):
	"""Handle when NPC dialogue ends"""
	# Notify GameStateManager that dialogue ended
	if GameStateManager:
		GameStateManager.end_dialogue()
	
	# Ensure player movement is re-enabled (handled by GameStateManager now)
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

func setup_quest_log_window():
	"""Initialize the quest log window"""
	var quest_log_scene = load("res://scenes/QuestLogWindow.tscn")
	if quest_log_scene:
		quest_log_window = quest_log_scene.instantiate()
		add_child(quest_log_window)
		
		# Connect quest log signals
		quest_log_window.quest_selected.connect(_on_quest_selected)
		quest_log_window.quest_tracked.connect(_on_quest_tracked)
		quest_log_window.window_closed.connect(_on_quest_log_closed)
	else:
		print("Warning: Could not load QuestLogWindow.tscn")

func _on_quest_selected(quest: QuestData):
	"""Handle quest selection in quest log"""
	print("Quest selected: %s" % quest.title)

func _on_quest_tracked(quest_id: String):
	"""Handle quest tracking change"""
	print("Now tracking quest: %s" % quest_id)
	update_quest_ui()

func _on_quest_log_closed():
	"""Handle quest log window being closed"""
	print("Quest log closed")

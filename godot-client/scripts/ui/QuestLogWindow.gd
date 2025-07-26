extends Control
class_name QuestLogWindow

# QuestLogWindow - Main coordinator for quest log functionality
# Orchestrates quest list and details display components

signal quest_selected(quest: QuestData)
signal quest_tracked(quest_id: String)
signal window_closed()

# UI node references
@onready var quest_log_panel: Panel = $QuestLogPanel
@onready var close_button: Button = $QuestLogPanel/VBoxContainer/HeaderContainer/CloseButton
@onready var quest_list: VBoxContainer = $QuestLogPanel/VBoxContainer/ContentContainer/QuestListPanel/QuestListContainer/QuestListScroll/QuestList
@onready var quest_title_label: Label = $QuestLogPanel/VBoxContainer/ContentContainer/QuestDetailsPanel/QuestDetailsContainer/QuestTitleLabel
@onready var quest_description_label: RichTextLabel = $QuestLogPanel/VBoxContainer/ContentContainer/QuestDetailsPanel/QuestDetailsContainer/QuestDescriptionScroll/QuestDescriptionLabel
@onready var objectives_container: VBoxContainer = $QuestLogPanel/VBoxContainer/ContentContainer/QuestDetailsPanel/QuestDetailsContainer/ObjectivesContainer
@onready var rewards_container: VBoxContainer = $QuestLogPanel/VBoxContainer/ContentContainer/QuestDetailsPanel/QuestDetailsContainer/RewardsContainer
@onready var refresh_button: Button = $QuestLogPanel/VBoxContainer/ButtonContainer/RefreshButton
@onready var track_button: Button = $QuestLogPanel/VBoxContainer/ButtonContainer/TrackButton

# Component references
var quest_list_panel: QuestListPanel
var quest_details_panel: QuestDetailsPanel

# Current state
var current_selected_quest: QuestData = null

func _ready():
	# Start hidden
	hide()
	
	# Initialize components
	quest_list_panel = QuestListPanel.new()
	quest_details_panel = QuestDetailsPanel.new()
	
	add_child(quest_list_panel)
	add_child(quest_details_panel)
	
	# Initialize components with node references
	quest_list_panel.initialize(quest_list)
	quest_details_panel.initialize(quest_title_label, quest_description_label, objectives_container, rewards_container)
	
	# Connect component signals
	quest_list_panel.quest_button_selected.connect(_on_quest_selected_from_list)
	
	# Connect UI signals
	close_button.pressed.connect(_on_close_button_pressed)
	refresh_button.pressed.connect(_on_refresh_button_pressed)
	track_button.pressed.connect(_on_track_button_pressed)
	
	# Connect to quest manager updates
	if QuestManager:
		QuestManager.quest_started.connect(_on_quest_updated)
		QuestManager.quest_completed.connect(_on_quest_updated)
		QuestManager.quest_objective_completed.connect(_on_objective_updated)

func show_quest_log():
	"""Show the quest log window"""
	refresh_quest_list()
	show()
	
	# Animate in
	quest_log_panel.modulate.a = 0.0
	quest_log_panel.scale = Vector2(0.8, 0.8)
	
	var tween = create_tween()
	tween.parallel().tween_property(quest_log_panel, "modulate:a", 1.0, 0.3)
	tween.parallel().tween_property(quest_log_panel, "scale", Vector2.ONE, 0.3)
	
	# Play open sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("dialogue_open")

func hide_quest_log():
	"""Hide the quest log window"""
	var tween = create_tween()
	tween.parallel().tween_property(quest_log_panel, "modulate:a", 0.0, 0.2)
	tween.parallel().tween_property(quest_log_panel, "scale", Vector2(0.8, 0.8), 0.2)
	tween.tween_callback(hide)
	
	# Play close sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("dialogue_close")
	
	window_closed.emit()

func refresh_quest_list():
	"""Refresh the list of active quests"""
	quest_list_panel.refresh_quest_list()

# Component event handlers
func _on_quest_selected_from_list(quest: QuestData):
	"""Handle quest selection from list component"""
	current_selected_quest = quest
	quest_details_panel.display_quest_details(quest)
	
	# Update track button
	track_button.disabled = (current_selected_quest == null)
	track_button.text = "Track Quest" if current_selected_quest != QuestManager.get_current_active_quest() else "Currently Tracked"
	
	# Emit selection signal
	quest_selected.emit(quest)




# Signal handlers
func _on_close_button_pressed():
	"""Handle close button press"""
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	hide_quest_log()

func _on_refresh_button_pressed():
	"""Handle refresh button press"""
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	quest_list_panel.refresh_quest_list()

func _on_track_button_pressed():
	"""Handle track quest button press"""
	if not current_selected_quest:
		return
	
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")
	
	# Set as active quest in quest manager
	QuestManager.set_active_quest(current_selected_quest.id)
	quest_tracked.emit(current_selected_quest.id)
	
	# Update button text
	track_button.text = "Currently Tracked"

func _on_quest_updated(quest: QuestData):
	"""Handle quest updates"""
	if visible:
		quest_list_panel.refresh_quest_list()

func _on_objective_updated(quest: QuestData, objective: QuestObjective):
	"""Handle objective updates"""
	if visible and current_selected_quest and current_selected_quest.id == quest.id:
		quest_details_panel.update_quest_progress(quest)

func _input(event):
	"""Handle input for quest log"""
	if not visible:
		return
	
	# Close with ESC
	if event.is_action_pressed("ui_cancel"):
		_on_close_button_pressed()

# Public API
func select_quest_by_id(quest_id: String):
	"""Select a specific quest by ID"""
	# This would need to be implemented in the quest list panel
	# For now, just refresh and let it select the first quest
	quest_list_panel.refresh_quest_list()
extends Control
class_name QuestListPanel

# QuestListPanel - Manages the quest list display
# Handles quest button creation, selection, and filtering

signal quest_button_selected(quest: QuestData)

var quest_list: VBoxContainer
var quest_list_buttons: Array[Button] = []
var current_selected_quest: QuestData = null

func initialize(list_container: VBoxContainer):
	quest_list = list_container

func refresh_quest_list():
	"""Refresh the list of active quests"""
	# Clear existing quest buttons
	clear_quest_list()
	
	# Get all active quests
	var active_quests = QuestManager.get_active_quests()
	
	if active_quests.is_empty():
		show_no_quests_message()
		return
	
	# Create quest list buttons
	for quest in active_quests:
		create_quest_list_item(quest)
	
	# Select first quest by default
	if quest_list_buttons.size() > 0:
		select_quest_button(quest_list_buttons[0])

func clear_quest_list():
	"""Clear the quest list"""
	for button in quest_list_buttons:
		button.queue_free()
	quest_list_buttons.clear()
	
	# Clear any existing children
	for child in quest_list.get_children():
		child.queue_free()

func show_no_quests_message():
	"""Show message when no quests are available"""
	var no_quests_label = Label.new()
	no_quests_label.text = "No active quests"
	no_quests_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	no_quests_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	no_quests_label.add_theme_color_override("font_color", Color.GRAY)
	quest_list.add_child(no_quests_label)

func create_quest_list_item(quest: QuestData):
	"""Create a quest list item button"""
	var quest_button = Button.new()
	quest_button.text = quest.title
	quest_button.custom_minimum_size.y = 40
	quest_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	# Style the button
	quest_button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	quest_button.add_theme_color_override("font_color", Color.WHITE)
	
	# Add quest status indicator
	var status_text = ""
	if quest.is_completed:
		status_text = " ✓"
		quest_button.add_theme_color_override("font_color", Color.GREEN)
	elif quest.has_failed:
		status_text = " ✗"
		quest_button.add_theme_color_override("font_color", Color.RED)
	else:
		# Show progress for active quests
		var completed_objectives = 0
		var total_objectives = quest.objectives.size()
		for objective in quest.objectives:
			if objective.is_completed:
				completed_objectives += 1
		
		if total_objectives > 0:
			status_text = " (%d/%d)" % [completed_objectives, total_objectives]
	
	quest_button.text += status_text
	
	# Connect button signal
	quest_button.pressed.connect(_on_quest_button_pressed.bind(quest_button, quest))
	
	# Add to list
	quest_list.add_child(quest_button)
	quest_list_buttons.append(quest_button)

func select_quest_button(button: Button):
	"""Select a quest button and highlight it"""
	# Unhighlight all buttons
	for quest_button in quest_list_buttons:
		quest_button.add_theme_color_override("font_color_pressed", Color.WHITE)
		quest_button.remove_theme_color_override("font_color_hover")
	
	# Highlight selected button
	button.add_theme_color_override("font_color_pressed", Color.YELLOW)
	button.add_theme_color_override("font_color_hover", Color.YELLOW)
	
	# Find associated quest
	var quest_index = quest_list_buttons.find(button)
	if quest_index >= 0:
		var active_quests = QuestManager.get_active_quests()
		if quest_index < active_quests.size():
			current_selected_quest = active_quests[quest_index]
			quest_button_selected.emit(current_selected_quest)

func _on_quest_button_pressed(button: Button, quest: QuestData):
	"""Handle quest button press"""
	select_quest_button(button)
	
	# Play button sound
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx("button_click")

func get_selected_quest() -> QuestData:
	"""Get the currently selected quest"""
	return current_selected_quest
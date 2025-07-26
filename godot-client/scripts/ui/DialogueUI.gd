extends Control
class_name DialogueUI

# UI node references
@onready var dialogue_panel: Panel = $DialoguePanel
@onready var speaker_name_label: Label = $DialoguePanel/DialogueContainer/SpeakerPanel/SpeakerName
@onready var speaker_portrait: TextureRect = $DialoguePanel/DialogueContainer/SpeakerPanel/SpeakerPortrait
@onready var dialogue_text: RichTextLabel = $DialoguePanel/DialogueContainer/DialogueText
@onready var response_container: VBoxContainer = $DialoguePanel/DialogueContainer/ResponseContainer
@onready var continue_button: Button = $DialoguePanel/DialogueContainer/ContinueButton

# Current dialogue state
var current_dialogue_entry: DialogueEntry
var current_npc: NPC
var response_buttons: Array[Button] = []

# Signals
signal dialogue_response_selected(response: DialogueResponse)
signal dialogue_continued
signal dialogue_closed

func _ready():
	# Add to dialogue_ui group for GameStateManager integration
	add_to_group("dialogue_ui")
	
	# Set z-index for conversation layer
	z_index = ZIndex.CONVERSATION
	
	# Hide dialogue UI initially
	hide_dialogue()
	
	# Connect continue button
	continue_button.pressed.connect(_on_continue_pressed)

func show_dialogue(npc: NPC, dialogue_entry: DialogueEntry):
	"""Display a dialogue entry from an NPC"""
	if not npc or not dialogue_entry:
		print("Error: Invalid NPC or dialogue entry provided to DialogueUI")
		return
		
	current_npc = npc
	current_dialogue_entry = dialogue_entry
	
	# Notify GameStateManager that dialogue is starting
	var game_state_manager = get_node_or_null("/root/GameStateManager")
	if game_state_manager:
		game_state_manager.start_dialogue()
	
	# Set speaker info
	speaker_name_label.text = dialogue_entry.speaker_name if dialogue_entry.speaker_name != "" else npc.npc_data.name
	if npc.npc_data and npc.npc_data.dialogue_portrait:
		speaker_portrait.texture = npc.npc_data.dialogue_portrait
	else:
		speaker_portrait.texture = null
	
	# Set dialogue text with vocabulary highlighting
	dialogue_text.text = dialogue_entry.get_highlighted_text()
	
	# Clear previous response buttons
	_clear_response_buttons()
	
	# Show response options or continue button
	if dialogue_entry.response_options.size() > 0:
		_create_response_buttons(dialogue_entry.response_options)
		continue_button.hide()
	else:
		continue_button.show()
	
	# Show the dialogue panel
	dialogue_panel.show()
	self.show()
	
	# Play dialogue open sound
	_play_audio_sfx("dialogue_open")
	
	# Apply dialogue effects
	dialogue_entry.execute_effects()

func hide_dialogue():
	"""Hide the dialogue UI"""
	dialogue_panel.hide()
	self.hide()
	current_dialogue_entry = null
	current_npc = null
	
	# Notify GameStateManager that dialogue is ending
	var game_state_manager = get_node_or_null("/root/GameStateManager")
	if game_state_manager:
		game_state_manager.end_dialogue()
	
	# Notify tutorial system of dialogue completion
	if has_node("/root/TutorialManager"):
		get_node("/root/TutorialManager")._on_dialogue_completed()
	
	# Play dialogue close sound
	_play_audio_sfx("dialogue_close")

func _create_response_buttons(responses: Array[DialogueResponse]):
	"""Create buttons for dialogue response options"""
	continue_button.hide()
	
	for response in responses:
		var button = Button.new()
		button.text = response.text
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		button.custom_minimum_size.y = 40
		
		# Connect button to response handler
		var response_callable = func(): _on_response_selected(response)
		button.pressed.connect(response_callable)
		
		response_container.add_child(button)
		response_buttons.append(button)

func _clear_response_buttons():
	"""Remove all response buttons"""
	for button in response_buttons:
		if button:
			button.queue_free()
	response_buttons.clear()

func _on_continue_pressed():
	"""Handle continue button press for non-branching dialogue"""
	# Store current_npc before hide_dialogue() clears it
	var npc_to_end = current_npc
	dialogue_continued.emit()
	hide_dialogue()
	# Manually end dialogue if the signal handler didn't work
	if npc_to_end:
		npc_to_end.end_dialogue()

func _on_response_selected(response: DialogueResponse):
	"""Handle response selection for branching dialogue"""
	dialogue_response_selected.emit(response)
	hide_dialogue()

func _input(event):
	"""Handle keyboard input for dialogue - now coordinated with GameStateManager"""
	if not is_visible_in_tree():
		return
	
	# Only handle input if GameStateManager allows it (dialogue mode active)
	var game_state_manager = get_node_or_null("/root/GameStateManager")
	if game_state_manager and not game_state_manager.is_in_dialogue():
		return
	
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("interact"):
		if continue_button.visible:
			_on_continue_pressed()
		elif response_buttons.size() > 0:
			# Select first response option with Enter/Space
			response_buttons[0].pressed.emit()
		else:
			# Store current_npc before hide_dialogue() clears it
			var npc_to_end = current_npc
			dialogue_closed.emit()
			hide_dialogue()
			# Manually end dialogue if the signal handler didn't work
			if npc_to_end:
				npc_to_end.end_dialogue()
	
	elif event.is_action_pressed("ui_cancel"):
		# Store current_npc before hide_dialogue() clears it
		var npc_to_end = current_npc
		dialogue_closed.emit()
		hide_dialogue()
		# Manually end dialogue if the signal handler didn't work
		if npc_to_end:
			npc_to_end.end_dialogue()

func set_dialogue_visible(visible: bool):
	"""Show or hide dialogue UI"""
	if visible and current_dialogue_entry:
		show()
		dialogue_panel.show()
	else:
		hide_dialogue()

# Audio helper methods
func _play_audio_sfx(sound_name: String, pitch: float = 1.0):
	"""Helper function to play sound effects safely"""
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx(sound_name, pitch)

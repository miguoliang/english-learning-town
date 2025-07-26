extends CharacterBody2D
class_name NPC

signal dialogue_started(npc: NPC)
signal dialogue_ended(npc: NPC)
signal quest_available(npc: NPC, quest_id: String)

@export var npc_data: NPCData
@export var interaction_range: float = 80.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var interaction_area: Area2D = $InteractionArea
@onready var name_label: Label = $NameLabel
@onready var quest_indicator: Sprite2D = $QuestIndicator

var is_in_dialogue: bool = false
var player_in_range: bool = false
var current_dialogue_tree: Array[DialogueEntry] = []
var current_dialogue_index: int = 0

func _ready():
	if not npc_data:
		print("Warning: NPC has no data assigned!")
		return
	
	setup_npc()
	setup_interaction_area()
	update_quest_indicator()

func setup_npc():
	# Set sprite
	if npc_data.sprite_texture:
		sprite.texture = npc_data.sprite_texture
	
	# Set name label
	name_label.text = npc_data.get_display_name()
	name_label.visible = false  # Hide until player is near
	
	# Position based on data
	if npc_data.position != Vector2.ZERO:
		global_position = npc_data.position

func setup_interaction_area():
	if interaction_area:
		interaction_area.body_entered.connect(_on_player_entered_range)
		interaction_area.body_exited.connect(_on_player_exited_range)
		
		# Set interaction area size
		var collision_shape = interaction_area.get_node("CollisionShape2D")
		if collision_shape and collision_shape.shape is CircleShape2D:
			collision_shape.shape.radius = interaction_range

func update_quest_indicator():
	if not quest_indicator:
		return
	
	var has_available_quest = false
	var has_completed_quest = false
	
	# Check for available quests
	for quest_id in npc_data.available_quests:
		var quest = QuestManager.get_quest(quest_id)
		if quest and quest.is_available():
			has_available_quest = true
			break
	
	# Check if current quest targets this NPC
	var current_quest = QuestManager.get_current_active_quest()
	if current_quest:
		var current_obj = current_quest.get_current_objective()
		if current_obj and current_obj.target_id == npc_data.id:
			has_completed_quest = true
	
	# Set indicator
	if has_available_quest:
		quest_indicator.modulate = Color.YELLOW  # New quest
		quest_indicator.visible = true
	elif has_completed_quest:
		quest_indicator.modulate = Color.GREEN   # Complete quest
		quest_indicator.visible = true
	else:
		quest_indicator.visible = false

func _on_player_entered_range(body):
	if body.name == "Player":
		player_in_range = true
		name_label.visible = true
		
		# Notify tutorial system that player approached NPC
		if has_node("/root/TutorialManager"):
			get_node("/root/TutorialManager")._on_player_approached_npc()
		
		# Show interaction hint if not in dialogue
		if not is_in_dialogue:
			show_interaction_hint()

func _on_player_exited_range(body):
	if body.name == "Player":
		player_in_range = false
		name_label.visible = false
		hide_interaction_hint()

func show_interaction_hint():
	"""Show interaction hint using HintManager"""
	if has_node("/root/HintManager"):
		var hint_pos = global_position + Vector2(50, -60)
		get_node("/root/HintManager").show_contextual_hint(
			"Press [color=yellow][b]E[/b][/color] or [color=yellow][b]SPACE[/b][/color] to talk",
			hint_pos,
			"Talk to " + npc_data.name,
			3.0
		)

func hide_interaction_hint():
	"""Hide interaction hint"""
	if has_node("/root/HintManager"):
		# Dismiss contextual hints for this NPC
		get_node("/root/HintManager").dismiss_all_hints()

func interact():
	if is_in_dialogue or not npc_data.is_available_now():
		return
	
	# Notify tutorial system of NPC interaction
	if has_node("/root/TutorialManager"):
		get_node("/root/TutorialManager")._on_player_interacted_with_npc()
	
	start_dialogue()

func start_dialogue():
	is_in_dialogue = true
	current_dialogue_tree = npc_data.get_current_dialogue()
	current_dialogue_index = 0
	
	dialogue_started.emit(self)
	
	if current_dialogue_tree.size() > 0:
		show_dialogue_entry(current_dialogue_tree[0])
	else:
		# Fallback dialogue
		var fallback = DialogueEntry.new(get_fallback_dialogue(), npc_data.name)
		show_dialogue_entry(fallback)

func show_dialogue_entry(entry: DialogueEntry):
	# The dialogue UI will be handled by the TownExplorationController
	# This function now only provides debug output - UI handles all dialogue flow
	print("%s: %s" % [entry.speaker_name, entry.text])
	
	# The DialogueUI will handle:
	# - Displaying the dialogue
	# - Executing effects
	# - Managing response options
	# - Advancing or ending dialogue

func show_response_options(options: Array[DialogueResponse]):
	# TODO: Show response UI
	print("Response options:")
	for i in range(options.size()):
		if options[i].is_available():
			print("%d. %s" % [i + 1, options[i].text])

func choose_response(response_index: int):
	if current_dialogue_index >= current_dialogue_tree.size():
		return
	
	var current_entry = current_dialogue_tree[current_dialogue_index]
	if response_index >= current_entry.response_options.size():
		return
	
	var chosen_response = current_entry.response_options[response_index]
	chosen_response.execute_response()
	
	# Continue to next dialogue or end
	if chosen_response.leads_to_dialogue_id != "":
		# Find dialogue with matching ID
		for entry in current_dialogue_tree:
			if entry.next_dialogue_id == chosen_response.leads_to_dialogue_id:
				show_dialogue_entry(entry)
				return
	
	end_dialogue()

func advance_dialogue():
	current_dialogue_index += 1
	if current_dialogue_index < current_dialogue_tree.size():
		show_dialogue_entry(current_dialogue_tree[current_dialogue_index])
	else:
		end_dialogue()

func handle_response(response: DialogueResponse):
	"""Handle a player response during dialogue"""
	if not response:
		print("Error: Invalid response provided")
		return
	
	# Execute response effects
	response.execute_effects()
	
	# Continue to next dialogue based on response
	if response.next_dialogue_id != "":
		# TODO: Handle branching dialogue based on response
		advance_dialogue()
	else:
		advance_dialogue()

func end_dialogue():
	is_in_dialogue = false
	dialogue_ended.emit(self)
	
	# Update quest indicator
	update_quest_indicator()
	
	# Increase friendship
	npc_data.increase_friendship(2)

func update_quest_progress(entry: DialogueEntry):
	var current_quest = QuestManager.get_current_active_quest()
	if not current_quest:
		return
	
	# Update quest objective based on dialogue
	QuestManager.update_quest_objective(
		current_quest.id,
		entry.objective_type,
		entry.objective_target
	)

func get_fallback_dialogue() -> String:
	var greetings = [
		"Hello there! Welcome to our town!",
		"Hi! It's nice to see you around.",
		"Greetings! How are you today?",
		"Hey! Are you new here?",
		"Good to see you! How can I help?"
	]
	
	return greetings[randi() % greetings.size()]

# Quest-related functions
func give_quest(quest_id: String):
	if QuestManager.start_quest(quest_id):
		quest_available.emit(self, quest_id)
		update_quest_indicator()

func has_available_quests() -> bool:
	for quest_id in npc_data.available_quests:
		var quest = QuestManager.get_quest(quest_id)
		if quest and quest.is_available():
			return true
	return false

func get_available_quests() -> Array[String]:
	var available: Array[String] = []
	for quest_id in npc_data.available_quests:
		var quest = QuestManager.get_quest(quest_id)
		if quest and quest.is_available():
			available.append(quest_id)
	return available

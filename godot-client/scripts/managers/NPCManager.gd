extends Node

# NPCManager - Manages all NPCs in the game
# Handles NPC data, interactions, and quest integration

signal npc_interaction_started(npc: NPC)
signal npc_interaction_ended(npc: NPC)

var npcs: Dictionary = {}
var npc_data: Dictionary = {}

func _ready():
	print("NPCManager initialized")
	create_npc_data()

func create_npc_data():
	# Create Teacher data
	var teacher_data = TeacherData.new()
	npc_data["teacher"] = teacher_data
	
	# Create Shopkeeper data
	var shopkeeper_data = ShopkeeperData.new()
	npc_data["shopkeeper"] = shopkeeper_data
	
	print("Created NPC data for %d NPCs" % npc_data.size())

func register_npc(npc: NPC, npc_id: String):
	if not npc_data.has(npc_id):
		print("Warning: No data found for NPC ID: ", npc_id)
		return
	
	# Assign data to NPC
	npc.npc_data = npc_data[npc_id]
	
	# Set sprite
	match npc_id:
		"teacher":
			var teacher_texture = load("res://assets/sprites/teacher.png")
			npc.sprite.texture = teacher_texture
		"shopkeeper":
			var shopkeeper_texture = load("res://assets/sprites/shopkeeper.png")
			npc.sprite.texture = shopkeeper_texture
	
	# Set quest indicator
	var quest_indicator_texture = load("res://assets/sprites/quest_indicator.png")
	npc.quest_indicator.texture = quest_indicator_texture
	
	# Connect signals
	npc.dialogue_started.connect(_on_npc_dialogue_started)
	npc.dialogue_ended.connect(_on_npc_dialogue_ended)
	npc.quest_available.connect(_on_npc_quest_available)
	
	# Store reference
	npcs[npc_id] = npc
	
	print("Registered NPC: ", npc_id)

func get_npc(npc_id: String) -> NPC:
	return npcs.get(npc_id, null)

func get_npc_data(npc_id: String) -> NPCData:
	return npc_data.get(npc_id, null)

func _on_npc_dialogue_started(npc: NPC):
	npc_interaction_started.emit(npc)
	
	# Disable player movement during dialogue
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("enable_movement"):
		player.enable_movement(false)

func _on_npc_dialogue_ended(npc: NPC):
	npc_interaction_ended.emit(npc)
	
	# Re-enable player movement
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("enable_movement"):
		player.enable_movement(true)

func _on_npc_quest_available(npc: NPC, quest_id: String):
	print("NPC %s has quest available: %s" % [npc.npc_data.name, quest_id])

func update_all_npc_quest_indicators():
	for npc in npcs.values():
		if npc.has_method("update_quest_indicator"):
			npc.update_quest_indicator()
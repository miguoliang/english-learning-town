extends Node
class_name PlayerInteraction

# PlayerInteraction - Handles player interaction with NPCs and objects
# Manages interaction detection, audio feedback, and event signaling

signal interaction_started(npc_name: String)
signal building_entered(building_name: String)

var interaction_area: Area2D
var is_interacting: bool = false

func initialize(area: Area2D):
	interaction_area = area
	
	# Connect signals
	if interaction_area:
		interaction_area.area_entered.connect(_on_area_entered)
		interaction_area.body_entered.connect(_on_body_entered)

func try_interact():
	"""Attempt to interact with nearby objects"""
	# Check for nearby interactable objects
	if not interaction_area:
		print("No interaction area available")
		return
		
	var areas = interaction_area.get_overlapping_areas()
	var bodies = interaction_area.get_overlapping_bodies()
	
	# First check for NPCs
	for body in bodies:
		if body.is_in_group("npcs") and body.has_method("interact"):
			# Play interaction sound
			play_audio_sfx("interact")
			body.interact()
			print("Interacting with NPC: ", body.name)
			
			# Notify tutorial system
			if has_node("/root/TutorialManager"):
				get_node("/root/TutorialManager")._on_player_interacted_with_npc()
			
			return
	
	# Then check for other interactables
	for area in areas:
		if area.has_method("interact"):
			play_audio_sfx("interact")
			area.interact()
			return
	
	for body in bodies:
		if body.has_method("interact") and body != get_parent():
			play_audio_sfx("interact")
			body.interact()
			return
	
	print("No interactable objects nearby")

func _on_area_entered(area: Area2D):
	"""Handle area interactions (NPCs, items, etc.)"""
	if area.has_meta("npc_name"):
		var npc_name = area.get_meta("npc_name")
		print("Near NPC: ", npc_name)
		
		# Notify tutorial system
		if has_node("/root/TutorialManager"):
			get_node("/root/TutorialManager")._on_player_approached_npc()
		
		# Could show interaction prompt here
	elif area.has_meta("building_name"):
		var building_name = area.get_meta("building_name")
		print("Near building: ", building_name)

func _on_body_entered(body: Node2D):
	"""Handle body interactions"""
	if body.has_meta("interaction_type"):
		var interaction_type = body.get_meta("interaction_type")
		match interaction_type:
			"npc":
				if body.has_meta("npc_name"):
					interaction_started.emit(body.get_meta("npc_name"))
			"building":
				if body.has_meta("building_name"):
					building_entered.emit(body.get_meta("building_name"))

func set_interacting(interacting: bool):
	"""Set interaction state"""
	is_interacting = interacting

func play_audio_sfx(sound_name: String, pitch: float = 1.0):
	"""Helper function to play sound effects safely"""
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx(sound_name, pitch)

func play_footstep_sound():
	"""Play randomized footstep sound"""
	play_audio_sfx("footstep", randf_range(0.9, 1.1))
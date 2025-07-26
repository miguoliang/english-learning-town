# MockNPC.gd
# Mock NPC for testing

extends Node2D

signal dialogue_started(npc)
signal dialogue_ended(npc)

var npc_data: Resource
var is_in_dialogue: bool = false
var is_interactable: bool = true

func _ready():
	name = "MockNPC"

func interact():
	if is_interactable:
		start_dialogue()

func start_dialogue():
	is_in_dialogue = true
	dialogue_started.emit(self)

func end_dialogue():
	is_in_dialogue = false
	dialogue_ended.emit(self)

func has_method(method_name: String) -> bool:
	match method_name:
		"interact", "start_dialogue", "end_dialogue":
			return true
		_:
			return super.has_method(method_name)
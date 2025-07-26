# MockPlayer.gd
# Mock PlayerController for testing

extends Node2D

var can_move: bool = true
var is_moving: bool = false
var movement_enabled: bool = true

func _ready():
	name = "MockPlayer"

func enable_movement(enabled: bool):
	movement_enabled = enabled
	can_move = enabled

func try_interact():
	print("Mock player interaction")

func start_movement(direction: Vector2):
	if movement_enabled:
		is_moving = true

func has_method(method_name: String) -> bool:
	match method_name:
		"enable_movement", "try_interact", "start_movement":
			return true
		_:
			return super.has_method(method_name)
# MockTutorialManager.gd
# Mock TutorialManager for testing

extends Node

signal tutorial_started()
signal tutorial_finished()
signal tutorial_step_completed(step_name: String)

var is_tutorial_active: bool = false
var current_step: int = 0
var tutorial_completed: bool = false

func _ready():
	name = "MockTutorialManager"

func start_tutorial():
	is_tutorial_active = true
	tutorial_started.emit()

func finish_tutorial():
	is_tutorial_active = false
	tutorial_completed = true
	tutorial_finished.emit()

func force_start_tutorial():
	start_tutorial()

func is_tutorial_running() -> bool:
	return is_tutorial_active

func disable_non_tutorial_interactions():
	pass

func enable_all_interactions():
	pass

func has_method(method_name: String) -> bool:
	match method_name:
		"force_start_tutorial", "disable_non_tutorial_interactions", "enable_all_interactions":
			return true
		_:
			return super.has_method(method_name)
# MockHintManager.gd
# Mock HintManager for testing

extends Node

var last_hint_shown: String = ""
var last_hint_position: Vector2
var last_hint_title: String = ""
var last_hint_duration: float = 0.0

func _ready():
	name = "MockHintManager"

func show_hint(hint_id: String, position: Vector2):
	last_hint_shown = hint_id
	last_hint_position = position

func show_contextual_hint(text: String, position: Vector2, title: String = "", duration: float = 3.0):
	last_hint_shown = text
	last_hint_position = position
	last_hint_title = title
	last_hint_duration = duration

func hide_hint():
	last_hint_shown = ""

func has_method(method_name: String) -> bool:
	match method_name:
		"show_hint", "show_contextual_hint", "hide_hint":
			return true
		_:
			return super.has_method(method_name)
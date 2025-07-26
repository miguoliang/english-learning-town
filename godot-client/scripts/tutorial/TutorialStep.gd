extends Resource
class_name TutorialStep

# TutorialStep - Data structure for individual tutorial steps
# Contains all configuration for a single tutorial step

@export var id: String
@export var title: String
@export var description: String
@export var target_element: String
@export var action_required: String
@export var auto_advance: bool = false
@export var delay: float = 3.0
@export var highlight_position: Vector2
@export var highlight_size: Vector2

func _init(p_id: String = "", p_title: String = "", p_description: String = "", 
		   p_target: String = "", p_action: String = "", p_auto: bool = false, p_delay: float = 3.0):
	id = p_id
	title = p_title
	description = p_description
	target_element = p_target
	action_required = p_action
	auto_advance = p_auto
	delay = p_delay
extends Resource
class_name HintData

# HintData - Data structure for individual hints
# Contains all properties and configuration for a hint

@export var id: String
@export var title: String
@export var text: String
@export var icon: Texture2D
@export var priority: HintManager.HintPriority
@export var position: Vector2
var target_node: Node
@export var duration: float
@export var can_be_dismissed: bool = true
@export var one_time_only: bool = false
@export var conditions: Array[String] = []

func _init(p_id: String = "", p_title: String = "", p_text: String = "", p_priority: HintManager.HintPriority = HintManager.HintPriority.MEDIUM):
	id = p_id
	title = p_title
	text = p_text
	priority = p_priority
	duration = 5.0

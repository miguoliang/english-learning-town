extends Node
class_name PlayerMovement

# PlayerMovement - Handles grid-based movement logic
# Manages movement timing, grid snapping, and smooth interpolation

signal movement_started(direction: Vector2)
signal movement_completed()

@export var tile_size: int = 32
@export var move_speed: float = 0.15
@export var run_speed_multiplier: float = 0.5

var is_moving: bool = false
var is_running: bool = false
var target_position: Vector2
var move_timer: float = 0.0
var last_direction: Vector2 = Vector2.DOWN

# Movement queuing for smooth continuous movement
var queued_direction: Vector2 = Vector2.ZERO
var has_queued_movement: bool = false

var player_body: CharacterBody2D

func initialize(body: CharacterBody2D):
	player_body = body
	target_position = body.global_position

func handle_movement(delta):
	if not player_body:
		return
		
	if is_moving:
		# Update move timer
		move_timer += delta
		var movement_duration = get_movement_duration()
		
		# Check if movement is complete
		if move_timer >= movement_duration:
			# Snap to target position
			player_body.global_position = target_position
			is_moving = false
			move_timer = 0.0
			player_body.velocity = Vector2.ZERO
			movement_completed.emit()
			
			# Check for queued movement to continue smoothly
			if has_queued_movement:
				start_movement(queued_direction)
				has_queued_movement = false
		else:
			# Smooth interpolation with easing
			var progress = move_timer / movement_duration
			# Apply ease-out for smoother feeling
			var eased_progress = ease_out_cubic(progress)
			var start_pos = target_position - (last_direction * tile_size)
			player_body.global_position = start_pos.lerp(target_position, eased_progress)
			
			# Update sprite scale animation if sprites component is available
			var sprites = player_body.get_node_or_null("PlayerSprites")
			if sprites and sprites.has_method("add_movement_scale_effect"):
				sprites.add_movement_scale_effect(progress)
	else:
		player_body.velocity = Vector2.ZERO
	
	# Still use move_and_slide for collision detection
	player_body.move_and_slide()

func start_movement(direction: Vector2):
	if not player_body:
		return
		
	# Calculate next position based on tile size
	var next_position = player_body.global_position + (direction * tile_size)
	
	# Store movement data
	last_direction = direction
	target_position = next_position
	is_moving = true
	move_timer = 0.0
	
	movement_started.emit(direction)
	
	# Notify tutorial system of movement
	if has_node("/root/TutorialManager"):
		get_node("/root/TutorialManager")._on_player_moved()
		
		# Check for running
		if is_running:
			get_node("/root/TutorialManager")._on_player_ran()

func queue_next_movement(direction: Vector2):
	"""Queue the next movement direction for smooth continuous movement"""
	queued_direction = direction
	has_queued_movement = true

func get_movement_duration() -> float:
	"""Get current movement duration based on speed and running state"""
	var duration = move_speed
	if is_running:
		duration *= run_speed_multiplier
	return duration

func ease_out_cubic(t: float) -> float:
	"""Smooth easing function for movement"""
	return 1.0 - pow(1.0 - t, 3.0)

func stop_movement():
	"""Stop current movement immediately"""
	is_moving = false
	has_queued_movement = false
	if player_body:
		player_body.velocity = Vector2.ZERO

func can_continue_movement(input_direction: Vector2) -> bool:
	"""Check if movement can continue in given direction"""
	return is_moving and move_timer >= get_movement_duration() * 0.5 and input_direction != Vector2.ZERO
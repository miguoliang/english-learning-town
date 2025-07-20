extends CharacterBody2D
class_name PlayerController

# Player movement and interaction controller

signal interaction_started(npc_name: String)
signal building_entered(building_name: String)

@export var tile_size: int = 32
@export var move_speed: float = 0.15
@export var run_speed_multiplier: float = 0.5

@onready var sprite: Sprite2D = $Sprite2D
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var interaction_area: Area2D = $InteractionArea

# Directional sprites for boy
var boy_sprite_front: Texture2D
var boy_sprite_back: Texture2D
var boy_sprite_side: Texture2D

# Directional sprites for girl
var girl_sprite_front: Texture2D
var girl_sprite_back: Texture2D
var girl_sprite_side: Texture2D

# Current active sprites
var sprite_front: Texture2D
var sprite_back: Texture2D
var sprite_side: Texture2D

var input_vector: Vector2 = Vector2.ZERO
var is_running: bool = false
var can_move: bool = true
var is_interacting: bool = false
var is_moving: bool = false
var target_position: Vector2
var move_timer: float = 0.0

# Movement queuing for smooth continuous movement
var queued_direction: Vector2 = Vector2.ZERO
var has_queued_movement: bool = false

# Animation states
var last_direction: Vector2 = Vector2.DOWN

func _ready():
	# Add to player group
	add_to_group("player")
	
	# Load boy sprites
	boy_sprite_front = load("res://assets/sprites/boy_front.png")
	boy_sprite_back = load("res://assets/sprites/boy_back.png")
	boy_sprite_side = load("res://assets/sprites/boy_side.png")
	
	# Load girl sprites
	girl_sprite_front = load("res://assets/sprites/girl_front.png")
	girl_sprite_back = load("res://assets/sprites/girl_back.png")
	girl_sprite_side = load("res://assets/sprites/girl_side.png")
	
	# Connect signals
	if interaction_area:
		interaction_area.area_entered.connect(_on_area_entered)
		interaction_area.body_entered.connect(_on_body_entered)
	
	# Connect to game manager for player data updates
	if GameManager:
		GameManager.player_data_changed.connect(_on_player_data_changed)
	
	# Set initial appearance
	update_player_appearance()
	
	# Load appropriate sprites based on gender
	load_sprites_for_gender()
	
	# Initialize target position
	target_position = global_position

func _physics_process(delta):
	if can_move and not is_interacting:
		handle_input()
		handle_movement(delta)
		update_animation()

func handle_input():
	# Get continuous input vector
	input_vector = Vector2.ZERO
	
	if Input.is_action_pressed("move_left"):
		input_vector.x -= 1
	if Input.is_action_pressed("move_right"):
		input_vector.x += 1
	if Input.is_action_pressed("move_up"):
		input_vector.y -= 1
	if Input.is_action_pressed("move_down"):
		input_vector.y += 1
	
	# Normalize diagonal movement
	if input_vector.length() > 1:
		input_vector = input_vector.normalized()
	
	# Check for running
	is_running = Input.is_action_pressed("run")
	
	# Handle interaction input
	if Input.is_action_just_pressed("interact"):
		try_interact()
	
	# Start new movement if input detected and not currently moving
	if input_vector != Vector2.ZERO and not is_moving:
		start_movement(input_vector)
	# Continue movement in same direction if already moving
	elif input_vector != Vector2.ZERO and is_moving and move_timer >= get_movement_duration() * 0.5:
		# Allow queuing next movement when 50% through current movement for more responsive feel
		queue_next_movement(input_vector)
	# Clear queued movement if no input
	elif input_vector == Vector2.ZERO:
		has_queued_movement = false

func handle_movement(delta):
	if is_moving:
		# Update move timer
		move_timer += delta
		var movement_duration = get_movement_duration()
		
		# Check if movement is complete
		if move_timer >= movement_duration:
			# Snap to target position
			global_position = target_position
			is_moving = false
			move_timer = 0.0
			velocity = Vector2.ZERO
			# Reset sprite scale
			sprite.scale = Vector2.ONE
			
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
			global_position = start_pos.lerp(target_position, eased_progress)
			
			# Add subtle scale animation for movement feedback
			var scale_bounce = 1.0 + (sin(progress * PI) * 0.05)
			sprite.scale = Vector2(scale_bounce, scale_bounce)
	else:
		velocity = Vector2.ZERO
	
	# Still use move_and_slide for collision detection
	move_and_slide()

func ease_out_cubic(t: float) -> float:
	"""Smooth easing function for movement"""
	return 1.0 - pow(1.0 - t, 3.0)

func get_movement_duration() -> float:
	"""Get current movement duration based on speed and running state"""
	var duration = move_speed
	if is_running:
		duration *= run_speed_multiplier
	return duration

func queue_next_movement(direction: Vector2):
	"""Queue the next movement direction for smooth continuous movement"""
	queued_direction = direction
	has_queued_movement = true

func update_animation():
	# Update sprite direction based on movement
	update_sprite_direction()
	
	if not animation_player:
		return
	
	var animation_name = "idle_down"
	
	if is_moving:
		# Determine direction for animation
		if abs(last_direction.x) > abs(last_direction.y):
			if last_direction.x > 0:
				animation_name = "walk_right" if not is_running else "run_right"
			else:
				animation_name = "walk_left" if not is_running else "run_left"
		else:
			if last_direction.y > 0:
				animation_name = "walk_down" if not is_running else "run_down"
			else:
				animation_name = "walk_up" if not is_running else "run_up"
	else:
		# Idle animations
		if abs(last_direction.x) > abs(last_direction.y):
			if last_direction.x > 0:
				animation_name = "idle_right"
			else:
				animation_name = "idle_left"
		else:
			if last_direction.y > 0:
				animation_name = "idle_down"
			else:
				animation_name = "idle_up"
	
	# Play animation if it exists and is different from current
	if animation_player.has_animation(animation_name):
		if animation_player.current_animation != animation_name:
			animation_player.play(animation_name)

func start_movement(direction: Vector2):
	# Calculate next position based on tile size
	var next_position = global_position + (direction * tile_size)
	
	# Store movement data
	last_direction = direction
	target_position = next_position
	is_moving = true
	move_timer = 0.0
	
	# Play footstep sound effect
	_play_audio_sfx("footstep", randf_range(0.9, 1.1))

func update_sprite_direction():
	if not sprite or not is_moving:
		return
	
	# Reset transformations
	sprite.rotation = 0
	sprite.flip_h = false
	
	# Determine which direction is dominant and switch sprite
	if abs(last_direction.x) > abs(last_direction.y):
		# Moving horizontally - use side sprite
		sprite.texture = sprite_side
		if last_direction.x < 0:
			# Moving left - flip the side sprite
			sprite.flip_h = true
	else:
		# Moving vertically
		if last_direction.y > 0:
			# Moving down - use front sprite (can see face)
			sprite.texture = sprite_front
		else:
			# Moving up - use back sprite (can see back of head)
			sprite.texture = sprite_back

func try_interact():
	# Check for nearby interactable objects
	if interaction_area:
		var areas = interaction_area.get_overlapping_areas()
		var bodies = interaction_area.get_overlapping_bodies()
		
		# First check for NPCs
		for body in bodies:
			if body.is_in_group("npcs") and body.has_method("interact"):
				# Play interaction sound
				_play_audio_sfx("interact")
				body.interact()
				print("Interacting with NPC: ", body.name)
				return
		
		# Then check for other interactables
		for area in areas:
			if area.has_method("interact"):
				area.interact()
				return
		
		for body in bodies:
			if body.has_method("interact") and body != self:
				body.interact()
				return
	
	print("No interactable objects nearby")

func _on_area_entered(area: Area2D):
	# Handle area interactions (NPCs, items, etc.)
	if area.has_meta("npc_name"):
		var npc_name = area.get_meta("npc_name")
		print("Near NPC: ", npc_name)
		# Could show interaction prompt here
	elif area.has_meta("building_name"):
		var building_name = area.get_meta("building_name")
		print("Near building: ", building_name)

func _on_body_entered(body: Node2D):
	# Handle body interactions
	if body.has_meta("interaction_type"):
		var interaction_type = body.get_meta("interaction_type")
		match interaction_type:
			"npc":
				if body.has_meta("npc_name"):
					interaction_started.emit(body.get_meta("npc_name"))
			"building":
				if body.has_meta("building_name"):
					building_entered.emit(body.get_meta("building_name"))

func _on_player_data_changed(player_data: PlayerData):
	update_player_appearance()

func load_sprites_for_gender():
	"""Load appropriate sprites based on player gender"""
	if not GameManager or not GameManager.is_player_logged_in:
		# Default to boy sprites
		sprite_front = boy_sprite_front
		sprite_back = boy_sprite_back
		sprite_side = boy_sprite_side
		return
	
	var player_data = GameManager.current_player
	match player_data.gender:
		"male":
			sprite_front = boy_sprite_front
			sprite_back = boy_sprite_back
			sprite_side = boy_sprite_side
		"female":
			sprite_front = girl_sprite_front
			sprite_back = girl_sprite_back
			sprite_side = girl_sprite_side
		_:
			# Default to boy sprites
			sprite_front = boy_sprite_front
			sprite_back = boy_sprite_back
			sprite_side = boy_sprite_side
	
	# Update current sprite if needed
	if sprite:
		update_sprite_direction()

func update_player_appearance():
	if not GameManager or not GameManager.is_player_logged_in:
		return
	
	var player_data = GameManager.current_player
	
	# Load appropriate sprites for gender
	load_sprites_for_gender()
	
	# Update sprite based on player data
	if sprite:
		# Change sprite color based on level (simple example)
		var level_hue = (player_data.level - 1) * 0.1
		var level_color = Color.from_hsv(level_hue, 0.3, 1.0)
		sprite.modulate = level_color

# Movement control methods
func enable_movement(enabled: bool):
	can_move = enabled
	if not enabled:
		velocity = Vector2.ZERO
		input_vector = Vector2.ZERO
		has_queued_movement = false
		is_moving = false
		sprite.scale = Vector2.ONE

# Audio helper methods
func _play_audio_sfx(sound_name: String, pitch: float = 1.0):
	"""Helper function to play sound effects safely"""
	if has_node("/root/AudioManager"):
		get_node("/root/AudioManager").play_sfx(sound_name, pitch)

extends CharacterBody2D
class_name PlayerController

# PlayerController - Main coordinator for player functionality
# Orchestrates movement, sprites, and interaction components

signal interaction_started(npc_name: String)
signal building_entered(building_name: String)

@onready var animated_sprite: AnimatedSprite2D = $Sprite2D
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var interaction_area: Area2D = $InteractionArea

# Component references
var movement: PlayerMovement
var sprites: PlayerSprites
var interaction: PlayerInteraction

var input_vector: Vector2 = Vector2.ZERO
var can_move: bool = true

func _ready():
	# Add to player group
	add_to_group("player")
	
	# Initialize components
	movement = PlayerMovement.new()
	sprites = PlayerSprites.new()
	interaction = PlayerInteraction.new()
	
	add_child(movement)
	add_child(sprites)
	add_child(interaction)
	
	# Initialize components with node references
	movement.initialize(self)
	sprites.initialize(animated_sprite, animation_player)
	interaction.initialize(interaction_area)
	
	# Connect component signals
	interaction.interaction_started.connect(_on_interaction_started)
	interaction.building_entered.connect(_on_building_entered)
	movement.movement_started.connect(_on_movement_started)
	movement.movement_completed.connect(_on_movement_completed)
	
	# Connect to game manager for player data updates
	if GameManager:
		GameManager.player_data_changed.connect(_on_player_data_changed)

func _physics_process(delta):
	if can_move and not interaction.is_interacting:
		handle_input()
		movement.handle_movement(delta)
		update_animation()

func handle_input():
	# Check with GameStateManager if movement is allowed
	if GameStateManager and not GameStateManager.can_player_move():
		input_vector = Vector2.ZERO
		return
	
	# Don't process movement input if any dialog is open
	if _has_modal_dialog_open():
		input_vector = Vector2.ZERO
		return
	
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
	movement.is_running = Input.is_action_pressed("run")
	
	# Handle interaction input
	if Input.is_action_just_pressed("interact"):
		interaction.try_interact()
	
	# Start new movement if input detected and not currently moving
	if input_vector != Vector2.ZERO and not movement.is_moving:
		movement.start_movement(input_vector)
	# Continue movement in same direction if already moving
	elif movement.can_continue_movement(input_vector):
		# Allow queuing next movement when 50% through current movement for more responsive feel
		movement.queue_next_movement(input_vector)
	# Clear queued movement if no input
	elif input_vector == Vector2.ZERO:
		movement.has_queued_movement = false



func update_animation():
	# Update sprite direction based on movement
	sprites.update_sprite_direction(movement.last_direction)
	
	# Update animations
	sprites.update_animation(movement.is_moving, movement.is_running, movement.last_direction)




# Component event handlers
func _on_interaction_started(npc_name: String):
	interaction_started.emit(npc_name)

func _on_building_entered(building_name: String):
	building_entered.emit(building_name)

func _on_movement_started(direction: Vector2):
	# Play footstep sound
	interaction.play_footstep_sound()

func _on_movement_completed():
	# Reset sprite scale
	sprites.reset_scale()

func _on_player_data_changed(player_data: PlayerData):
	sprites.update_appearance()


# Movement control methods
func enable_movement(enabled: bool):
	can_move = enabled
	if not enabled:
		velocity = Vector2.ZERO
		input_vector = Vector2.ZERO
		if movement:
			movement.stop_movement()
		if sprites:
			sprites.reset_scale()

# Input helper methods
func _has_modal_dialog_open() -> bool:
	"""Check if any modal dialog is currently open that should block movement"""
	# Check for AcceptDialog nodes (like tutorial skip confirmation)
	var dialogs = get_tree().get_nodes_in_group("dialogs")
	for dialog in dialogs:
		if dialog is AcceptDialog and dialog.visible:
			return true
	
	# Check for any popup that might be modal
	var popups = get_tree().get_nodes_in_group("popups")
	for popup in popups:
		if popup.visible:
			return true
	
	return false

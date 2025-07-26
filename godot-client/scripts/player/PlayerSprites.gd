extends Node
class_name PlayerSprites

# PlayerSprites - Manages player sprite loading and animation
# Now works with AnimatedSprite2D for walking animations

# SpriteFrames resources for boy and girl
var boy_sprite_frames: SpriteFrames
var girl_sprite_frames: SpriteFrames

# Current active sprite frames
var current_sprite_frames: SpriteFrames

var animated_sprite: AnimatedSprite2D
var animation_player: AnimationPlayer

# Current direction and movement state
var current_direction: String = "down"
var is_moving: bool = false

func initialize(sprite_node: AnimatedSprite2D, anim_player: AnimationPlayer):
	animated_sprite = sprite_node
	animation_player = anim_player
	load_sprite_resources()
	load_sprites_for_gender()

func load_sprite_resources():
	"""Load all sprite resources"""
	# Load boy sprite sheet
	boy_sprite_frames = create_sprite_frames_from_sheet("res://assets/sprites/boy_avatar_32x32.png")
	
	# Load girl sprite sheet (use boy for now as fallback)
	girl_sprite_frames = create_sprite_frames_from_sheet("res://assets/sprites/boy_avatar_32x32.png")

func create_sprite_frames_from_sheet(sprite_sheet_path: String) -> SpriteFrames:
	"""Create SpriteFrames resource from sprite sheet"""
	var sprite_frames = SpriteFrames.new()
	var texture = load(sprite_sheet_path)
	
	if not texture:
		print("Warning: Could not load sprite sheet: ", sprite_sheet_path)
		return sprite_frames
	
	# Create walking animations for each direction
	var directions = ["down", "left", "right", "up"]
	var frame_size = Vector2(32, 32)
	
	for i in range(directions.size()):
		var direction = directions[i]
		var animation_name = "walk_" + direction
		
		sprite_frames.add_animation(animation_name)
		sprite_frames.set_animation_loop(animation_name, true)
		sprite_frames.set_animation_speed(animation_name, 8.0)
		
		# Add 3 frames for walking cycle (right foot, idle, left foot)
		for col in range(3):
			var atlas_texture = AtlasTexture.new()
			atlas_texture.atlas = texture
			atlas_texture.region = Rect2(col * frame_size.x, i * frame_size.y, frame_size.x, frame_size.y)
			
			sprite_frames.add_frame(animation_name, atlas_texture)
	
	# Create idle animation (just the middle frame)
	sprite_frames.add_animation("idle")
	sprite_frames.set_animation_loop("idle", false)
	sprite_frames.set_animation_speed("idle", 1.0)
	
	# Add idle frame (column 1 = middle frame, row 0 = down direction)
	var idle_atlas = AtlasTexture.new()
	idle_atlas.atlas = texture
	idle_atlas.region = Rect2(1 * frame_size.x, 0 * frame_size.y, frame_size.x, frame_size.y)
	sprite_frames.add_frame("idle", idle_atlas)
	
	return sprite_frames

func load_sprites_for_gender():
	"""Load appropriate sprites based on player gender"""
	if not GameManager or not GameManager.is_player_logged_in:
		# Default to boy sprites
		current_sprite_frames = boy_sprite_frames
		apply_sprite_frames()
		return
	
	var player_data = GameManager.current_player
	match player_data.gender:
		"male":
			current_sprite_frames = boy_sprite_frames
		"female":
			current_sprite_frames = girl_sprite_frames
		_:
			# Default to boy sprites
			current_sprite_frames = boy_sprite_frames
	
	# Apply the sprite frames and set initial state
	apply_sprite_frames()
	set_idle_state()

func apply_sprite_frames():
	"""Apply current sprite frames to the animated sprite"""
	if animated_sprite and current_sprite_frames:
		animated_sprite.sprite_frames = current_sprite_frames
		# Use normal scale - camera zoom will handle sizing
		animated_sprite.scale = Vector2(1.0, 1.0)

func set_idle_state():
	"""Set sprite to idle state"""
	if animated_sprite and current_sprite_frames:
		animated_sprite.play("idle")
		is_moving = false

func update_sprite_direction(direction: Vector2):
	"""Update sprite direction and animation based on movement"""
	if not animated_sprite or not current_sprite_frames:
		return
	
	# Determine direction string
	var new_direction = get_direction_string(direction)
	current_direction = new_direction
	
	# Update animation based on movement
	if direction.length() > 0:
		# Moving - play walking animation
		var animation_name = "walk_" + current_direction
		if animated_sprite.animation != animation_name:
			animated_sprite.play(animation_name)
		is_moving = true
	else:
		# Not moving - show idle
		if is_moving:
			set_idle_state()

func get_direction_string(direction: Vector2) -> String:
	"""Convert Vector2 direction to string"""
	if abs(direction.x) > abs(direction.y):
		# Horizontal movement
		if direction.x > 0:
			return "right"
		else:
			return "left"
	else:
		# Vertical movement
		if direction.y > 0:
			return "down"
		else:
			return "up"

# New animation system now handles all animations through AnimatedSprite2D
# No need for separate AnimationPlayer animations

func update_animation(is_moving: bool, is_running: bool, direction: Vector2):
	"""Update animation - compatibility function for PlayerController"""
	# Convert the old-style call to the new system
	update_sprite_direction(direction if is_moving else Vector2.ZERO)

func update_appearance():
	"""Update player appearance based on current data"""
	if not GameManager or not GameManager.is_player_logged_in:
		return
	
	var player_data = GameManager.current_player
	
	# Load appropriate sprites for gender
	load_sprites_for_gender()
	
	# Update sprite based on player data
	if animated_sprite:
		# Could add level-based color changes here if needed
		# var level_hue = (player_data.level - 1) * 0.1
		# var level_color = Color.from_hsv(level_hue, 0.3, 1.0)
		# animated_sprite.modulate = level_color
		pass

func add_movement_scale_effect(progress: float):
	"""Add subtle scale animation for movement feedback"""
	if animated_sprite:
		var scale_bounce = 1.0 + (sin(progress * PI) * 0.05)
		animated_sprite.scale = Vector2(scale_bounce, scale_bounce)

func reset_scale():
	"""Reset sprite scale to normal"""
	if animated_sprite:
		animated_sprite.scale = Vector2.ONE